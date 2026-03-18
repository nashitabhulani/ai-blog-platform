# Aether AI Blog Platform

A full-stack AI-powered blog platform using React (frontend) + Strapi (backend CMS).
Generate complete SEO-optimized blog posts automatically via a multi-step AI pipeline.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS, React Router v6, React Helmet |
| Backend | Strapi v4 CMS, SQLite (dev), REST API |
| AI | OpenAI GPT-4o (content) + DALL·E 3 (images) |
| HTTP | Axios |

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd ai-blog-platform
```

### 2. Backend (Strapi)

```bash
cd backend/strapi
npm install
cp .env.example .env
# Edit .env — add your OPENAI_API_KEY
npm run develop
```

Strapi admin UI: http://localhost:1337/admin
First run: create your admin account.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env — set VITE_STRAPI_URL and VITE_OPENAI_API_KEY
npm run dev
```

Frontend: http://localhost:5173

---

## Strapi Collections Setup

After starting Strapi, create these Content Types in the admin UI:

### Post
| Field | Type | Options |
|-------|------|---------|
| title | Text | Required |
| slug | UID | targetField: title |
| excerpt | Text (long) | |
| content | Rich Text (Markdown) | |
| featuredImage | Media | Single |
| seoTitle | Text | |
| seoDescription | Text (long) | |
| seoKeywords | JSON | |
| readingTime | Number | Integer |
| aiGenerated | Boolean | default: false |
| outline | JSON | |
| keywords | JSON | |
| socialContent | JSON | |
| status | Enumeration | draft, published |
| category | Relation | Many-to-one → Category |
| tags | Relation | Many-to-many → Tag |

### Category
| Field | Type |
|-------|------|
| name | Text |
| slug | UID |
| description | Text |

### Tag
| Field | Type |
|-------|------|
| name | Text |
| slug | UID |

### PromptTemplate
| Field | Type |
|-------|------|
| name | Text |
| prompt | Text (long) |

### Permissions
Go to Settings → Roles → Public → enable find/findOne for Post, Category, Tag.
Go to Settings → Roles → Authenticated → enable all for Post, Category, Tag, PromptTemplate, Upload.

---

## Environment Variables

### frontend/.env
```
VITE_STRAPI_URL=http://localhost:1337
VITE_OPENAI_API_KEY=sk-...
VITE_STRAPI_TOKEN=your_strapi_api_token
```

### backend/strapi/.env
```
HOST=0.0.0.0
PORT=1337
APP_KEYS=your_app_keys
API_TOKEN_SALT=your_salt
ADMIN_JWT_SECRET=your_secret
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=sk-...
```

---

## AI Pipeline

When a user enters a blog title in the AI Generator, the system runs:

```
1. Keyword Research     → GPT-4o generates primary/secondary keywords
2. Outline Generation   → GPT-4o creates H2/H3 structure
3. Section Writing      → GPT-4o writes 250–350 words per heading
4. Internal Linking     → Fetches existing posts, AI inserts relevant links
5. SEO Metadata         → Generates title, description, schema
6. Image Generation     → DALL·E 3 generates featured image → uploaded to Strapi
```

Each step saves progress to Strapi (draft post), so nothing is lost.

---

## Project Structure

```
ai-blog-platform/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level pages
│   │   ├── layouts/          # Layout wrappers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API + AI service layer
│   │   └── utils/            # Helpers (reading time, slugify, etc.)
│   ├── .env.example
│   └── vite.config.js
└── backend/
    └── strapi/               # Strapi v4 project
        └── strapi-config/    # Collection type schemas (copy to src/api/)
```

---

## Scripts

```bash
# Start everything (from root)
cd backend/strapi && npm run develop &
cd frontend && npm run dev
```
