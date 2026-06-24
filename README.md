# Chai Base

Full-stack tea catalog and cart application built with Django REST Framework and React. The backend exposes a JWT-protected API for managing teas, carts, recommendations, dashboard stats, and generated API docs. The frontend provides a customer catalog experience plus an admin area for tea inventory management.

## Tech Stack

**Backend**

- Python 3.12
- Django 6
- Django REST Framework
- Simple JWT authentication
- PostgreSQL via `psycopg`
- Cloudinary media storage
- drf-spectacular Swagger/OpenAPI docs
- Sentry integration
- Docker and Gunicorn

**Frontend**

- React 19
- Vite
- React Router
- Axios with JWT refresh handling
- Tailwind CSS
- Lucide React icons
- Vercel SPA rewrite config

## Project Structure

```text
.
+-- chaihq/                  # Django project and tea API app
|   +-- chaihq/              # Django settings, root URLs, WSGI/ASGI
|   +-- tea/                 # Models, serializers, views, filters, permissions
|   +-- static/              # Backend static assets
|   +-- manage.py
+-- tea-frontend/            # React/Vite frontend
|   +-- src/                 # Pages, components, contexts, services
|   +-- public/              # Public frontend assets
|   +-- vercel.json
+-- Dockerfile               # Backend container image
+-- docker-compose.yml       # Backend service definition
+-- requirements.txt         # Python dependencies
+-- README.md
```

## Features

- Public tea catalog with detail pages
- Tea search, filtering, and ordering
- Tea recommendations by category
- User registration and JWT login
- Automatic frontend access-token refresh
- Authenticated cart with add, update, remove, and clear actions
- Admin-only create, edit, and delete flows for teas
- Admin dashboard stats for inventory and users
- Image upload support through Cloudinary
- Swagger API docs
- Docker build and OCI deployment workflows

## Backend Setup

Create a backend environment file at `chaihq/.env`:

```env
SECRET_KEY=replace-me
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=chai_base
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SENTRY_DSN=
```

Install and run the backend:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd chaihq
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The backend runs at `http://localhost:8000`.

### Admin Permissions

Write access to tea management endpoints and dashboard stats requires a user in the Django auth group named `Admin`.

Create the group in the Django admin, or use the shell:

```bash
python manage.py shell
```

```python
from django.contrib.auth.models import Group, User

group, _ = Group.objects.get_or_create(name="Admin")
user = User.objects.get(username="admin")
user.groups.add(group)
```

## Frontend Setup

Create `tea-frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

Install and run the frontend:

```bash
cd tea-frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## API Overview

All API routes are mounted under `/api/`.

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `GET` | `/api/health/` | Health check | Public |
| `POST` | `/api/register/` | Create a user account | Public |
| `POST` | `/api/login/` | Get JWT access and refresh tokens | Public |
| `POST` | `/api/refresh/` | Refresh an access token | Public |
| `GET` | `/api/teas/` | List teas with filtering/search/ordering | Public |
| `POST` | `/api/teas/` | Create a tea | Admin |
| `GET` | `/api/teas/<id>/` | Get tea details | Public |
| `PUT/PATCH` | `/api/teas/<id>/` | Update a tea | Admin |
| `DELETE` | `/api/teas/<id>/` | Delete a tea | Admin |
| `GET` | `/api/teas/<id>/recommendations/` | Get related teas | Public |
| `GET` | `/api/cart/` | Get the current user's cart | User |
| `POST` | `/api/cart/add/` | Add a tea to cart | User |
| `PATCH` | `/api/cart/item/<item_id>/` | Update cart item quantity | User |
| `DELETE` | `/api/cart/item/<item_id>/delete/` | Remove a cart item | User |
| `DELETE` | `/api/cart/clear/` | Clear cart | User |
| `GET` | `/api/dashboard/stats/` | Admin dashboard metrics | Admin |
| `GET` | `/api/schema/` | OpenAPI schema | Public |
| `GET` | `/api/docs/` | Swagger UI | Public |

### Filtering and Search

`GET /api/teas/` supports:

- Filters: `price`, `price__lte`, `price__gte`, `name`, `name__icontains`, `stock`, `stock__lte`, `stock__gte`, `origin`, `origin__icontains`
- Search: `search=<term>` across tea name and description
- Ordering: `ordering=name`, `ordering=price`, `ordering=stock`, `ordering=created_at`

Example:

```bash
curl "http://localhost:8000/api/teas/?search=green&price__lte=500&ordering=price"
```

## Docker

Build and run the backend container:

```bash
docker build -t tea-catalog-api .
docker run --env-file chaihq/.env -p 8000:8000 tea-catalog-api
```

Or use Docker Compose:

```bash
docker compose up -d --build
```

The compose file expects an external Docker network named `spring-network` and uses `.env` from the repository root as the service env file. Create that network first if it does not exist:

```bash
docker network create spring-network
```

## Quality Checks

Backend:

```bash
cd chaihq
python manage.py check
python manage.py test
```

Frontend:

```bash
cd tea-frontend
npm run lint
npm run build
```

## Deployment Notes

- Backend deployment is container-based with `gunicorn chaihq.wsgi:application --bind 0.0.0.0:8000`.
- GitHub Actions includes a Docker build health check on `main`.
- The deploy workflow SSHes into an OCI host, resets `/opt/apps/tea-api` to `origin/main`, and runs `docker compose up -d --build`.
- Frontend deployment can use Vercel; `tea-frontend/vercel.json` rewrites all routes to `index.html` for client-side routing.

## Demo Credentials

```text
Username: admin
Password: NewStrongPassword123
```

These are sample credentials for demonstration only. Create new local users and rotate any deployed credentials before using the project outside development.
