chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "explainWithStudyMate",
    title: "StudyMate: Explain selected text",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "explainWithStudyMate" && info.selectionText) {
    chrome.notifications?.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "StudyMate (Lite)",
      message: "Open the popup and click 'Explain' to analyze your selected text."
    });
  }
});

