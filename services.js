/**
 * MailLayer Services (Gmail & Outlook)
 * Adapted for Web environment with Popup OAuth.
 */

const GOOGLE_CLIENT_ID = '1034329801184-nu1h1128ec36fuejkgn6v6q9rcn0ud75.apps.googleusercontent.com';
const OUTLOOK_CLIENT_ID = 'ce78b45b-572b-4eb7-80f8-41547567ec34';

class AuthService {
    static async getValidToken(provider) {
        const storageKey = `ml_${provider}_token`;
        let token = localStorage.getItem(storageKey);
        
        // Simple expiry check (optional, but tokens usually last 1hr)
        const expiryKey = `ml_${provider}_expiry`;
        const expiry = localStorage.getItem(expiryKey);
        if (token && expiry && Date.now() > parseInt(expiry)) {
            localStorage.removeItem(storageKey);
            token = null;
        }

        if (token) return token;

        // If no token, trigger popup
        return this.loginWithPopup(provider);
    }

    static loginWithPopup(provider) {
        return new Promise((resolve, reject) => {
            const width = 500;
            const height = 600;
            const left = (window.screen.width / 2) - (width / 2);
            const top = (window.screen.height / 2) - (height / 2);
            
            // Redirect URI must be authorized in Google/MS dashboards
            const redirectUri = window.location.origin + window.location.pathname.replace('embed.html', 'auth_callback.html');
            
            let authUrl = '';
            if (provider === 'gmail') {
                authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                    `client_id=${GOOGLE_CLIENT_ID}&` +
                    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                    `response_type=token&` +
                    `state=gmail&` +
                    `scope=${encodeURIComponent('https://www.googleapis.com/auth/gmail.send')}`;
            } else {
                authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
                    `client_id=${OUTLOOK_CLIENT_ID}&` +
                    `response_type=token&` +
                    `state=outlook&` +
                    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                    `scope=${encodeURIComponent('https://graph.microsoft.com/mail.send')}`;
            }

            const popup = window.open(authUrl, 'MailLayerAuth', `width=${width},height=${height},top=${top},left=${left}`);

            const messageHandler = (event) => {
                if (event.data && event.data.type === 'maillayer-auth-token') {
                    const { token, provider: p } = event.data;
                    // Log for debugging
                    console.log(`[MailLayer] Received token for ${p}`);
                    
                    if (p === provider) {
                        localStorage.setItem(`ml_${provider}_token`, token);
                        localStorage.setItem(`ml_${provider}_expiry`, (Date.now() + 3500 * 1000).toString());
                        window.removeEventListener('message', messageHandler);
                        resolve(token);
                    }
                }
            };

            window.addEventListener('message', messageHandler);

            // Poll for popup closure as fallback
            const pollTimer = setInterval(() => {
                if (popup.closed) {
                    clearInterval(pollTimer);
                    // Give a small delay for the message to arrive
                    setTimeout(() => {
                        if (!localStorage.getItem(`ml_${provider}_token`)) {
                            reject(new Error('Login cancelled or failed.'));
                        }
                    }, 500);
                }
            }, 500);
        });
    }
}

class GmailService {
    static async sendEmail(data) {
        const token = await AuthService.getValidToken('gmail');
        const rawMessage = this.createRawMessage(data);
        
        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ raw: rawMessage })
        });

        if (!response.ok) {
            const errData = await response.json();
            if (response.status === 401) {
                localStorage.removeItem('ml_gmail_token');
                throw new Error('Session expired. Please try again.');
            }
            throw new Error(errData.error?.message || 'Failed to send Gmail email');
        }

        return true;
    }

    static createRawMessage(data) {
        const mainBoundary = '----MailLayerBoundary' + Math.random().toString(16).slice(2);
        const bodyBoundary = '----MailLayerBody' + Math.random().toString(16).slice(2);
        
        let headers = [
            `To: ${data.to}`,
            `Subject: ${data.subject}`,
            'MIME-Version: 1.0',
            `Content-Type: multipart/mixed; boundary="${mainBoundary}"`
        ];

        if (data.cc) headers.push(`Cc: ${data.cc}`);
        if (data.bcc) headers.push(`Bcc: ${data.bcc}`);

        const plainText = data.body.replace(/<[^>]*>/g, '');

        let emailParts = [
            ...headers,
            '',
            `--${mainBoundary}`,
            `Content-Type: multipart/alternative; boundary="${bodyBoundary}"`,
            '',
            `--${bodyBoundary}`,
            'Content-Type: text/plain; charset=utf-8',
            'Content-Transfer-Encoding: 7bit',
            '',
            plainText,
            '',
            `--${bodyBoundary}`,
            'Content-Type: text/html; charset=utf-8',
            'Content-Transfer-Encoding: 7bit',
            '',
            data.body,
            '',
            `--${bodyBoundary}--`
        ];

        if (data.attachments && data.attachments.length > 0) {
            data.attachments.forEach(att => {
                emailParts.push(`--${mainBoundary}`);
                emailParts.push(`Content-Type: ${att.contentType}; name="${att.name}"`);
                emailParts.push(`Content-Disposition: attachment; filename="${att.name}"`);
                emailParts.push('Content-Transfer-Encoding: base64');
                emailParts.push('');
                emailParts.push(att.content);
            });
        }

        emailParts.push(`--${mainBoundary}--`);
        const email = emailParts.join('\r\n');

        // Base64url encoding
        const bytes = new TextEncoder().encode(email);
        const base64 = btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''));
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
}

class OutlookService {
    static async sendEmail(data) {
        const token = await AuthService.getValidToken('outlook');
        
        const emailContent = {
            message: {
                subject: data.subject,
                body: { contentType: 'HTML', content: data.body },
                toRecipients: [{ emailAddress: { address: data.to } }],
                ccRecipients: data.cc ? data.cc.split(',').map(e => ({ emailAddress: { address: e.trim() } })) : [],
                bccRecipients: data.bcc ? data.bcc.split(',').map(e => ({ emailAddress: { address: e.trim() } })) : [],
                attachments: (data.attachments || []).map(att => ({
                    '@odata.type': '#microsoft.graph.fileAttachment',
                    name: att.name,
                    contentType: att.contentType,
                    contentBytes: att.content
                }))
            }
        };

        const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...emailContent, saveToSentItems: true })
        });

        if (!response.ok) {
            const errData = await response.json();
            if (response.status === 401) {
                localStorage.removeItem('ml_outlook_token');
                throw new Error('Session expired. Please try again.');
            }
            throw new Error(errData.error?.message || 'Failed to send Outlook email');
        }

        return true;
    }
}
