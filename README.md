# VoiceAgent.ai

**VoiceAgent.ai** is a plug-and-play SaaS platform that enables small and mid-sized businesses to deploy AI-powered voice agents for phone-based customer interactions. No development work is required—just configure, and your virtual agent is live!

---

## Key Features

* **Prebuilt Voice Agents**

  * **FAQ Agent**: Automatically answers customer questions using your website/docs.
  * **Booking Agent**: Schedules appointments by integrating with Google Calendar or Calendly.
  * **Order Agent**: Takes and processes inventory orders via simple voice-driven menus.

* **Self-Service Onboarding**

  * Upload URLs, PDFs, or CSVs to provide your business knowledge base.
  * Automatic website crawling and text indexing.
  * Vector embeddings stored in a managed database for fast retrieval.

* **Telephony & AI Integration**

  * Dedicated phone numbers via Twilio Programmable Voice.
  * Real-time transcription with Twilio or OpenAI Whisper.
  * Conversational AI powered by OpenAI GPT-4.
  * Text-to-speech responses using ElevenLabs or Amazon Polly.

* **Business Dashboard**

  * View call logs, transcripts, and user interactions.
  * Analytics: call volume, success rates, common intents.
  * Manage agent settings: business hours, greeting scripts, phone numbers.
  * Billing and plan management (General vs. Custom).

* **Custom Plan**

  * White-glove service to build a fully tailored voice agent.
  * Voice/style fine-tuning, advanced prompt engineering.

---

## Tech Stack

| Layer            | Technologies                                              |
| ---------------- | --------------------------------------------------------- |
| **Frontend**     | Next.js, React, Tailwind CSS, Shadcn UI, Clerk/Auth0      |
| **Backend**      | FastAPI (Python) or Express.js (Node)                     |
| **Database**     | PostgreSQL (via Supabase)                                 |
| **Vector Store** | Pinecone / Supabase Vector / FAISS                        |
| **Telephony**    | Twilio Programmable Voice & Webhooks                      |
| **AI Services**  | OpenAI GPT-4 (NLU), Whisper (ASR), ElevenLabs/Polly (TTS) |
| **Storage**      | AWS S3 (audio files)                                      |
| **Async Tasks**  | Celery (Python) or BullMQ (Node)                          |

---

## Getting Started

### Prerequisites

* Node.js >= 16
* Python 3.9+
* PostgreSQL instance (or Supabase account)
* Twilio account (Voice API enabled)
* OpenAI API key
* AWS S3 bucket (for audio storage)

### Installation

1. **Clone the repo**:

   ```bash
   git clone https://github.com/your-org/voiceagent.ai.git
   cd voiceagent.ai
   ```

2. **Backend Setup**:

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   # Fill in your DATABASE_URL, TWILIO, OPENAI, and AWS credentials
   alembic upgrade head
   uvicorn main:app --reload
   ```

3. **Frontend Setup**:

   ```bash
   cd ../frontend
   npm install
   cp .env.local.example .env.local
   # Add NEXT_PUBLIC_ env vars for Supabase, Clerk, etc.
   npm run dev
   ```

4. **Twilio Webhook Configuration**:

   * In your Twilio Console, set the Voice & Messaging webhook URLs to `https://your-domain.com/api/twilio/incoming` and `https://your-domain.com/api/twilio/transcription` respectively.

---

## Project Structure

```
├── backend/                         # FastAPI backend
│   ├── app/                         # API modules, services, models
│   ├── celery/                      # Async tasks for crawling & embedding
│   ├── alembic/                     # DB migrations
│   └── main.py                      # Entry point
├── frontend/                        # Next.js dashboard
│   ├── pages/                       # Next.js pages
│   ├── components/                  # UI components (Shadcn)
│   └── lib/                         # Supabase, Clerk, Twilio clients
├── scripts/                         # Utility scripts (crawler, chunking)
├── .env.example                     # Example environment variables
└── README.md                        # This file
```

---

## MVP Roadmap (20 Hours)

1. **Phase 1 (2.5h)**: Repo setup, Twilio sandbox test.
2. **Phase 2 (6h)**: Call flow (webhook, transcription, GPT, TTS).
3. **Phase 3 (6h)**: Dashboard: auth, onboarding form, logs view.
4. **Phase 4 (3.5h)**: API endpoints & embeddings indexing.
5. **Phase 5 (2h)**: E2E testing, polish UI, demo script.

---

## Contributing

1. Fork the repo. 2. Create a branch (`git checkout -b feature-name`). 3. Commit your changes. 4. Open a Pull Request.

---

## License

MIT © Your Company
