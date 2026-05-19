const pdfInput = document.getElementById("pdfInput");
const dropzone = document.getElementById("dropzone");
const fileTitle = document.getElementById("fileTitle");
const fileSubtitle = document.getElementById("fileSubtitle");
const uploadBtn = document.getElementById("uploadBtn");
const uploadResult = document.getElementById("uploadResult");

const questionInput = document.getElementById("questionInput");
const askBtn = document.getElementById("askBtn");
const answerSection = document.getElementById("answerSection");
const answerText = document.getElementById("answerText");
const sourcesList = document.getElementById("sourcesList");
const copyAnswerBtn = document.getElementById("copyAnswerBtn");

const loaderOverlay = document.getElementById("loaderOverlay");
const loaderTitle = document.getElementById("loaderTitle");
const loaderSubtitle = document.getElementById("loaderSubtitle");

const ollamaStatus = document.getElementById("ollamaStatus");
const chromaStatus = document.getElementById("chromaStatus");
const refreshStatusBtn = document.getElementById("refreshStatusBtn");

let selectedFile = null;
let lastAnswer = "";

function showLoader(title, subtitle) {
  loaderTitle.textContent = title;
  loaderSubtitle.textContent = subtitle;
  loaderOverlay.classList.remove("hidden");
}

function hideLoader() {
  loaderOverlay.classList.add("hidden");
}

function setMessage(element, message, type) {
  element.textContent = message;
  element.className = `result-message ${type}`;
  element.classList.remove("hidden");
}

function escapeHtml(value) {
  if (!value) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function checkStatus() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();

    updateStatusPill(ollamaStatus, data.ollama);
    updateStatusPill(chromaStatus, data.chroma);
  } catch (error) {
    updateStatusPill(ollamaStatus, "offline");
    updateStatusPill(chromaStatus, "offline");
  }
}

function updateStatusPill(element, status) {
  element.classList.remove("online", "offline", "muted");

  if (status === "online") {
    element.textContent = "Online";
    element.classList.add("online");
  } else if (status === "offline") {
    element.textContent = "Offline";
    element.classList.add("offline");
  } else {
    element.textContent = "Unknown";
    element.classList.add("muted");
  }
}

function handleFile(file) {
  if (!file) return;

  if (file.type !== "application/pdf") {
    setMessage(uploadResult, "Please upload a valid PDF file.", "error");
    return;
  }

  selectedFile = file;
  fileTitle.textContent = file.name;
  fileSubtitle.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB selected`;
  uploadResult.classList.add("hidden");
}

dropzone.addEventListener("click", () => pdfInput.click());

pdfInput.addEventListener("change", (event) => {
  handleFile(event.target.files[0]);
});

dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropzone.classList.add("dragover");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("dragover");
});

dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropzone.classList.remove("dragover");
  handleFile(event.dataTransfer.files[0]);
});

uploadBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    setMessage(uploadResult, "Select a PDF before uploading.", "error");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  uploadBtn.disabled = true;
  showLoader("Indexing PDF", "Extracting text, creating chunks, generating embeddings, and storing in ChromaDB...");

  try {
    const response = await fetch("/api/ingest", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }

    const added = data.added || data.chunks_stored || "unknown";

    setMessage(
      uploadResult,
      `Document indexed successfully. Chunks added: ${added}`,
      "success"
    );
  } catch (error) {
    setMessage(uploadResult, `Upload failed: ${error.message}`, "error");
  } finally {
    uploadBtn.disabled = false;
    hideLoader();
  }
});

document.querySelectorAll(".sample-question").forEach((button) => {
  button.addEventListener("click", () => {
    questionInput.value = button.dataset.question;
    questionInput.focus();
  });
});

askBtn.addEventListener("click", async () => {
  const question = questionInput.value.trim();

  if (!question) {
    alert("Please enter a question.");
    return;
  }

  askBtn.disabled = true;
  showLoader("Generating Answer", "Retrieving top document chunks and asking the local LLM...");

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to generate answer");
    }

    renderAnswer(data);
  } catch (error) {
    answerSection.classList.remove("hidden");
    answerText.textContent = `Error: ${error.message}`;
    sourcesList.innerHTML = "";
  } finally {
    askBtn.disabled = false;
    hideLoader();
  }
});

function renderAnswer(data) {
  const payload = Array.isArray(data) ? data[0] : data;

  const answer =
    payload.answer ||
    payload.text_output ||
    payload.output ||
    "No answer returned.";

  const references = payload.references || [];
  const sources = payload.sources || [];

  lastAnswer = answer;

  answerText.textContent = answer;
  sourcesList.innerHTML = "";

  const displayReferences = references.length
    ? references
    : sources.map((source, index) => ({
        reference_number: source.source_number || index + 1,
        file_name: source.source_file_name || "uploaded.pdf",
        snippet: source.text || ""
      }));

  if (!displayReferences.length) {
    sourcesList.innerHTML = `
      <div class="source-item">
        <div class="source-title">No references returned</div>
        <div class="source-text">The system generated an answer but did not return supporting references.</div>
      </div>
    `;
  } else {
    displayReferences.forEach((ref, index) => {
      const refNumber = ref.reference_number || index + 1;
      const fileName = ref.file_name || "uploaded.pdf";
      const snippet = ref.snippet || "";

      const referenceHtml = `
        <div class="source-item">
          <div class="source-title">Reference ${escapeHtml(refNumber)}</div>
          <div class="source-meta">${escapeHtml(fileName)} • Supporting passage</div>
          <div class="source-text">${escapeHtml(snippet)}</div>
        </div>
      `;

      sourcesList.insertAdjacentHTML("beforeend", referenceHtml);
    });
  }

  answerSection.classList.remove("hidden");
  answerSection.scrollIntoView({ behavior: "smooth", block: "start" });
}
copyAnswerBtn.addEventListener("click", async () => {
  if (!lastAnswer) return;

  await navigator.clipboard.writeText(lastAnswer);

  copyAnswerBtn.textContent = "Copied";
  setTimeout(() => {
    copyAnswerBtn.textContent = "Copy Answer";
  }, 1400);
});

refreshStatusBtn.addEventListener("click", checkStatus);

checkStatus();