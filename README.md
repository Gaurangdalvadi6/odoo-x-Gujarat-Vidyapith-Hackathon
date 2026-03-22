# Learnova — eLearning Platform

Full-stack **eLearning** application: instructors/admins manage courses, lessons, quizzes, and reporting; learners browse published courses, learn in a full-screen player, take quizzes (one question per page), earn points and badges, and leave reviews.

---

## Tech Stack

| Layer | Technology |
|--------|------------|
| **Backend** | Java 21, Spring Boot 3.5, Spring Data JPA, Spring Security, JWT (JJWT) |
| **Database** | PostgreSQL (configurable via `application.properties` / env vars) |
| **Frontend** | React 19, Vite 8, React Router, Tailwind CSS, Axios |

---

## Project Structure

```
elearning/
├── src/main/java/com/hackthon/    # Spring Boot application
│   ├── ElearningApplication.java
│   ├── config/                    # Security, JWT filter, CORS, data seeding
│   ├── controller/              # REST: Auth, Admin, Learner
│   ├── dto/                     # Auth DTOs
│   ├── model/                   # JPA entities (users, courses, lessons, quizzes, etc.)
│   ├── repository/
│   └── service/
├── src/main/resources/
│   └── application.properties     # DB, JWT, JPA
├── frontend/                    # React + Vite + Tailwind
│   ├── src/
│   │   ├── api/                 # Axios client
│   │   ├── context/             # Auth (JWT in localStorage)
│   │   ├── pages/               # Login, Register, Courses, My Courses, Player, Admin
│   │   └── components/
│   └── package.json
├── pom.xml
└── README.md
```

---

## Features (aligned with product spec)

### Roles

- **Admin** — full back-office access.
- **Instructor** — create/edit courses, lessons, quizzes, publish, attendees, reporting.
- **Learner** — browse published courses, enroll, full-screen player, quizzes, points/badges, reviews.

### Backend capabilities

- JWT authentication (`/api/auth/register`, `/api/auth/login`).
- Course CRUD, publish toggle, visibility & access rules, pricing for paid courses.
- Lessons (video/document/image metadata), quizzes with questions/options and attempt-based scoring.
- Enrollments, lesson progress, course completion.
- Reviews and course-wise reporting for admins.

### Frontend capabilities

- Public course listing; protected routes for learner and admin areas.
- **My Courses** with profile points and badge display.
- **Full-screen player** — sidebar, lessons, quizzes (one question per page), quiz submission with points feedback.
- **Admin** — course dashboard (list/kanban style), course edit, lesson/quiz creation, quiz question builder, attendee invite/contact (API-backed), reporting table.

---

## Prerequisites

- **JDK 21**
- **Maven** (or use included `mvnw` / `mvnw.cmd`)
- **PostgreSQL** running locally (or remote) with a database created for the app
- **Node.js 18+** and **npm** (for the frontend)

---

## Backend Setup

1. Create a PostgreSQL database (example name: `odoo_hackthon`).

2. Configure connection in `src/main/resources/application.properties` or via environment variables:

   | Variable | Example |
   |----------|---------|
   | `DB_HOST` | `localhost` |
   | `DB_PORT` | `5432` |
   | `DB_NAME` | `odoo_hackthon` |
   | `DB_USERNAME` | `postgres` |
   | `DB_PASSWORD` | your password |

3. JWT secret and expiry (defaults in `application.properties`; override in production):

   - `app.jwt.secret`
   - `app.jwt.expiration-ms`

4. Run the API:

   ```bash
   ./mvnw spring-boot:run
   ```

   On Windows:

   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

5. Default port: **8080** (unless changed).

6. On first run, seed users may be created (see `DataInitializer`): e.g. admin, instructor, learner — check logs / DB for emails and default password if configured.

---

## Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` or set when running:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Serve `frontend/dist` with any static host or preview locally:

```bash
npm run preview
```

---

## API Endpoints

**Base URL (local default):** `http://localhost:8080`

Send `Authorization: Bearer <token>` for protected routes (except where noted).

### Authentication — `/api/auth`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Register learner; body: `name`, `email`, `password` |
| `POST` | `/api/auth/login` | Login; body: `email`, `password` — returns JWT + user fields |

### Learner — `/api/learn`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/learn/courses` | List published courses. Query: optional `userId`. **Public** (guest visibility rules apply). |
| `POST` | `/api/learn/courses/{courseId}/enroll` | Enroll. Query: `userId`, optional `purchased` |
| `GET` | `/api/learn/my-courses/{userId}` | Learner’s enrollments |
| `GET` | `/api/learn/courses/{courseId}/lessons` | Lessons for course |
| `GET` | `/api/learn/courses/{courseId}/quizzes` | Quizzes for course |
| `GET` | `/api/learn/quizzes/{quizId}/questions` | Quiz questions + options (no correct flags for learners) |
| `POST` | `/api/learn/enrollments/{enrollmentId}/lessons/{lessonId}/complete` | Mark lesson complete |
| `POST` | `/api/learn/enrollments/{enrollmentId}/complete-course` | Mark course completed (requires 100% lesson progress) |
| `POST` | `/api/learn/quizzes/{quizId}/submit` | Submit quiz. Query: `userId`. Body: `{ "answers": { "<questionId>": <optionId> } }` |
| `POST` | `/api/learn/courses/{courseId}/reviews` | Add review. Query: `userId`. Body: `rating`, `reviewText` |
| `GET` | `/api/learn/courses/{courseId}/reviews` | List reviews. **Public** |

### Admin / Instructor — `/api/admin`

Requires role **ADMIN** or **INSTRUCTOR**.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/courses` | All courses |
| `POST` | `/api/admin/courses` | Create course. Body: `title`, optional `responsibleUserId` |
| `PUT` | `/api/admin/courses/{courseId}` | Update course fields |
| `PATCH` | `/api/admin/courses/{courseId}/publish` | Publish toggle. Query: `value` (boolean) |
| `POST` | `/api/admin/courses/{courseId}/lessons` | Add lesson |
| `GET` | `/api/admin/courses/{courseId}/lessons` | List lessons |
| `POST` | `/api/admin/courses/{courseId}/quizzes` | Add quiz |
| `GET` | `/api/admin/courses/{courseId}/quizzes` | List quizzes |
| `POST` | `/api/admin/quizzes/{quizId}/questions` | Add question + options |
| `GET` | `/api/admin/quizzes/{quizId}/questions` | List questions (includes correct flags) |
| `DELETE` | `/api/admin/quizzes/questions/{questionId}` | Delete question |
| `POST` | `/api/admin/courses/{courseId}/attendees` | Add attendee by user id. Query: `userId` |
| `POST` | `/api/admin/courses/{courseId}/attendees/invite` | Invite by email. Body: `{ "email" }` |
| `POST` | `/api/admin/courses/{courseId}/attendees/contact` | Contact flow (returns recipient list). Body: `subject`, `message` |
| `GET` | `/api/admin/reports/courses/{courseId}` | Enrollment / progress report |

> **Security:** Some `GET` learner routes are public — see `SecurityConfig.java` for exact rules.

---

## Security Notes

- Use strong `app.jwt.secret` in production.
- Do not commit real DB passwords or secrets; use env vars or a secrets manager.
- CORS is open by default for development; tighten for production.

---

## Testing

```bash
./mvnw test
```

(Requires a test DB configuration if tests spin up the full context; adjust `src/test/resources` as needed.)

---

## License

This project was created for a hackathon / learning context. Add your license here if you distribute it.

---

## References

- Product flow: course setup → publish → enrollment → learning player → quiz → completion → reviews → reporting.

For **frontend-only** commands and Vite details, see [`frontend/README.md`](frontend/README.md).
