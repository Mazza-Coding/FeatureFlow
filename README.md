# FeatureFlow

A simple tool for dev teams to manage feature requests. Built this because we needed a better way to track what features are being proposed, discussed, and worked on.

## What it does

- Submit feature proposals with context on _why_ it matters
- Discuss features with tagged comments (questions, ideas, risks, etc.)
- Track features through their lifecycle: Proposed → Discussion → Approved → In Progress → Done
- Auto-calculate priority based on business value vs effort/risk
- Keep a full activity log so nothing gets lost

## Project structure

```
├── .github/workflows/  # CI/CD pipelines
├── django_project/     # Django config (settings, urls)
├── features/           # API app (models, views, serializers)
├── frontend/           # React app
│   └── src/
│       ├── components/ # Header, CommentThread, StatusChangeModal, ActivityTimeline
│       ├── pages/      # Login, Register, FeatureList, FeatureDetail, FeatureForm
│       ├── context/    # Auth context
│       └── services/   # API client
├── manage.py
├── requirements.txt
└── db.sqlite3          # Dev database (gitignored)
```

## Tech

**Backend:** Django 5, Django REST Framework, SimpleJWT  
**Frontend:** React 18, React Router, Axios, Vite  
**Database:** SQLite for dev (Postgres-ready)

## Getting started

### Backend

```bash
python -m venv venv
.\venv\Scripts\Activate  # Windows
source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Backend runs on http://localhost:8000, frontend on http://localhost:5000.

## API

Auth:

- `POST /api/auth/register/` - Sign up
- `POST /api/auth/login/` - Get tokens
- `POST /api/auth/refresh/` - Refresh token
- `GET /api/auth/me/` - Current user

Features:

- `GET /api/features/` - List all
- `POST /api/features/` - Create
- `GET /api/features/{id}/` - Get one (includes comments & activity)
- `PATCH /api/features/{id}/` - Update
- `DELETE /api/features/{id}/` - Delete
- `POST /api/features/{id}/change_status/` - Move to next status

## Tests

```bash
# Backend
python manage.py test features

# Frontend
cd frontend && npm test
```

## CI/CD

GitHub Actions runs on every push and PR to `main`:

- **CI** ([ci.yml](.github/workflows/ci.yml)) — runs backend tests, frontend tests, and builds the frontend
- **Deploy** ([deploy.yml](.github/workflows/deploy.yml)) — builds artifacts ready for deployment (configure your own target)

## License

MIT
