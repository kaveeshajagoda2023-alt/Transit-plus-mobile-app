const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT_FRONTEND = 3000;
const PORT_BACKEND = 5000;

// Start Backend Server
const backend = spawn('node', ['backend/server.js'], { stdio: 'inherit' });

// Simple Static Web Server for Frontend UI
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const frontendServer = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'frontend', req.url === '/' ? 'index.html' : req.url);
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback to index.html
        fs.readFile(path.join(__dirname, 'frontend', 'index.html'), (err2, fallback) => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(fallback, 'utf-8');
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'text/plain';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

frontendServer.listen(PORT_FRONTEND, () => {
  console.log(`
========================================================================
📱 TRANSITPLUS MOBILE APP UI RUNNING LIVE!
👉 OPEN IN BROWSER TO SEE UI: http://localhost:${PORT_FRONTEND}
========================================================================
  `);
});

process.on('SIGINT', () => {
  backend.kill();
  process.exit();
});
