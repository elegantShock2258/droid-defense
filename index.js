let gameManager = {}

let player = null
let playerRadius = 90
let guideLine = null

let bullets = []
let bulletsDirection = null

let bulletCounter = 0
let bulletsMax = 30

let scale = 4

let mouseX = 0
let mouseY = 1


let x0 = -1
let y0 = -1
let x00 = -1
let y00 = -1

let aliens = []

let paused = false
let moved = false

let displacement = [0, 0]

let score = 0

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
        this.rot = 0
        this.shoot = [this.x + this.width / 2, this.y - 10]
        this.r = Math.sqrt((this.rectCordX - this.x) * (this.rectCordX - this.x) + (this.rectCordY - this.y) * (this.rectCordY - this.y))
    }

    shoot() {
        console.log("shoot!")
    }
    draw(ctx) {
        // ctx.fillStyle = this.color
        // ctx.beginPath()
        // ctx.arc(this.x, this.y, this.width / 2, 20, 2 * Math.PI)
        // ctx.fill()

        let img = document.getElementById("spaceship")
        img.height = this.height
        ctx.drawImage(img, this.x - this.width / 2, this.y, this.width, 100 * this.height / this.width)

    }

    rotate(x = -1, y = -1, ctx) {
        //clear img
        ctx.fillStyle = "red"
        ctx.beginPath()
        ctx.arc(this.x, this.y + this.height / 2, this.width / 1.3, 0, 2 * Math.PI)
        ctx.fill()

        // save
        ctx.save()
        ctx.translate(this.x, this.y + this.height / 2)

        if (x != -1) {
            let m = (y - player.y) / (x - player.x)
            if (m > 0)
                this.rot = (Math.atan(m)) + 3 * Math.PI / 2
            else
                this.rot = (Math.atan(m)) + 5 * Math.PI / 2
            console.log(this.rot, x, y, m)
        }
        ctx.rotate(this.rot)
        ctx.translate(-(this.x), -(this.y + this.height / 2))
        let img = document.getElementById("spaceship")
        img.height = this.height
        ctx.drawImage(img, this.x - this.width / 2, this.y, this.width, 100 * this.height / this.width)

        ctx.restore()

    }
    move(dx, dy, ctx) {
        let inBoundX = this.x + this.width / 2 + dx < board.width && this.x - this.width / 2 + dx > 0
        let inBoundY = this.y + this.height / 2 + dy < board.height && this.y - this.height / 2 + dy > 0
        this.x = (inBoundX) ? this.x + dx : this.x
        this.y = (inBoundY) ? this.y + dy : this.y
        this.rotate(-1, -1, ctx)
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
    let mouse = [mouseX - player.x, mouseY - player.y]
    let mouseMod = Math.sqrt(mouse[0] * mouse[0] + mouse[1] * mouse[1])
    mouse[0] /= mouseMod
    mouse[1] /= mouseMod

    bulletsDirection = mouse


    ctx.fillStyle = "#0000ff80"
    ctx.strokeStyle = gameManager.bg
    ctx.beginPath()
    ctx.arc(mouseX, mouseY, 15, 0, 2 * Math.PI)
    ctx.fill()

    if (moved) {
        player.rotate(mouseX, mouseY, ctx)

        x0 = mouseX
        y0 = mouseY
        moved = false
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
        bullets[bulletCounter] = (new Bullet(player.x, player.y, 5, 10, "", "", bulletsDirection))
    }
    document.addEventListener('keydown', async function (e) {
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "h") {
            if (!paused) { displacement = [-scale, 0] }
        }
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "j") {
            if (!paused) {
                displacement = [0, scale]
            }
        }
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "k") {
            if (!paused) {
                displacement = [0, -scale]
            }
        }
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "l") {
            if (!paused) { displacement = [scale, 0] }
        }
        console.log(displacement)
    })

    //chekcing
    bullets = Array(20).fill("")
    aliens = Array(20).fill("")
    for (let j = 1; j <= 2; j++) {
        for (let i = 0; i < 10; i++) {
            let rndX = (Math.floor(4 * Math.random() % 2 == 0) ? 1 : -1) * (100 * Math.random() + (Math.floor(3 * Math.random()) % 2 == 0) ? board.width : 0)
            let rndY = (Math.floor(4 * Math.random() % 2 == 0) ? 1 : -1) * (100 * Math.random() + (Math.floor(3 * Math.random()) % 2 == 0) ? board.height : 0)
            // aliens[i + 10 * (j - 1)] = new Alien(90 * Math.abs(i - 5) + board.width / 2.5, 40 * j, 30, 20, "#ffffff", "")
            aliens[i + 10 * (j - 1)] = new Alien(board.width * Math.random(), -board.height * Math.random(), 30, 20, "#ffffff", "")
        }
    }
    console.log(aliens)


}
function drawNavBar(score, healthPer = 100, ctx) {
    ctx.font = "40px mcfont"
    ctx.fillStyle = "white"
    ctx.fillText("Health: ", 10, 40)
}
function gameLoop() {
    if (!paused) {
        let healthPer = 100
        ctx.fillStyle = gameManager.bg
        ctx.fillRect(0, 0, board.width, board.height);
        player.draw(ctx)

        drawNavBar(score, healthPer, ctx)
        let moveX = 2.8
        //collision
        for (let i = 0; i < aliens.length; i++) {
            if (aliens[i].color != gameManager.bg) {
                aliens[i].move([player.x, player.y], ctx)
                if (aliens[i].collides(guideLine) || aliens[i].collides(player)) {
                    loseGame()
                }
            }
        }
        //movement

        for (let i = 0; i < bullets.length; i++) {
            let bullet = bullets[i]
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
                    score++
                    break
                }
            }
        }
        player.move(displacement[0], displacement[1], ctx)
        drawCrossHair(ctx)
    }

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