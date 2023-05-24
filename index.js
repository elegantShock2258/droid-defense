let gameManager = {}

let player = null
let playerRadius = 90
let guideLine = null

let bullets = []
let bulletsDirection = null

let bulletCounter = 0
let bulletsMax = 30

let scale = 8

let mouseX = 0
let mouseY = 1


let x0 = -1
let y0 = -1
let x00 = -1
let y00 = -1

let aliens = []

let paused = false
let moved = false

class GameObject {
    constructor(x, y, width, height, color, svg = "") {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
        this.svg = svg
    }

    draw(ctx) {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
        // else {
        //     let path = new Path2D(svg)
        //     ctx.stroke(path)
        // }
    }

    move(dx, dy, ctx) {
        ctx.fillStyle = gameManager.bg
        ctx.fillRect(this.x, this.y, this.width, this.height)
        this.x += dx
        this.y += dy
        this.draw(ctx)
    }

    collides(obj) {
        return (this.x < obj.x + obj.width
            && this.x + this.width > obj.x
            && this.y < obj.y + obj.height
            && this.y + this.height > obj.y);
    }
}

class Bullet extends GameObject {

    constructor(x, y, width, height, color, svg = "", direction = [0, -20]) {
        super(x, y, width, height, color, svg)
        this.direction = direction
    }


    draw(ctx) {
        ctx.fillStyle = "#90f542"

        ctx.fillRect(this.x, this.y, this.width, this.height)
    }

    move(ctx) {
        super.move(20 * this.direction[0], 20 * this.direction[1], ctx)
    }
}

class Alien extends GameObject {
    constructor(x, y, width, height, color, svg = "", direction = [0, 1]) {
        super(x, y, width, height, color, svg)
        this.direction = direction
    }

    draw(ctx) {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }
    move(playerDir, ctx) {
        let mod = Math.sqrt(((this.x - playerDir[0]) * (this.x - playerDir[0])) + ((this.y - playerDir[1]) * (this.y - playerDir[1])))
        let normalisedCoords = [-(this.x - playerDir[0]) / mod, -(this.y - playerDir[1]) / mod]
        super.move(normalisedCoords[0], normalisedCoords[1], ctx)
    }
}

class Player extends GameObject {
    constructor(x, y, width, height, color, svg = "", guideLine) {
        super(x, y, width, height, color, svg)
        this.color = "#f54242"
        this.guideLine = guideLine

        this.rectW = 25
        this.rectH = 50
        this.rectCordX = this.x - Math.floor(this.rectW / 2)
        this.rectCordY = this.y - this.width / 2 - (this.rectH - 2)

        this.r = Math.sqrt((this.rectCordX - this.x) * (this.rectCordX - this.x) + (this.rectCordY - this.y) * (this.rectCordY - this.y))
    }

    shoot() {
        console.log("shoot!")
    }
    draw(ctx) {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.width / 2, 0, 2 * Math.PI)
        ctx.fill()
        ctx.fillStyle = "grey"
        ctx.fillRect(this.rectCordX, this.rectCordY, this.rectW, this.rectH)
    }
    move(dx, dy, ctx) {
        ctx.beginPath()
        ctx.fillStyle = gameManager.bg
        ctx.arc(this.x, this.y, this.width / 2, 0, 2 * Math.PI)
        ctx.fill()
        ctx.fillRect(this.rectCordX, this.rectCordY, this.rectW, this.rectH)
        let maximumX = (this.x + dx) < (guideLine.width + guideLine.x)
        let minimumX = (this.x + dx > 90)
        this.x = maximumX && minimumX ? this.x + dx : this.x
        this.y += dy
        this.rectCordX = maximumX && minimumX ? this.rectCordX + dx : this.rectCordX
        this.rectCordY += dy
        if (!maximumX || !minimumX) guideLine.color = "aliceblue"
        if (!maximumX || !minimumX) guideLine.color = "#303030"
        this.draw(ctx)
    }
    moveHead(mouse, ctx) {
    }
}

let board = document.getElementById('board')
let ctx = board.getContext("2d")


const ratio = window.devicePixelRatio;

board.width = window.innerWidth * ratio;
board.height = window.innerHeight * ratio;
board.style.width = window.innerWidth + "px";
board.style.height = window.innerHeight + "px";

document.body.style.cursor = "none"
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY

    moved = true
})

function drawCrossHair(ctx) {
    requestAnimationFrame(gameLoop)
    // if (x0 != -1) {
    //     // clear last mouse pos nd line
    //     ctx.fillStyle = "#101010"
    //     ctx.strokeStyle = gameManager.bg
    //     ctx.beginPath()
    //     ctx.arc(x0, y0, 15, 0, 2 * Math.PI)
    //     ctx.stroke()
    //     ctx.fill()

    // }

    let mouse = [mouseX - player.x, mouseY - player.y]
    let mouseMod = Math.sqrt(mouse[0] * mouse[0] + mouse[1] * mouse[1])
    mouse[0] /= mouseMod
    mouse[1] /= mouseMod

    bulletsDirection = mouse

    player.moveHead(mouse, ctx)

    console.log(mouseX,mouseY,x0,y0)
    ctx.fillStyle = "#0000ff80"
    ctx.strokeStyle = gameManager.bg
    ctx.beginPath()
    ctx.arc(mouseX, mouseY, 15, 0, 2 * Math.PI)
    ctx.fill()

    if (moved) {
        x0 = mouseX
        y0 = mouseY
    }
}
function gameSetup() {
    gameManager.bg = "#101010"
    console.log(ctx)
    guideLine = new GameObject(90, board.height - playerRadius, board.width - 180, 3, "#303030")
    player = new Player(board.width / 2, board.height - playerRadius, playerRadius, playerRadius, guideLine)
    console.log(player)
    document.onclick = (e) => {
        bulletCounter = (bulletCounter + 1) % bulletsMax
        bullets[bulletCounter] = (new Bullet(player.rectCordX, player.rectCordY - 10, 5, 10, "", "", bulletsDirection))
    }
    document.addEventListener('keydown', async function (e) {
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "h") {
            !paused ? player.move(-scale, 0, ctx) : null
        }
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "j") {
            if (!paused) {
                guideLine.move(0, scale / 2, ctx)
                player.move(0, scale / 2, ctx)
            }
        }
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "k") {
            if (!paused) {
                guideLine.move(0, -scale / 2, ctx)
                player.move(0, -scale / 2, ctx)
            }
        }
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "l") {
            !paused ? player.move(scale, 0, ctx) : null
        } if (e.key === " ") {
            bulletCounter = (bulletCounter + 1) % bulletsMax
            bullets[bulletCounter] = (new Bullet(player.rectCordX, player.rectCordY - 10, 5, 10, "", "", bulletsDirection))
        }

    })

    //chekcing
    bullets = Array(20).fill("")
    aliens = Array(20).fill("")

    for (let i = 0; i < 10; i++) {
        aliens[i] = new Alien(90 * Math.abs(i - 5) + board.width / 2.5, 40, 30, 20, "#ffffff", "")
    }
    for (let i = 0; i < 10; i++) {
        aliens[10 + i] = new Alien(90 * Math.abs(i - 5) + board.width / 2.5, 80, 30, 20, "#ffffff", "")
    }


}

function gameLoop() {
    if (!paused) {
        ctx.fillStyle = gameManager.bg
        ctx.fillRect(0, 0, board.width, board.height);
        player.draw(ctx)

        for (let i = 0; i < aliens.length; i++) {
            if (aliens[i].color != gameManager.bg) {
                aliens[i].move([player.x, player.y], ctx)
                if (aliens[i].collides(guideLine) || aliens[i].collides(player)) {
                    loseGame()
                }
            }
        }

        for (let i = 0; i < bullets.length; i++) {
            let bullet = bullets[i]
            let clear = false
            if (bullet != "" && bullet != undefined) {
                bullet.move(ctx)
                if (bullet.y < 0) {
                    bullets[i] = ""
                    clear = true
                }
            }

            for (let j = 0; j < aliens.length; j++) {
                if (aliens[j].collides(bullet)) {
                    aliens.splice(j, 1)
                    bullets[i] = ""
                }
            }
        }

    }

    drawCrossHair(ctx)
    // requestAnimationFrame(gameLoop)
}

function gameInit() {
    gameSetup()
    // setInterval(gameLoop, 90)
    requestAnimationFrame(gameLoop)
}

function loseGame() {
    console.log("Game Lost!")
    paused = true
}



gameInit()