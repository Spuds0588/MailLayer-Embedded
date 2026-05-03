/**
 * MailLayer Embedded Iframe Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    
    // UI Elements
    const selectorScreen = document.getElementById('ml-selector-screen');
    const toInput = document.getElementById('ml-to');
    const ccInput = document.getElementById('ml-cc');
    const bccInput = document.getElementById('ml-bcc');
    const subjectInput = document.getElementById('ml-subject');
    const ccRow = document.getElementById('ml-cc-row');
    const bccRow = document.getElementById('ml-bcc-row');
    const toggleCc = document.getElementById('ml-toggle-cc');
    const toggleBcc = document.getElementById('ml-toggle-bcc');
    const attachBtn = document.getElementById('ml-attach-btn');
    const fileInput = document.getElementById('ml-file-input');
    const attachList = document.getElementById('ml-attachments-list');
    const discardBtn = document.getElementById('ml-discard-btn');
    const sendBtn = document.getElementById('ml-send-btn');
    const closeBtn = document.getElementById('ml-close-btn');
    const providerToggle = document.getElementById('ml-provider-toggle');
    const providerMenu = document.getElementById('ml-provider-menu');

    let currentProvider = localStorage.getItem('ml_preferred_provider');
    let attachments = [];

    // 0. Provider Selection Logic
    if (!currentProvider) {
        selectorScreen.style.display = 'flex';
    } else {
        updateProviderUI(currentProvider);
    }

    document.querySelectorAll('.selector-btn').forEach(btn => {
        btn.onclick = () => {
            const provider = btn.dataset.provider;
            currentProvider = provider;
            localStorage.setItem('ml_preferred_provider', provider);
            updateProviderUI(provider);
            selectorScreen.style.display = 'none';
        };
    });

    function updateProviderUI(provider) {
        sendBtn.innerText = `Send with ${provider === 'gmail' ? 'Gmail' : 'Outlook'}`;
    }

    // 1. Populate fields and apply locks from URL parameters
    if (params.has('to')) {
        toInput.value = params.get('to');
        if (params.get('lockTo') === 'true') toInput.readOnly = true;
    }
    if (params.has('cc')) {
        ccInput.value = params.get('cc');
        ccRow.style.display = 'flex';
        toggleCc.style.display = 'none';
        if (params.get('lockCc') === 'true') ccInput.readOnly = true;
    }
    if (params.has('bcc')) {
        bccInput.value = params.get('bcc');
        bccRow.style.display = 'flex';
        toggleBcc.style.display = 'none';
        if (params.get('lockBcc') === 'true') bccInput.readOnly = true;
    }
    if (params.has('subject')) {
        subjectInput.value = params.get('subject');
        if (params.get('lockSubject') === 'true') subjectInput.readOnly = true;
    }

    if (params.get('disableAttachments') === 'true') {
        document.querySelector('.maillayer-attachment-trigger').style.display = 'none';
    }

    // 2. Apply Custom Styling
    if (params.has('color')) {
        const color = `#${params.get('color')}`;
        document.documentElement.style.setProperty('--primary-color', color);
        document.documentElement.style.setProperty('--header-bg', color);
        document.documentElement.style.setProperty('--btn-primary-hover', adjustColor(color, -20));
    }

    if (params.get('theme') === 'light') {
        document.documentElement.style.setProperty('--bg-color', '#ffffff');
        document.documentElement.style.setProperty('--text-color', '#1e293b');
        document.documentElement.style.setProperty('--footer-bg', '#f8fafc');
        document.documentElement.style.setProperty('--input-bg', '#f1f5f9');
        document.documentElement.style.setProperty('--border-color', '#e2e8f0');
        document.documentElement.style.setProperty('--text-muted', '#64748b');
        // Update Quill styles for light theme if needed
    }

    // 3. Initialize Quill
    const quill = new Quill('#ml-editor-container', {
        theme: 'snow',
        placeholder: 'Type your message...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'clean']
            ]
        }
    });

    if (params.has('body')) {
        quill.clipboard.dangerouslyPasteHTML(params.get('body'));
    }

    // 4. Event Listeners
    toggleCc.onclick = () => {
        ccRow.style.display = 'flex';
        toggleCc.style.display = 'none';
        ccInput.focus();
    };

    toggleBcc.onclick = () => {
        bccRow.style.display = 'flex';
        toggleBcc.style.display = 'none';
        bccInput.focus();
    };

    attachBtn.onclick = () => fileInput.click();

    fileInput.onchange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Data = event.target.result.split(',')[1];
                const attachment = {
                    name: file.name,
                    contentType: file.type || 'application/octet-stream',
                    content: base64Data,
                    size: file.size
                };
                attachments.push(attachment);
                renderAttachments();
            };
            reader.readAsDataURL(file);
        });
        fileInput.value = '';
    };

    function renderAttachments() {
        attachList.innerHTML = '';
        attachments.forEach((att, index) => {
            const chip = document.createElement('div');
            chip.className = 'ml-attachment-chip';
            chip.innerHTML = `
                <span>${att.name}</span>
                <span class="ml-attachment-remove" data-index="${index}">&times;</span>
            `;
            chip.querySelector('.ml-attachment-remove').onclick = () => {
                attachments.splice(index, 1);
                renderAttachments();
            };
            attachList.appendChild(chip);
        });
    }

    discardBtn.onclick = () => window.parent.postMessage('maillayer-close', '*');
    closeBtn.onclick = () => window.parent.postMessage('maillayer-close', '*');

    // Provider Menu
    providerToggle.onclick = () => providerMenu.classList.toggle('active');
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.onclick = () => {
            currentProvider = item.dataset.provider;
            localStorage.setItem('ml_preferred_provider', currentProvider);
            updateProviderUI(currentProvider);
            providerMenu.classList.remove('active');
        };
    });

    // Send Email
    sendBtn.onclick = async () => {
        const data = {
            to: toInput.value,
            cc: ccInput.value,
            bcc: bccInput.value,
            subject: subjectInput.value,
            body: quill.root.innerHTML,
            attachments: attachments
        };

        if (!data.to) {
            alert('Please specify a recipient.');
            return;
        }

        sendBtn.innerText = 'Sending...';
        sendBtn.disabled = true;

        try {
            let success = false;
            if (currentProvider === 'gmail') {
                success = await GmailService.sendEmail(data);
            } else {
                success = await OutlookService.sendEmail(data);
            }

            if (success) {
                sendBtn.innerText = '✅ Sent!';
                setTimeout(() => window.parent.postMessage('maillayer-close', '*'), 1000);
            }
        } catch (error) {
            console.error('[MailLayer] Send failed:', error);
            alert('Failed to send email: ' + error.message);
            sendBtn.innerText = `Send with ${currentProvider === 'gmail' ? 'Gmail' : 'Outlook'}`;
            sendBtn.disabled = false;
        }
    };

    /**
     * Simple color adjuster for hover states
     */
    function adjustColor(hex, percent) {
        let num = parseInt(hex.replace('#', ''), 16),
            amt = Math.round(2.55 * percent),
            R = (num >> 16) + amt,
            G = (num >> 8 & 0x00FF) + amt,
            B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
});
