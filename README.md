# JustTrackIt

Simple issue tracker / kanban board (kind of like Jira) made for the Software Engineering course project.

You can create projects, add people to them, create issues (tasks, bugs, stories) and move them around on the board with drag and drop.

## Tech

- **Backend:** Java 17, Spring Boot 2.7, Spring Security + JWT, Spring Data JPA
- **Database:** PostgreSQL 14
- **Frontend:** React 18 (create-react-app), react-router v6, axios, react-beautiful-dnd

## Features

- register / login (JWT token, saved in localStorage)
- projects: create, edit, delete, add/remove members
- kanban board with 4 columns (To Do, In Progress, In Review, Done)
- drag & drop issues between columns, order is saved
- create / edit / delete issues (type, priority, assignee, story points, description)
- comments on issues
- board filters: search, by assignee, only my issues, by type
- issues list view with sorting
- "Your work" page with issues assigned to you
- admin panel (`/admin`, only for ADMIN role): manage all users, projects, issues and comments

## How to run

### 1. Database

Easiest is with docker:

```
docker-compose up -d
```

or create a postgres database called `trackit` yourself (user `postgres`, password `postgres`, or change it in `backend/src/main/resources/application.properties`)

### 2. Backend

```
cd backend
./mvnw spring-boot:run
```

runs on http://localhost:8080

Tables are created automatically (ddl-auto=update). When the database is empty, some demo data is inserted (see `DataLoader.java`).

Note: `./mvnw package` runs the tests and they need the database to be running, otherwise use `-DskipTests`

### 3. Frontend

```
cd frontend
npm install
npm start
```

opens http://localhost:3000

## Demo accounts

| username | password |
|----------|----------|
| demo     | demo123  |
| anna     | anna123  |
| mark     | mark123  |
| admin    | admin123 | (ADMIN role, sees the Admin link in the navbar)

The admin user is created on startup if it doesn't exist yet.

## API

All endpoints except login/register need the header `Authorization: Bearer <token>`

| Method | URL | |
|---|---|---|
| POST | /api/auth/register | |
| POST | /api/auth/login | |
| GET | /api/auth/me | current user |
| GET | /api/users?q= | search users |
| GET | /api/users/me/issues | issues assigned to me |
| GET/POST | /api/projects | |
| GET/PUT/DELETE | /api/projects/{id} | |
| POST | /api/projects/{id}/members | body: `{ "username": "..." }` |
| DELETE | /api/projects/{id}/members/{userId} | |
| GET/POST | /api/projects/{id}/issues | |
| GET/PUT/DELETE | /api/issues/{id} | |
| PATCH | /api/issues/{id}/move | body: `{ "status": "DONE", "position": 0 }` |
| GET/POST | /api/issues/{id}/comments | |
| DELETE | /api/comments/{id} | |

Admin endpoints (need ROLE_ADMIN, otherwise 403):

| Method | URL | |
|---|---|---|
| GET | /api/admin/stats | counts |
| GET/POST | /api/admin/users | |
| PUT/DELETE | /api/admin/users/{id} | empty password = keep old one |
| GET/POST | /api/admin/projects | |
| PUT/DELETE | /api/admin/projects/{id} | can change owner |
| GET | /api/admin/issues | all issues |
| POST | /api/admin/projects/{id}/issues | |
| PUT/DELETE | /api/admin/issues/{id} | |
| GET | /api/admin/comments | |
| DELETE | /api/admin/comments/{id} | |

## Known issues / TODO

- only USER and ADMIN roles, every project member can edit everything in the project (only owner can delete project)
- can't delete a user who owns a project, admin has to change the owner first
- admin can't open project boards unless they are a member
- jwt secret is in application.properties (should be env variable)
- no refresh token, you just get logged out after 24h
- React.StrictMode is removed because react-beautiful-dnd doesn't work with it
- no tests (except the default one)
- sprints / backlog not done yet
- mobile view is not really good
