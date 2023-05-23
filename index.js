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



class Player extends GameObject {
    constructor(x, y, width, height, color, svg = "", guideLine) {
        super(x, y, width, height, color, svg)
        this.color = "#f54242"
        this.guideLine = guideLine
    }

    shoot() {
        console.log("shoot!")
    }

    
    
    move(dx, dy, ctx) {
        ctx.fillStyle = gameManager.bg
        ctx.fillRect(this.x, this.y, this.width, this.height)
        let maximumX = (this.x + dx) < (guideLine.width + guideLine.x)
        let minimumX = (this.x + dx > 90)
        this.x = maximumX && minimumX ? this.x + dx : this.x
        if (!maximumX || !minimumX) guideLine.color = "aliceblue"
        console.log(this.x, guideLine.width - 90)
        this.y += dy
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
let guideLine = null
let scale = 18

function gameSetup() {
    gameManager.bg = "#101010"
    console.log(ctx)
    guideLine = new GameObject(90, board.height - 60 + 15, board.width - 180, 3, "#303030")
    player = new Player(board.width / 2, board.height - 60, 30, 30, guideLine)
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
        }

    })
}

function gameLoop() {
    ctx.fillStyle = gameManager.bg
    ctx.fillRect(0, 0, board.width, board.height);
    guideLine.draw(ctx)
    player.draw(ctx)
}

function gameInit() {
    gameSetup()
    requestAnimationFrame(gameLoop)
}

gameInit()