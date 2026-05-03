# 📄 Product Requirements Document (PRD): MailLayer Embedded
## 1. Executive Summary
MailLayer Embedded is an open-source, client-side JavaScript library that allows web developers to upgrade the standard mailto: links on their websites. Instead of bouncing users to desktop clients or new tabs, the library injects a customizable iframe modal that lets visitors send emails directly from their own Gmail or Outlook accounts without leaving the host website.
## 2. Target Audience
 * **Primary:** Web developers, agency owners, and indie hackers.
 * **Secondary:** Site visitors who want a frictionless way to contact listing owners (e.g., job boards, directories, real estate sites).
## 3. Core Features
 * **Drop-in Script:** A lightweight <script> tag that developers add to their site.
 * **Auto-Interception:** Automatically detects links with a specific class (e.g., .maillayer-trigger) or standard mailto: links.
 * **Hosted Iframe:** The modal content is hosted on the MailLayer GitHub Pages domain, eliminating backend server requirements.
 * **Client-Side OAuth:** Uses Google and Microsoft web OAuth flows within the iframe to authenticate the sender.
 * **Dynamic Styling:** Reads URL parameters (e.g., ?theme=dark&color=FF5000) to dynamically update the iframe's CSS to match the host site's branding.
 * **Viral Loop:** A mandatory "⚡ Powered by MailLayer Embedded" badge linking back to the open-source repo.
# 🏗️ Implementation Guide
## Architecture Overview
The project consists of two distinct parts working together:
 1. **The Wrapper Script (maillayer.js):** This is the script the developer puts on their site. Its only job is to watch for clicks, generate the modal UI (a dark overlay), and inject the <iframe>.
 2. **The Hosted App (embed.html):** This is the actual email client hosted on your GitHub Pages. It handles the Quill.js editor, OAuth, API calls, and styling.
## The OAuth Challenge (And Solution)
Since this is running in an iframe on a 3rd-party site, browsers (like Safari and Chrome's upcoming updates) might block localStorage access for the iframe (3rd-party cookie blocking).
 * **The Solution:** When a user clicks "Sign in with Google" inside your iframe, you cannot just redirect the iframe. You must open a **Popup Window** for the OAuth flow. Once the popup completes the login, it uses window.postMessage() to pass the access token back to the iframe and closes itself.
## Dynamic Styling Logic
Inside embed.html, parse the URL string for styling:
```javascript
// Example logic in embed.html
const params = new URLSearchParams(window.location.search);
if (params.has('primaryColor')) {
    document.documentElement.style.setProperty('--btn-bg-color', `#${params.get('primaryColor')}`);
}
// Apply To, CC, and Subject
if (params.has('to')) document.getElementById('to-field').value = params.get('to');

```
# ✅ Developer Task List
### Phase 1: Repository & Skeleton Setup
 * [ ] Create a new public GitHub repository named MailLayer-Embedded.
 * [ ] Set up GitHub Pages to serve from the main branch.
 * [ ] Create maillayer.js (The wrapper script).
 * [ ] Create embed.html (The iframe host page).
 * [ ] Create test.html (A local page acting as a fake "client website" to test the integration).
### Phase 2: The Wrapper Script (maillayer.js)
 * [ ] Write event listener to catch clicks on a[href^="mailto:"].
 * [ ] Prevent default browser behavior (e.preventDefault()).
 * [ ] Parse the clicked link's href to extract to, subject, cc, and body.
 * [ ] Write a function to inject a <div> overlay (modal background) into the DOM.
 * [ ] Write a function to inject the <iframe> pointing to your GitHub Pages URL, appending the extracted variables as URL parameters.
 * [ ] Add a listener for window.postMessage to close the modal when the iframe tells it the email was sent or cancelled.
### Phase 3: The Hosted Iframe (embed.html UI)
 * [ ] Copy the HTML/CSS layout from the MailLayer Extension's modal.
 * [ ] Strip out Chrome-specific code (e.g., shadow DOM wrappers, since the iframe already provides CSS isolation).
 * [ ] Initialize Quill.js for the rich text editor.
 * [ ] Write the URL parameter parsing function to apply custom CSS variables (theme=dark, primaryColor, etc.).
 * [ ] Add the "⚡ Powered by MailLayer Embedded" badge at the bottom.
### Phase 4: Authentication & API Logic (The Tricky Part)
 * [ ] Set up a Web OAuth Client ID in Google Cloud Console (make sure your GitHub Pages URL is an authorized origin/redirect URI).
 * [ ] Set up a Single-Page App Registration in Azure/Microsoft (for Outlook).
 * [ ] Implement the "Login via Popup" flow. (Clicking "Login" opens a small window, does the OAuth dance, and sends the token back via postMessage).
 * [ ] Update the API payload scripts (copied from the extension) to use these new Web OAuth tokens to send the message.
### Phase 5: Documentation & Launch Prep
 * [ ] Write the README.md with foolproof "How to install" instructions (just pasting the CDN link and adding a class to links).
 * [ ] Detail the available URL parameters for customization.
 * [ ] Publish the wrapper script to unpkg or jsDelivr so developers can link to it cleanly.
 * [ ] Launch on Hacker News ("Show HN: I open-sourced the MailLayer extension into a drop-in library for your website").
