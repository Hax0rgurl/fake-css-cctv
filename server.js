const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = process.env.PORT || 3000;
const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

const PUBLIC_DIR = path.join(__dirname, 'public');

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // Proxy endpoint for Giphy API
    if (parsedUrl.pathname === '/api/giphy') {
        const tag = parsedUrl.query.tag || '';

        if (!GIPHY_API_KEY) {
            console.error('GIPHY_API_KEY is not configured');
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Backend configuration error' }));
        }

        try {
            const response = await fetch(
                `https://api.giphy.com/v1/gifs/random?api_key=${GIPHY_API_KEY}&tag=${encodeURIComponent(tag)}&rating=g`
            );

            if (!response.ok) {
                throw new Error(`Giphy API responded with status: ${response.status}`);
            }

            const data = await response.json();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(data));
        } catch (error) {
            console.error('Error fetching from Giphy:', error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Failed to fetch from Giphy' }));
        }
    }

    // Serve static files from the public directory
    let filePath = path.join(PUBLIC_DIR, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);

    // Safety check to prevent directory traversal out of public directory
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
        case '.gif': contentType = 'image/gif'; break;
        case '.mp4': contentType = 'video/mp4'; break;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // If file not found, serve index.html (useful for SPA-like behavior)
                fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err, indexContent) => {
                    if (err) {
                        res.writeHead(404);
                        res.end('File not found');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(indexContent, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
