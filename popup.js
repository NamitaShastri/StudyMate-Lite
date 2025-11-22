const apiKeyInput = document.getElementById("apiKey");
const resultEl = document.getElementById("result");

const prompts = {
  explain: (text) => `Explain this clearly and simply for a student:\n\n${text}`,
  hint: (text) => `Give a small conceptual hint about this, without giving the full answer:\n\n${text}`,
  summarize: (text) => `Summarize this content in 3–4 short bullet points:\n\n${text}`,
  quiz: (text) => `Create short multiple-choice questions (4 options each) from this content and include correct answers at the end of all the questions:\n\n${text}`
};

async function getSelectedText() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString(),
  });
  return result.trim();
}

async function callGemini(prompt, apiKey) {
  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await response.json();
  const output = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return output || "No response from Gemini.";
}

async function runAction(type) {
  resultEl.textContent = "Fetching selected text...";
  const text = await getSelectedText();

  if (!text) {
    resultEl.textContent = "⚠️ No text selected. Highlight something first!";
    return;
  }

  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    resultEl.textContent = "⚠️ Paste your Gemini API key above (not saved).";
    return;
  }

  resultEl.textContent = "⏳ Thinking...";

  try {
    const prompt = prompts[type](text);
    const reply = await callGemini(prompt, apiKey);
    resultEl.textContent = reply;
  } catch (err) {
    console.error(err);
    resultEl.textContent = "❌ " + err.message;
  }
}

document.getElementById("explainBtn").addEventListener("click", () => runAction("explain"));
document.getElementById("hintBtn").addEventListener("click", () => runAction("hint"));
document.getElementById("summarizeBtn").addEventListener("click", () => runAction("summarize"));
document.getElementById("quizBtn").addEventListener("click", () => runAction("quiz"));

