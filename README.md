# 🏥 Agentic Healthcare Assistant

A production-grade, full-stack AI healthcare assistant built with **Flask**, **LangChain**, and **Llama 3.1**. This application utilizes a Retrieval-Augmented Generation (RAG) pipeline backed by a Vector Database to provide accurate medical information, and an autonomous Agentic reasoning engine to dynamically trigger backend tools like medication reminders.

## ✨ Key Features

* **Semantic Medical Search (RAG):** Replaces brittle keyword matching with HuggingFace text embeddings (`all-MiniLM-L6-v2`) and ChromaDB, allowing users to query symptoms using natural language.
* **Agentic Tool Calling:** Uses Groq's high-speed inference to power an autonomous agent. The LLM acts as a reasoning engine, deciding when to search the medical database and when to trigger background Python scripts.
* **Conversational Memory:** Implements a sliding-window memory buffer (`chat_history`) to cure "LLM Amnesia," allowing the agent to resolve pronouns and understand multi-turn conversation context.
* **Dynamic Tool Routing:** An intent-parsing interceptor physically sandboxes the LLM by removing the scheduling tool from its toolkit unless time-based keywords are detected, preventing proactive hallucination ("Tool Excitement").
* **Automated Medication Reminders:** Utilizes Python's `schedule` library running on an isolated daemon thread to trigger real-time Text-to-Speech (TTS) desktop alerts for medication routines.
* **Markdown UI Parsing:** Custom frontend JavaScript regex securely parses LLM-generated markdown (bolding, line breaks) into DOM-safe HTML.

## 🛠️ Tech Stack

### Backend
* **Framework:** Python / Flask
* **AI Orchestration:** LangChain (`create_tool_calling_agent`, `AgentExecutor`)
* **LLM Provider:** Groq API (Llama 3.1 8B Instant)
* **Vector Database:** ChromaDB
* **Embeddings:** HuggingFace (`sentence-transformers/all-MiniLM-L6-v2`)
* **Task Scheduling:** `schedule`, `threading`
* **Text-to-Speech:** `pyttsx3`

### Frontend
* **Stack:** HTML5, CSS3, Vanilla JavaScript
* **Data Visualization:** Chart.js (for health log analytics)
* **State Management:** Session-based memory via Flask

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/mayankydvv/health_assistant_rag.git](https://github.com/mayankydvv/health_assistant_rag.git)
cd healthcare-assistant