# Fix public browsing and role-based routing

## What will change
- Keep the salon homepage and every public section fully accessible without a session.
- Require authentication only when a visitor begins the booking flow, preserving their intent so they can continue after sign-in.
- Make the auth page resolve the signed-in user’s role: admins go to `/admin`; customers return to the normal booking area and never enter the admin portal.
- Keep `/admin` protected at both route and server-function levels, redirecting customers away before admin UI or data loads.
- Update the public navigation so signed-in customers see their name and booking history, while only admins see the Admin link.
- Keep sign-out returning users to the public site rather than forcing another login.

## Verification
- Signed out: load `/`, inspect all public sections, and confirm booking is the first auth prompt.
- Customer: sign in, confirm normal-site destination/name/history access, and verify `/admin` redirects without admin data.
- Admin: sign in with the designated admin account and confirm the destination is `/admin`.
- Check current build/runtime diagnostics after implementation.

## Technical details
- Use the existing protected `_authenticated` route group only for `/bookings` and `/admin`; public routes remain top-level.
- Reuse the existing authenticated `getMyRole` server function for authoritative role routing and the existing backend authorization checks for admin operations.
- Pass only a validated same-origin destination through the auth flow.
