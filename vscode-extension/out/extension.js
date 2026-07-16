"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const http = require("http");
const https = require("https");
const url_1 = require("url");
// Helper function to send HTTP(S) POST requests dynamically
async function sendTelemetryEvent(endpoint, token, payload) {
    return new Promise((resolve, reject) => {
        try {
            const parsedUrl = new url_1.URL(endpoint);
            const dataStr = JSON.stringify(payload);
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(dataStr)
                }
            };
            const requester = parsedUrl.protocol === 'https:' ? https : http;
            const req = requester.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        console.log(`[FlowSense] Telemetry sent: ${payload.eventType} - ${res.statusCode}`);
                        resolve();
                    }
                    else {
                        console.warn(`[FlowSense] Failed to send telemetry: ${res.statusCode} - ${body}`);
                        reject(new Error(`Status Code: ${res.statusCode}`));
                    }
                });
            });
            req.on('error', (e) => {
                console.error(`[FlowSense] Network error: ${e.message}`);
                reject(e);
            });
            req.write(dataStr);
            req.end();
        }
        catch (error) {
            console.error('[FlowSense] URL parsing error:', error);
            reject(error);
        }
    });
}
function activate(context) {
    console.log('FlowSense AI telemetry extension is active!');
    // 1. Command to prompt and store user PAT securely
    let setTokenCommand = vscode.commands.registerCommand('flowsense.setToken', async () => {
        const token = await vscode.window.showInputBox({
            prompt: 'Enter your FlowSense AI Personal Access Token (PAT)',
            placeHolder: 'fs_pat_live_...',
            ignoreFocusOut: true,
            password: true
        });
        if (token) {
            await context.secrets.store('flowsense.pat', token.trim());
            vscode.window.showInformationMessage('FlowSense AI: Token configured successfully.');
        }
    });
    context.subscriptions.push(setTokenCommand);
    // Helper to log document telemetry
    async function logDocumentEvent(eventType, document) {
        // Only track file schemes (skips git, settings, output channels, etc.)
        if (document.uri.scheme !== 'file') {
            return;
        }
        const token = await context.secrets.get('flowsense.pat');
        if (!token) {
            // Silently return if token is not configured yet
            return;
        }
        const config = vscode.workspace.getConfiguration('flowsense');
        const endpoint = config.get('apiEndpoint') || 'http://localhost:3000/api/events';
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
        const workspaceName = workspaceFolder ? workspaceFolder.name : 'Single File';
        const payload = {
            eventType,
            resourceName: document.fileName,
            workspace: workspaceName,
            timestamp: new Date().toISOString(),
            metadata: {
                language: document.languageId,
                linesCount: document.lineCount
            }
        };
        sendTelemetryEvent(endpoint, token, payload).catch(() => { });
    }
    // 2. Event listener: Active file opened
    const openListener = vscode.workspace.onDidOpenTextDocument((doc) => {
        logDocumentEvent('FILE_OPEN', doc);
    });
    context.subscriptions.push(openListener);
    // 3. Event listener: Active file saved
    const saveListener = vscode.workspace.onDidSaveTextDocument((doc) => {
        logDocumentEvent('FILE_SAVE', doc);
    });
    context.subscriptions.push(saveListener);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map