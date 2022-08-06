const socket = io.connect(location.origin)

const canvasW = 30
const canvasH = 40
let userX = 0
let userY = 0
const tileSize = 20
const itemImageSize = 25
const arasa = 3
const akarusa = 128

let focusDisplayX = 0
let focusDisplayY = 0
let focusMapX = 0
let focusMapY = 0

let contextX = 0
let contextY = 0
const contextH = 11
const contextW = 12
let showContext = false
let inventory = [
  {value: "iron", amount: 10},
  {value: "iron", amount: 10},
  {value: "", amount: 0},
  {value: "", amount: 0},
  {value: "", amount: 0}
]

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
      
      const displayedX = tileX + userX - canvasW/2
      const displayedY = tileY + userY - canvasH/2

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
      
      const displayedX = tileX + userX - canvasW/2
      const displayedY = tileY + userY - canvasH/2

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
    ctx.drawImage(focusImg, focusDisplayX*tileSize, focusDisplayY*tileSize, tileSize, tileSize)
  }

  //コンテキストメニューの表示
  if(showContext == true){
    ctx.fillStyle = "#000000"
    ctx.lineWidth = 2
    ctx.strokeStyle = "#F0F0F0"
    //ウィンドウ
    ctx.globalAlpha = 0.7
    ctx.fillRect(contextX, contextY, contextW*tileSize, contextH*tileSize)
    ctx.globalAlpha = 1
    ctx.strokeRect(contextX, contextY, contextW*tileSize, contextH*tileSize)
    //右のやつ
    for (let i = 0; i < 5; i++) {
      ctx.strokeRect(contextX + tileSize/2, contextY + tileSize/2 + tileSize*2*i, 2*tileSize, 2*tileSize)
    }
    let count = 0
    inventory.forEach((item) => {
      if(item.value == ""){return}
      const padding = (tileSize*2 - itemImageSize) / 2
      const newItem = new Image()
      newItem.src = `/${item.value}.png`
      ctx.drawImage(
        newItem,
        contextX + tileSize/2 + padding,
        contextY + tileSize/2 + padding + tileSize*2*count,
        itemImageSize,
        itemImageSize
      )

      count += 1
    })
  }
}

document.addEventListener("scroll", ()=>{
  event.preventDefault();
})

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
      userY -= 1
      break;
    case "d":
      userX += 1
      break;
    case "s":
      userY += 1
      break;
    case "a":
      userX -= 1
      break;

    case "q":
      
      break;
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
    if(newFocusX != focusDisplayX || newFocusY != focusDisplayY){
      focusDisplayX = newFocusX
      focusDisplayY = newFocusY
      focusMapX = focusDisplayX - (canvasW/2 - userX)
      focusMapY = focusDisplayY - (canvasH/2 - userY)
      updateDisplay()
    }
  }
})

document.addEventListener("contextmenu", (e)=>{
  const mousePosition = returnFocusPosition(e)
  contextX = mousePosition.x
  contextY = mousePosition.y
  showContext = !showContext

  updateDisplay()

  event.preventDefault();
})