# StudyMate Lite – Chrome Extension

StudyMate Lite is a simple Chrome Extension that helps students stay organized and focused.
This project also includes a small Node.js backend server used for handling API requests securely.

This guide explains how anyone can set up and use the project.

## 1. Project Contents

This project contains:
Chrome extension files (popup, background script, manifest)
A Node.js backend server (server.js)
A .env.example file showing what environment variables are needed
A package.json file listing the server dependencies
Icons and other assets

## 2. Downloading the Project

You can download the project by either cloning it or downloading it as a ZIP.

Clone example:
git clone <repository-link>
After downloading, open the folder in any code editor such as VS Code.

## 3. Setting up the .env file

Inside the project, you will see a file named .env.example.
This file shows which values you need to provide for the server.
Create a new file named .env in the same location.
Copy the content from .env.example into the .env file and fill in your own values.

Example .env:

API_KEY=your_api_key_here
PORT=5000

Meaning:
API_KEY is your private API key (your Gemini API key).
PORT is the port on which the backend server will run.

## 4. Installing Backend Dependencies

Open a terminal inside the project folder and run:
npm install
This will install all required Node.js packages.

## 5. Running the Backend Server

Start the backend server by running:
node server.js
The server will start on the port you set in the .env file (default is 5000).

## 6. Loading the Chrome Extension

To use the extension in Google Chrome:
1. Open Chrome.
2. Go to chrome://extensions/
3. Enable Developer Mode (top right).
4. Click “Load unpacked.”
5.Select the project folder.

The extension will now appear in your browser.

