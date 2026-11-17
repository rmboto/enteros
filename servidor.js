// Servidor local de Feria Neón 84.
// Sirve el juego y guarda las puntuaciones en jugadores.json, en esta misma carpeta.
// Uso: node servidor.js [--puerto=8084] [--red] [--abrir]
//   --red    acepta conexiones de otros equipos de la red (por defecto, solo este ordenador)
//   --abrir  abre el juego en el navegador al arrancar
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const { exec } = require('child_process');

const RAIZ = __dirname;
const ARCHIVO = path.join(RAIZ, 'jugadores.json');
const args = process.argv.slice(2);
const arg = (n) => { const a = args.find((x) => x.startsWith('--' + n + '=')); return a ? a.split('=')[1] : null; };
const PUERTO = Number(arg('puerto') || process.env.PORT || 8084);
const RED = args.includes('--red');
const HOST = RED ? '0.0.0.0' : '127.0.0.1';
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2',
};

/* ---------- base de datos ---------- */
function vacia() { return { juego: 'Feria Neón 84', version: 1, actualizado: null, jugadores: [], partidas: [] }; }
function leer() {
  try { const d = JSON.parse(fs.readFileSync(ARCHIVO, 'utf8')); if (d && Array.isArray(d.jugadores) && Array.isArray(d.partidas)) return d; } catch (e) { /* no existe o está dañado */ }
  return vacia();
}
function guardar(db) { // se escribe en un temporal y se renombra, para no dejar nunca el archivo a medias
  const tmp = ARCHIVO + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, ARCHIVO);
}
function texto(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max); }
function numero(v, min, max) { v = Number(v); return Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : 0; }
function limpiar(p) { // ficha de una partida, con los campos acotados
  const usuario = texto(p && p.usuario, 24);
  if (!usuario) return null;
  return {
    id: texto(p.id, 40) || Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    fecha: new Date().toISOString(), usuario,
    puntos: numero(p.puntos, 0, 99999), aciertos: numero(p.aciertos, 0, 20), preguntas: numero(p.preguntas, 0, 20),
    completa: p.completa === true,
    logros: Array.isArray(p.logros) ? p.logros.slice(0, 12).map((x) => texto(x, 40)) : [],
    modo: texto(p.modo, 30), duracionSeg: numero(p.duracionSeg, 0, 86400),
  };
}
function anotar(db, r) { // añade la partida; la misma visita guardada a medias y después terminada lleva el mismo id y se sustituye
  const i = db.partidas.findIndex((x) => x.id === r.id);
  if (i >= 0) { if (r.preguntas < (db.partidas[i].preguntas || 0)) return; db.partidas[i] = r; } else db.partidas.push(r);
  if (db.partidas.length > 5000) db.partidas.splice(0, db.partidas.length - 5000);
  db.actualizado = r.fecha;
}
function indexar(db) { // las fichas de jugadores se recalculan siempre a partir de las partidas
  const m = new Map();
  for (const p of db.partidas) {
    const k = String(p.usuario).toLowerCase();
    let j = m.get(k);
    if (!j) { j = { usuario: p.usuario, partidas: 0, mejorPuntuacion: 0, mejorAciertos: 0, puntosTotales: 0, ultimaPuntuacion: 0, ultimaPartida: null }; m.set(k, j); }
    j.partidas++; j.puntosTotales += p.puntos;
    j.mejorPuntuacion = Math.max(j.mejorPuntuacion, p.puntos); j.mejorAciertos = Math.max(j.mejorAciertos, p.aciertos);
    if (!j.ultimaPartida || String(p.fecha) >= j.ultimaPartida) { j.ultimaPartida = p.fecha; j.ultimaPuntuacion = p.puntos; }
  }
  db.jugadores = [...m.values()].sort((a, b) => b.mejorPuntuacion - a.mejorPuntuacion || String(a.usuario).localeCompare(String(b.usuario)));
}

/* ---------- servidor ---------- */
function json(res, estado, cuerpo) { res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(cuerpo)); }

const srv = http.createServer((req, res) => {
  let ruta;
  try { ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (e) { res.writeHead(400); return res.end(); }

  if (ruta === '/api/jugadores') {
    if (req.method === 'GET') return json(res, 200, leer());
    if (req.method !== 'POST') { res.writeHead(405, { Allow: 'GET, POST' }); return res.end(); }
    // solo JSON: así otra web abierta en el navegador no puede colar puntuaciones con un formulario
    if (!/^application\/json/i.test(req.headers['content-type'] || '')) return json(res, 415, { error: 'Se esperaba application/json' });
    let cuerpo = '', grande = false;
    req.on('data', (c) => { cuerpo += c; if (cuerpo.length > 65536) { grande = true; req.destroy(); } });
    req.on('end', () => {
      if (grande) return;
      let d;
      try { d = JSON.parse(cuerpo); } catch (e) { return json(res, 400, { error: 'JSON no válido' }); }
      const lista = Array.isArray(d && d.partidas) ? d.partidas.slice(0, 8) : [d];
      const db = leer();
      let n = 0;
      for (const p of lista) { const r = limpiar(p); if (r) { anotar(db, r); n++; } }
      if (!n) return json(res, 400, { error: 'Falta el usuario' });
      indexar(db);
      try { guardar(db); } catch (e) { return json(res, 500, { error: 'No se pudo escribir jugadores.json' }); }
      json(res, 200, db);
    });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  if (ruta.endsWith('/')) ruta += 'index.html';
  const fichero = path.join(RAIZ, ruta);
  // nada fuera de esta carpeta, ni archivos ocultos ni temporales
  if (!fichero.startsWith(RAIZ + path.sep) || path.basename(fichero).startsWith('.') || fichero.endsWith('.tmp')) { res.writeHead(404); return res.end(); }
  fs.readFile(fichero, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(fichero).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : buf);
  });
});

srv.on('error', (e) => {
  console.error(e.code === 'EADDRINUSE' ? 'El puerto ' + PUERTO + ' ya está en uso. Prueba con: node servidor.js --puerto=8085' : String(e));
  process.exit(1);
});

if (!fs.existsSync(ARCHIVO)) { try { guardar(vacia()); } catch (e) { console.error('No se pudo crear jugadores.json: ' + e.message); } }

srv.listen(PUERTO, HOST, () => {
  const local = 'http://localhost:' + PUERTO;
  console.log('Feria Neón 84 en marcha: ' + local);
  console.log('Las puntuaciones se guardan en ' + ARCHIVO);
  if (RED) {
    for (const lista of Object.values(os.networkInterfaces())) for (const i of lista || []) if (i.family === 'IPv4' && !i.internal) console.log('Desde otros equipos de la red: http://' + i.address + ':' + PUERTO);
  }
  if (args.includes('--abrir')) {
    const orden = process.platform === 'win32' ? 'start "" "' + local + '"' : process.platform === 'darwin' ? 'open "' + local + '"' : 'xdg-open "' + local + '"';
    exec(orden, () => {});
  }
  console.log('Para parar el servidor: Ctrl + C');
});
