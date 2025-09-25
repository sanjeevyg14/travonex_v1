# Travonex Platform: Pending Backend API Connections

This document lists all the pages and components in the Travonex platform that are currently using mock data or simulated API calls. To make the application fully functional, these sections need to be connected to live backend APIs.

---

## 🔑 Core Authentication & Session

- **`src/app/auth/signup/page.tsx`**
  - **Pending:** The signup form currently simulates user creation by calling the mock login API.
  - **Required API:** `POST /api/auth/signup` to handle new user registration.

- **`src/hooks/useAuthGuard.ts` & `src/context/AuthContext.tsx`**
  - **Pending:** Session is fetched from a mock API (`/api/users/me/session`).
  - **Required API:** `GET /api/auth/session` (or similar) to securely verify the user's session from the `httpOnly` cookie.

---

## 👤 User Panel

- **`src/app/page.tsx` (Homepage)**
  - **Pending:** Fetches banner trips, featured trips, and categories from mock data.
  - **Required APIs:** `GET /api/trips?isBanner=true`, `GET /api/trips?isFeatured=true`, `GET /api/categories`.

- **`src/app/search/page.tsx`**
  - **Pending:** All filtering, sorting, and searching is done on a client-side mock data array.
  - **Required API:** `GET /api/trips` with query parameters for search (`q`), filtering (`category`, `price`, etc.), and sorting (`sortKey`).

- **`src/app/trips/[slug]/page.tsx` (Trip Details)**
  - **Pending:** Fetches trip details from mock data.
  - **Required API:** `GET /api/trips/slug/{slug}`.

- **`src/app/book/[tripId]/page.tsx` (Booking Page)**
  - **Pending:**
    - Coupon validation uses a mock API.
    - Final booking submission is simulated and does not call a backend endpoint.
  - **Required APIs:** `POST /api/coupons/validate`, `POST /api/bookings/create`.

- **`src/app/bookings/page.tsx`**
  - **Pending:** User's booking history is fetched from mock data.
  - **Required API:** `GET /api/users/me/bookings`.

- **`src/app/profile/page.tsx`**
  - **Pending:** User profile data is from a mock source, and save actions are simulated.
  - **Required APIs:** `GET /api/users/me/profile`, `PUT /api/users/me/profile`.

- **`src/app/wishlist/page.tsx`**
  - **Pending:** Wishlisted trips are hardcoded.
  - **Required API:** `GET /api/users/me/wishlist`.

---

## 👔 Trip Organizer Panel

- **`src/app/trip-organiser/dashboard/page.tsx`**
  - **Pending:** All dashboard metrics (revenue, participants, etc.) are calculated from mock data.
  - **Required API:** `GET /api/organizers/me/dashboard`.

- **`src/app/trip-organiser/trips/page.tsx` & `src/components/trips/TripForm.tsx`**
  - **Pending:**
    - Creating and editing trips are simulated.
    - The list of an organizer's trips is from a mock source.
  - **Required APIs:** `GET /api/organizers/me/trips`, `POST /api/trips`, `PUT /api/trips/{id}`.

- **`src/app/trip-organiser/bookings/page.tsx`**
  - **Pending:** List of bookings for the organizer's trips is from a mock source.
  - **Required API:** `GET /api/organizers/me/bookings`.

- **`src/app/trip-organiser/leads/page.tsx`**
  - **Pending:** Lead data and the "unlock" action are simulated.
  - **Required APIs:** `GET /api/organizers/me/leads`, `POST /api/leads/{leadId}/unlock`.

- **`src/app/trip-organiser/coupons/page.tsx`**
  - **Pending:** Organizer-created coupons are from a mock source; create/edit actions are simulated.
  - **Required APIs:** `GET /api/organizers/me/coupons`, `POST /api/organizers/me/coupons`.

- **`src/app/trip-organiser/payouts/page.tsx`**
  - **Pending:** Eligible payouts and payout history are from a mock source. The "Request Payout" action is simulated.
  - **Required APIs:** `GET /api/organizers/me/payouts`, `POST /api/organizers/me/payouts/request`.

- **`src/app/trip-organiser/profile/page.tsx`**
  - **Pending:** Organizer profile data is from a mock source. All save actions and document uploads are simulated.
  - **Required APIs:** `GET /api/organizers/me/profile`, `PUT /api/organizers/me/profile`, `POST /api/organizers/me/documents`.

---

## ⚙️ Super Admin Panel

Almost all pages in the admin panel use mock data for tables and actions. Key pages include:

- **`src/app/admin/dashboard/page.tsx`**: Uses a mock API route, needs connection to real aggregate data.
- **`src/app/admin/trips/page.tsx`**: Needs connection to `GET /api/admin/trips` and associated action endpoints.
- **`src/app/admin/bookings/page.tsx`**: Needs connection to `GET /api/admin/bookings`.
- **`src/app/admin/trip-organisers/page.tsx`**: Needs connection to `GET /api/admin/organizers`.
- **`src/app/admin/payouts/page.tsx`**: Needs connection to `GET /api/admin/payouts` and processing endpoints.
- **`src/app/admin/users/page.tsx`**: Needs connection to `GET /api/admin/users`.
- **`src/app/admin/admin-roles/page.tsx`**: Needs connection to `GET/POST/PUT /api/admin/roles`.
- **`src/app/admin/promotions/page.tsx`**: Needs connection to `GET/POST/PUT /api/admin/promotions`.
- **`src/app/admin/settings/page.tsx`**: Needs connection to a settings API to fetch and save platform configurations.
- **`src/app/admin/audit-log/page.tsx`**: Needs connection to `GET /api/admin/audit-logs`.
- **`src/app/admin/reports/page.tsx`**: Needs connection to an analytics/reporting endpoint.
