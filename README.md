# ⚡ MailLayer Embedded

[**Home Page**](https://embedded.maillayer.wiki/) &nbsp; | &nbsp; [**Try the Demo**](https://embedded.maillayer.wiki/test.html)

MailLayer Embedded is a lightweight, drop-in JavaScript library that upgrades standard `mailto:` links on your website. Instead of triggering clunky desktop apps, it opens instant webmail deep-link pop-ups for **Gmail**, **Outlook Web**, and **Yahoo Mail**.

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

MailLayer Embedded is customizable using `data-maillayer-*` attributes.

### 1. Script-Level Options (Global)
These attributes are added to the `<script>` tag itself to configure global behavior.

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-maillayer-auto-detect` | Automatically scans the page for plain-text emails and converts them to triggers. | `false` |
| `data-maillayer-auto-link-color` | The color of the auto-detected "Magic" links (HEX or CSS color). | `#5998c5` |
| `data-maillayer-provider` | Default webmail provider: `gmail`, `outlook`, or `yahoo`. | `gmail` |

**Example:**
```html
<script src="https://embedded.maillayer.wiki/maillayer.js" 
        data-maillayer-auto-detect="true" 
        data-maillayer-provider="gmail"></script>
```

### 2. Trigger-Level Options
These attributes are added to `<a>` tags or any element with the `.maillayer-trigger` class.

| Attribute | Description |
|-----------|-------------|
| `data-maillayer-provider` | Target webmail service for this link (`gmail`, `outlook`, or `yahoo`). |
| `data-maillayer-to` | Set the recipient email address. |
| `data-maillayer-cc` | Set CC recipients. |
| `data-maillayer-bcc` | Set BCC recipients. |
| `data-maillayer-subject` | Pre-populate the subject line. |
| `data-maillayer-body` | Pre-populate the email body. |

**Example (Custom Button Trigger):**
```html
<button class="maillayer-trigger" 
        data-maillayer-to="support@example.com"
        data-maillayer-provider="outlook"
        data-maillayer-subject="Help Requested">
    Contact Support
</button>
```

---

## 🏗️ How it Works

1. **Interception:** The library listens for clicks on any `mailto:` link, `.maillayer-trigger` button, or auto-detected email.
2. **Deep-Link Generation:** Converts parameters into direct webmail URLs for Gmail, Outlook, or Yahoo Mail.
3. **Pop-up Window Launch:** Opens a focused, distraction-free pop-up composition window natively in the browser. Zero backend or OAuth required!

## 🧪 Local Testing

To test the library locally:
1. Open `test.html` in your browser.
2. Click any mailto link, trigger button, or auto-detected email address.

## 📄 License
MIT License. Built by [Spuds0588](https://github.com/Spuds0588).
