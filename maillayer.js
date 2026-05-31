/**
 * MailLayer Embedded Wrapper Script
 * Version: 1.0.0
 * Author: Spuds0588
 * License: MIT
 */

(function() {
    'use strict';

    // Configuration - Replace with your GitHub Pages URL
    const BASE_URL = 'https://embedded.maillayer.wiki/';
    
    // Find the script tag that included this file to read configuration
    const selfScript = document.currentScript || document.querySelector('script[src*="maillayer.js"]');
    const config = {
        autoDetect: selfScript?.dataset.maillayerAutoDetect === 'true',
        autoLinkColor: selfScript?.dataset.maillayerAutoLinkColor || '#5998c5'
    };

    // Determine which URL to use (prefer local if testing)
    const EMBED_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') 
        ? 'embed.html' 
        : BASE_URL + 'embed.html';

    /**
     * Intercept clicks on mailto: links and .maillayer-trigger elements
     */
    document.addEventListener('click', (e) => {
        const mailtoLink = e.target.closest('a[href^="mailto:"]');
        const customTrigger = e.target.closest('.maillayer-trigger');
        
        if (mailtoLink || customTrigger) {
            e.preventDefault();
            e.stopPropagation();
            
            let params = {};
            let dataset = {};

            if (mailtoLink) {
                params = parseMailtoUrl(mailtoLink.href);
                dataset = mailtoLink.dataset;
            } else if (customTrigger) {
                params = {
                    to: customTrigger.dataset.maillayerTo || '',
                    cc: customTrigger.dataset.maillayerCc || '',
                    bcc: customTrigger.dataset.maillayerBcc || '',
                    subject: customTrigger.dataset.maillayerSubject || '',
                    body: customTrigger.dataset.maillayerBody || ''
                };
                dataset = customTrigger.dataset;
            }

            openMailLayer(params, dataset);
        }
    }, true);

    /**
     * Parses a mailto URL into its component parts.
     */
    function parseMailtoUrl(url) {
        const cleanUrl = url.replace(/^mailto:/i, '');
        const [toPart, queryPart] = cleanUrl.split('?');
        
        const result = {
            to: decodeURIComponent(toPart || ''),
            cc: '',
            bcc: '',
            subject: '',
            body: ''
        };

        if (queryPart) {
            const params = new URLSearchParams(queryPart);
            result.cc = params.get('cc') || '';
            result.bcc = params.get('bcc') || '';
            result.subject = params.get('subject') || '';
            result.body = params.get('body') || '';
        }

        return result;
    }

    /**
     * Opens the MailLayer modal
     */
    function openMailLayer(data, dataset) {
        if (document.getElementById('maillayer-embed-overlay')) return;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'maillayer-embed-overlay';
        applyStyles(overlay, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: '2147483647',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        });

        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.id = 'maillayer-embed-iframe';
        
        // Build iframe URL with parameters
        const url = new URL(EMBED_URL, window.location.href);
        url.searchParams.set('to', data.to);
        if (data.cc) url.searchParams.set('cc', data.cc);
        if (data.bcc) url.searchParams.set('bcc', data.bcc);
        if (data.subject) url.searchParams.set('subject', data.subject);
        if (data.body) url.searchParams.set('body', data.body);

        // Pass custom styles and restrictions from dataset
        if (dataset.maillayerTheme) url.searchParams.set('theme', dataset.maillayerTheme);
        if (dataset.maillayerColor) url.searchParams.set('color', dataset.maillayerColor.replace('#', ''));
        
        // Restriction parameters
        if (dataset.maillayerLockTo === 'true') url.searchParams.set('lockTo', 'true');
        if (dataset.maillayerLockCc === 'true') url.searchParams.set('lockCc', 'true');
        if (dataset.maillayerLockBcc === 'true') url.searchParams.set('lockBcc', 'true');
        if (dataset.maillayerLockSubject === 'true') url.searchParams.set('lockSubject', 'true');
        if (dataset.maillayerDisableAttachments === 'true') url.searchParams.set('disableAttachments', 'true');

        iframe.src = url.toString();
        
        applyStyles(iframe, {
            width: '850px',
            maxWidth: '95vw',
            height: '650px',
            maxHeight: '90vh',
            border: 'none',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            background: '#111111'
        });

        overlay.appendChild(iframe);
        document.body.appendChild(overlay);

        // Fade in
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });

        // Close on overlay click
        overlay.onclick = (e) => {
            if (e.target === overlay) closeModal();
        };

        // Listen for messages from iframe
        window.addEventListener('message', handleMessage);

        function handleMessage(event) {
            if (event.data === 'maillayer-close') {
                closeModal();
            }
        }

        function closeModal() {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                window.removeEventListener('message', handleMessage);
            }, 300);
        }
    }

    /**
     * Auto-Detect Logic (Magic UX)
     */
    function initMagicUX() {
        if (!config.autoDetect) return;

        console.log('[MailLayer] Auto-Detect enabled. Scanning for emails...');
        injectMagicStyles();
        
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        
        function scanForEmails(node) {
            const skipTags = ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'A', 'BUTTON', 'NOSCRIPT', 'IFRAME', 'SVG'];
            
            const textNodes = [];
            const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
                acceptNode: function(n) {
                    if (n.parentNode && skipTags.includes(n.parentNode.nodeName)) return NodeFilter.FILTER_REJECT;
                    if (n.parentNode && n.parentNode.classList?.contains('maillayer-magic-link')) return NodeFilter.FILTER_REJECT;
                    if (n.nodeValue.trim() === '') return NodeFilter.FILTER_SKIP;
                    if (emailRegex.test(n.nodeValue)) {
                        emailRegex.lastIndex = 0;
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_SKIP;
                }
            }, false);

            while (walker.nextNode()) {
                textNodes.push(walker.currentNode);
            }

            textNodes.forEach(textNode => {
                emailRegex.lastIndex = 0;
                const text = textNode.nodeValue;
                if (!emailRegex.test(text)) return;
                
                const span = document.createElement('span');
                span.innerHTML = text.replace(emailRegex, (match) => {
                    return `<span class="maillayer-magic-link" data-maillayer-to="${match}">${match} <svg width="12" height="12" viewBox="0 0 24 24" fill="${config.autoLinkColor}" style="vertical-align: middle; margin-left: 2px;"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg></span>`;
                });
                
                textNode.parentNode.replaceChild(span, textNode);
            });
        }

        // Initial scan
        scanForEmails(document.body);
        
        // Mutation Observer for dynamic content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        scanForEmails(node);
                    } else if (node.nodeType === Node.TEXT_NODE) {
                        if (node.parentNode) scanForEmails(node.parentNode);
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });

        // Click listener for magic links
        document.addEventListener('click', (e) => {
            const magicLink = e.target.closest('.maillayer-magic-link');
            if (magicLink) {
                e.preventDefault();
                e.stopPropagation();
                openMailLayer({
                    to: magicLink.dataset.maillayerTo,
                    cc: '', bcc: '', subject: '', body: ''
                }, magicLink.dataset);
            }
        }, true);
    }

    function injectMagicStyles() {
        if (document.getElementById('maillayer-magic-styles')) return;
        const style = document.createElement('style');
        style.id = 'maillayer-magic-styles';
        style.textContent = `
            @keyframes maillayerFadeIn {
                from { opacity: 0; filter: blur(2px); }
                to { opacity: 1; filter: blur(0); }
            }
            .maillayer-magic-link {
                color: ${config.autoLinkColor};
                border-bottom: 1px solid ${config.autoLinkColor}44;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                transition: all 0.2s ease;
                animation: maillayerFadeIn 0.5s ease-out forwards;
                text-decoration: none;
                font-weight: 500;
            }
            .maillayer-magic-link:hover {
                border-bottom-color: ${config.autoLinkColor};
                background: ${config.autoLinkColor}11;
                border-radius: 4px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Helper to apply multiple styles to an element
     */
    function applyStyles(el, styles) {
        for (const [key, value] of Object.entries(styles)) {
            el.style[key] = value;
        }
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMagicUX);
    } else {
        initMagicUX();
    }

})();
