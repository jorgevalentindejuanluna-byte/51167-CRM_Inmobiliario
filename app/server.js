// server.js — Punto de entrada para Next.js en Plesk Node.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error al manejar la petición:', err);
      res.statusCode = 500;
      res.end('Error interno del servidor');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> CRM Inmobiliario listo en http://${hostname}:${port}`);
    console.log(`> Entorno: ${process.env.NODE_ENV}`);
  });
});
