const PROXY_URL = "http://localhost:3000/api/generate";
const PROXY_SECRET = ""; //Enter your proxy_scret same as the written in .env file


function clean(text) {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^- /gm, "")
    .trim();
}

async function getSelectedText() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString()
  });

  return result.trim();
}

async function callAI(prompt) {
  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Proxy-Secret": PROXY_SECRET
    },
    body: JSON.stringify({ prompt })
  });

  if (!res.ok) throw new Error("Server Error");

  const data = await res.json();
  return clean(data.text);
}

async function run(type) {
  const result = document.getElementById("result");
  const selected = await getSelectedText();

  if (!selected) {
    result.textContent = "Highlight some text first!";
    return;
  }

  result.textContent = "Thinking…";

  const prompts = {
    explain: `Explain simply:\n${selected}`,
    hint: `Give a small hint:\n${selected}`,
    summarize: `Summarize briefly:\n${selected}`,
    quiz: `Create 2 questions:\n${selected}`
  };

  try {
    const reply = await callAI(prompts[type]);
    result.textContent = reply;
  } catch (e) {
    result.textContent = " Failed to fetch";
  }
}

document.getElementById("explainBtn").onclick = () => run("explain");
document.getElementById("hintBtn").onclick = () => run("hint");
document.getElementById("summarizeBtn").onclick = () => run("summarize");
document.getElementById("quizBtn").onclick = () => run("quiz");
