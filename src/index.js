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
  res.sendFile(__dirname + '/index.html');
});

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

io.on('connection', (socket) => {
  console.log('user connected');
  //メッセージが送られた時の処理
  socket.on('sendMessage', (message) => {
    console.log('Message has been sent: ', message);

    const newDoc = {
      from: "testUser",
      content: message
    }
    chatDB.insert(newDoc)

    console.log(chatDB);
    io.emit("updateList", newDoc)
  });
});