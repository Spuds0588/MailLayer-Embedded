# 📄 Product Requirements Document (PRD): MailLayer Embedded

## 1. Executive Summary
MailLayer Embedded is an open-source, client-side JavaScript library that allows web developers to upgrade standard `mailto:` links on their websites. Instead of bouncing users to desktop clients or complex OAuth modals, the library launches focused webmail compose windows directly for Gmail, Outlook Web, and Yahoo Mail.

## 2. Target Audience
 * **Primary:** Web developers, agency owners, and indie hackers.
 * **Secondary:** Site visitors who want a frictionless way to contact listing owners (e.g., job boards, directories, real estate sites).

## 3. Core Features
 * **Drop-in Script:** A lightweight `<script>` tag developers add to their site.
 * **Auto-Interception:** Automatically detects links with `.maillayer-trigger` or standard `mailto:` links.
 * **Native Deep Links:** Launches direct compose windows for Gmail, Outlook Web, and Yahoo Mail in a pop-up window.
 * **Zero Backend / Zero OAuth:** Uses webmail deep linking, eliminating API keys, tokens, and backend server requirements.
 * **Auto-Detect (Magic UX):** Option to scan plain-text emails on the host page and convert them to interactive triggers.

## 4. Architecture Overview
1. **The Wrapper Script (`maillayer.js`):** Intercepts clicks on `mailto:` links, trigger elements, and auto-detected email addresses.
2. **Deep-Link Engine:** Formats recipient, CC, BCC, subject, and body into native webmail URL parameters and launches `window.open(url, 'MailLayerPopup')`.
