const Application = PIXI.Application;
const Assets = PIXI.Assets;
const Container = PIXI.Container;
const Sprite = PIXI.Sprite;
const Graphics = PIXI.Graphics;
const Text = PIXI.Text;
const TextStyle = PIXI.TextStyle;

function Lerp(a, b, t){ return a + (b - a) * t }

class Button extends Sprite{
    constructor(texture, onPointerDown, initialScale){
        super(texture);

        this.onDown = onPointerDown;

        this.initialScale = initialScale || 1.0;
        this.scale.set(this.initialScale);

        this.anchor.set(0.5)
        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerdown',  this._pointerDown);
        this.on('pointerup', this._pointerUp);
        this.on('pointerupoutside', this._pointerUpOutside);
        this.on('pointerover', this._pointerOver);
        this.on('pointerout', this._pointerOut);
    }
    _pointerDown(){
        this.scale.set(0.9);
        this.onDown();
    }
    _pointerUp(){
        this.scale.set(this.initialScale);
    }
    _pointerUpOutside(){
        this.scale.set(this.initialScale);
    }
    _pointerOver(){
        this.hover = true;
    }
    _pointerOut(){
        this.hover = false;
    }
}

class ControlButton extends Container{
    constructor(type){
        super();

        this.arrow = new Sprite(textures.arrow);
        this.arrow.anchor.set(0.5);
        this.arrow.x = 64;
        this.arrow.y = 64;
        this.arrow.tint = 0x0FEE9E;

        this.type = type;

        switch (type) {
            case 'left':
                this.arrow.angle = -180;
                this.pressedVal = -1;
                break;
            case 'up':
                this.arrow.angle = -90;
                this.pressedVal = -LEVELS[currentLevel].grid[0].length;
                break;
            case 'down':
                this.arrow.angle = 90;
                this.pressedVal = LEVELS[currentLevel].grid[0].length;
                break;
            default:
                this.pressedVal = 1;
                break;
        }


        this.addChild(this.arrow);

        this.hover = false;
        this.pressed = false;

        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerdown', this.pointerDown);
        this.on('pointerup', this.pointerUp);
        this.on('pointerupoutside', this.pointerUpOutside);
        this.on('pointerover', this.pointerOver);
        this.on('pointerout', this.pointerOut);
    }
    setPressedVal()
    {
        if (this.type === 'up') this.pressedVal = -LEVELS[currentLevel].grid[0].length;
        else if (this.type === 'down' ) this.pressedVal = LEVELS[currentLevel].grid[0].length;
    }

    pointerDown(){
        pressedDir = this.pressedVal;
        this.arrow.scale.set(0.9);
        this.arrow.tint = 0x3DF3B2;
        this.pressed = true;
    }
    pointerUp(){
        this.arrow.scale.set(1.0);
        this.arrow.tint = this.hover ? 0x3DF3B2 : 0x0FEE9E;
        this.pressed = false;
    }
    pointerUpOutside(){
        this.arrow.scale.set(1.0);
        this.arrow.tint = 0x0FEE9E;
        this.pressed = false;
    }
    pointerOver(){
        this.arrow.tint = 0x3DF3B2;
        this.hover = true;
    }
    pointerOut(){
        this.arrow.tint = this.pressed ? 0x3DF3B2 : 0x0FEE9E;
        this.hover = false;
    }

}

class Dot extends Sprite{
    constructor(type, cellNo, moveLength, maxRow, maxCol){
        super(textures.circle);
        this.tint = DOTS[type].color;
        this.cellNo = cellNo; 
        this.moveLength = moveLength;

        this.maxRow = maxRow;
        this.maxCol = maxCol;

        this.isMove = false;
        this.nextX;
        this.nextY;

        this.speed = .1;
        this.type = type;
        this.wait = (type === 4 || type === 3) ? true : false;
        this.waitRound = 1;
    }

    move()
    {
        if (this.wait && this.waitRound > 0) {
            this.waitRound--;
            return;
        }
        else this.waitRound = 1;
    
        if (this.type === 2 || this.type === 4) this.dir = -pressedDir;
        else this.dir = pressedDir;

        if (!levelGrid[this.cellNo + this.dir] || levelGrid[this.cellNo + this.dir].indexOf(9) !== -1) return; // target cell is blocked

        if (this.dir === 1) {
            if (this.cellNo % this.maxCol === 0 ) return;
            this.nextX = this.x + this.moveLength;
            this.moveFn = (delta) => {
                this.x = Lerp(this.x, this.nextX, delta * this.speed);
            }
        }
        else if (this.dir === -1) {
            if ((this.cellNo - 1) % this.maxCol === 0 ) return;
            this.nextX = this.x - this.moveLength;
            this.moveFn = (delta) => {
                this.x = Lerp(this.x, this.nextX, delta * this.speed);
            }
        }
        else if (this.dir > 1) {
            if (this.cellNo + this.dir > this.maxCol * this.maxRow) return;
            this.nextY = this.y + this.moveLength;
            this.moveFn = (delta) => {
                this.y = Lerp(this.y, this.nextY, delta * this.speed);
            }
        }
        else if (this.dir < -1) {
            if (this.cellNo + this.dir < 0) return;
            this.nextY = this.y - this.moveLength;
            this.moveFn = (delta) => {
                this.y = Lerp(this.y, this.nextY, delta * this.speed);
            }
        }

        this.isMove = true;
        levelGrid[this.cellNo].splice(levelGrid[this.cellNo].indexOf(this.type), 1);
        levelGrid[this.cellNo + this.dir].push(this.type);
        this.cellNo += this.dir;
    }
    update(delta){
        if (this.isMove) this.moveFn(delta);
    }

}

let GAME;

const LOGICAL_W = 1920;
const LOGICAL_H = 1080;


let DOTS_ARRAY = [];

// dot data in global
const DOTS = {
    1: {
        total: 0,
        completed: false,
        color: '#0FEE9E'
    },
    2: {
        total: 0,
        completed: false,
        color: '#EE0F5F'
    },
    3: {
        total: 0,
        completed: false,
        color: '#CFEE0F'
    },
    4: {
        total: 0,
        completed: false,
        color: '#9E0FEE'
    }
};

// all levels 
const LEVELS = {
    1: {
        time: 30,
        move: 5,
        grid: [[1, 1]]
    },
    2: {
        time: 30,
        move: 5,
        grid: [[1, 0, 1]]
    },
    3: {
        time: 30,
        move: 5,
        grid: [
            [1, 1],
            [1, 1]
        ]
    },
    4: {
        time: 30,
        move: 2,
        grid: [
            [1, 1],
            [1, 9]
        ]
    },
    5: {
        time: 30,
        move: 2,
        grid: [
            [1, 9],
            [1, 9],
            [1, 9]
        ]
    },
    6: {
        time: 30,
        move: 4,
        grid: [
            [1, 1],
            [1, 1],
            [1, 1]
        ]
    },
    7: {
        time: 30,
        move: 4,
        grid: [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ]
    },
    8: {
        time: 30,
        move: 8,
        grid: [
            [1, 1, 1],
            [1, 9, 1],
            [1, 1, 1]
        ]
    },
    9: {
        time: 30,
        move: 5,
        grid: [
            [1, 9, 1, 9],
            [0, 1, 0, 1]
        ]
    },
    10: {
        time: 30,
        move: 4,
        grid: [
            [1, 9, 9],
            [1, 9, 9],
            [1, 0, 1]
        ]
    },
    11: {
        time: 30,
        move: 4,
        grid: [
            [1, 9, 1],
            [0, 9, 0],
            [0, 0, 0]
        ]
    },
    12: {
        time: 30,
        move: 5,
        grid: [
            [1, 9, 1, 9],
            [0, 0, 0, 0],
            [9, 1, 9, 1]
        ]
    },
    13: {
        time: 30,
        move: 6,
        grid: [
            [0, 1, 0],
            [9, 0, 9],
            [0, 0, 1],
            [1, 9, 1]
        ]
    },
    14: {
        time: 30,
        move: 7,
        grid: [
            [1, 0, 1, 0, 0],
            [9, 9, 9, 0, 9],
            [1, 1, 1, 1, 1]
        ]
    },
    15: {
        time: 30,
        move: 4,
        grid: [
            [1, 0, 1],
            [0, 1, 0],
            [1, 0, 1]
        ]
    },
    16: {
        time: 30,
        move: 4,
        grid: [
            [1, 9, 0],
            [1, 0, 0],
            [0, 9, 1]
        ]
    },
    17: {
        time: 30,
        move: 7,
        grid: [
            [1, 1, 9, 1],
            [0, 9, 1, 0],
            [1, 9, 0, 1],
            [0, 0, 0, 9]
        ]
    },
    18: {
        time: 30,
        move: 10,
        grid: [
            [9, 1, 9, 1],
            [0, 0, 0, 0],
            [1, 9, 1, 0],
            [9, 9, 9, 1]
        ]
    },
    19: {
        time: 30,
        move: 5,
        grid: [
            [2, 0, 0, 2]
        ]
    },
    20: {
        time: 30,
        move: 5,
        grid: [
            [2, 0, 2],
            [0, 2, 0]
        ]
    },
    21: {
        time: 30,
        move: 5,
        grid: [
            [0, 2, 0],
            [2, 0, 0],
            [0, 0, 2]
        ]
    },
    22: {
        time: 30,
        move: 5,
        grid: [
            [2, 9, 2, 9],
            [0, 2, 0, 2],
            [9, 9, 9, 0]
        ]
    },
    23: {
        time: 30,
        move: 7,
        grid: [
            [2, 2, 9, 9],
            [9, 0, 2, 2],
            [2, 2, 9, 9]
        ]
    },
    24: {
        time: 30,
        move: 4,
        grid: [
            [2, 0, 0],
            [0, 9, 0],
            [0, 0, 2]
        ]
    },
    25: {
        time: 30,
        move: 5,
        grid: [
            [2, 9, 2, 9],
            [0, 0, 0, 0],
            [9, 2, 9, 2]
        ]
    },
    26: {
        time: 30,
        move: 7,
        grid: [
            [2, 2, 9, 2],
            [0, 9, 2, 0],
            [2, 9, 0, 2],
            [0, 0, 0, 9]
        ]
    },
    27: {
        time: 30,
        move: 7,
        grid: [
            [2, 0, 2, 0, 0],
            [9, 9, 9, 0, 9],
            [2, 2, 2, 2, 2]
        ]
    },
    28: {
        time: 30,
        move: 5,
        grid: [
            [2, 0, 0, 0],
            [0, 9, 9, 2],
            [2, 9, 9, 2]
        ]
    },
    29: {
        time: 30,
        move: 1,
        grid: [
            [1, 1, 2, 2]
        ]
    },
    30: {
        time: 30,
        move: 1,
        grid: [
            [1, 1],
            [2, 2]
        ]
    },
    31: {
        time: 30,
        move: 2,
        grid: [
            [1, 2],
            [2, 1]
        ]
    },
    32: {
        time: 30,
        move: 4,
        grid: [
            [1, 2, 0],
            [0, 9, 0],
            [0, 1, 2]
        ]
    },
    33: {
        time: 30,
        move: 5,
        grid: [
            [1, 2],
            [2, 1],
            [0, 0],
            [2, 1],
            [1, 2]
        ]
    },
    34: {
        time: 30,
        move: 5,
        grid: [
            [1, 1, 1, 9],
            [9, 2, 2, 2],
            [2, 1, 2, 9]
        ]
    },
    35: {
        time: 30,
        move: 5,
        grid: [
            [1, 2, 1, 2],
            [0, 0, 0, 0],
            [2, 1, 2, 1]
        ]
    },
    36: {
        time: 30,
        move: 6,
        grid: [
            [1, 1, 2, 2],
            [2, 2, 1, 1],
            [1, 1, 2, 2],
            [2, 2, 1, 1]
        ]
    },
    37: {
        time: 30,
        move: 6,
        grid: [
            [1, 2, 1, 2],
            [2, 1, 2, 1],
            [1, 2, 1, 2],
            [2, 1, 2, 1]
        ]
    },
    38: {
        time: 30,
        move: 3,
        grid: [
            [2, 9, 1, 9],
            [0, 2, 0, 1]
        ]
    },
    39: {
        time: 30,
        move: 12,
        grid: [
            [2, 9, 9, 1, 9],
            [0, 0, 0, 0, 9],
            [1, 9, 9, 2, 0]
        ]
    },
    40: {
        time: 30,
        move: 6,
        grid: [
            [0, 9, 9, 2],
            [0, 1, 2, 0],
            [2, 9, 9, 0]
        ]
    },
    41: {
        time: 30,
        move: 4,
        grid: [
            [2, 2, 1],
            [1, 1, 2],
            [2, 2, 1]
        ]
    },
    42: {
        time: 30,
        move: 4,
        grid: [
            [1, 2],
            [0, 0],
            [0, 0],
            [2, 1]
        ]
    },
    43: {
        time: 30,
        move: 6,
        grid: [
            [3, 0, 3, 0]
        ]
    },
    44: {
        time: 30,
        move: 8,
        grid: [
            [3, 9],
            [3, 9],
            [0, 3],
            [0, 3]
        ]
    },
    45: {
        time: 30,
        move: 6,
        grid: [
            [4, 0, 4, 0]
        ]
    },
    46: {
        time: 30,
        move: 4,
        grid: [
            [3, 4],
            [4, 3]
        ]
    },
    47: {
        time: 30,
        move: 4,
        grid: [
            [1, 4, 1],
            [3, 3, 4],
            [2, 2, 0]
        ]
    },
    48: {
        time: 30,
        move: 6,
        grid: [
            [1, 4, 1],
            [0, 0, 0],
            [4, 0, 0]
        ]
    },
    49: {
        time: 30,
        move: 4,
        grid: [
            [2, 3, 2],
            [3, 0, 0],
            [1, 1, 1]
        ]
    },
    50: {
        time: 30,
        move: 4,
        grid: [
            [2, 4, 1],
            [2, 4, 1]
        ]   
    },
    51: {
        time: 30,
        move: 4,
        grid: [
            [2, 2, 3, 3],
            [2, 2, 1, 1]
        ]
    },
    52: {
        time: 30,
        move: 4,
        grid: [
            [1, 1, 1],
            [2, 3, 3],
            [2, 3, 3]
        ]
    },
    53: {
        time: 30,
        move: 4,
        grid: [
            [1, 1, 3, 3],
            [2, 9, 9, 0],
            [2, 9, 9, 4],
            [0, 0, 0, 4]
        ]
    },
    54: {
        time: 30,
        move: 4,
        grid: [
            [4, 4, 3, 3],
            [1, 1, 2, 2]
        ]
    },
    55: {
        time: 30,
        move: 6,
        grid: [
            [2, 9, 9, 3],
            [0, 3, 2, 0]
        ]
    },
    56: {
        time: 30,
        move: 6,
        grid: [
            [2, 4, 1],
            [1, 2, 4],
            [9, 2, 1]
        ]
    },
    57: {
        time: 30,
        move: 4,
        grid: [
            [3, 2, 1],
            [0, 0, 0],
            [3, 2, 1]
        ]
    },
    58: {
        time: 30,
        move: 3,
        grid: [
            [4, 4, 1, 1],
            [2, 0, 0, 2],
            [3, 3, 9, 9]
        ]
    },
    59: {
        time: 30,
        move: 2,
        grid: [
            [2, 2, 9],
            [9, 4, 4],
            [1, 1, 9]
        ]
    },
    60: {
        time: 30,
        move: 8,
        grid: [
            [1, 2, 0, 1],
            [1, 9, 9, 0],
            [2, 0, 0, 0]
        ]
    },
    61: {
        time: 30,
        move: 8,
        grid: [
            [1, 2, 9, 9],
            [1, 2, 9, 3],
            [0, 0, 3, 0],
            [4, 0, 4, 0]
        ]
    }
    
}

const DIR = {
    left: -1,
    right: 1,
    up: -1,
    down: 1
};

// keep track of dots current position in 1D Array
let levelGrid = {};
// global variable to hold textures 
let textures;
let currentStage = 1; // earch stage consists of three levels
let currentLevel = 1;
// hold dir data. 1: right -1: left  < -1: up  > 1: down
let pressedDir = 0;
// global scale data for game window
let scaleFactor = 1.0;
// global timer variable for level time
let timeLeft = 0;
// global PIXI.Text object for render time;
let timeLabel;
// level or game has been started
let started = false;

let failed = false;
let won = false;

let gameFinished = false;

function resizeHandler() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    scaleFactor = Math.min(w / LOGICAL_W, h / LOGICAL_H);

    GAME.renderer.resize(w, h);
    GAME.stage.scale.set(scaleFactor, scaleFactor);

    
    const buttonContainer = GAME.stage.children.find(c => c.name === 'btns');
    if (buttonContainer) {
        buttonContainer.x = GAME.view.width * .75 / scaleFactor;
        buttonContainer.y = GAME.view.height * .5 / scaleFactor;
    }
    
    const dotsContainer = GAME.stage.children.find(c => c.name === 'dots');
    if (dotsContainer) {    
        dotsContainer.x = GAME.view.width * .25 / scaleFactor;
        dotsContainer.y = GAME.view.height * .5 / scaleFactor;
    }

    const hud = GAME.stage.children.find(c => c.name === 'hud');
    if (hud) {
        hud.x = GAME.view.width * .5 / scaleFactor - hud.width * .5;
    }

    const pass = GAME.stage.children.find(c => c.name === 'pass');
    if (pass) {
        pass.x = GAME.view.width / scaleFactor - 120;
    }

    if (pausePanel) {
        pausePanel.x = GAME.view.width * .5 / scaleFactor - 200;
        pausePanel.y = GAME.view.height * .5 / scaleFactor - 100;
    }
}

function panelFadeOutAnimation(panel, step, callback) {
    panel.alpha = Lerp(panel.alpha, 0, step);
    if (panel.alpha > 0.05) {
        setTimeout(() => {
            panelFadeOutAnimation(panel, step, callback);
        }, 16);
    } 
    else {
        callback && callback();
    }
}

function panelFadeInAnimation(panel, step, callback) {
    panel.alpha = Lerp(panel.alpha, 1, step);
    if (panel.alpha < 0.90) {
        setTimeout(() => {
            panelFadeInAnimation(panel, step, callback);
        }, 16);
    }
    else {
        callback && callback();
    }
}

function panelEnterAnimation(panel) {
    panel.x = Lerp(panel.x, panel.fixedX, .05);
    if (panel.fixedX - panel.x > 0.05) {
        setTimeout(() => {
            panelEnterAnimation(panel);
        }, 16);
    }
}

function pauseBgScaleAnimation(up) {
    if(up) {//means scale up
        bgLayer.scale.set(Lerp(bgLayer.scale.x, 13, 0.1))
        if (13 - bgLayer.scale.x > 0.1) {
            setTimeout(() => {
                pauseBgScaleAnimation(true)
            }, 16);
        }
    }
    else {//means scale down
        bgLayer.scale.set(Lerp(bgLayer.scale.x, 1, 0.1))
        if (bgLayer.scale.x - 1 > 0.1) {
            setTimeout(() => {
                pauseBgScaleAnimation(false)
            }, 16);
        }
    }
}

function getCurrentLevel() { return (currentStage - 1) * 3 + 1 }


function resetDots()
{
    for(dotType in DOTS){
        DOTS[dotType].total = 0;
        DOTS[dotType].completed = false;
    }
}

function onPauseBtnPressed() {
    started = false;
    btnSound.currentTime = 0;
    btnSound.play();
    pauseBgScaleAnimation(true);
    pausePanel.visible = true;
    pausePanel.children[1].visible = true;
    panelFadeInAnimation(pausePanel, 0.05, () => { console.log("pause")});
}

function onPassLevelBtnPressed() {
    btnSound.currentTime = 0;
    btnSound.play();
}

function onRestartBtnPressed() {
    btnSound.currentTime = 0;
    btnSound.play();
    
    currentLevel = getCurrentLevel();
    changeLevel();

    pauseBgScaleAnimation(false);
    pausePanel.visible = false;
    pausePanel.alpha = 0;

    step1Circle.tint = 0x29ABE2;
    step2Circle.tint = 0x29ABE2;
    step3Flag.tint = 0x29ABE2;
}

function onContinueBtnPressed() {
    btnSound.currentTime = 0;
    btnSound.play();
    pauseBgScaleAnimation(false);
    panelFadeOutAnimation(pausePanel, 0.1, () => { pausePanel.visible = false });
    started = true;
}

let isCreditsOpen = false;
function onCreditsBtnPressed() {
    btnSound.currentTime = 0;
    btnSound.play();
    if (!isCreditsOpen) {
        panelFadeInAnimation(creditsList, 0.04, () => { });
        isCreditsOpen = true;
    }
    else {
        panelFadeOutAnimation(creditsList, 0.04, () => { });
        isCreditsOpen = false;
    }
    
}

function onSoundBtnPressed() {
    btnSound.currentTime = 0;
    btnSound.play();
    if (sound) {
        soundText.text = 'Sound off';
        sound = false;
        
        for(let i = 0; i < allSounds.length; i++) {
            allSounds[i].volume = 0.0;
        }
    }
    else {
        soundText.text = 'Sound on';
        sound = true;
        
        for(let i = 0; i < allSounds.length; i++) {
            allSounds[i].volume = 1.0;
        }
        clockSound.volume = 0.2;
    }
    

}

function finish() {
    pauseBgScaleAnimation(true);

    const congratsText = new Text('YOU FINISHED GAME, THANKS FOR PLAYING', {
        fontFamily: ['Kablammo', 'cursive'],
        fontSize: 70,
        fontWeight: 700,
        align: 'right',
        fill: 0x02012B,
    });
    congratsText.x = GAME.view.width * .5 / scaleFactor - congratsText.width * .5;
    congratsText.y = GAME.view.height * .5 / scaleFactor - congratsText.height * .5;
    congratsText.alpha = 0;
    GAME.stage.addChild(congratsText);
    panelFadeInAnimation(congratsText, 0.05, () => { console.log("game finished") });
}

let lastChance = false;
function fail(type) {
    if (won) return;
    started = false;
    if (type === 'mix') {
        failed = true;
        mixFailSound.currentTime = 0;
        mixFailSound.play()
    }
    else if (type === 'time') {
        failed = true;
        alarmSound.currentTime = 0;
        alarmSound.play();
    }
    else if (type === 'move') {
        if (!failed) {
            lastChance = true;
            setTimeout(() => {
                lastChance = false;
                if (won) {
                    changeLevel();
                    return;
                }
                failed = true;
                fail(type);

            }, 1000);
        }
        else {
            moveFailSound.currentTime = 0;
            moveFailSound.play();
        }
        
    }

    if (!failed) return;

    setTimeout(() => {
        pauseBgScaleAnimation(true);
        pausePanel.visible = true;
        pausePanel.children[1].visible = false
        panelFadeInAnimation(pausePanel, 0.05, () => { });    
    }, 500);
    

}

function win() {
    if (failed) return;
    started = false;
    won = true;
    checkStage()
    currentLevel++;
    if (currentLevel > Object.keys(LEVELS).length) gameFinished = true;

    if (gameFinished) finish()
    else {
        if (!lastChance) changeLevel();
    }
    

}

function checkStage() {
    if (currentLevel % 3 === 1) {
        step1SuccesSound.currentTime = 0;
        step1SuccesSound.play();
        step1Circle.tint = 0x0FEE9E;
    }
    if (currentLevel % 3 === 2) {
        step2SuccesSound.currentTime = 0;
        step2SuccesSound.play();
        step2Circle.tint = 0x0FEE9E;
    }
    if (currentLevel % 3 === 0){
        step3SuccesSound.currentTime = 0;
        step3SuccesSound.play();
        step3Flag.tint = 0x0FEE9E;
        currentStage++;
        saveGameData();
        lvlLabel.text = 'Lvl ' + currentStage;
        setTimeout(() => {
            successSound.currentTime = 0;
            successSound.play();
            step1Circle.tint = 0x29ABE2;
            step2Circle.tint = 0x29ABE2;
            step3Flag.tint = 0x29ABE2;
        }, 1000);
    }
}

function checkStatus(){
    const samples = [];
    for(item in levelGrid){
        const cell = levelGrid[item];
        const sample = cell[0];
        if (!sample || sample === 9) continue;
        const length = cell.length;
        let total = 0;
        for(let i = 0; i < length; i++){
            if (cell[i] === sample) total++; 
        }
        if (total !== length) return -1;
        else if (DOTS[sample].total === total) DOTS[sample].completed = true;
        samples.push(sample);
    }

    for(let i = 0; i < samples.length; i++) if (!DOTS[samples[i]].completed) return 0;

    return 1;
}

let moveLeft = 0; // how many move has current level 
let moveLabel; // PIXI.Text obj to show moveLeft

let __counter = 0;
let isMove = false; // is dots in movement wait till animation finish
let clockTick = 0;
function update(delta){
    if(!started) return;

    if (!moveLeft > 0) {
        fail('move');
        return;
    }

    if(!timeLeft > 0) {
        fail('time');
        return;
    }

    __counter += delta;
    if (__counter > 60){
        if (clockTick > 0) clockTick--;
        else {
            clockSound.currentTime = 0;
            clockSound.play();
            clockTick = 1;
        }
        __counter = 0;
        timeLeft -= 1;
        timeLabel.text = timeLeft;
    }
    
    if(pressedDir !== 0 && !isMove){
        // move for each dot
        // update levelGrid
        // check grid for fail or win
        // else proceed
        moveSound.currentTime = 0 ;
        moveSound.play();

        for(let i = 0; i < DOTS_ARRAY.length; i++){
            DOTS_ARRAY[i].move();
        }
        const status = checkStatus();
        isMove = true;
        pressedDir = 0;
        moveLeft--;

        moveLabel.text = moveLeft;

        setTimeout(() => { 
            if (status === -1) fail('mix');
            else if (status === 1) win();
            isMove = false
        }, 900);
    }

}

function changeLevel() {
    const dotsPanel = GAME.stage.children.find(c => c.name === 'dots');
    panelFadeOutAnimation(dotsPanel, 0.05, () => { GAME.stage.removeChild(dotsPanel) });
    levelGrid = {};
    for(let i = 0; i < DOTS_ARRAY.length; i++){
        const dot = DOTS_ARRAY[i];
        GAME.ticker.remove(dot.update, dot);    
    }
    DOTS_ARRAY = [];
    resetDots();
    createLevelGrid();
    startLevel();
}

function startLevel() {
    timeLeft = LEVELS[currentLevel].time;
    timeLabel.text = timeLeft;
    
    moveLeft = LEVELS[currentLevel].move;
    moveLabel.text = moveLeft;

    controlButtons[0].setPressedVal();
    controlButtons[1].setPressedVal();

    won = false;
    failed = false;
    setTimeout(() => {
        started = true;
    }, 1000);
}

function createLevelGrid() {

    const padding = 10;
    const dotSize = 128;
    const gap = 15;

    const container = new Container();
    container.name = 'dots';    

    const g = new Graphics();
    container.addChild(g);

    const levelData = LEVELS[currentLevel].grid;
    const row = levelData.length;

    const cellSize = dotSize + 2 * padding;
    const blockSize = cellSize + gap;
    let count = 1;
    for(let r = 0; r < row; r++){
        const col = levelData[r].length;
        for(let c = 0; c < col; c++){
            const data = levelData[r][c];

            levelGrid[count] = []
            data !== 0 && levelGrid[count].push(data);

            count++;
            if(data === 9) continue;

            //g.lineStyle(3, 0x02012B, 1);
            g.beginFill(0x1F1383)
            g.drawRoundedRect(c * blockSize, r * blockSize, cellSize, cellSize);
            g.endFill();

            if(data === 0) continue;

            const dot = new Dot(data, count - 1, blockSize, row, col);

            container.addChild(dot)

            dot.x = c * blockSize + padding;
            dot.y = r * blockSize + padding;

            GAME.ticker.add(dot.update, dot);
            DOTS[data].total++;
            DOTS_ARRAY.push(dot);
        }
    }
    //g.beginFill(0xeeeeee);
    //g.drawRect(0, 0, container.width, container.height);

    container.fixedX = GAME.view.width * .25 / scaleFactor;
    container.fixedY = GAME.view.height * .5 / scaleFactor;  

    container.x = -container.width;
    container.y = GAME.view.height * .5 / scaleFactor;

    container.pivot.x = container.width * .5;
    container.pivot.y = container.height * .5;
    
    GAME.stage.addChildAt(container, GAME.stage.children.length - 1);
    panelEnterAnimation(container);
}

const controlButtons = []; // we need only up and down cause only up down dir value changes as grid change
function createControlPanel() {
    const container = new Container;

    container.name = 'btns';

    const bgPattern = new Sprite(textures.pattern);
    bgPattern.tint = 0x1F1383;
    bgPattern.x = 80;
    bgPattern.y = 80;

    container.addChild(bgPattern);


    const leftBtn = new ControlButton('left');
    const rightBtn = new ControlButton('right');
    const upBtn = new ControlButton('up');
    const downBtn = new ControlButton('down');


    controlButtons.push(upBtn, downBtn);

    container.addChild(leftBtn);
    container.addChild(rightBtn);
    container.addChild(upBtn);
    container.addChild(downBtn);

    leftBtn.y = 128;

    rightBtn.x = 256;
    rightBtn.y = 128;

    upBtn.x = 128;

    downBtn.x = 128;
    downBtn.y = 256;

    container.pivot.x = container.width * .5;
    container.pivot.y = container.height * .5;

    GAME.stage.addChild(container);
    
    container.x = GAME.view.width * .75 / scaleFactor;
    container.y = GAME.view.height * .5 / scaleFactor;
}

let lvlLabel, step1Circle, step2Circle, step3Flag;
function createHUD(){
    const container = new Container();
    const g = new Graphics();
    
    container.addChild(g);
    
    const style = new TextStyle({
        fontFamily: ['Kablammo', 'cursive'],
        fontSize: 50,
        fontWeight: 700,
        align: 'right',
        fill: 0x0FEE9E,
    });

    const timeLabelBox = new Container();
    const clock = new Sprite(textures.clock);
    timeLabelBox.addChild(clock);
    clock.x = 20;
    clock.y = 12;
    timeLabel = new Text('xxx', style);
    timeLabelBox.addChild(timeLabel);
    timeLabel.x = clock.x + clock.width + 20;
    timeLabel.y = 16;

    const moveLabelBox = new Container();
    const moveIcon = new Sprite(textures.move);
    moveLabelBox.addChild(moveIcon);
    moveIcon.x = 20;
    moveIcon.y = 12;
    moveLabel = new Text('xx', style);
    moveLabelBox.addChild(moveLabel);
    moveLabel.x = moveIcon.width + 40;
    moveLabel.y = 13;
    moveLabelBox.x = timeLabelBox.width + 40;

    container.addChild(timeLabelBox);
    container.addChild(moveLabelBox);

    container.x = GAME.view.width * .5 / scaleFactor - container.width * .5;
    container.y = 20;

    container.name = 'hud';

    g.lineStyle(4, 0x26169D, 1);
    g.beginFill(0x1F1383);
    g.drawRoundedRect(0, 0, timeLabelBox.width + 20, 90, 16);
    g.endFill();

    g.beginFill(0x1F1383);
    g.drawRoundedRect(timeLabelBox.width + 40, 0, moveLabelBox.width + 40, 90);
    g.endFill();

    // PAUSE BUTTON
    const pause = new Button(textures.pause, onPauseBtnPressed);
    pause.tint = 0x0FEE9E;
    pause.x = 100;
    pause.y = 60;
    GAME.stage.addChild(pause);

    // PASS LEVEL BUTTON
    const passLevelBtn = new Button(textures.rarrow, onPassLevelBtnPressed, 1.2);
    passLevelBtn.x = GAME.view.width / scaleFactor - 100;
    passLevelBtn.y = 70;
    passLevelBtn.name = 'pass';
    const passLevelLabel = new Text('Pass with Ad', {
        fontFamily: ['Kablammo', 'cursive'],
        fontSize: 20,
        fontWeight: 700,
        align: 'right',
        fill: 0x0FEE9E,
    });
    passLevelLabel.x = -60;
    passLevelLabel.y = 40;
    passLevelBtn.addChild(passLevelLabel);

    GAME.stage.addChild(passLevelBtn);


    const lvlCounterBox = new Container;
    lvlCounterBox.x = 300;
    lvlCounterBox.y = 30;

    lvlLabel = new Text('Lvl '+currentStage, style);
    step1Circle = new Sprite(textures.circle);
    step1Circle.scale.set(0.2);
    step1Circle.x = 220;
    step1Circle.y = 20;
    step1Circle.tint = 0x29ABE2;
    step2Circle = new Sprite(textures.circle);
    step2Circle.scale.set(0.2);
    step2Circle.x = 260;
    step2Circle.y = 20;
    step2Circle.tint = 0x29ABE2;
    step3Flag = new Sprite(textures.flag);
    step3Flag.x = 300;
    step3Flag.tint = 0x29ABE2;

    lvlCounterBox.addChild(lvlLabel);
    lvlCounterBox.addChild(step1Circle);
    lvlCounterBox.addChild(step2Circle)
    lvlCounterBox.addChild(step3Flag);
    GAME.stage.addChild(lvlCounterBox);

    GAME.stage.addChild(container);

}

let pausePanel;
let creditsList;
let soundText;
let sound = true;
function createPausePanel() {
    pausePanel = new Container();

    const style = new TextStyle({
        fontFamily: ['Kablammo', 'cursive'],
        fontSize: 50,
        fontWeight: 700,
        align: 'right',
        fill: 0x02012B,
    });    

    const restartBtn = new Button(textures.restart, onRestartBtnPressed);
    restartBtn.tint = 0x02012B;
    const restartText = new Text('Restart', style);
    restartText.x = -80;
    restartText.y = 70;
    restartBtn.addChild(restartText);

    const continueBtn = new Button(textures.arrow, onContinueBtnPressed);
    continueBtn.tint = 0x02012B;
    continueBtn.x = 420;
    const continueText = new Text('Continue', style);
    continueText.x = -120;
    continueText.y = 70;
    continueBtn.name = 'cont';
    continueBtn.addChild(continueText);


    const creditsBtn = new Button(textures.credits, onCreditsBtnPressed);
    creditsBtn.tint = 0x02012B;
    creditsBtn.y = -250;
    const creditsText = new Text('Credits', style);
    creditsText.x = -80;
    creditsText.y = 70;
    creditsBtn.addChild(creditsText);

    creditsList = new Text(
        `
        Clock icon by justicon - Flaticon: https://www.flaticon.com/free-icons/clock
        Movement icon by Royyan Wijaya - Flaticon: https://www.flaticon.com/free-icons/movement
        Arrow icons by Freepik - Flaticon: https://www.flaticon.com/free-icons/arrow
        Wave icon by icon wind - Flaticon: https://www.flaticon.com/free-icons/sound-wave
        Music and sound from Zapsplat: https://www.zapsplat.com
        `,
        {
            fontFamily: ['Kablammo', 'cursive'],
            fontSize: 30,
            fontWeight: 700,
            align: 'left',
            fill: 0x02012B,
        }
    );
    creditsList.x = -500;
    creditsList.y = 220;
    creditsList.alpha = 0;


    const soundBtn = new Button(textures.wave, onSoundBtnPressed);
    soundBtn.x = 400;
    soundBtn.y = -250;
    const __text = 'Sound ' + (sound ? 'on' : 'off');
    soundText = new Text(__text, {
        fontFamily: ['Kablammo', 'cursive'],
        fontSize: 45,
        fontWeight: 700,
        align: 'center',
        fill: 0x02012B,
    });
    soundText.x = 50;
    soundText.y = -30;
    soundBtn.addChild(soundText);


    pausePanel.addChild(restartBtn);
    pausePanel.addChild(continueBtn);
    pausePanel.addChild(creditsBtn);
    pausePanel.addChild(creditsList);
    pausePanel.addChild(soundBtn);
    canvasLayer.addChild(pausePanel);

    pausePanel.alpha = 0;
    pausePanel.visible = false;

    pausePanel.x = GAME.view.width * .5 / scaleFactor - 300;
    pausePanel.y = GAME.view.height * .5 / scaleFactor - 100;
}


const step1SuccesSound = new Audio('assets/success1.mp3');
const step2SuccesSound = new Audio('assets/success2.mp3');
const step3SuccesSound = new Audio('assets/success3.mp3');
const successSound = new Audio('assets/level-end.mp3');
const moveSound = new Audio('assets/move.mp3');
const clockSound = new Audio('assets/clocktick.mp3');
const btnSound = new Audio('assets/btntick.mp3');
const alarmSound = new Audio('assets/alarm.mp3');
const moveFailSound = new Audio('assets/move-fail.mp3');
const mixFailSound = new Audio('assets/mix-fail.mp3');
clockSound.volume = 0.2;

const allSounds = [step1SuccesSound, step2SuccesSound, step3SuccesSound, successSound, moveSound, clockSound, btnSound, alarmSound, moveFailSound, mixFailSound];

let myFont;
async function loadAssets() {
    Assets.add('circle', 'assets/circle.png');
    Assets.add('arrow', 'assets/arrow.png');
    Assets.add('btnDown', 'assets/btn-down.png');
    Assets.add('btnUp', 'assets/btn-up.png');
    Assets.add('clock', 'assets/clock.png');
    Assets.add('move', 'assets/move-right.png');
    Assets.add('pause', 'assets/pause.png');
    Assets.add('pattern', 'assets/pattern.png');
    Assets.add('rarrow', 'assets/right-arrow.png');
    Assets.add('flag', 'assets/flag.png');  
    Assets.add('restart', 'assets/restart.png');
    Assets.add('credits', 'assets/credits.png');
    Assets.add('wave', 'assets/wave.png');

    textures = await Assets.load(['wave','circle', 'arrow', 'btnDown', 'btnUp', 'clock', 'move', 'pause', 'pattern', 'rarrow', 'flag', 'restart', 'credits']);
}

function parseCookie(str) {
    const result = str
    .split('&')
    .map(c => c.split('='))
    .reduce((acc, item) => {
        acc[item[0].trim()] = item[1].trim()
        return acc;
    }, {});

    return result;
}

function saveGameData() {
    // doing like this beacuse I have only one data for now
    const date = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toGMTString();
    document.cookie = 'stage=' + currentStage + ';expires=' + date;
}

function loadGameData() {
    let data;
    if (document.cookie) {
        data = parseCookie(document.cookie);
        currentStage = data.stage || 1;
    }
    currentLevel = getCurrentLevel();
}

function startGame() {
    landing = false;
    GAME.stage.removeChild(landingContainer);

    const bgPattern = new Sprite(textures.pattern);
    bgPattern.tint = 0x04025D;
    const bgPattern2 = new Sprite(textures.pattern);
    bgPattern2.tint = 0x04025D;

    GAME.stage.addChild(bgPattern);
    GAME.stage.addChild(bgPattern2);

    createControlPanel();
    createLevelGrid();
    createHUD();
    startLevel();
    

    canvasLayer = new Container();

    // same patter for pause screens
    bgLayer = new Sprite(textures.pattern);
    bgLayer.x = -320;
    bgLayer.y = -410
    bgLayer.tint = 0x0FEE9E;
    bgLayer.eventMode = 'static';

    canvasLayer.addChild(bgLayer);
    GAME.stage.addChild(canvasLayer);


    createPausePanel();

    //GAME.start();
    GAME.ticker.add(update)

    
    // animated bg pattern
    bgPattern.x = 200;
    bgPattern2.angle = 90;
    bgPattern2.scale.set(4);
    bgPattern2.x = GAME.view.width * .7 / scaleFactor;
    bgPattern2.y = GAME.view.height * .5 / scaleFactor; 

    GAME.ticker.add(delta => {
        bgPattern2.angle += 0.05 * delta;
    });
}


function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

let landing = true;
let timeForLandingAnimation = 0;
function playLandingAnimation() {
    if (!landing) return;

    startTitle.y += clamp(Math.cos(timeForLandingAnimation) * .5, -100, 100);
    timeForLandingAnimation += 0.016;
    setTimeout(() => {
        playLandingAnimation();
    }, 16);
}

let landingContainer, startTitle;
function showLandingScreen() {
    landingContainer = new Container();

    const g = new Graphics();
    g.beginFill(0x02012B);
    g.drawRect(0, 0, GAME.view.width / scaleFactor, GAME.view.height / scaleFactor);
    g.endFill();
    landingContainer.addChild(g);

    const gameTitle = new Text('Dot Sweep', {
        fontFamily: ['Kablammo', 'cursive'],
        fontSize: 105,
        fontWeight: 700,
        align: 'center',
        fill: 0x0FEE9E,
    });
    gameTitle.x = GAME.view.width * .5 / scaleFactor - gameTitle.width * .5;
    gameTitle.y = GAME.view.height * .5 / scaleFactor - 200;
    landingContainer.addChild(gameTitle);

    startTitle = new Text('Loading...',  {
        fontFamily: ['Kablammo', 'cursive'],
        fontSize: 60,
        fontWeight: 700,
        align: 'center',
        fill: 0x0FEE9E,
    });
    landingContainer.addChild(startTitle);
    startTitle.x = GAME.view.width * .5 / scaleFactor - startTitle.width * .5;
    startTitle.y = GAME.view.height * .5 / scaleFactor + 100;

    GAME.stage.addChild(landingContainer);
    playLandingAnimation();
}

let canvasLayer, bgLayer;
async function initGame() {
    await loadAssets();
    loadGameData();
    setTimeout(() => {
        startTitle.text = 'Click to start';
        startTitle.x -= 40;
        landingContainer.eventMode = 'static';
        landingContainer.on('pointerdown', startGame)    
    }, 1000);
    

}

WebFont.load({
    google: {
        families: ['Kablammo']
    },
    active: showLandingScreen,
});

GAME = new Application({width: 480, height: 720, backgroundColor: 0x02012B, antialias: true});
document.body.appendChild(GAME.view);
window.addEventListener('resize', resizeHandler);
resizeHandler();



initGame();