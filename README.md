# 🚀 Webhook-Driven Task Processing Pipeline

![CI](https://github.com/heleneolivares/Webhook-Driven-Task-Processing-Pipeline/actions/workflows/ci.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=flat&logo=docker&logoColor=white)

A backend service that receives webhooks, processes them asynchronously through a background worker, and delivers results to registered subscriber endpoints. Think of it as a simplified Zapier — an inbound event triggers a processing step, and the result is forwarded to one or more destinations.

---

## ✨ Features

- ✅ **Webhook Ingestion** — Receive events from any source via unique pipeline URLs
- ✅ **Async Processing** — Background job queue with retry logic
- ✅ **3 Processing Actions** — Filter, AI Analysis, and Smart Aggregation
- ✅ **Multi-subscriber Delivery** — Send results to multiple URLs per pipeline
- ✅ **Soft Delete** — Pipelines and subscribers are never lost
- ✅ **Many-to-Many** — One subscriber can belong to multiple pipelines
- ✅ **AI-Powered** — Gemini AI generates human-readable insights
- ✅ **Full Observability** — Track every job and delivery attempt
- ✅ **Dockerized** — Runs with a single command

---

## 🏗️ Architecture
Client
│
▼
API Server (Express)
│
├── POST /webhooks/:sourceKey
│         │
│         ▼
│    PostgreSQL (Job Queue)
│         │
│         ▼
│      Worker
│         │
│    ┌────┴────────────────┐
│    │                     │
│    ▼                     ▼
│  filter            ai_analysis
│    │                     │
│    └────────┬────────────┘
│             │
│          aggregate
│    (filter + AI summary)
│             │
│             ▼
│      Subscriber URLs
│      (with retry logic)
│
└── GET /jobs, /pipelines, /subscribers

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| TypeScript | Language |
| Node.js + Express | API Server |
| PostgreSQL | Database + Job Queue |
| Drizzle ORM | Database queries |
| Docker + Docker Compose | Containerization |
| GitHub Actions | CI/CD |
| Vitest | Testing |
| Google Gemini AI | AI Analysis |
| Axios | HTTP delivery |

---

## ⚙️ Processing Actions

### 🔍 `filter`
Filters incoming webhook payload based on a condition. Jobs that don't meet the condition are marked as `skipped`.

```json
{
  "actionType": "filter",
  "actionConfig": {
    "field": "discount_percent",
    "operator": "gt",
    "value": 20
  }
}
```

Supported operators: `gt` `lt` `eq` `gte` `lte` `neq`

---

### 🤖 `ai_analysis`
Uses Google Gemini AI to analyze a single webhook payload and generate a human-readable summary with insights and recommendations.

```json
{
  "actionType": "ai_analysis",
  "actionConfig": {
    "prompt": "Focus on price trends and whether this is a good deal"
  }
}
```

---

### 📊 `aggregate`
Accumulates multiple webhook events over a configurable time window, filters them, and uses Gemini AI to generate an intelligent group summary.

```json
{
  "actionType": "aggregate",
  "actionConfig": {
    "windowMinutes": 60,
    "maxEvents": 100,
    "filter": {
      "field": "discount_percent",
      "operator": "gt",
      "value": 20
    },
    "prompt": "Analyze these discounted products and identify the best deals"
  }
}
```

---

## 🚀 Setup

### Prerequisites

- Docker
- Node.js 20+
- A [Gemini API key](https://aistudio.google.com/apikey) (free)

### Run with Docker Compose

```bash
# 1. Clone the repository
git clone https://github.com/heleneolivares/Webhook-Driven-Task-Processing-Pipeline.git
cd Webhook-Driven-Task-Processing-Pipeline

# 2. Set up environment variables
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# 3. Start all services
docker compose up --build

# 4. Run migrations 
docker exec -i webhook_db psql -U postgres -d webhook_pipeline < drizzle/0000_jittery_drax.sql
```

### Run tests

```bash
npm test
```

---

## 📡 API Endpoints

### Pipelines
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/pipelines` | Get all pipelines |
| `GET` | `/pipelines/:id` | Get pipeline by ID |
| `POST` | `/pipelines` | Create pipeline |
| `PATCH` | `/pipelines/:id` | Update pipeline |
| `DELETE` | `/pipelines/:id` | Soft delete pipeline |

### Subscribers
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/subscribers` | Get all subscribers |
| `GET` | `/subscribers/:id` | Get subscriber by ID |
| `POST` | `/subscribers` | Create subscriber |
| `PATCH` | `/subscribers/:id` | Update subscriber |
| `DELETE` | `/subscribers/:id` | Soft delete subscriber |
| `POST` | `/subscribers/:id/pipelines/:pipelineId` | Link to pipeline |
| `DELETE` | `/subscribers/:id/pipelines/:pipelineId` | Unlink from pipeline |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/webhooks/:sourceKey` | Ingest webhook |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/jobs` | Get all jobs |
| `GET` | `/jobs/:id` | Get job by ID |
| `GET` | `/jobs/:id/delivery-attempts` | Get delivery attempts |

---

## 🗄️ Database Schema
pipelines ──────────── pipeline_subscribers ──────────── subscribers
│                                                          │
│                                                          │
webhook_events                                         delivery_attempts
│                                                          │
│                                                          │
jobs ──────────────────────────────────────────────────────┘
│
aggregation_buckets

---

## 🧠 Design Decisions

### Modular Architecture
Each feature has its own module with `routes`, `service`, and `queries` layers — clean separation of concerns, easy to scale.

### PostgreSQL as Job Queue
Instead of Redis or RabbitMQ, PostgreSQL acts as the queue backend. Simpler infrastructure, strong consistency, easy debugging.

### Soft Delete
Pipelines and subscribers are never physically deleted — `deleted_at` is set instead. Full history preserved, accidental deletions recoverable.

### Many-to-Many Subscribers
Subscribers exist independently and can be linked to multiple pipelines via `pipeline_subscribers` join table.

### Separate API and Worker
The API accepts requests and queues work instantly. The worker processes jobs asynchronously — slow processing never blocks incoming webhooks.

### Retry Logic
Failed deliveries retry up to 3 times with exponential backoff. Every attempt logged in `delivery_attempts` for full observability.

### Aggregation Buckets
The `aggregate` action uses a bucket system to collect events over a time window. When the window expires, events are filtered and analyzed together by Gemini AI.

---

## 👩‍💻 Author

**Helene Olivares**