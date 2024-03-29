//モジュールインストール系
  //ファイルシステム系モジュール
  const path = require('path');
  const fs = require('fs');

  //サーバー系モジュール
  const express = require('express');
  const http = require('http');
  const socketIo = require('socket.io');

  //データベース系モジュール
  const Datastore = require("nedb")

  //マップ生成用モジュール
  const noise = require("simplenoise")


//サーバー系
  const app = express();
  const server = http.Server(app);
  const io = socketIo(server);
  const PORT = 9000;


//データベースのセットアップ
  let chatDB = new Datastore({
    filename: "./src/assets/chats.db",
    autoload: true
  })

  chatDB.loadDatabase((error)=>{
    if(error != null){console.error(error)}
    console.log("loaded database");
  })


//サーバーのアップロード
  //基本ファイル
  app.get("/", (req, res)=>{res.sendFile(__dirname + "/src/index.html")})
  app.get("/main.js", (req, res)=>{res.sendFile(__dirname + "/src/main.js")})

  //画像ファイル
  const tiles_folder = "/src/assets/tiles/"
  const files = fs.readdirSync(__dirname + tiles_folder)
    .filter((file) => {
        return path.extname(file).toLowerCase() === ".png"; 
    })
  for(const file of files){ //files.foreachと同義
    app.get(`/${file}`, (req, res)=>{res.sendFile(__dirname + tiles_folder + file)})
  }


//マップ生成
  const mapSeed = Math.random()
  const ironSeed = Math.random()
  const aluminumSeed = Math.random()
  const oilSeed = Math.random()

  function radian(degree){return degree * ( Math.PI / 180 )}
  
  //通常マップ生成用
  function makeMap(
    Misal,
    chunkSize,
    waveHeight,
    waveWidth,
    noiseSize,
    seed
  ){
    noise.seed(seed)
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
    return map
  }

  //アイテムマップ生成用
  function makeItemMap(
    Misal,
    chunkSize,
    waveHeight,
    waveWidth,
    noiseSize,
    seed,
    minHeight,
    maxHeight
  ){
    noise.seed(seed)
    let map = []
    for (let y = 0; y < chunkSize; y++) {
      let newLine = []
      const newLineStartHeight = waveHeight * Math.sin(radian(y) * waveWidth)
      for (let x = 0; x < chunkSize; x++) {
        const newTileHeight = waveHeight * Math.sin(radian(x) * waveWidth) + newLineStartHeight + noise.simplex2(x*noiseSize, y*noiseSize)*Misal
        if(minHeight < newTileHeight && newTileHeight < maxHeight){
          newLine.push("S")
        }else{
          newLine.push("B")
        }
      }
      map.push(newLine)
    }
    return map
  }

  //全マップ生成用
  function makeDefaultMap(){
    const Misal = 5 //全体のずれ幅
    const chunkSize = 60
    const waveHeight = 3
    const waveWidth = 10
    const noiseSize = 1/10
    const minHeight = -6.5
    const maxHeight = 6

    const map = makeMap(Misal, chunkSize, waveHeight, waveWidth, noiseSize, mapSeed)
    const ironMap = makeItemMap(Misal, chunkSize, waveHeight, waveWidth, noiseSize, ironSeed, minHeight, maxHeight)
    const oilMap = makeItemMap(Misal, chunkSize, waveHeight, waveWidth, noiseSize, oilSeed, minHeight, maxHeight)
    const aluminumMap = makeItemMap(Misal, chunkSize, waveHeight, waveWidth, noiseSize, aluminumSeed, minHeight, maxHeight)

    io.emit("drawChunk", {
      map: map,
      ironMap: ironMap,
      oilMap: oilMap,
      aluminumMap: aluminumMap
    })
  }


//サーバーを待受状態にする
  server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
  });


//サーバーが接続した時に実行する
  io.on('connection', (socket) => {
    console.log('user connected');

    makeDefaultMap()
  })