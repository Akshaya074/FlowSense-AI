# FlowSense AI 🚀

Live - https://flow-sense-ai-self.vercel.app/

> **Intelligent Developer Activity Ingestion, Daily AI Focus Summaries, and Semantic Chat (RAG) System.**

FlowSense AI is a developer productivity tracker that aggregates telemetry logs from VS Code saves/opens and Chrome documentation whitelisted views. It compiles raw developer logs into professional, structured **Daily Focus Summaries** using Google's Gemini models, indexes summaries into **Qdrant Vector Cloud**, and exposes a **Semantic Context Chatbot (RAG)** alongside a **Redis-cached Workspace Analytics Dashboard** to help developers review their work and recall context.

---

## 🎨 Tech Stack & Architecture

- **Frontend/Backend**: [Next.js](https://nextjs.org/) (Turbopack) & [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [Clerk Security](https://clerk.com/)
- **Database & ORM**: [PostgreSQL (Supabase)](https://supabase.com/) & [Prisma ORM](https://www.prisma.io/)
- **Vector Database**: [Qdrant Vector Search Cloud](https://qdrant.tech/)
- **AI Models**: Google [Gemini API](https://ai.google.dev/) (`gemini-flash-latest`, `gemini-embedding-2`)
- **Caching & Rate Limiting**: [Upstash Redis REST Client](https://upstash.com/)
- **IDE Extensions**: Companion VS Code Extension (TypeScript) & unpacked Chrome Extension (JavaScript)

### System Workflow
```mermaid
graph TD
    A[VS Code / Chrome Extension] -- Telemetry Events --> B[API Events Route]
    B -- Ingestion Rate Limits --> C[Upstash Redis ZSET]
    B -- Write Telemetry Logs --> D[(PostgreSQL Supabase)]
    E[Overview Dashboard] -- Trigger AI Compile --> F[API Summary Route]
    F -- Fetch Logs --> D
    F -- Generate Summary --> G[Gemini Flash]
    F -- Generate Embeddings --> H[Gemini Embedding 2]
    F -- Upsert Vector & Payload --> I[(Qdrant Vector Cloud)]
    J[Ask FlowSense RAG Chat] -- Query Vectorization --> H
    J -- Cosine Filtered Search --> I
    J -- Synthesize Response --> G
    K[Analytics Dashboard] -- 5m TTL Cache --> L[(Upstash Redis Cache)]
```

---

## ✨ Features

### 1. Ingestion & Security guards
* **VS Code Companion Extension**: Tracks file save and file open events in the background, securely storing your Personal Access Token in the OS keystore (VS Code Secrets API).
* **Chrome Extension Logger**: Listens to browser tab views, checking them against a whitelisted regex pattern (e.g. `react.dev`, `clerk.com`) to track research.
* **Sliding Window Rate Limiting**: Uses atomic Redis sorted sets (`ZSET`) to rate-limit events ingestion (60 req/min), RAG search (5 req/min), and summaries (3 req/min), preventing DB and API billing depletion.

### 2. Daily AI Focus Summaries
* **Pipeline Compilation**: Synthesizes timestamped log activities into professional, encourage-focused summaries (🚀 Focus Areas, 📚 Documentation Visited, 💡 Insights).
* **Robust Fallback Engine**: Employs a multi-model backup chain (`gemini-flash-latest` ➡️ `gemini-3.5-flash` ➡️ `gemini-2.5-pro`) to automatically recover from transient 503 capacity issues.
* **Clerk 429 Bypass**: Resolves local session clerk IDs first to eliminate Clerk Dev backend API quotas.

### 3. Ask FlowSense Chat (RAG)
* **Tenant Security Vector Match**: Enforces strict user ID filtering within Qdrant Cloud to prevent any data leak between client profiles.
* **Conversational Context Synthesizer**: Vectorizes user queries, fetches relevant daily summary context, and outputs styled markdown answers with clickable source date tags.

### 4. Cached Workspace Analytics
* **Developer Stats HUD**: Tracks coding hours, files edited, doc searches, and total events.
* **SVG Trends Chart**: Custom interactive SVG trend chart visualizing coding session duration per day over the past 7 days (complete with hover tooltip minutes).
* **Redis Caching**: Caches compiled analytics in Redis for 5 minutes, keeping page load latency under 15ms.

---

## ⚙️ Environment Configurations

Create a `.env` (or `.env.local` for high-risk secrets) file in the root folder:

```env
# 1. Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# 2. Database Connection
DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/postgres?schema=public"

# 3. Google Gemini AI Studio
GEMINI_API_KEY=AIzaSy...

# 4. Qdrant Vector Cloud
QDRANT_URL=https://your-cluster-id.aws.cloud.qdrant.io:6333
QDRANT_API_KEY=your_qdrant_api_key

# 5. Upstash Redis Cache
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

---

## 🚀 Getting Started

### 1. Database Migrations and Seeding
Initialize your database schemas and populate mock seed events for developer overview previews:
```bash
npx prisma migrate dev --name init
node prisma/seed.js
```

### 2. Install Dependencies & Run Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application dashboard.

---

## 🧪 Testing the Extensions Locally

### 1. VS Code Extension
1. Open the `vscode-extension/` directory in VS Code.
2. Press `F5` to open the Extension Development Host window.
3. Open VS Code Settings (`Ctrl+,`) and configure:
   * **`FlowSense AI: Service URL`**: Set to `http://localhost:3000`
4. Open the Command Palette (`Ctrl+Shift+P`), run **`FlowSense AI: Set Personal Access Token`**, and paste the token generated in the Settings page.

### 2. Chrome Extension
1. Open Chrome and navigate to `chrome://extensions/`.
2. Toggle on **Developer Mode** (top-right).
3. Click **Load Unpacked** and select the `browser-extension/` directory.
4. Click the FlowSense extension icon in your toolbar, paste your token, set the Server URL, and click **Save**.
