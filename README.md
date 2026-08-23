# 🌿 Green University Events

A full-stack event management system for a university campus — students discover and register for events, organizers create and manage them, and admins oversee approvals and users. Built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **Authentication** — register/login with JWT, role-based access (student / organizer / admin), optional "Remember me" (30-day httpOnly cookie session)
- **Event management** — organizers create, edit, and delete events (category, venue, capacity, schedule, green-initiative tagging); admins approve or reject submissions
- **Registration** — students browse/search/filter events and register; each registration generates a QR code for check-in
- **Attendance & records** — organizers view registrant lists and check attendees in via QR code; students view their registration history
- **Feedback & ratings** — students rate and review events after they've ended; average ratings shown on each event
- **Notifications** — in-app notifications with unread badge and mark-as-read
- **Admin dashboard** — platform-wide stats, pending event approvals, user management

## Tech Stack

| Layer    | Technology                                              |
|----------|-----------------------------------------------------------|
| Frontend | React, React Router, React-Bootstrap, Axios                |
| Backend  | Node.js, Express, Mongoose                                 |
| Database | MongoDB                                                     |
| Auth     | JSON Web Tokens (JWT) + httpOnly cookies                    |
| Other    | QR code generation, express-validator, helmet, morgan       |

## Project Structure

```
event management code/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Route logic (auth, events, registrations, notifications, admin)
│   │   ├── models/        # Mongoose schemas (User, Event, Registration, Notification)
│   │   ├── routes/        # Express route definitions
│   │   ├── middleware/    # Auth guard, validation, cookie parsing, error handling
│   │   └── server.js      # App entry point
│   ├── docs/               # API.md, SETUP.md
│   └── .env.example
└── frontend/
    └── src/
        ├── pages/          # Route-level views (Events, EventDetail, Login, AdminDashboard, ...)
        ├── components/     # Shared UI (Navbar, EventForm, FeedbackSection, PrivateRoute)
        ├── context/        # AuthContext
        └── services/       # Axios API client
```

## Getting Started

### Prerequisites
- Node.js v16+
- MongoDB (local install or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Clone and install
```bash
git clone https://github.com/tayeburfahim2003-gif/Event-management-.git
cd "event management code"

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables
```bash
cd backend
cp .env.example .env
```
Then edit `.env` and fill in your own `MONGODB_URI`, `JWT_SECRET`, and admin credentials.

### 3. Run the app
Open two terminals:
```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:3000)
cd frontend
npm start
```

The backend seeds a default admin account (from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`) on first successful database connection.

### 4. Verify it's working
Visit `http://localhost:5000/api/health` — it should report the API and database connection status.

## API Reference

See [`backend/docs/API.md`](backend/docs/API.md) for the full endpoint list, and [`backend/docs/SETUP.md`](backend/docs/SETUP.md) for a condensed setup checklist.

Key endpoints:

| Method | Endpoint                          | Description                          |
|--------|------------------------------------|---------------------------------------|
| POST   | `/api/auth/register`               | Register a new user                  |
| POST   | `/api/auth/login`                  | Log in, optionally with `rememberMe`  |
| GET    | `/api/events`                      | List/search/filter events            |
| POST   | `/api/events`                      | Create an event (organizer/admin)    |
| POST   | `/api/registrations`               | Register for an event                |
| PUT    | `/api/registrations/:id/feedback`  | Submit a rating/review                |
| GET    | `/api/events/:id/feedback`         | Get an event's average rating/reviews|
| GET    | `/api/admin/stats`                 | Platform-wide stats (admin)          |

## Team

| Member        | Focus                                                                 |
|---------------|------------------------------------------------------------------------|
| tayeburfahim  | Backend — API design, models, controllers, database                    |
| Shormista     | Frontend — all pages, routing, UI/UX                                   |
| rsbishal      | Feature development (feedback/ratings, remember-me auth), integration testing, bug fixes, documentation |

## License

This project was built for coursework purposes.
