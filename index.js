let gameManager = {}

let player = null
let playerRadius = 90
let guideLine = null

let bullets = []
let bulletsDirection = null

let bulletCounter = 0
let bulletsMax = 1000

let scale = 18

let x0 = -1
let y0 = -1
let x00 = -1
let y00 = -1



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
        super.move(20*this.direction[0],  20*this.direction[1], ctx)
    }


}

class Alien extends GameObject {
    draw(ctx) {
        this.color = "#ff0000"
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }
}

class Player extends GameObject {
    constructor(x, y, width, height, color, svg = "", guideLine) {
        super(x, y, width, height, color, svg)
        this.color = "#f54242"
        this.guideLine = guideLine
    }

    shoot() {
        console.log("shoot!")
    }
    draw(ctx) {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.width / 2, 0, 2 * Math.PI)
        ctx.fill()
    }
    move(dx, dy, ctx) {
        ctx.beginPath()
        ctx.fillStyle = gameManager.bg
        // ctx.fillRect(this.x, this.y, this.width, this.height)
        ctx.arc(this.x, this.y, this.width / 2, 0, 2 * Math.PI)
        ctx.fill()
        let maximumX = (this.x + dx) < (guideLine.width + guideLine.x)
        let minimumX = (this.x + dx > 90)
        this.x = maximumX && minimumX ? this.x + dx : this.x
        this.y += dy
        if (!maximumX || !minimumX) guideLine.color = "aliceblue"
        console.log(this.x, guideLine.width - 90)
        guideLine.draw(ctx)
        if (!maximumX || !minimumX) guideLine.color = "#303030"
        this.draw(ctx)
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
    if (x0 != -1) {
        // clear last mouse pos nd line
        ctx.fillStyle = "#101010"
        ctx.beginPath()
        ctx.arc(x0, y0, 20 / 2, 0, 2 * Math.PI)
        ctx.fill()

    }


    let mouse = [e.clientX - player.x, e.clientY - player.y]
    let mouseMod = Math.sqrt(mouse[0] * mouse[0] + mouse[1] * mouse[1])
    mouse[0] /= mouseMod
    mouse[1] /= mouseMod

    bulletsDirection = mouse

    ctx.fillStyle = "#0000ff80"
    ctx.beginPath()
    ctx.arc(e.clientX, e.clientY, 20 / 2, 0, 2 * Math.PI)
    ctx.fill()

    x0 = e.clientX
    y0 = e.clientY

})

function gameSetup() {
    gameManager.bg = "#101010"
    console.log(ctx)
    guideLine = new GameObject(90, board.height - playerRadius, board.width - 180, 3, "#303030")
    player = new Player(board.width / 2, board.height - playerRadius, playerRadius, playerRadius, guideLine)
    console.log(player)

    document.addEventListener('keydown', async function (e) {
        if (e.key === "ArrowLeft" || e.key === "d" || e.key === "h") {
            player.move(-scale, 0, ctx)
        }
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "j") {
            guideLine.move(0, scale / 2, ctx)
            player.move(0, scale / 2, ctx)
        }
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "k") {
            guideLine.move(0, -scale / 2, ctx)
            player.move(0, -scale / 2, ctx)
        }
        if (e.key === "ArrowRight" || e.key === "a" || e.key === "l") {
            player.move(scale, 0, ctx)
        } if (e.key === " ") {
            bulletCounter = (bulletCounter + 1) % bulletsMax
            bullets[bulletCounter] = (new Bullet(player.x , player.y - 10, 5, 10, "", "", bulletsDirection))
        }

    })

    //chekcing
    bullets = Array(20).fill("")
}

function gameLoop() {
    ctx.fillStyle = gameManager.bg
    ctx.fillRect(0, 0, board.width, board.height);
    guideLine.draw(ctx)
    player.draw(ctx)

    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i]
        if (bullet != "") {
            bullet.move(ctx)
            if (bullet.y < 0) bullets[i] = ""
        }
    }
}

function gameInit() {
    gameSetup()
    setInterval(gameLoop, 90)
}

gameInit()