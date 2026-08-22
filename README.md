# Goa Salon Glow

Act as a Senior UI/UX Designer and Web Developer. Build a high-converting, modern, premium responsive website for "Sapana's Touch of Class" beauty salon in Fatorda, Goa. 

### 1. BRAND & BUSINESS DETAILS

* Business Name: Sapana's Touch of Class (Women-Owned Premier Salon)

* Rating & Proof: 4.8★ Rating (150+ Google Reviews)

* Contact Number: +91 070285 77275

* Address: Building No 1, Albanita Enclave, Shop No 2 & 3, Fatorda, Madgaon, Goa 403601 (Plus Code: 7XR5+CG)

* Hours: Open Daily (9:30 AM – 8:00 PM)

* Core Offerings: Hair Styling, Rebonding, Coloring, Facials & Tan Removal, Bridal & Pre-Wedding Makeup, Hair Spa, Pedicure/Manicure, Acrylic Extensions.

* Key Features: On-site services, Free Wi-Fi, Restroom, Kid-friendly, On-site parking, Prior appointments required.

* Payment Options Accepted: Google Pay, Credit Cards, Debit Cards, Cash.

### 2. VISUAL STYLE & DESIGN TRENDS

* Aesthetic: Luxury, elegant, modern, and clean. Use soft champagne gold (#D4AF37), deep rose velvet (#8B0000 / #C71585), and frosted dark obsidian background modes.

* Glassmorphism: Utilize semi-transparent frosted-glass cards (`backdrop-filter: blur(12px)`) with subtle white/gold borders for service cards, appointment forms, and review badges.

* 3D Motion & Assets: 

  - A floating, interactive 3D hero model (e.g., dynamic 3D silk ribbon or perfume bottle using Three.js/Spline) that moves gently on mouse hover.

  - Micro 3D icons for amenities (Wi-Fi, Parking, Card Payments, Kid-Friendly).

* Scroll Animations & Interactive UI:

  - GSAP/Framer Motion scroll-driven animations: smooth parallax scrolling for background photos.

  - Text reveal animations for headings as the user scrolls.

  - Interactive "Before & After" image sliders for hair rebonding, coloring, and facial transformations.

  - Magnetic CTA buttons with glowing liquid-hover effects.

### 3. WEBSITE STRUCTURE & PAGES

1. HERO SECTION:

   * Dynamic headline: "Elevate Your Beauty at Goa's Premier Salon"

   * Subheadline: "4.8★ Rated Salon in Fatorda, Madgaon | Women-Owned & Crafted for Elegance"

   * Floating Glassmorphic Trust Badge: "150+ 5-Star Reviews on Google"

   * CTAs: "Book Appointment" (Primary glowing button) & "Explore Services" (Secondary glass button)

   * Background: High-definition looping video background of hair styling/spa treatments covered with a subtle frosted glass overlay.

2. AMENITIES & FEATURES STRIP (Horizontal ticker bar):

   * Icons + Labels: Women-Owned | On-site Parking | Free Wi-Fi | Appointment Only | Kid Friendly | GPay Accepted

3. POPULAR SERVICES (Grid with Glassmorphism Cards & Micro-interactions):

   * Categories: Hair Care & Styling, Skin & Facials, Bridal & Pre-Wedding, Nails & Extensions.

   * Hover effect: Card expands, background image gently zooms in, and price/description blurs up from bottom.

4. REVIEWS & TESTIMONIALS (Interactive 3D Carousel):

   * Showcase Google rating (4.8 Stars).

   * Feature authentic quotes highlighting staff hospitality, hair spa treatments, and bridal makeups.

5. ONLINE APPOINTMENT BOOKING SYSTEM (Interactive Step-by-Step Form):

   * Step 1: Select Service (Hair, Skin, Nails, Bridal).

   * Step 2: Choose Date & Time Slot (9:30 AM - 8:00 PM).

   * Step 3: Enter Guest Details (Name, Phone Number, Special Notes).

   * Step 4: Instant WhatsApp confirmation redirect or SMS notification trigger.

6. FOOTER & LOCATION INFO:

   * Embedded interactive dark-mode Google Map centered at Albanita Enclave, Fatorda.

   * One-click "Get Directions" link leading to Google Maps.

   * Quick contact: Tap-to-call (+91 070285 77275).

   * Address details & Operating hours.

### 4. TECHNICAL & PERFORMANCE REQUIREMENTS

* Tech Stack: React / Next.js / Tailwind CSS / Framer Motion or GSAP.

* Mobile-first, fast-loading, highly responsive layout.

* SEO Optimized for keywords: "Best salon in Fatorda", "Beauty parlour Madgaon Goa", "Hair salon near Albanita Enclave".

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8b099671-e07b-4ea2-8672-7e3e692f1072).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
