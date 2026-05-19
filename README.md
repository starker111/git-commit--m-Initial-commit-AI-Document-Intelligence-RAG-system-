# AI-Powered Document Intelligence RAG System

A local AI-powered document intelligence platform that allows users to upload PDFs, ask questions in plain English, and receive polished source-backed answers.

This project was built using n8n, Ollama, ChromaDB, FastAPI, and a custom HTML/CSS/JavaScript interface. It runs locally and does not require paid OpenAI API access.

---

## Demo

- Upload a PDF
- Extract text from the document
- Split the document into chunks
- Generate embeddings using Ollama
- Store vectors in ChromaDB
- Ask questions from the document
- Retrieve relevant passages
- Generate a source-backed answer using a local LLM
- Display polished answers and references in a web interface

---

## Tech Stack

| Layer | Tool |
|---|---|
| Workflow Automation | n8n |
| Local LLM | Ollama |
| Chat Model | llama3.1 |
| Embedding Model | nomic-embed-text |
| Vector Database | ChromaDB |
| API Bridge | FastAPI |
| Frontend | HTML, CSS, JavaScript |
| Local Backend Proxy | Node.js + Express |
| File Upload Handling | Multer |

---

## Architecture

```text
User Interface
   ↓
Node.js Express Backend
   ↓
n8n Webhooks
   ↓
PDF Text Extraction / Question Processing
   ↓
Ollama Embeddings
   ↓
ChromaDB Vector Storage and Retrieval
   ↓
Ollama LLM Answer Generation
   ↓
Source-backed Answer in UI
