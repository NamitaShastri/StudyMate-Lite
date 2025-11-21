// popup.js — sends selected text + action to Gemini proxy and displays result in page panel

const prompts = {
  explain: (t) => `Explain this clearly and simply for a student:\n\n${t}`,
  hint: (t) => `Give a small conceptual hint about this, without giving the full answer:\n\n${t}`,
  summarize: (t) => `Summarize this content in 3–4 short bullet points:\n\n${t}`,
  quiz: (t) => `Create short multiple-choice questions (4 options each) from this content and include correct answers:\n\n${t}`
};

const PROXY_URL = "http://localhost:3000/api/generate";  // change to your deployed URL
const PROXY_SECRET = "XMG/YoosT8oyjqNXt/LvrXGJRYdCstJzbhnPC67yI8o="; // same as in .env

async function getSelectedText() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString(),
  });
  return result.trim();
}

async function callProxy(prompt) {
  const resp = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Proxy-Secret': PROXY_SECRET
    },
    body: JSON.stringify({ prompt })
  });

  if (!resp.ok) throw new Error(await resp.text());
  const data = await resp.json();
  return data.text || JSON.stringify(data.raw || data);
}

async function runAction(type) {
  const selectedText = await getSelectedText();
  if (!selectedText) {
    alert("⚠️ Please highlight some text first!");
    return;
  }

  try {
    const prompt = prompts[type](selectedText);
    const reply = await callProxy(prompt);

    // Send result to page overlay
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: "STUDYMATE_UPDATE", text: reply });
    });

    window.close();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

document.getElementById("explainBtn").addEventListener("click", () => runAction("explain"));
document.getElementById("hintBtn").addEventListener("click", () => runAction("hint"));
document.getElementById("summarizeBtn").addEventListener("click", () => runAction("summarize"));
document.getElementById("quizBtn").addEventListener("click", () => runAction("quiz"));
