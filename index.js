let gameManager = {}


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
    draw(ctx) {
        ctx.fillStyle = "#90f542"
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


let player = null
let playerRadius = 90
let guideLine = null
let bullets = null
let scale = 18
function gameSetup() {
    gameManager.bg = "#101010"
    console.log(ctx)
    guideLine = new GameObject(90, board.height - playerRadius  , board.width - 180, 3, "#303030")
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
            bullets.push(new Bullet(player.x + player.width / 2, player.y - 10, 5, 10))
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

    bullets.forEach(function (bullet) {
        if (bullet != "") {
            bullet.move(0, -20, ctx)
        }
    })
}

function gameInit() {
    gameSetup()
    setInterval(gameLoop, 100)
}

gameInit()