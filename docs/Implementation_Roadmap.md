# FlowSense AI - Master Implementation Roadmap (Refined)
## Document Version: 1.1.0
## Date: July 15, 2026

This document serves as the step-by-step guide for implementing FlowSense AI. We will complete this project phase-by-phase. For each phase, we will align on goals, prerequisites, folder mappings, database requirements, UI adjustments, backend rules, testing procedures, commits, and lessons learned.

---

## Phase 1: Project Setup
### 1. Phase Goal
* **What**: Initialize the base repository as a Next.js App Router application. Integrate Tailwind CSS, add the shadcn/ui design library, configure Clerk authentication, build a public marketing landing page, and establish a protected layout for the dashboard.
* **Why**: Establishes the foundations of routing, page layout, custom styling systems, and authentication middlewares before introducing backend storage or external telemetry integrations.

### 2. Concepts Required
* **Next.js App Router Layouts & Routing**: Understanding layout layouts (`layout.js`) and Route Groups `(auth)`.
* **Component Styling (Tailwind + shadcn/ui)**: The integration of styling and Radix-based UI configurations.
* **Clerk Middleware**: Configuring authentication boundaries in middleware to protect `/dashboard/*` routes.
* **Page State Handling**: Designing components to support Loading, Empty, Error, and Success visual states.

### 3. Folder Changes
* **Folders to Create**:
  * `app/(auth)/sign-in/[[...sign-in]]/`
  * `app/(auth)/sign-up/[[...sign-up]]/`
  * `app/dashboard/`
  * `components/`
  * `components/ui/`
* **Files to Create**:
  * `app/layout.js` (Global setup + Clerk provider wrapper)
  * `app/page.js` (Landing page featuring a hero section, features list, and CTA)
  * `app/dashboard/page.js` (Secure dashboard overview page displaying summary triggers)
  * `app/dashboard/layout.js` (Dashboard shell containing sidebar navigation UI with links: Dashboard, Timeline, Ask FlowSense, Analytics, Settings)
  * `app/middleware.js` (Clerk security logic definition)
  * `app/globals.css` (Base styling tokens)
  * `components/dashboard-sidebar.jsx` (Navigation sidebar component)
* **Files to Modify**:
  * `package.json` (Add Clerk and Tailwind/shadcn dependencies)

### 4. Database Changes
* None (Database is introduced in Phase 2).

### 5. API Design
* None (Only static and authenticated routes are configured in this setup phase).

### 6. Frontend Changes
* **Landing Page**: Public marketing screen displaying the core value proposition.
* **Dashboard Layout**: Protected panel layout containing a left navigation panel mapping: Dashboard, Timeline, Ask FlowSense, Analytics, Settings.
* **UI Flow**: Unauthenticated traffic is redirected to Clerk login routes, and successful authentication leads users to `/dashboard`. Handles Loading skeleton state during initial user state resolution.

### 7. Backend Changes
* **Middleware Auth Guard**: Clerk checks inbound routes, blocking access to `/dashboard` pathways for unauthenticated requests.

### 8. Testing Checklist
- [ ] Run `npm run dev` and verify that the application boots without compiler warnings.
- [ ] Attempt to access `/dashboard` directly as an anonymous visitor. Ensure user is redirected to Clerk sign-in.
- [ ] Create a test account using Clerk and verify that a redirect lands on the secure `/dashboard` route.
- [ ] Verify that landing page components display responsively across desktop, tablet, and mobile views.

### 9. Git Commit
`feat: initialize nextjs project, configure tailwind, shadcn, clerk auth and dashboard shell`

### 10. Learning Outcome
* Master secure middleware pathing configurations in Next.js.
* Learn component design patterns with Tailwind CSS and Radix UI.

---

## Phase 2: Database Setup & Event Ingestion
### 1. Phase Goal
* **What**: Initialize Supabase PostgreSQL, configure Prisma ORM, specify the database schema, write a seed script to generate realistic telemetry mock data, and build telemetry API route handlers to receive events.
* **Why**: Telemetry requires a reliable structured storage layer. Seeding provides the testing foundation for development of Phase 3, 6, and 8. Ingestion handlers receive external client data.

### 2. Concepts Required
* **Relational Database Design**: Normalization, foreign keys, indexing.
* **Prisma ORM & Seeding**: Model configurations, migrations, and writing custom seed scripts using Prisma Client.
* **REST API Authorization**: Checking bearer tokens on request headers (`Authorization: Bearer <PAT>`).

### 3. Folder Changes
* **Folders to Create**:
  * `prisma/`
  * `prisma/migrations/`
  * `app/api/events/`
  * `app/api/user/token/`
  * `lib/`
  * `lib/services/`
* **Files to Create**:
  * `prisma/schema.prisma` (Database models definition)
  * `prisma/seed.js` (Database seeding script to generate realistic coding & browser events)
  * `lib/db.js` (Singleton database instance helper)
  * `lib/services/telemetry.js` (Telemetry event processing & token validation logic)
  * `app/api/events/route.js` (REST ingestion endpoint POST handler validating Bearer token)
  * `app/api/user/token/route.js` (PAT token generation and hashing POST handler)

### 4. Database Changes
* **New Tables**:
  * `User` (email, clerkId, hashed token value representing the PAT)
  * `TelemetryEvent` (eventType: `FILE_OPEN` / `FILE_SAVE` / `DOC_VISIT`, resourceName, workspace, timestamp, metadata json)
  * `DailySummary` (date, markdown content, reference mappings)
* **Relations**: `User` has a 1-to-many relationship with both `TelemetryEvent` and `DailySummary`.
* **Migrations**: Executing initial migration script to build tables inside the Supabase instance.

### 5. API Design
* **POST `/api/events`**: Ingests telemetry logs.
  * Inputs: Header `Authorization: Bearer <PAT>`, JSON body (`eventType`, `resourceName`, `workspace`, `timestamp`, `metadata`).
  * Outputs: `202 Accepted` success JSON, or `401 Unauthorized` for missing/invalid keys.
* **POST `/api/user/token`**: Generates or replaces a user Personal Access Token (PAT).
  * Outputs: Plaintext token payload string starting with `fs_pat_`.

### 6. Frontend Changes
* None (Focus is on backend REST API logic).

### 7. Backend Changes
* **Token Hashing**: Implement secure token validation (the client receives a raw `fs_pat_` key, but the database stores a cryptographically hashed representation).
* **Ingestion Guard**: Reject telemetry entries containing missing metadata or invalid schemas.

### 8. Testing Checklist
- [ ] Run Prisma migration sync to ensure database tables deploy correctly to Supabase.
- [ ] Run `npx prisma db seed` and confirm that realistic mock data is populated into PostgreSQL.
- [ ] Call POST `/api/user/token` as an authenticated user to verify that a token is returned and its hashed representation is stored in PostgreSQL.
- [ ] Submit an event to POST `/api/events` with an invalid token. Verify that a `401 Unauthorized` response is returned.
- [ ] Submit a correctly formatted telemetry payload using a valid token in the `Authorization` header. Verify that a `202 Accepted` response is returned.

### 9. Git Commit
`feat: configure supabase db, write seed script and build events ingestion api`

### 10. Learning Outcome
* Learn database normalization, schema seeding, and bearer token authorization strategies in serverless handlers.

---

## Phase 3: Dashboard Layout & Timeline UI
### 1. Phase Goal
* **What**: Build the dashboard overview screen and the timeline page, displaying recent active files and documentation logs populated directly from PostgreSQL.
* **Why**: The timeline serves as the visual display of the developer's raw context, showing what files were edited and what web resources were accessed.

### 2. Concepts Required
* **React State & Pagination**: Fetching and displaying records dynamically as the user scrolls.
* **Prisma Aggregations**: Querying database records with filters, sorting data by timestamp.
* **Next.js Page States**: Designing pages to handle Loading (skeleton UI), Empty (blank state messages), Error (error layouts with retries), and Success (data feeds) dynamically.

### 3. Folder Changes
* **Folders to Create**:
  * `app/dashboard/timeline/`
  * `app/api/dashboard/timeline/`
* **Files to Create**:
  * `app/dashboard/timeline/page.js` (Chronological timeline screen with filters and state boundaries)
  * `app/api/dashboard/timeline/route.js` (Route handler: queries events directly from PostgreSQL)
  * `components/timeline-feed.jsx` (Visual list displaying event cards with appropriate icons)
* **Files to Modify**:
  * `app/dashboard/page.js` (Overview cards showing daily stats)

### 4. Database Changes
* None.

### 5. API Design
* **GET `/api/dashboard/timeline`**: Queries timeline entries.
  * Parameters: `page` (integer offset), `limit` (page size).
  * Returns: List of telemetry events sorted chronologically by timestamp.

### 6. Frontend Changes
* **Timeline Page**: Features interactive filters to toggle between IDE activities (file open/save) and browser activities (docs visits), supporting explicit **Loading**, **Empty**, **Error**, and **Success** UI wrappers.
* **Dashboard Home**: Updates overview cards showing total event counts for the current day.

### 7. Backend Changes
* **Metadata Parsing**: Formats telemetry entries (e.g., rendering file name extensions with appropriate language badges) before sending data to the client.

### 8. Testing Checklist
- [ ] Verify timeline loading states display skeletons before mock data renders.
- [ ] Open `/dashboard/timeline` and verify that seeded mock events display in reverse chronological order (newest first).
- [ ] Interact with the filters (Code vs. Docs). Verify that the list updates correctly without errors.
- [ ] Empty check: Clear event logs for a user and verify that a friendly "No events recorded yet" prompt is shown.

### 9. Git Commit
`feat: build timeline query endpoint and render timeline UI with loading states`

### 10. Learning Outcome
* Gain experience designing interactive dashboard interfaces and implementing paginated data retrieval.

---

## Phase 4: VS Code Extension
### 1. Phase Goal
* **What**: Build the VS Code companion extension to monitor workspace file states (Opened and Saved) and send telemetry payloads to the Next.js API.
* **Why**: Capturing real-time development events requires direct integration with the developer's editor environment.

### 2. Concepts Required
* **VS Code Extension API**: Activation configurations, event listeners (`onDidOpenTextDocument`, `onDidSaveTextDocument`), and workspace state detection.
* **VS Code Secret Storage**: Storing sensitive parameters (user PATs) securely inside the client editor context.
* **Axios / Node Fetch**: Executing requests with `Authorization: Bearer <token>` authentication headers.

### 3. Folder Changes
* **Folders to Create**:
  * `vscode-extension/`
  * `vscode-extension/src/`
* **Files to Create**:
  * `vscode-extension/package.json` (Extension configurations, commands, and options manifest)
  * `vscode-extension/tsconfig.json` (TypeScript parameters)
  * `vscode-extension/webpack.config.js` (Build configs)
  * `vscode-extension/src/extension.ts` (Core logic: watches text editor events and dispatches HTTP requests with Bearer tokens)

### 4. Database Changes
* None.

### 5. API Design
* None (Extension communicates directly with the ingestion API created in Phase 2).

### 6. Frontend Changes
* None.

### 7. Backend Changes
* None.

### 8. Testing Checklist
- [ ] Compile the extension locally using the VS Code extension development host (`F5`).
- [ ] Run the "FlowSense: Set Token" command. Verify that the PAT is stored correctly in secure settings.
- [ ] Open and save files inside the extension host environment. Verify in the host output console that event payloads are correctly formatted.
- [ ] Verify that events successfully arrive at the backend REST API and are recorded in the PostgreSQL database.

### 9. Git Commit
`feat: create vscode extension to track file open and save events`

### 10. Learning Outcome
* Learn how to build VS Code extensions, monitor workspace states, and manage secure storage on desktop clients.

---

## Phase 5: Browser Extension
### 1. Phase Goal
* **What**: Build the companion Chrome Extension using a background worker (no content scripts) to log developer visits to whitelisted documentation sites and send tab URLs to the Next.js API.
* **Why**: Capturing browser context provides the other half of a developer's working flow—the reference documentation they read while solving problems.

### 2. Concepts Required
* **Chrome Extension Architecture (Manifest V3)**: Manifest rules, background service workers, Chrome options pages, and local storage state APIs.
* **Whitelist URL Checking**: Using regular expressions or domain checks to capture page visits without tracking sensitive browsing history.

### 3. Folder Changes
* **Folders to Create**:
  * `browser-extension/`
* **Files to Create**:
  * `browser-extension/manifest.json` (Manifest configuration file)
  * `browser-extension/background.js` (Service worker script monitoring active tab transitions)
  * `browser-extension/popup.html` (Extension popup UI)
  * `browser-extension/popup.js` (Popup logic: saves PAT to chrome storage)

### 4. Database Changes
* None.

### 5. API Design
* None (Communicates directly with the ingestion API).

### 6. Frontend Changes
* **Extension Options Popup**: Small input window allowing developers to paste and save their PAT.

### 7. Backend Changes
* None.

### 8. Testing Checklist
- [ ] Load the `browser-extension` folder as an unpacked extension in Google Chrome.
- [ ] Enter a valid user PAT in the extension popup and verify it is successfully saved to local extension storage.
- [ ] Navigate to a whitelisted website (e.g., Stack Overflow or MDN) and verify that the tab URL is correctly captured.
- [ ] Navigate to a non-whitelisted site (e.g., news or entertainment sites) and verify that no tracking events are recorded.
- [ ] Check the database to confirm that whitelisted site visits are successfully stored as events.

### 9. Git Commit
`feat: create chrome extension to capture whitelisted documentation visits`

### 10. Learning Outcome
* Understand Chrome Manifest V3 extension structure, service worker life cycles, whitelist matching, and local extension storage.

---

## Phase 6: AI On-Demand Summarization
### 1. Phase Goal
* **What**: Integrate Gemini API and LangChain to build an on-demand summarization tool. When a summary is generated, the system creates vector representations of the generated daily summary (not individual events) and writes them to Qdrant Cloud.
* **Why**: Summaries turn raw telemetry logs into readable summaries. Embedding summaries instead of raw logs optimizes vector space size and RAG query accuracy.

### 2. Concepts Required
* **LangChain Orchestration**: Constructing structured prompts, using model chains.
* **Google Gemini API**: Dynamic content generation and parameters configuration.
* **Qdrant Vector Database Integration**: Initializing collections, writing vector points, and attaching metadata content.

### 3. Folder Changes
* **Folders to Create**:
  * `app/api/ai/summary/`
* **Files to Create**:
  * `lib/gemini.js` (Gemini API client initialization helper)
  * `lib/qdrant.js` (Qdrant client instance helper)
  * `lib/services/ai.js` (Summary generation business logic)
  * `app/api/ai/summary/route.js` (Route handler: triggers daily summary generation)
  * `components/summary-card.jsx` (Dashboard card component showing summaries)

### 4. Database Changes
* **Relations Used**: Reads `TelemetryEvent` rows and writes results to the `DailySummary` table.

### 5. API Design
* **POST `/api/ai/summary`**: Generates a summary for a given day and stores embeddings in Qdrant.
  * Inputs: JSON body containing the target `date`.
  * Outputs: Markdown summary text string.

### 6. Frontend Changes
* **Dashboard Summary Panel**: Shows summary cards for selected days supporting Loading (pulsing state), Empty (options to trigger generation), Error (re-run options), and Success states.

### 7. Backend Changes
* **LLM Prompts**: Prompt templates that guide Gemini to format summaries into structured sections.
* **Embed & Indexing**: Generate vector representations of the final generated daily summary and upload them to Qdrant Cloud.
* **Database Check**: Prevent redundant Gemini calls by checking if a summary for the given date already exists.

### 8. Testing Checklist
- [ ] Verify that the Next.js backend reads Gemini API key configurations.
- [ ] Trigger summary generation from the dashboard and verify loading skeletons display.
- [ ] Confirm that the markdown summary is written to PostgreSQL.
- [ ] Inspect Qdrant dashboard and confirm that the daily summary is embedded and stored.

### 9. Git Commit
`feat: implement on-demand daily summarization and write summary embeddings to qdrant`

### 10. Learning Outcome
* Learn prompt engineering, LangChain integration, and output caching strategies for LLM-based services.

---

## Phase 7: Ask FlowSense Chat (RAG)
### 1. Phase Goal
* **What**: Build the RAG semantic search interface (Ask FlowSense) allowing the user to search past summaries using natural language questions.
* **Why**: RAG search allows developers to retrieve context using natural language questions (e.g., *"What did I learn when working on the Redis configuration?"*).

### 2. Concepts Required
* **RAG Pipeline Flow**: Vectorizing user questions -> querying Qdrant summaries -> supplying matches as prompt context to Gemini -> returning responses.

### 3. Folder Changes
* **Folders to Create**:
  * `app/dashboard/ask-flowsense/`
  * `app/api/ai/search/`
* **Files to Create**:
  * `app/dashboard/ask-flowsense/page.js` (Ask FlowSense chat view with state parameters)
  * `lib/services/rag.js` (RAG semantic query business logic)
  * `app/api/ai/search/route.js` (RAG search endpoint POST handler)
  * `components/search-widget.jsx` (Chat dialog widget)

### 4. Database Changes
* None (Query matching matches summary collections in Qdrant).

### 5. API Design
* **POST `/api/ai/search`**: Processes natural language queries.
  * Inputs: JSON body containing the search `query`.
  * Outputs: Answer string generated from matching context.

### 6. Frontend Changes
* **Ask FlowSense Page**: Conversational chatbot interface supporting user inputs, displaying AI typing state (Loading), handling search errors (Error), and showing responses (Success).

### 7. Backend Changes
* **Embedding Generation**: Convert user queries into vector embeddings using Gemini's text embedding model.
* **RAG Prompting**: Retrieve matching summaries from Qdrant, construct a context-rich prompt, and call Gemini.

### 8. Testing Checklist
- [ ] Open the Ask FlowSense panel and verify the Empty state displays starter suggestions.
- [ ] Submit a question (e.g. *"What did I do yesterday?"*). Confirm that the vector search triggers.
- [ ] Verify that the generated response is based on matching daily summaries.
- [ ] Test the error boundaries by simulating database connection failures.

### 9. Git Commit
`feat: build ask flowsense RAG chat interface with qdrant and gemini`

### 10. Learning Outcome
* Understand how to implement RAG pipelines, generate and compare vector embeddings, and work with vector databases.

---

## Phase 8: Analytics UI & Rate Limiting
### 1. Phase Goal
* **What**: Add analytics charts to visualize development trends, connect Upstash Redis to cache charts data, and implement basic rate limiting for AI and telemetry endpoints.
* **Why**: Analytics provide visual insights. Caching reduces PostgreSQL aggregation loads. Rate limiting protects the Serverless environment from API spam.

### 2. Concepts Required
* **Data Visualization (Recharts)**: Drawing charts from structured arrays.
* **Upstash Redis Rate Limiting**: Implementing token bucket algorithms to limit endpoint access using Upstash Redis.

### 3. Folder Changes
* **Folders to Create**:
  * `app/dashboard/analytics/`
  * `app/api/dashboard/analytics/`
* **Files to Create**:
  * `app/dashboard/analytics/page.js` (Dashboard analytics layout)
  * `app/api/dashboard/analytics/route.js` (Analytics query route handler)
  * `lib/redis.js` (Redis client initialization helper)
  * `lib/services/analytics.js` (Analytics data aggregation services)
  * `components/analytics-charts.jsx` (Chart wrapper components)

### 4. Database Changes
* None.

### 5. API Design
* **GET `/api/dashboard/analytics`**: Computes data for charts.
  * Outputs: Aggregated counts of coding time, file saves, and visited documentation domains.

### 6. Frontend Changes
* **Analytics Page**: Renders charts (coding time, top files, top domains) supporting Loading, Empty, and Success states.

### 7. Backend Changes
* **Upstash Rate Limiting**: Intercept `/api/events` and `/api/ai/search` requests using Redis token counters. Return `429 Too Many Requests` when limits are exceeded.
* **Analytics Cache**: Cache computed metrics in Upstash Redis to avoid running heavy PostgreSQL queries on every page load.

### 8. Testing Checklist
- [ ] Open the Analytics page. Verify that database queries aggregate records correctly and cache the output.
- [ ] Refresh the page and confirm that data is served from Redis (no new PostgreSQL logs query).
- [ ] Test rate limiting: Spam `/api/events` with rapid requests and verify that the endpoint returns `429 Too Many Requests`.

### 9. Git Commit
`feat: implement analytics charts, redis cache and rate limiting`

### 10. Learning Outcome
* Learn how to use charting libraries, implement key-value caching, and enforce serverless rate-limiting security.

---

## Phase 9: Testing & Vercel Deployment
### 1. Phase Goal
* **What**: Finalize end-to-end manual testing, resolve outstanding console and build errors, commit to GitHub, and deploy to Vercel production hosting.
* **Why**: The final step ensures the application functions correctly in a production environment and serves as a polished, recruiter-ready portfolio project.

### 2. Concepts Required
* **Vercel Deployments**: Environment variable bindings, serverless execution limits.
* **Production Build Processes**: Compiling and testing production builds locally using `npm run build`.

### 3. Folder Changes
* **Files to Create**:
  * `README.md` (Detailed setup guide, architecture outline, and resume-ready summaries)
* **Files to Modify**:
  * Root configurations for deployment.

### 4. Database Changes
* None (Production tables are created in the live Supabase instance).

### 5. API Design
* None (Verify security and rate-limiting across all existing endpoints).

### 6. Frontend Changes
* **UI Polish**: Add smooth transitions and clear loading indicators. Make sure mock data is removed.

### 7. Backend Changes
* **Production Configs**: Ensure all API routes retrieve production connection strings for Supabase, Qdrant, and Redis.

### 8. Testing Checklist
- [ ] Run `npm run build` locally and ensure the build completes without errors.
- [ ] Push the project repository to a public GitHub repository.
- [ ] Connect the repository to Vercel and configure all required environment variables.
- [ ] Perform an end-to-end test in production: configure the extensions with production credentials, verify event logging, and check the dashboard visualizations, summaries, and search features.

### 9. Git Commit
`docs: complete testing, update readme and prepare for production vercel deployment`

### 10. Learning Outcome
* Gain experience deploying full-stack Next.js applications, linking cloud services (Supabase, Upstash, Qdrant), and configuring production environment variables.
