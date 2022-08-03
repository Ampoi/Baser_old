const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIo(server);

const PORT = 9000;
//nedbデータベースセットアップ
const Datastore = require("nedb")
let chatDB = new Datastore({
  filename: "./src/assets/chats.db",
  autoload: true
})
chatDB.loadDatabase((error)=>{
  if(error != null){console.error(error)}
  console.log("loaded database");
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/src/index.html")
});

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

const noise = require("simplenoise")
noise.seed(Math.random)

function radian(degree){return degree * ( Math.PI / 180 )}

io.on('connection', (socket) => {
  console.log('user connected');
  //メッセージが送られた時の処理
  socket.on('makeChunk', (
    Misal,
    chunkSize,
    waveHeight,
    waveWidth,
    noiseSize
  ) => {
    let map = []
    for (let y = 0; y < chunkSize; y++) {
      let newLine = []
      const newLineStartHeight = waveHeight * Math.sin(radian(y) * waveWidth)
      for (let x = 0; x < chunkSize; x++) {
        const newTileHeight = waveHeight * Math.sin(radian(x) * waveWidth) + newLineStartHeight + noise.simplex2(x*noiseSize, y*noiseSize)*Misal
        newLine.push(newTileHeight)
      }
      map.push(newLine)
    }
    io.emit("drawChunk", map)
  });
});