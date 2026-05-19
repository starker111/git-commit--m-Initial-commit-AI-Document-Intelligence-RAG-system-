# Project Report: AI-Powered Document Intelligence RAG System

## Problem Statement

Many users need to understand long PDF documents quickly. Normal search only finds keywords, and normal LLMs may hallucinate when answering questions about specific documents.

This project solves that problem by building a local RAG system that retrieves relevant passages from the uploaded PDF and uses those passages to generate source-backed answers.

---

## What I Built

I built a local document intelligence platform where users can:

1. Upload a PDF
2. Extract the text
3. Split the text into chunks
4. Generate embeddings for each chunk
5. Store the chunks in ChromaDB
6. Ask questions about the document
7. Retrieve relevant chunks
8. Generate a polished answer using a local LLM
9. Display answer and references in a web interface

---

## Why I Used n8n

I used n8n because it allows visual orchestration of the full AI workflow. It made it easier to connect webhooks, PDF extraction, code transformation, HTTP requests, local AI models, vector storage, and final responses.

n8n was useful because the project is not just one script. It is a full automation pipeline with multiple moving parts.

---

## Why I Used Ollama

I used Ollama to run both the LLM and embedding model locally.

Models used:

- llama3.1 for answer generation
- nomic-embed-text for embeddings

This allowed the system to run without paid API keys and made the document processing more private.

---

## Why I Used ChromaDB

ChromaDB was used as the local vector database. It stores embeddings for document chunks and allows similarity search when a user asks a question.

This is the retrieval part of the RAG system.

---

## Why I Used FastAPI Bridge

Directly calling ChromaDB from n8n was difficult due to nested arrays and changing API behavior. I created a FastAPI bridge to provide clean endpoints:

- POST /add
- POST /query
- GET /health

This made the workflow more stable and easier to debug.

---

## Why I Used Chunking

A full PDF is too large and broad to search directly. I split the document into overlapping chunks so that each chunk can be embedded and retrieved independently.

Chunk size: 1200 characters  
Overlap: 150 characters

The overlap helps preserve meaning across chunk boundaries.

---

## Why I Used Embeddings

Embeddings convert text into numerical vectors that represent semantic meaning. This allows the system to compare the user’s question with document chunks by meaning, not just keyword matching.

---

## Why I Used RAG

RAG makes the answer more grounded. Instead of letting the LLM answer from general knowledge, the system retrieves relevant document passages and gives those passages to the model.

This reduces hallucination and improves trust.

---

## Why I Built a Custom Interface

I built a custom HTML/CSS/JavaScript frontend to make the project look like a real AI product. It includes PDF upload, question input, system status, answer display, and supporting references.

This makes the project more understandable and impressive for recruiters.
