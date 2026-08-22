-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin','customer');
CREATE TYPE public.appointment_status AS ENUM ('PENDING','CONFIRMED','COMPLETED','CANCELLED');
CREATE TYPE public.payment_status AS ENUM ('UNPAID','DEPOSIT_PAID','PAID','REFUNDED');

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name',''), NEW.email, NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT,
  active_status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.staff TO anon, authenticated;
GRANT ALL ON public.staff TO service_role;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_public_read" ON public.staff FOR SELECT TO anon, authenticated USING (active_status = true);
CREATE POLICY "staff_admin_all" ON public.staff FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  duration_min INTEGER NOT NULL DEFAULT 60 CHECK (duration_min > 0),
  description TEXT,
  active_status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "services_public_read" ON public.services FOR SELECT TO anon, authenticated USING (active_status = true);
CREATE POLICY "services_admin_read" ON public.services FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "services_admin_write" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  service_ids UUID[] NOT NULL DEFAULT '{}',
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  status public.appointment_status NOT NULL DEFAULT 'PENDING',
  payment_status public.payment_status NOT NULL DEFAULT 'UNPAID',
  notes TEXT,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE UNIQUE INDEX appointments_staff_slot_unique ON public.appointments (staff_id, date, time_slot)
  WHERE status IN ('PENDING','CONFIRMED') AND staff_id IS NOT NULL;
CREATE INDEX appointments_date_idx ON public.appointments (date, time_slot);
CREATE INDEX appointments_user_idx ON public.appointments (user_id);

CREATE POLICY "appointments_select_own" ON public.appointments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "appointments_insert_own" ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "appointments_update_own_cancel" ON public.appointments FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "appointments_admin_delete" ON public.appointments FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  approved_status BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read_approved" ON public.reviews FOR SELECT TO anon, authenticated USING (approved_status = true);
CREATE POLICY "reviews_select_own" ON public.reviews FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "reviews_admin_write" ON public.reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.availability_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  reason TEXT NOT NULL DEFAULT 'Holiday',
  is_full_day_block BOOLEAN NOT NULL DEFAULT true,
  blocked_slots TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (date)
);
GRANT SELECT ON public.availability_exceptions TO anon, authenticated;
GRANT ALL ON public.availability_exceptions TO service_role;
ALTER TABLE public.availability_exceptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "availability_public_read" ON public.availability_exceptions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "availability_admin_write" ON public.availability_exceptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL,
  identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
CREATE INDEX rate_limits_lookup ON public.rate_limits (bucket, identifier, created_at DESC);

INSERT INTO public.staff (name, specialty) VALUES
  ('Sapana', 'Bridal & Hair Styling'),
  ('Priya', 'Skin & Facials'),
  ('Anjali', 'Nails & Extensions');

INSERT INTO public.services (category, name, price, duration_min, description) VALUES
  ('Hair Care & Styling','Hair Rebonding',4500,180,'Smooth, sleek, frizz-free hair with premium bonding care.'),
  ('Hair Care & Styling','Global Hair Colour',2800,120,'Ammonia-free global colour with gloss finish.'),
  ('Hair Care & Styling','Hair Spa Ritual',1200,60,'Deep-conditioning spa with scalp massage.'),
  ('Hair Care & Styling','Cut & Blow Dry',700,45,'Precision cut styled with a salon blow dry.'),
  ('Skin & Facials','Signature Glow Facial',1800,75,'Brightening facial for an instant luminous finish.'),
  ('Skin & Facials','Tan Removal Therapy',1400,60,'De-tan treatment for face, neck and arms.'),
  ('Skin & Facials','Express Clean-Up',600,30,'Quick pore-clearing clean-up.'),
  ('Nails & Extensions','Acrylic Nail Extensions',2500,120,'Custom-shaped acrylic extensions with art.'),
  ('Nails & Extensions','Gel Polish Manicure',900,60,'Long-lasting gel polish with cuticle care.'),
  ('Nails & Extensions','Luxury Pedicure',1100,60,'Spa pedicure with scrub and massage.'),
  ('Bridal & Pre-Wedding','HD Bridal Makeup',15000,240,'Complete HD bridal look with draping.'),
  ('Bridal & Pre-Wedding','Bridal Trial Session',3500,120,'Pre-wedding trial to lock your look.'),
  ('Bridal & Pre-Wedding','Pre-Wedding Glow Package',9500,300,'Multi-session skin, hair and nail prep.');