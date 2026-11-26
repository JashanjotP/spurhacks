# Front-Desk AI: A Friendly Voice for Your Business
## Conversational AI Agent

This project is a helper for small and mid-sized businesses that want an AI to answer their phone calls. You can set it up easily without writing any code. It can handle common questions, book appointments, and more, all through a simple phone call.

---

### Our Story So Far

**The Idea:**
We wanted to create a helpful AI that could manage a business's phone calls. The goal was to build something that any business owner could use, whether it's answering frequently asked questions by learning from a website or scheduling appointments for customers. It's all managed through a simple dashboard.

**The Tools We're Using:**
For anyone curious about the tech, here's what's under the hood:
*   **Frontend:** We're using Next.js, React, and Tailwind CSS to build the dashboard you see and use.
*   **Backend:** A Python framework called FastAPI is the brain of the operation.
*   **Database & Login:** We rely on Supabase to handle our database, user accounts, and storing information securely.
*   **The Magic:** Twilio provides the phone numbers, OpenAI's GPT-4 helps with understanding conversations, and ElevenLabs makes the AI's voice sound natural.

**A Quick Note on the Journey:**
Building this has been a learning experience. We ran into a tricky bug with our database (Supabase) that took a few hours to figure out. It was a good reminder that even with modern tools, things can get complex, especially with security rules and data formatting. We're happy we pushed through it and learned a lot along the way.

---

### What It Can Do

*   **Ready-to-Go AI Helpers**
    *   **FAQ Helper:** Give it a link to your website or a document, and it will learn how to answer common customer questions.
    *   **Booking Helper:** Can help customers schedule appointments.
    *   **Order Helper:** Can take simple inventory orders over the phone.

*   **Easy Setup**
    *   You can give it website links, PDFs, or other files to learn from.
    *   It smartly organizes the information so it can find answers quickly.

*   **The Dashboard**
    *   A simple place to see call history and what was discussed.
    *   You can also manage your AI helper's settings, like its greeting message or business hours.

---

### How to Get Started

**What You'll Need:**
*   A basic understanding of Node.js and Python.
*   Accounts with Supabase, Twilio, and OpenAI.
*   A place to store audio files, like AWS S3.

**Setting Things Up:**
1.  **Get the code:**
    ```bash
    git clone https://github.com/your-org/frontdeskai.git
    cd frontdeskai
    ```

2.  **Set up the backend (the brain):**
    ```bash
    cd backend
    pip install -r requirements.txt
    # You'll need to copy .env.example to .env and fill it out
    uvicorn main:app --reload
    ```

3.  **Set up the frontend (the dashboard):**
    ```bash
    cd ../frontend
    npm install
    # Also copy .env.local.example to .env.local and add your details
    npm run dev
    ```

4.  **Connect to Twilio:**
    *   In your Twilio account, you'll need to point the voice webhooks to your new backend URL.

---

### How the Project is Organized

```
├── backend/         # The brain of the operation
├── frontend/        # The dashboard you'll use
├── scripts/         # Extra helper scripts
└── README.md        # The file you're reading now :)
```

---

### Phases of our development

1.  **Phase 1**: Get the project started and test the phones.
2.  **Phase 2**: Build the main call flow (listening, thinking, speaking).
3.  **Phase 3**: Create the dashboard with login and call history.
4.  **Phase 4**: Teach the AI to learn from documents.
5.  **Phase 5**: Test everything, polish the design, and get ready for a demo.

---

### Contributing

We'd love for you to contribute! Here's how you can help:
1.  Fork the project.
2.  Create a new branch for your feature (`git checkout -b feature-name`).
3.  Make your changes and commit them.
4.  Open a Pull Request.

---

## License

MIT © Front-Desk AI
