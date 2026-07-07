# Blog Platform

A full-stack social blogging platform with authentication, posts, comments, likes, follow system, notifications, reporting, and an admin dashboard.

## Features

- **Authentication & Authorization** — Register, login (email or username), JWT-based auth with 24h token expiration, role-based access (User / Admin)
- **Posts** — Create, edit, and delete posts with title, description, and multiple image/video uploads. Paginated feed.
- **Likes & Comments** — Like/unlike posts, add comments on posts
- **Follow System** — Follow/unfollow users, view followers and following lists, suggested users
- **User Profiles** — Customizable profiles with avatar, bio, post history, follower/following counts
- **Notifications** — Real-time notifications for follows, likes, and comments
- **Reporting** — Report users or posts with custom reasons
- **Admin Dashboard** — View platform statistics, manage users (ban/unban, delete), moderate posts (hide/unhide, delete), and review/dismiss reports
- **File Uploads** — Avatar and post media uploads with MIME type validation via Apache Tika

## Technologies Used

### Backend
- **Java 17**
- **Spring Boot 4.0.6** (Web, Data JPA, Security, Validation)
- **PostgreSQL** (via Neon.tech cloud)
- **Hibernate** (ORM with DDL auto-update)
- **JWT** (io.jsonwebtoken 0.11.5) — Stateless authentication
- **Lombok** — Boilerplate reduction
- **Apache Tika 2.9.2** — MIME type validation for file uploads
- **Maven** — Build and dependency management

### Frontend
- **Angular 21** (Standalone components, Signals-based state management)
- **TypeScript 5.9**
- **RxJS 7.8** — Reactive programming
- **Angular Material** — UI component library
- **Font Awesome 7** — Icons
- **Express 5** — SSR server

## Prerequisites

- **Java 17+** — [Download](https://adoptium.net/)
- **Node.js 18+** and **npm** — [Download](https://nodejs.org/)
- **Angular CLI** — Install globally:
  ```bash
  npm install -g @angular/cli
  ```
- **PostgreSQL** — Either a local instance or a cloud database (e.g., [Neon.tech](https://neon.tech))

## Project Structure

```
├── backend/                   # Spring Boot backend
│   ├── src/main/java/Blog/   # Java source code
│   │   ├── controller/       # REST API controllers
│   │   ├── service/          # Business logic
│   │   ├── repository/       # JPA repositories
│   │   ├── entities/         # JPA entities
│   │   ├── dto/              # Data transfer objects
│   │   ├── config/           # Security, CORS, Web config
│   │   ├── jwt/              # JWT filter and utilities
│   │   └── seeder/           # Admin account auto-seeder
│   ├── src/main/resources/
│   │   └── application.properties  # ⚠️ Gitignored — create manually
│   ├── data/                  # Uploaded files storage
│   │   ├── avatars/
│   │   ├── covers/
│   │   └── posts/
│   └── pom.xml
├── frontend/                  # Angular frontend
│   ├── src/app/
│   │   ├── components/       # Standalone components
│   │   ├── core/             # Services, guards, interceptors
│   │   └── models/           # TypeScript interfaces
│   └── package.json
└── makefile                   # Convenience commands
```

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd 01_Blog
```

### 2. Set up the database

Create a PostgreSQL database (local or cloud). You can use [Neon.tech](https://neon.tech) for a free cloud PostgreSQL instance.

### 3. Configure the backend

Create the file `backend/src/main/resources/application.properties`:

> ⚠️ **Important:** This file is gitignored and must be created manually. Without it, the backend will not start.

```properties
spring.application.name=demo

# ── Database ──────────────────────────────────────────
# Replace with your own PostgreSQL credentials
spring.datasource.url=jdbc:postgresql://<YOUR_HOST>:<PORT>/<YOUR_DATABASE>?sslmode=require
spring.datasource.username=<YOUR_DB_USERNAME>
spring.datasource.password=<YOUR_DB_PASSWORD>

# ── JPA / Hibernate ───────────────────────────────────
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# ── JWT ───────────────────────────────────────────────
# Use a strong, unique secret (at least 256 bits)
application.security.jwt.secret-key=<YOUR_JWT_SECRET_KEY>
application.security.jwt.expiration=86400000

# ── File Uploads ──────────────────────────────────────
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=100MB
```

**Example using a local PostgreSQL database:**

```properties
spring.application.name=demo

spring.datasource.url=jdbc:postgresql://localhost:5432/blog_db
spring.datasource.username=postgres
spring.datasource.password=postgres

spring.jpa.properties.hibernate.format_sql=true
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

application.security.jwt.secret-key=mySuperSecretKeyThatIsAtLeast256BitsLong1234567890!
application.security.jwt.expiration=86400000

spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=100MB
```

### 4. Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`.

On first run, an admin account is automatically created:

| Field    | Value            |
|----------|------------------|
| Username | `admin`          |
| Password | `admin123`       |
| Email    | `admin@gmail.com`|

### 5. Run the frontend

In a separate terminal:

```bash
cd frontend
npm install
ng serve
```

The app will be available at `http://localhost:4200`.

### Quick start (both at once)

```bash
make both
```

## Default Admin Account

The application seeds a default admin user on startup if none exists. You can change these credentials after logging in:

- **Username:** `admin`
- **Password:** `admin123`

## API Overview

The backend exposes a REST API at `http://localhost:8080`:

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT token |

### Authenticated Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/me` | Get current user |
| GET/PUT | `/api/users/me` | Get/update current user profile |
| GET | `/api/users/{id}` | Get user by ID |
| GET | `/api/suggestedUsers` | Get suggested users to follow |
| GET | `/api/users/search/{username}` | Search users |
| GET/POST | `/api/posts` | List (paginated) / create posts |
| GET/PUT/DELETE | `/api/posts/{postId}` | Get / update / delete a post |
| POST | `/api/posts/{postId}/like` | Toggle like on a post |
| GET | `/api/users/{userId}/posts` | Get user's posts |
| GET | `/api/posts/{postId}/comments` | Get post comments |
| POST | `/api/posts/{postId}/comment` | Add comment |
| DELETE | `/api/comments/{comment}` | Delete comment |
| POST | `/api/follow/{userId}` | Toggle follow/unfollow |
| GET | `/api/followers/{userId}` | Get user's followers |
| GET | `/api/following/{userId}` | Get who a user follows |
| GET | `/api/notifications` | Get notifications |
| PUT | `/api/notifications/{notifId}/read` | Mark notification as read |
| POST | `/api/report` | Submit a report |

### Admin Endpoints (requires Admin role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/{userId}/ban` | Toggle ban/unban user |
| DELETE | `/api/admin/users/{userId}` | Delete user permanently |
| GET | `/api/admin/posts` | List all posts |
| PUT | `/api/admin/posts/{postId}/hide` | Toggle hide/unhide post |
| DELETE | `/api/admin/posts/{postId}` | Delete post permanently |
| GET | `/api/admin/reports` | List all reports |
| PUT | `/api/admin/reports/{reportId}/review` | Mark report as reviewed |
| PUT | `/api/admin/reports/{reportId}/dismiss` | Dismiss report |

All authenticated requests must include the JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## Environment Variables (Optional)

For production, consider externalizing sensitive configuration via environment variables:

```bash
export DB_URL=jdbc:postgresql://...
export DB_USERNAME=myuser
export DB_PASSWORD=mypassword
export JWT_SECRET=mysecret
```

Then reference them in `application.properties`:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
application.security.jwt.secret-key=${JWT_SECRET}
```
