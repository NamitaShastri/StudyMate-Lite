// content.js — Unified right-side StudyMate panel (buttons + results inside page)

if (!document.getElementById("studyMatePanel")) {
  const panel = document.createElement("div");
  panel.id = "studyMatePanel";
  panel.innerHTML = `
    <div class="sm-header">
      <span>StudyMate (Lite)</span>
      <button id="smCloseBtn">×</button>
    </div>

    <p class="sm-info">Highlight any text on this page and choose an action below.</p>

    <div class="sm-buttons">
      <button id="smExplain">Explain</button>
      <button id="smHint">Hint</button>
      <button id="smSummarize">Summarize</button>
      <button id="smQuiz">Quiz Me</button>
    </div>

    <div class="sm-result" id="smResult">Waiting for text selection...</div>

    <div class="sm-footer">
      ⚡ Powered by Gemini 2.5 Flash<br />
      <small>No user API key required.</small>
    </div>
  `;
  document.body.appendChild(panel);

  // Add styles
  const style = document.createElement("style");
  style.textContent = `
    #studyMatePanel {
      position: fixed;
      top: 0;
      right: 0;
      width: 420px;
      height: 100vh;
      background: rgba(10, 10, 20, 0.7);
      backdrop-filter: blur(12px);
      border-left: 1px solid rgba(138, 43, 226, 0.4);
      color: #e5dbff;
      font-family: 'Segoe UI', Arial, sans-serif;
      z-index: 999999;
      box-shadow: 0 0 25px rgba(138, 43, 226, 0.3);
      overflow-y: auto;
      padding: 16px;
      transform: translateX(430px);
      transition: transform 0.4s ease-in-out;
    }

    #studyMatePanel.active {
      transform: translateX(0);
    }

    .sm-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      font-weight: 700;
      color: #bb86fc;
      margin-bottom: 12px;
    }

    #smCloseBtn {
      background: transparent;
      border: none;
      color: #bb86fc;
      font-size: 22px;
      cursor: pointer;
    }

    #smCloseBtn:hover {
      color: #d4b4ff;
    }

    .sm-info {
      font-size: 13px;
      color: #c6a3ff;
      text-align: center;
      margin-bottom: 12px;
    }

    .sm-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 14px;
    }

    .sm-buttons button {
      flex: 1;
      padding: 10px 8px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      background: linear-gradient(145deg, #2e1a77, #1c0b45);
      color: #fff;
      font-weight: 600;
      font-size: 13px;
      transition: all 0.25s ease-in-out;
    }

    .sm-buttons button:hover {
      background: linear-gradient(145deg, #3c22a0, #241060);
      transform: translateY(-2px);
      box-shadow: 0 0 8px rgba(138, 43, 226, 0.6);
    }

    .sm-result {
      min-height: 120px;
      border-radius: 10px;
      background: rgba(15, 15, 25, 0.6);
      border: 1px solid rgba(138, 43, 226, 0.4);
      padding: 10px;
      font-size: 13.5px;
      white-space: pre-wrap;
      color: #e5dbff;
      transition: all 0.3s ease;
      overflow-y: auto;
    }

    .sm-footer {
      margin-top: 10px;
      text-align: center;
      color: #c6a3ff;
      font-size: 11px;
      line-height: 1.4;
    }
  `;
  document.head.appendChild(style);

  // Slide in the panel automatically when a selection is made
  document.addEventListener("mouseup", async () => {
    const selection = window.getSelection().toString().trim();
    if (selection) {
      panel.classList.add("active");
      document.getElementById("smResult").textContent = "Text selected. Choose an action above.";
      window.selectedText = selection; // save selection globally
    }
  });

  // Close button
  const closeBtn = panel.querySelector("#smCloseBtn");
  closeBtn.addEventListener("click", () => {
    panel.classList.remove("active");
  });

  // Gemini API call through your proxy
  async function callProxy(prompt) {
    const PROXY_URL = "http://localhost:3000/api/generate"; // update if different
    const PROXY_SECRET = "XMG/YoosT8oyjqNXt/LvrXGJRYdCstJzbhnPC67yI8o="; // must match .env
    const response = await fetch(PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Proxy-Secret": PROXY_SECRET
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();
    return data.text || "⚠️ No response from Gemini.";
  }

  // Common function to trigger generation
  async function handleAction(type) {
    const text = window.selectedText || "";
    if (!text) {
      alert("Please highlight some text first.");
      return;
    }

    const resultEl = document.getElementById("smResult");
    resultEl.textContent = "⏳ Generating, please wait...";

    const prompts = {
      explain: `Explain this clearly:\n\n${text}`,
      hint: `Give a small conceptual hint for this:\n\n${text}`,
      summarize: `Summarize this in 3–4 bullet points:\n\n${text}`,
      quiz: `Create 2 quiz questions with answers from this content:\n\n${text}`
    };

    try {
      const reply = await callProxy(prompts[type]);
      resultEl.textContent = reply;
    } catch (err) {
      resultEl.textContent = "❌ Error: " + err.message;
    }
  }

  // Button events
  document.getElementById("smExplain").addEventListener("click", () => handleAction("explain"));
  document.getElementById("smHint").addEventListener("click", () => handleAction("hint"));
  document.getElementById("smSummarize").addEventListener("click", () => handleAction("summarize"));
  document.getElementById("smQuiz").addEventListener("click", () => handleAction("quiz"));
}
