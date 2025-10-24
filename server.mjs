import { createServer } from 'http';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;
const port = process.env.PORT ? Number(process.env.PORT) : 5173;

const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8'
};

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
}

function resolveFilePath(urlPath) {
    const safePath = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
    if (safePath === '/' || safePath === '') {
        return path.join(rootDir, 'index.html');
    }
    return path.join(rootDir, safePath);
}

const server = createServer(async (req, res) => {
    const filePath = resolveFilePath(req.url.split('?')[0]);

    try {
        const data = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': getContentType(filePath) });
        res.end(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not Found');
        } else {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Internal Server Error');
        }
    }
});

server.listen(port, () => {
    console.log(`Baby Feed Tracker running at http://localhost:${port}`);
});
