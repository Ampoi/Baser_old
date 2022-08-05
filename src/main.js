const socket = io.connect(location.origin)

const canvasW = 30
const canvasH = 40
let avatarX = 0
let avatarY = 0
const tileSize = 20
const arasa = 3
const akarusa = 128
let focusX = 0
let focusY = 0
let contextX = 0
let contextY = 0
const contextH = tileSize*16
const contextW = tileSize*12
let showContext = false

let map = []
let ironMap = []
let oilMap = []
let aluminumMap = []

//画面描画
const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")
canvas.height = canvasH * tileSize
canvas.width = canvasW * tileSize

function returnFocusPosition(mouse){
  const rect = canvas.getBoundingClientRect();
  return {
    x: mouse.clientX - rect.left,
    y: mouse.clientY - rect.top
  };
}

function drawItemMap(newMap, type) {
  for (let tileY = 0; tileY < canvasH; tileY++) {
    for (let tileX = 0; tileX < canvasW; tileX++) {
      let tileValue = "S"
      
      const displayedX = tileX + avatarX - canvasW/2
      const displayedY = tileY + avatarY - canvasH/2

      if(newMap[displayedY] != undefined && newMap[displayedY][displayedX] != undefined){
        tileValue = newMap[displayedY][displayedX]
      }

      if(tileValue == "S"){
        ctx.fillStyle = "rgba(0, 0, 0, 0)"
        ctx.fillRect(tileX*tileSize,tileY*tileSize,tileSize,tileSize)
      }else{
        let newTile = new Image()
        newTile.src = `/${type}.png`
        ctx.drawImage(newTile, tileX*tileSize, tileY*tileSize, tileSize, tileSize)
      }
    }
  }
}

function updateDisplay(){
  //マップの描画
  //tileX, tileYは画面上のタイルの位置
  for (let tileY = 0; tileY < canvasH; tileY++) {
    for (let tileX = 0; tileX < canvasW; tileX++) {
      let tileValue = "space"
      
      const displayedX = tileX + avatarX - canvasW/2
      const displayedY = tileY + avatarY - canvasH/2

      if(map[displayedY] != undefined && map[displayedY][displayedX] != undefined){
        tileValue = map[displayedY][displayedX]
      }

      if(tileValue == "space"){
        var newColor = "#000000"
      }else{
        const newColorNumber = 20*Math.round(tileValue/arasa)*arasa + 128
        var newColor = `rgb(${newColorNumber},${newColorNumber},${newColorNumber})`
      }

      ctx.fillStyle = newColor
      ctx.fillRect(tileX*tileSize,tileY*tileSize,tileSize,tileSize)
    }
  }
  
  ctx.globalAlpha = 0.5
  drawItemMap(ironMap, "iron")
  drawItemMap(oilMap, "oil")
  drawItemMap(aluminumMap, "aluminum")
  ctx.globalAlpha = 1

  //フォーカスの表示
  let focusImg = new Image()
  focusImg.src = "/focus.png"
  focusImg.onload = ()=>{
    console.log("apapa");
    ctx.drawImage(focusImg, focusX*tileSize, focusY*tileSize, tileSize, tileSize)
  }

  //コンテキストメニューの表示
  if(showContext == true){
    ctx.fillStyle = "#000000"
    ctx.fillRect(contextX ,contextY,contextW,contextH)
  }
}

socket.on("drawChunk", (newMap)=>{
  map = newMap.map
  ironMap = newMap.ironMap
  oilMap = newMap.oilMap
  aluminumMap = newMap.aluminumMap

  updateDisplay()
})

document.addEventListener("keydown", (e)=>{
  switch (e.key) {
    case "w":
      avatarY -= 1
      break;
    case "d":
      avatarX += 1
      break;
    case "s":
      avatarY += 1
      break;
    case "a":
      avatarX -= 1
    default:
      break;
  }
  updateDisplay()
})

canvas.addEventListener("mousemove", (e)=>{
  if(showContext == false){
    const mousePosition = returnFocusPosition(e)
    newFocusX = Math.floor(mousePosition.x / tileSize)
    newFocusY = Math.floor(mousePosition.y / tileSize)
    if(newFocusX != focusX || newFocusY != focusY){
      focusX = newFocusX
      focusY = newFocusY
      updateDisplay()
    }
  }
})

document.addEventListener("contextmenu", (e)=>{
  const mousePosition = returnFocusPosition(e)
  contextX = mousePosition.x
  contextY = mousePosition.y
  showContext = !showContext
  console.log(mousePosition);

  updateDisplay()

  event.preventDefault();
})