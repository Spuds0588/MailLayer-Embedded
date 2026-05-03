# ⚡ MailLayer Embedded

[**Home Page**](https://spuds0588.github.io/MailLayer-Embedded/) &nbsp; | &nbsp; [**Try the Demo**](https://spuds0588.github.io/MailLayer-Embedded/test.html)

MailLayer Embedded is a lightweight, drop-in JavaScript library that upgrades standard `mailto:` links on your website. Instead of opening a desktop client, it injects a native iframe modal that lets visitors send emails directly via Gmail or Outlook.

## 🚀 Quick Start

### 1. Add the Script
Include the `maillayer.js` script at the end of your `<body>` tag:

```html
<script src="https://spuds0588.github.io/MailLayer-Embedded/maillayer.js"></script>
```

### 2. Standard Usage
Any standard `mailto:` link will automatically be intercepted:

```html
<a href="mailto:support@example.com?subject=Hello&body=I%20need%20help">Contact Support</a>
```

### 3. Custom Branding
You can customize the modal's theme and primary color using `data-maillayer-*` attributes:

```html
<a href="mailto:sales@example.com" 
   data-maillayer-theme="light" 
   data-maillayer-color="2563eb">
   Contact Sales
</a>
```

### 4. Custom Triggers
You can trigger the modal on any element (like a `<button>`) by adding the `maillayer-trigger` class and using `data-maillayer-*` attributes:

```html
<button class="maillayer-trigger" 
        data-maillayer-to="support@example.com"
        data-maillayer-subject="Bug Report">
        Open Support Modal
</button>
```

### 5. Auto-Detect Page Emails (Magic UX)
MailLayer can automatically find plain-text email addresses on your page and turn them into active triggers. This is **disabled by default**. To enable it, add the `data-maillayer-auto-detect` attribute to your script tag:

```html
<script src="..." 
        data-maillayer-auto-detect="true"
        data-maillayer-auto-link-color="2563eb"></script>
```

| Attribute | Description | Default |
| :--- | :--- | :--- |
| `data-maillayer-auto-detect` | Enable/disable auto-linkifier | `false` |
| `data-maillayer-auto-link-color` | Hex color for auto-detected links | `#5998c5` |

## 🛠️ Configuration (For Owners)

If you are hosting this library yourself, ensure you:

1.  **Authorized Redirect URIs:** Add your `auth_callback.html` URL to your Google Cloud and Azure/Microsoft app registrations.
2.  **Update BASE_URL:** Update the `BASE_URL` constant in `maillayer.js` to point to your hosted directory.

## 🧪 Local Testing

To test the library locally:
1.  Run a local web server (e.g., `npx serve .` or Python's `http.server`).
2.  Open `test.html`.
3.  **Note:** OAuth flows (Gmail/Outlook login) require a valid `http` or `https` origin and will not work over the `file://` protocol.

## ⚖️ License
MIT © [Spuds0588](https://github.com/Spuds0588)
