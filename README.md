# ⚡ MailLayer Embedded

[**Home Page**](https://embedded.maillayer.wiki/) &nbsp; | &nbsp; [**Try the Demo**](https://embedded.maillayer.wiki/test.html)

MailLayer Embedded is a lightweight, drop-in JavaScript library that upgrades standard `mailto:` links on your website. Instead of opening a desktop client, it injects a native iframe modal that lets visitors send emails directly via Gmail or Outlook.

## 🚀 CDN Options

You can load the library using either the primary GitHub Pages host or the global jsDelivr CDN.

**Primary (GitHub Pages):**
```html
<script src="https://embedded.maillayer.wiki/maillayer.js"></script>
```

**Secondary / Backup (jsDelivr):**
```html
<script src="https://cdn.jsdelivr.net/gh/Spuds0588/MailLayer-Embedded@master/maillayer.js"></script>
```

---

## 🛠️ Configuration

MailLayer Embedded is highly customizable using `data-maillayer-*` attributes.

### 1. Script-Level Options (Global)
These attributes are added to the `<script>` tag itself to configure global behavior.

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-maillayer-auto-detect` | Automatically scans the page for plain-text emails and converts them to triggers. | `false` |
| `data-maillayer-auto-link-color` | The color of the auto-detected "Magic" links (HEX or CSS color). | `#5998c5` |

**Example:**
```html
<script src="..." data-maillayer-auto-detect="true" data-maillayer-auto-link-color="#e03616"></script>
```

### 2. Trigger-Level Options (Styling & Logic)
These attributes are added to `<a>` tags or any element with the `.maillayer-trigger` class.

| Attribute | Description |
|-----------|-------------|
| `data-maillayer-theme` | Set the modal theme: `light` or `dark`. |
| `data-maillayer-color` | Set the primary brand color for the modal (HEX without #). |
| `data-maillayer-to` | Set the recipient email address. |
| `data-maillayer-cc` | Set CC recipients. |
| `data-maillayer-bcc` | Set BCC recipients. |
| `data-maillayer-subject` | Pre-populate the subject line. |
| `data-maillayer-body` | Pre-populate the email body. |
| `data-maillayer-lock-to` | If `true`, the user cannot edit the recipient field. |
| `data-maillayer-lock-cc` | If `true`, the user cannot edit the CC field. |
| `data-maillayer-lock-bcc` | If `true`, the user cannot edit the BCC field. |
| `data-maillayer-lock-subject` | If `true`, the user cannot edit the subject line. |
| `data-maillayer-disable-attachments` | If `true`, the attachment button is removed. |

**Example (Pill Button with Locked Recipient):**
```html
<button class="maillayer-trigger" 
        data-maillayer-to="support@example.com"
        data-maillayer-lock-to="true"
        data-maillayer-color="e03616"
        data-maillayer-theme="dark">
    Contact Support
</button>
```

---

## 🏗️ How it Works

1. **Interception:** The library listens for clicks on any `mailto:` link or element with the `.maillayer-trigger` class.
2. **Injection:** It blocks the default browser behavior and injects an isolated iframe modal.
3. **Authentication:** The modal (hosted on GitHub Pages) handles OAuth flows for Gmail and Outlook, keeping the host site secure.
4. **Composition:** Users compose their email in a familiar interface and send it directly through their own provider.

## 🧪 Local Testing

To test the library locally:
1.  Run a local web server (e.g., `npx serve .` or Python's `http.server`).
2.  Open `test.html`.
3.  **Note:** OAuth flows (Gmail/Outlook login) require a valid `http` or `https` origin and will not work over the `file://` protocol.

## 📄 License
MIT License. Built by [Spuds0588](https://github.com/Spuds0588).
