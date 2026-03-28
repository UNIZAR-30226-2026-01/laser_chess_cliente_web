const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8080 });

console.log("Servidor Mock listo en puerto 8080");

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const msg = data.toString();
    // Rebotamos el mensaje para confirmar el movimiento del usuario
    ws.send(msg);
  
  });
});

// Cerramos el servidor tras 20 segundos para que la Action no se quede colgada
setTimeout(() => process.exit(0), 20000);
