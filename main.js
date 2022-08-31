const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
const btnUp = document.getElementById('up');
const btnLeft = document.getElementById('left');
const btnRight = document.getElementById('right');
const btnDown = document.getElementById('down');
const spanLives = document.getElementById('lives');
const spanTime = document.getElementById('time');
const spanScore = document.getElementById('score')

let canvasSize = Math.min(window.innerHeight, window.innerWidth)*0.8;
let elementSize = canvasSize/10;

canvas.setAttribute('width', canvasSize);
canvas.setAttribute('height', canvasSize);

const defaultTime = 10;
let lvl = 0;
let lives = 3;
let seconds = defaultTime;
let score = 0;
let isChronometerActive = false;
let isGameOver = false

const initialPosition = {
  posX: undefined,
  posY: undefined,
}

const position = {
  posX: undefined,
  posY: undefined,
}

window.addEventListener('load', renderMap);
window.addEventListener('resize', resizeMap);
window.addEventListener('load', showVars);


function resizeMap() {
  canvasSize = Math.min(window.innerHeight, window.innerWidth)*0.8;
  elementSize = canvasSize/10;
  
  canvas.setAttribute('width', canvasSize);
  canvas.setAttribute('height', canvasSize);

  renderMap();
}

function renderMap() {
  game.font = (`${elementSize * 0.85}px verdana`);
  game.textAlign = 'end' 

  const map = maps[lvl];
  const mapRow = map.trim().replaceAll(' ', '').split('\n');
  const mapRowCol = mapRow.map( row => row.split(''));
  
  mapRowCol.forEach((row, rowI) => {
    row.forEach((col, colI) => {
      const emoji = emojis[col];
      const posX = elementSize * (colI + 1);
      const posY = elementSize * (rowI + 1);
      game.fillText(emoji, posX, posY);
      if (col === 'O') {
        //Divido todo por elementSize para que las posiciones queden definidas del 1 al 10
        initialPosition.posX = posX/elementSize;
        initialPosition.posY = posY/elementSize;
        
        if (!position.posX){
          position.posX = posX/elementSize;
          position.posY = posY/elementSize;
        }
      }
    })
  });
  game.fillText(emojis['PLAYER'], position.posX * elementSize, position.posY * elementSize);
}

function startGame() {
  seconds = defaultTime;
  isChronometerActive = true;
  position.posX = undefined;
  position.posY = undefined;
  game.clearRect(0, 0, canvasSize, canvasSize);
  renderMap();

  const chronometer = setInterval(() => {
    if (isChronometerActive) {
      seconds -= .01;
      if (seconds <= 0.009) {
        clearInterval(chronometer);
        lvlLost();
        return;
      } 
      spanTime.innerText = seconds.toFixed(2);
    } else {
      clearInterval(chronometer);
    }
  }, 10);
}

btnUp.addEventListener('click', moveUp);
btnLeft.addEventListener('click', moveLeft);
btnRight.addEventListener('click', moveRight);
btnDown.addEventListener('click', moveDown);
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
      moveUp()
      break;
    
    case 'ArrowLeft':
      moveLeft()
      break;

    case 'ArrowRight':
      moveRight()
      break;

    case 'ArrowDown':
      moveDown()
      break;
    default:
        break;
  }
})

function moveUp() {
  move('up');
}
function moveLeft() {
  move('left');
}
function moveRight() {
  move('right');
}
function moveDown() {
  move('down');
}

function clear(position) {
  const startClearX = position.posX * elementSize - elementSize;
  const startClearY = position.posY * elementSize - (elementSize * .83);
  const endClearX = elementSize;
  const endClearY = (elementSize * 1.08);
  game.clearRect(startClearX, startClearY, endClearX, endClearY);
}

function move(dir) {
  if (isGameOver) {
    restartGame();
    return;
  }
  if (!isChronometerActive){
    startGame();
  }

  const previousPosition = {
    posX: position.posX,
    posY: position.posY,
  }

  if (dir === 'up') position.posY -= 1;
  else if (dir === 'left') position.posX -= 1;
  else if (dir === 'right') position.posX += 1;
  else if (dir === 'down') position.posY += 1;
  
  if (position.posX < 1 || position.posY < 1 || position.posX > 10 || position.posY > 10) {
    position.posX = previousPosition.posX;
    position.posY = previousPosition.posY;
    return
  }

  clear(previousPosition);
  
  if (previousPosition.posX == initialPosition.posX && previousPosition.posY == initialPosition.posY) {
    game.fillText(emojis['O'], previousPosition.posX * elementSize, previousPosition.posY * elementSize)
  }
  
  const map = maps[lvl];
  const mapRow = map.trim().replaceAll(' ', '').split('\n');
  const mapRowCol = mapRow.map( row => row.split(''));
  const emoji = mapRowCol[position.posY - 1][position.posX - 1];

  if (emoji === 'X'){
    lvlLost(bombCollision= true);
    return;
  }

  if (emoji === 'I') {
    lvlUp();
    return
  }

  game.fillText(emojis['PLAYER'], position.posX * elementSize, position.posY * elementSize);
}

function lvlLost(bombCollision) {
  isChronometerActive = false;
  lives --;
  clear(position);
  showVars();

  if (lives > 0) {
    if (bombCollision) {
      game.fillText(emojis['BOMB_COLLISION'], position.posX * elementSize, position.posY * elementSize);
    }
    position.posX = initialPosition.posX;
    position.posY = initialPosition.posY;
    game.fillText(emojis['PLAYER'], position.posX * elementSize, position.posY * elementSize);

  } else {
    gameOver();
  }
}

function gameOver() {
  score += Math.round(seconds);
  game.clearRect(0, 0, canvasSize, canvasSize);
  game.fillText('YOU LOSE!!!   \n'+ emojis['GAME_OVER'], canvasSize*0.8, canvasSize*0.5 );
  isGameOver = true;
  showVars();
}

function lvlUp() {
  lvl += 1;
  score = score + (50 * lvl) + (Math.round(seconds) * (lvl + 1)) + lives * 40;
  seconds = defaultTime;
  game.clearRect(0, 0, canvasSize, canvasSize);
  position.posX = undefined;
  position.posY = undefined;
  showVars();
  
  if (lvl == maps.length) {
    game.fillText('YOU WIN!!!   \n'+ emojis['WIN'], canvasSize*0.8, canvasSize*0.5 );
    lives = 0;
    isChronometerActive = false;
    isGameOver = true;
    return
  }
  renderMap();
}

function showLives() {
  spanLives.innerText = '';
  for (let live = 0; live < lives; live++) {
    spanLives.innerText += emojis.HEART;    
  }
}

function showVars(){
  showLives();
  spanScore.innerText = score;
  if (seconds >= 0.01) {
    spanTime.innerText = seconds.toFixed(2);
  } else {
    spanTime.innerText = '0.00';
  }
}

function restartGame() {
  position.posX = undefined;
  position.posY = undefined;
  game.clearRect(0, 0, canvasSize, canvasSize);
  isGameOver = false;
  lives = 3;
  score = 0;
  lvl = 0;
  seconds = defaultTime;
  renderMap();
  showVars();
}