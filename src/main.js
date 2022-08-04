const socket = io.connect(location.origin)

const canvasW = 30
const canvasH = 20
let avatarX = 0
let avatarY = 0
const tileSize = 16
const arasa = 3
const akarusa = 128

window.addEventListener("load", ()=>{
  socket.on("drawChunk", (newMap)=>{
    map = newMap
    updateDisplay(map)
  })
})

//画面描画
const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")
function updateDisplay(newMap){
  //マップの描画
  //tileX, tileYは画面上のタイルの位置
  for (let tileY = 0; tileY < canvasH; tileY++) {
    for (let tileX = 0; tileX < canvasW; tileX++) {
      let tileValue = "space"
      
      const displayedX = tileX + avatarX - canvasW/2
      const displayedY = tileY + avatarY - canvasH/2

      if(newMap[displayedY] != undefined && newMap[displayedY][displayedX] != undefined){
        tileValue = newMap[displayedY][displayedX]
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
}

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
  updateDisplay(map)
})