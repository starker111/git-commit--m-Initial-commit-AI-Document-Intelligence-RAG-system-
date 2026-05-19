# Tech Stack Explanation

## n8n

Used for workflow orchestration. It connects the upload trigger, PDF extraction, chunking, embedding generation, vector storage, retrieval, LLM answer generation, and webhook response.

## Ollama

Used to run local AI models.

- llama3.1: answer generation
- nomic-embed-text: embedding generation

## ChromaDB

Used as the vector database. It stores document chunks and embeddings for semantic retrieval.

## FastAPI

Used to create a simple bridge between n8n and ChromaDB.

## Node.js + Express

Used as a local backend proxy between the frontend and n8n.

## Multer

Used to handle PDF file uploads in the Node.js backend.

## HTML/CSS/JavaScript

Used to build the professional user interface.

## RAG

Used to make answers grounded in the uploaded document.
