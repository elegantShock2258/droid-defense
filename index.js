let gameManager = {}

let player = null
let homeBase = null
let playerRadius = 90
let guideLine = null

let bullets = []
let bulletsDirection = null
let homeBaseBullets = []
let homeBaseBulletsMax = 10
let homeBaseBulletsCounter = 0
let homeBaseShot = []

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
let lost = false

let displacement = [0, 0]

let score = 0
let Health = 100

let waveNumber = 1

let powerUpPaused = false
let poweupsAssets = ["heart.png", "qmark.png"]
let poweupsMethods = [() => {
    player.playerHealth = (player.playerHealth > 50) ? 100 : (player.playerHealth + 50) % 100
    console.log(player.playerHealth)
}, () => {

    for (let i = 0; i < aliens.length * Math.random(); i++) {
        aliens.pop()
    }
}]
const delay = ms => new Promise(res => setTimeout(res, ms));


// TODO:
// add a trail glow animation when the player moves
// add a roataion animation when it moves

// make home base able to shoot
// have 3 waves

// make big boss in wave 3 
// add poweups 
// leader board
// sound
// end game modal



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

    move(ctx, scalar = 20, direction = this.direction) {
        super.move(scalar * direction[0], scalar * direction[1], ctx)
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
class ShooterAlien extends Alien {
    constructor(x, y, width, height, color, svg) {
        super(x, y, width, height, color, svg)
        this.color = "#dd0000"
        this.bullets = Array(20).fill("")
        this.bulletCounter = 0
        this.shot = false
    }

    shoot(ctx) {
        this.bulletCounter = (this.bulletCounter + 1) % 20
        let mod = Math.sqrt(((player.x - this.x) * (player.x - this.x)) + ((player.y - this.y) * (player.y - this.y)))
        if (!this.shot) {
            this.bullets[this.bulletCounter] = new Bullet(this.x - 25, this.y + 13, 10, 20, "#efefef", "", [(player.x - this.x) / mod, (player.y - this.y) / mod])
            console.log("hehe i shot!")
            if (this instanceof ShootingHomingAlien) console.log("hehe i shot homing missile!")
            console.log(this.bullets)
        }
        this.shot = true
    }
}

class ShootingHomingAlien extends ShooterAlien {
    constructor(x, y, width, height, color, svg) {
        super(x, y, width, height, color, svg)
        this.color = "#660000"
    }

    // shoot(ctx) {
    //     this.bulletCounter = (this.bulletCounter + 1) % 20
    //     let mod = Math.sqrt(((player.x - this.x) * (player.x - this.x)) + ((player.y - this.y) * (player.y - this.y)))
    //     if (!this.shot) {
    //         this.bullets[this.bulletCounter] = new Bullet(this.x - 25, this.y + 13, 10, 20, "yellow", "", [(player.x - this.x) / mod, (player.y - this.y) / mod])
    //         console.log("homing shot!")
    //         console.log(this.bullets)
    //     }
    //     this.shot = true
    // }
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

        this.playerHealth = 100
    }

    shoot() {
        console.log("shoot!")
    }

    damage() {
        this.playerHealth -= 10
    }

    draw(ctx) {
        let img = document.getElementById("spaceship")
        img.height = this.height
        this.width = img.height
        ctx.drawImage(img, this.x - this.width / 2, this.y, this.width, 100 * this.height / this.width)

        ctx.fillStyle = "red"
        ctx.strokeStyle = "red"
        ctx.fillRect(this.x - this.width, this.y + this.height + 20, this.playerHealth, 10)
        ctx.strokeRect(this.x - this.width, this.y + this.height + 20, 100, 10)
        homeBase.draw(ctx)
    }

    rotate(x = -1, y = -1, ctx) {
        //clear img
        // ctx.fillStyle = gameManager.bg
        // ctx.beginPath()
        // ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height + 10)
        // ctx.fill()

        // save
        ctx.save()
        ctx.translate(this.x, this.y + this.height / 2)

        if (x != -1) {
            let m = (y - player.y) / (x - player.x)
            if (m > 0)
                this.rot = (Math.atan(m)) + 3 * Math.PI / 2
            else
                this.rot = (Math.atan(m)) + 5 * Math.PI / 2
            // console.log(this.rot, x, y, m)
        }
        ctx.rotate(this.rot)
        ctx.translate(-(this.x), -(this.y + this.height / 2))
        let img = document.getElementById("spaceship")
        img.height = this.height
        ctx.drawImage(img, this.x - this.width / 2, this.y, this.width, 100 * this.height / this.width)

        ctx.restore()
        // add trail glow anim

    }
    move(dx, dy, ctx) {
        ctx.fillStyle = "red"
        ctx.fillRect(this.x - this.width, this.y + this.height + 20, this.playerHealth, 10)
        ctx.strokeRect(this.x - this.width, this.y + this.height + 20, this.playerHealth, 10)
        let inBoundX = this.x + this.width / 2 + dx < board.width && this.x - this.width / 2 + dx > 0
        let inBoundY = this.y + this.height / 2 + dy < board.height && this.y - this.height / 2 + dy > board.height / 2
        this.x = (inBoundX) ? this.x + dx : this.x
        this.y = (inBoundY) ? this.y + dy : this.y
        this.rotate(-1, -1, ctx)

        if (this.playerHealth === 0) {
            loseGame(ctx)
            return
        }
    }
}
class PowerUp extends Alien {
    constructor(x, y, width, height, color, svg = "", guideLine) {
        super(x, y, width, height, color, svg)
        this.poweupNumber = Math.floor((poweupsMethods.length) * Math.random())
        this.imageElement = 1
    }

    apply() {
        poweupsMethods[this.poweupNumber]()
    }
    draw(ctx) {
        this.imageElement = document.getElementById(poweupsAssets[this.poweupNumber])
        this.imageElement.src = poweupsAssets[this.poweupNumber]
        this.imageElement.height = this.height
        this.width = this.imageElement.height
        ctx.drawImage(this.imageElement, this.x - this.width / 2, this.y, this.width, 100 * this.height / this.width)
    }
    move(playerDir, ctx) {
        let mod = Math.sqrt(((this.x - playerDir[0]) * (this.x - playerDir[0])) + ((this.y - playerDir[1]) * (this.y - playerDir[1])))
        let normalisedCoords = [-(this.x - playerDir[0]) / mod, -(this.y - playerDir[1]) / mod]

        let dx = normalisedCoords[0]
        let dy = normalisedCoords[1]

        this.height = 80
        let inBoundX = this.x + this.width / 2 + dx < board.width && this.x - this.width / 2 + dx > 0
        let inBoundY = this.y + this.height / 2 + dy < board.height && this.y - this.height / 2 + dy > board.height / 2
        // this.x = (inBoundX) ? this.x + dx : this.x
        // this.y = (inBoundY) ? this.y + dy : this.y

        this.y += playerDir[1]
        this.draw(ctx)
    }
}

class Boss extends ShooterAlien {
    constructor(x, y, width, height, color, svg) {
        super(x, y, width, height, color, svg)
        this.color = color
        this.BossHealth = 1000
        this.height = board.width / 8
        this.width = board.width / 8
    }
    move(a, ctx) {
        ctx.fillStyle = gameManager.bg
        ctx.beginPath()
        ctx.arc(this.x, this.y, board.width / 8, 0, 2 * Math.PI)
        ctx.fill()

        this.y += 0.2
        this.draw(ctx)
    }

    damage(ctx) {
        this.BossHealth -= 5
        if (this.BossHealth <= 0) {
            loseGame(ctx)
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, board.width / 8, 0, 2 * Math.PI)
        ctx.fill()

        ctx.fillStyle = "red"
        ctx.fillRect(this.x - board.width / 8, this.y - board.width / 8 - 25, this.BossHealth / 2, 10)
        ctx.strokeStyle = "red"
        ctx.strokeRect(this.x - board.width / 8, this.y - board.width / 8 - 25, this.BossHealth / 2, 10)
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
    guideLine = new GameObject(90, board.height - playerRadius, board.width - 180, 3, "#303030")
    player = new Player(board.width / 2, board.height - playerRadius, playerRadius, playerRadius, guideLine)
    homeBase = new GameObject(board.width - 400, board.height - 250, 150, 150, "green", "")
    document.onclick = (e) => {
        if (!lost) {
            bulletCounter = (bulletCounter + 1) % bulletsMax
            bullets[bulletCounter] = (new Bullet(player.x, player.y, 5, 10, "", "", bulletsDirection))
        } else {
            let eventX = e.clientX
            let eventY = e.clientY
            console.log(eventX, eventY, (board.width / 3.7 + 900 / 3.55 - 10))
            if (eventX > (board.width / 3.7 + 900 / 3.55 - 10) && (eventY > (board.height / 7 + 450) && eventY < (board.height / 7 + 480))) {
                console.log("refresh")
                document.location.reload()
            } else {
                console.log("closed")
                window.close()
            }
        }
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
    })

    //chekcing
    bullets = Array(20).fill("")
    homeBaseBullets = Array(20).fill("")
    aliens = Array(20).fill("")
    for (let j = 1; j <= 2; j++) {
        for (let i = 0; i < 10; i++) {
            // powerup
            // shooter alien
            // shooter alien (homing)
            // alien
            let rand = Math.floor(10000 * Math.random())
            if (rand % 4 == 0)
                aliens[i + 10 * (j - 1)] = new PowerUp(((Math.floor(poweupsMethods.length * Math.random())) % 2 == 0 ? 1 : -1) * board.width * Math.random(), -board.height * Math.random(), 30, 20, "#ffffff", "")
            else if (rand % 4 == 1)
                aliens[i + 10 * (j - 1)] = new ShooterAlien(((Math.floor(4 * Math.random())) % 2 == 0 ? 1 : -1) * board.width * Math.random(), -board.height * Math.random(), 30, 20, "#ffffff", "")
            else if (rand % 4 == 2)
                aliens[i + 10 * (j - 1)] = new Alien(((Math.floor(4 * Math.random())) % 2 == 0 ? 1 : -1) * board.width * Math.random(), -board.height * Math.random(), 30, 20, "#ffffff", "")
            else if (rand % 4 == 3)
                aliens[i + 10 * (j - 1)] = new ShootingHomingAlien(((Math.floor(4 * Math.random())) % 2 == 0 ? 1 : -1) * board.width * Math.random(), -board.height * Math.random(), 30, 20, "#ffffff", "")
        }
    }
    player.draw(ctx)

}
function drawNavBar(score, ctx) {
    ctx.font = "40px mcfont"
    ctx.fillStyle = "white"
    ctx.fillText("Health: ", 10, 40)

    ctx.fillStyle = "red"
    ctx.strokeStyle = "red"
    ctx.fillRect(190, 15, Health * 4, 25)
    ctx.strokeRect(190, 15, 100 * 4, 25)

    ctx.font = "40px mcfont"
    ctx.fillStyle = "white"
    ctx.fillText(`Score: ${score}`, board.width - 200, 40)

    // draw "HOME" text at home
    ctx.font = "40px mcfont"
    ctx.fillStyle = "white"
    ctx.fillText(`HOME`, homeBase.x + homeBase.width / 6, homeBase.y + homeBase.height / 2)

    ctx.font = "40px mcfont"
    ctx.fillStyle = "white"
    ctx.fillText(`Wave: ${waveNumber}`, board.width / 2, 40)
}

async function nextWave(ctx) {
    waveNumber++;

    ctx.fillStyle = gameManager.bg
    ctx.fillRect(0, 0, board.width, board.height)

    if (waveNumber === 4) {
        ctx.font = "90px mcfont"
        ctx.fillStyle = "white"
        ctx.fillText(`BOSS LEVEL`,board.width / 2 - 180, board.height / 2 + 45)

        await delay()

        aliens[0] = new Boss(800, 20, 2, 3, "#454334", "")

    } else {
        ctx.font = "90px mcfont"
        ctx.fillStyle = "white"
        ctx.fillText(`Wave: ${waveNumber}`, board.width / 2 - 180, board.height / 2 + 45)

        await delay()

        for (let j = 1; j <= 2; j++) {
            for (let i = 0; i < 10; i++) {
                let rand = Math.floor(10000 * Math.random())
                if (rand % 4 == 0)
                    // powerup
                    aliens[i + 10 * (j - 1)] = new PowerUp(((Math.floor(4 * Math.random())) % 2 == 0 ? 1 : -1) * board.width * Math.random(), -board.height * Math.random(), 30, 20, "#ffffff", "")
                else if (rand % 4 == 1)
                    // shooter alien
                    aliens[i + 10 * (j - 1)] = new ShooterAlien(((Math.floor(4 * Math.random())) % 2 == 0 ? 1 : -1) * board.width * Math.random(), -board.height * Math.random(), 30, 20, "#ffffff", "")
                else if (rand % 4 == 2)
                    // shooter alien (homing)
                    aliens[i + 10 * (j - 1)] = new Alien(((Math.floor(4 * Math.random())) % 2 == 0 ? 1 : -1) * board.width * Math.random(), -board.height * Math.random(), 30, 20, "#ffffff", "")
                else if (rand % 4 == 3)
                    // alien
                    aliens[i + 10 * (j - 1)] = new ShootingHomingAlien(((Math.floor(4 * Math.random())) % 2 == 0 ? 1 : -1) * board.width * Math.random(), -board.height * Math.random(), 30, 20, "#ffffff", "")
            }
        }
    }
}

async function gameLoop() {
    if (!paused && !powerUpPaused) {
        ctx.fillStyle = gameManager.bg
        ctx.fillRect(0, 0, board.width, board.height);
        // draw home base
        homeBase.draw(ctx)

        if (Health == 0) {
            (ctx)
            return
        }
        let alienBullets = []
        let dirn = (powerUpPaused) ? [0, 0] : [player.x, player.y]
        //collision
        for (let i = 0; i < aliens.length; i++) {
            if (aliens[i] != "") {

                if (!powerUpPaused) {
                    if (aliens[i] instanceof PowerUp && !powerUpPaused) (aliens[i].y >= board.height) ? aliens.splice(i, 1) : aliens[i].move([0, 1], ctx)
                    else if (aliens[i] instanceof ShooterAlien) aliens[i].move([player.x, player.y], ctx)
                    else if (aliens[i] instanceof Alien) aliens[i].move([homeBase.x, homeBase.y], ctx)
                    else if (aliens[i] instanceof ShootingHomingAlien) aliens[i].move([player.x, player.y], ctx)
                    else aliens[i].move(dirn, ctx)
                } else {
                    aliens[i].move([0.01, 0.01], ctx)
                }
                if (aliens[i] instanceof ShooterAlien || aliens[i] instanceof ShootingHomingAlien) {
                    if (((player.x - aliens[i].x) * (player.x - aliens[i].x) + (player.y - aliens[i].y) * (player.y - aliens[i].y)) <= 500 * 500) {
                        aliens[i].shoot(ctx)
                        alienBullets.push(aliens[i])
                    }
                }

                if (aliens[i] != undefined && aliens[i].color != gameManager.bg) {
                    if (aliens[i].collides(player) && aliens[i] instanceof Alien && !(aliens[i] instanceof PowerUp)) {
                        loseGame(ctx)
                        return
                    }
                    else if (aliens[i].collides(homeBase)) {
                        if (Health != 0) Health -= 2
                        else if (Health == 0) loseGame(ctx)
                        aliens.splice(i, 1)
                    }
                }
                if (aliens[i] != undefined) {
                    let dist = (homeBase.x - aliens[i].x) * (homeBase.x - aliens[i].x) + (homeBase.y - aliens[i].y) * (homeBase.y - aliens[i].y)
                    if (dist <= 200 * 200) {
                        console.log("omg alien detecteddd")
                        if (!homeBaseShot.includes(i)) {
                            homeBaseBulletsCounter = (homeBaseBulletsCounter + 1) % homeBaseBulletsMax
                            homeBaseBullets[homeBaseBulletsCounter] = (new Bullet(homeBase.x, homeBase.y, 10, 20, "blue", "", [(aliens[i].x - homeBase.x) / dist, (aliens[i].y - homeBase.y) / dist]))
                            homeBaseShot.push(i)
                            console.log("i added a pew pew: ", homeBaseBullets)
                        }
                    }
                }
            }
        }
        //movement
        for (let i = 0; i < bullets.length; i++) {
            // move player bullets
            let bullet = bullets[i]
            if (bullet != "" && bullet != undefined) {
                bullet.move(ctx)
                if (bullet.y < 0) {
                    bullets[i] = ""
                    clear = true
                }
            }
            for (let j = 0; j < aliens.length; j++) {
                if (aliens[j] != "" && bullet != undefined && aliens[j].collides(bullet)) {
                    console.log(aliens[j])
                    if (aliens[j] instanceof Boss) {
                        console.log("huh?")
                        bullets[i] = ""
                        aliens[j].damage()
                    } else {
                        if (aliens[j] instanceof PowerUp) {
                            (aliens[j].apply())
                            console.log("Powerup applied ", aliens[i].apply)
                        }
                        aliens.splice(j, 1)
                        bullets[i] = ""
                        score++
                        break
                    }
                }
            }
        }

        // handling shooting bots
        for (let i = 0; i < alienBullets.length; i++) {
            for (let j = 0; j < alienBullets[i].bullets.length; j++) {
                if (alienBullets[i].bullets[j] != '') {
                    if (alienBullets[i] instanceof ShootingHomingAlien) {
                        let mod = Math.sqrt((player.x - alienBullets[i].bullets[j].x) * (player.x - alienBullets[i].bullets[j].x) + (player.y - alienBullets[i].bullets[j].y) * (player.y - alienBullets[i].bullets[j].y))
                        alienBullets[i].bullets[j].move(ctx, 5, [(player.x - alienBullets[i].bullets[j].x) / mod, (player.y - alienBullets[i].bullets[j].y) / mod])
                    }
                    else alienBullets[i].bullets[j].move(ctx, 5)
                    if (player.collides(alienBullets[i].bullets[j])) {
                        alienBullets[i].bullets.splice(j, 1)
                        player.damage()
                    }
                }
            }
        }

        for (let i = 0; i < homeBaseBullets.length; i++) {
            if (homeBaseBullets[i] != "") {

                homeBaseBullets[i].move(ctx, 100)
                if (homeBaseBullets[i].x >= board.width || homeBaseBullets.x < 0 || homeBaseBullets.y >= board.height || homeBaseBullets[i].y < 0) {
                    homeBaseBullets.splice(i, 1)
                    homeBaseShot = false
                } else {
                    for (let j = 0; j < aliens.length; j++) {
                        if (aliens[j].collides(homeBaseBullets[i]) && !(aliens[j] instanceof PowerUp)) {
                            aliens.splice(j, 1)
                            // console.log("me pew pew the alien")
                        }
                    }
                }
            }
        }

        player.move(displacement[0], displacement[1], ctx)
        drawCrossHair(ctx)
        drawNavBar(score, ctx)
        if (aliens.toString() === '') nextWave(ctx)
    } else if (powerUpPaused) {
        player.move(displacement[0], displacement[1], ctx)
    }

}


function gameInit() {
    gameSetup()
    requestAnimationFrame(gameLoop)
}

function loseGame(ctx) {
    paused = true
    lost = true
    console.log("Game Lost!")

    modal = document.createElement("div")
    modal.classList.add('modal')
    modal.id = "startup"

    let mainlayout = document.createElement("div")
    mainlayout.classList.add('dialogueLayoutLost')


    let h1_3 = document.createElement("h1")
    h1_3.classList.add('modalSelect')
    h1_3.textContent = "CREDITS : 0 | INSERT CREDIT(S)"
    h1_3.style.fontSize = "1em"
    h1_3.style.textShadow = "none"
    h1_3.style.animation = "credits 0.7s infinite cubic-bezier(1,0,0,1)"

    let h1 = document.createElement("h1")
    h1.classList.add('h1Lost')
    h1.textContent = "Sequence"
    let h1_2 = document.createElement("h1")
    h1_2.classList.add('h1Lost')
    h1_2.textContent = "Safari"
    h1_2.style.alignSelf = "flex-end"

    let uiDiv = document.createElement("div")
    uiDiv.classList.add('uiDev')

    lostText = document.createElement("div")
    lostText.classList.add('modalSelect')
    lostText.classList.add('youLostText')

    lostText.textContent = "You Lost!"

    settings = document.createElement("div")
    settings.classList.add('modalSelect')

    uiDiv.appendChild(settings)
    mainlayout.appendChild(h1)
    mainlayout.appendChild(h1_2)
    mainlayout.appendChild(h1_3)
    mainlayout.appendChild(uiDiv)
    modal.appendChild(mainlayout)
    modal.onclick = () => { location.reload() }

    document.body.appendChild(modal)

    document.body.style.cursor = "pointer"
}

gameInit()