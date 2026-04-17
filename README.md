# 🏥 Agentic Healthcare Assistant

A production-grade, full-stack AI healthcare assistant built with **Flask**, **LangChain**, and **Llama 3.1**. This application combines a Retrieval-Augmented Generation (RAG) pipeline backed by ChromaDB with an autonomous agentic reasoning engine — enabling natural language medical queries, multi-turn conversations, and automated medication reminders.

---

## ✨ Features

- **Semantic Medical Search (RAG):** Uses HuggingFace embeddings (`all-MiniLM-L6-v2`) and ChromaDB to retrieve contextually relevant medical information from natural language symptom descriptions — no brittle keyword matching.
- **Agentic Tool Calling:** Powered by Groq's high-speed LLM inference (Llama 3.1 8B), the agent autonomously decides when to query the medical database and when to trigger backend tools.
- **Conversational Memory:** A sliding-window `chat_history` buffer gives the agent multi-turn context, allowing it to resolve pronouns and handle follow-up questions naturally.
- **Dynamic Tool Routing:** An intent-parsing interceptor sandboxes the LLM — the scheduling tool is only injected into the agent's toolkit when time-based keywords are detected, preventing unprompted hallucinations ("Tool Excitement").
- **Automated Medication Reminders:** A `schedule`-powered daemon thread runs in the background and triggers real-time Text-to-Speech (TTS) desktop alerts for medication routines.
- **Health Log Analytics:** Chart.js visualizations for tracking and analyzing personal health data over time.
- **Markdown UI Parsing:** Frontend JavaScript safely parses LLM-generated markdown (bold text, line breaks) into DOM-safe HTML.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Web Framework | Python / Flask |
| AI Orchestration | LangChain (`create_tool_calling_agent`, `AgentExecutor`) |
| LLM Provider | Groq API — Llama 3.1 8B Instant |
| Vector Database | ChromaDB |
| Embeddings | HuggingFace `sentence-transformers/all-MiniLM-L6-v2` |
| ML Models | Scikit-learn (Random Forest, multi-output) |
| Task Scheduling | `schedule` + `threading` |
| Text-to-Speech | `pyttsx3` |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Data Visualization | Chart.js |
| State Management | Session-based memory via Flask |

---

## 📁 Project Structure

```
health_assistant_rag/
├── app.py                    # Main Flask application & agent setup
├── app1.py                   # Alternate/experimental app entry point
├── app.ipynb                 # Jupyter notebook for exploration
├── build_vector_db.py        # Script to build ChromaDB from medical data
├── train_model.py            # Trains the multi-output Random Forest model
├── test_rag.py               # RAG pipeline tests
├── chroma_db/                # Persisted ChromaDB vector store
├── static/                   # CSS, JS, and frontend assets
├── template/                 # HTML Jinja2 templates
├── medical data.csv          # Source medical knowledge base
├── health_logs.csv           # User health log data
├── users.csv / user.csv      # User data
├── multi_output_rf_models.pkl # Trained Random Forest model
├── label_encoders.pkl         # Label encoders for the ML model
├── reminders.json             # Stored medication reminders
└── .gitignore
```

---

## 🚀 Installation & Setup

### Prerequisites

- Python 3.9+
- A [Groq API key](https://console.groq.com/) (free tier available)

### 1. Clone the Repository

```bash
git clone https://github.com/mayankydvv/health_assistant_rag.git
cd health_assistant_rag
```

### 2. Create a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install flask langchain langchain-groq chromadb sentence-transformers \
            scikit-learn pyttsx3 schedule pandas
```

### 4. Set Your Groq API Key

```bash
export GROQ_API_KEY="your_groq_api_key_here"
# On Windows:
set GROQ_API_KEY=your_groq_api_key_here
```

### 5. Build the Vector Database

Run this once to embed the medical data and persist it to ChromaDB:

```bash
python build_vector_db.py
```

### 6. (Optional) Train the ML Model

If you want to retrain the Random Forest model on the health data:

```bash
python train_model.py
```

### 7. Run the Application

```bash
python app.py
```

Then open your browser and go to `http://localhost:5000`.

---

## 🧠 How It Works

```
User Query
    │
    ▼
Intent Parser (checks for scheduling keywords)
    │
    ├─── Medical Query ──► RAG Tool ──► ChromaDB Semantic Search
    │                                        │
    │                                        ▼
    │                               Retrieved Medical Context
    │                                        │
    └─── Scheduling ──► Reminder Tool ──► schedule + pyttsx3 TTS
                                             │
                                             ▼
                                   Agent Reasoning (Llama 3.1 via Groq)
                                             │
                                             ▼
                                     Response + chat_history update
```

1. **Query arrives** → the intent parser determines which tools to expose to the agent.
2. **RAG retrieval** → symptoms/questions are embedded and matched against the ChromaDB vector store built from `medical data.csv`.
3. **Agent reasoning** → Llama 3.1 synthesizes the retrieved context with conversation history to produce a grounded response.
4. **Reminders** → If scheduling intent is detected, a background daemon thread registers the reminder and fires a TTS alert at the right time.

---

## ⚠️ Disclaimer

This application is intended for **informational and educational purposes only**. It is **not a substitute for professional medical advice, diagnosis, or treatment**. Always consult a qualified healthcare provider for medical concerns.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source. See the repository for license details.
