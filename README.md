---

# Next.js AI Document Assistant

A modern, full-stack Next.js application for document summarization, Q&A, and conversational AI—featuring a beautiful, responsive UI, PDF upload, and advanced AI-powered features.

---

## ✨ Features

- **Unified AI Assistant**: Chat, summarize, and ask questions about your documents in one place.
- **PDF Upload & Extraction**: Upload PDFs and extract text for analysis.
- **Document Summarization**: Get concise, viral-style summaries of your documents.
- **Document Q&A**: Ask questions and get accurate answers based strictly on your document content.
- **Conversational Chatbot**: General-purpose AI chat for any topic.
- **Modern UI/UX**: Responsive, dark-themed, spotlight background, and beautiful card-based layouts.
- **API-first**: RESTful endpoints for all major features.
- **File Support**: PDF, DOC, TXT (up to 10MB).
- **Powered by Google Gemini & LangChain**.

---

## 🚀 Getting Started

### 1. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. **Set up environment variables**

Create a `.env.local` file in the root with your Google Gemini API key:

```
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗂️ Project Structure

```
src/
  app/
    api/
      assistant/           # Unified AI assistant API (chat, summarize, QA)
      extract-pdf-text/    # PDF text extraction API
      uploadthing/         # File upload API
      v1/
        summarize/         # Document summarization API
        document-qa/       # Document Q&A API
        chatbot/           # Chatbot API
    chatbot/               # Chatbot UI page
    document-qa/           # Document Q&A UI page
    summarize/             # Summarization UI page
    unified-assistant/     # Unified assistant UI page
  components/
    unified-assistant/     # Unified assistant React components
    ui/                    # Reusable UI components (Button, Input, Spotlight, etc.)
  lib/                     # Utility libraries (PDF extraction, prompt templates, etc.)
  utils/                   # Helper utilities
```

---

## 🧑‍💻 Main UI Pages

- `/` — Home page with hero, features, carousel, and models section.
- `/unified-assistant` — Unified chat, summarize, and document QA assistant.
---

## 📚 API Endpoints

- `POST /api/assistant` — Unified endpoint for chat, summarization, and document QA.
- `POST /api/extract-pdf-text` — Extracts text from uploaded PDF.
- `POST /api/v1/summarize` — Summarizes a document.
- `POST /api/v1/document-qa` — Answers questions about a document.
- `POST /api/v1/chatbot` — General-purpose chatbot.

---

## 🛠️ Tech Stack

- **Next.js 15** (App Router, API routes)
- **React 19**
- **Tailwind CSS** (with custom spotlight effect)
- **Google Gemini API** (AI model)
- **LangChain** (PDF/document processing)
- **UploadThing** (file uploads)
- **Lucide React** (icons)
- **Zod** (validation)
- **Sonner** (toasts/notifications)

---

## 🖼️ UI/UX

- Fully responsive, mobile-friendly, and accessible.
- Dark theme with spotlight background.
- Card-based layouts for all major sections.
- Modern, glassy navbar and footer.

---

## 📝 Customization

- Prompts and AI behavior can be customized in `src/utils/prompt.ts`.
- UI components are reusable and can be extended in `src/components/ui/`.

---

## 📦 Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Lint code

---

