/**
 * MailLayer Embedded — Native Email Sending via Deep Links
 * Version: 2.0.0
 * License: MIT
 */

(() => {
    'use strict';

    const script = document.currentScript || document.querySelector('script[src*="maillayer.js"]');
    const config = {
        autoDetect: script?.dataset.maillayerAutoDetect === 'true',
        autoLinkColor: script?.dataset.maillayerAutoLinkColor || '#5998c5',
        provider: script?.dataset.maillayerProvider || 'gmail'
    };

    const getDeepLink = (provider, { to = '', cc = '', bcc = '', subject = '', body = '' }) => {
        const [t, c, b, s, bd] = [to, cc, bcc, subject, body].map(encodeURIComponent);
        if (provider === 'outlook' || provider === 'outlook_web') return `https://outlook.live.com/mail/0/deeplink/compose?to=${t}&cc=${c}&bcc=${b}&subject=${s}&body=${bd}`;
        if (provider === 'yahoo' || provider === 'yahoo_web') return `https://compose.mail.yahoo.com/?to=${t}&cc=${c}&bcc=${b}&subj=${s}&body=${bd}`;
        return `https://mail.google.com/mail/?view=cm&fs=1&to=${t}&cc=${c}&bcc=${b}&su=${s}&body=${bd}`;
    };

    const openMailLayer = (data, dataset = {}) => {
        const provider = dataset.maillayerProvider || config.provider;
        const url = getDeepLink(provider, data);
        window.open(url, 'MailLayerPopup', 'width=900,height=700,resizable=yes,scrollbars=yes');
    };

    const parseMailtoUrl = (url) => {
        const [toPart, queryPart] = url.replace(/^mailto:/i, '').split('?');
        const res = { to: decodeURIComponent(toPart || ''), cc: '', bcc: '', subject: '', body: '' };
        if (queryPart) {
            const p = new URLSearchParams(queryPart);
            ['cc', 'bcc', 'subject', 'body'].forEach(k => res[k] = p.get(k) || '');
        }
        return res;
    };

    document.addEventListener('click', (e) => {
        const mailto = e.target.closest('a[href^="mailto:"]');
        const trigger = e.target.closest('.maillayer-trigger');
        if (mailto || trigger) {
            e.preventDefault();
            e.stopPropagation();
            if (mailto) {
                openMailLayer(parseMailtoUrl(mailto.href), mailto.dataset);
            } else {
                openMailLayer({
                    to: trigger.dataset.maillayerTo || '',
                    cc: trigger.dataset.maillayerCc || '',
                    bcc: trigger.dataset.maillayerBcc || '',
                    subject: trigger.dataset.maillayerSubject || '',
                    body: trigger.dataset.maillayerBody || ''
                }, trigger.dataset);
            }
        }
    }, true);

    const initMagicUX = () => {
        if (!config.autoDetect) return;
        const style = document.createElement('style');
        style.textContent = `.maillayer-magic-link{color:${config.autoLinkColor};border-bottom:1px solid ${config.autoLinkColor}44;cursor:pointer;display:inline-flex;align-items:center;text-decoration:none;font-weight:500;transition:all .2s}.maillayer-magic-link:hover{border-bottom-color:${config.autoLinkColor};background:${config.autoLinkColor}11;border-radius:4px}`;
        document.head.appendChild(style);

        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        const skipTags = ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'A', 'BUTTON', 'NOSCRIPT', 'IFRAME', 'SVG'];

        const scan = (node) => {
            const textNodes = [];
            const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
                acceptNode: (n) => (n.parentNode && skipTags.includes(n.parentNode.nodeName)) || n.parentNode?.classList?.contains('maillayer-magic-link') ? NodeFilter.FILTER_REJECT : emailRegex.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
            });
            while (walker.nextNode()) textNodes.push(walker.currentNode);
            textNodes.forEach(n => {
                const span = document.createElement('span');
                span.innerHTML = n.nodeValue.replace(emailRegex, (match) => `<span class="maillayer-magic-link" data-maillayer-to="${match}">${match} <svg width="12" height="12" viewBox="0 0 24 24" fill="${config.autoLinkColor}" style="vertical-align:middle;margin-left:2px;"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg></span>`);
                n.parentNode.replaceChild(span, n);
            });
        };

        scan(document.body);
        new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 ? scan(n) : n.nodeType === 3 && n.parentNode && scan(n.parentNode)))).observe(document.body, { childList: true, subtree: true });

        document.addEventListener('click', (e) => {
            const link = e.target.closest('.maillayer-magic-link');
            if (link) {
                e.preventDefault();
                e.stopPropagation();
                openMailLayer({ to: link.dataset.maillayerTo }, link.dataset);
            }
        }, true);
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMagicUX);
    else initMagicUX();
})();
