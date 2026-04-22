const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');

const cols = 18;
const rows = 24;
let tile = 16;

let snake;
let food;
let dir;
let nextDir;
let score;
let particles;
let running = false;
let gameOver = false;

const speed = 95;
let loopId;

const best = Number(localStorage.getItem('snake-best') || 0);
bestEl.textContent = best;

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth;
  const cssHeight = cssWidth * (4 / 3);
  canvas.width = Math.floor(cssWidth * ratio);
  canvas.height = Math.floor(cssHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  tile = cssWidth / cols;
}

function newGame() {
  snake = [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];
  dir = { x: 1, y: 0 };
  nextDir = dir;
  score = 0;
  particles = [];
  gameOver = false;
  spawnFood();
  updateScore();
}

function spawnFood() {
  let valid = false;
  while (!valid) {
    food = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    };
    valid = !snake.some((s) => s.x === food.x && s.y === food.y);
  }
}

function setDirection(newDirection) {
  if (
    newDirection.x === -dir.x &&
    newDirection.y === -dir.y &&
    snake.length > 1
  ) {
    return;
  }
  nextDir = newDirection;
}

function step() {
  if (!running) return;

  dir = nextDir;
  const head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y,
  };

  const hitWall = head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows;
  const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);

  if (hitWall || hitSelf) {
    finishGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    burst(food.x, food.y, '#a9ff65');
    spawnFood();
    updateScore();
  } else {
    snake.pop();
  }

  animateParticles();
  render();
}

function burst(x, y, color) {
  for (let i = 0; i < 14; i += 1) {
    particles.push({
      x: (x + 0.5) * tile,
      y: (y + 0.5) * tile,
      vx: (Math.random() - 0.5) * 2.8,
      vy: (Math.random() - 0.5) * 2.8,
      life: 28 + Math.random() * 12,
      color,
    });
  }
}

function animateParticles() {
  particles = particles
    .map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 1 }))
    .filter((p) => p.life > 0);
}

function drawGrid() {
  const width = cols * tile;
  const height = rows * tile;

  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, '#06170b');
  bg.addColorStop(1, '#0b2a13');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#98ffb112';
  ctx.lineWidth = 1;
  for (let x = 0; x <= cols; x += 1) {
    ctx.beginPath();
    ctx.moveTo(x * tile, 0);
    ctx.lineTo(x * tile, height);
    ctx.stroke();
  }
  for (let y = 0; y <= rows; y += 1) {
    ctx.beginPath();
    ctx.moveTo(0, y * tile);
    ctx.lineTo(width, y * tile);
    ctx.stroke();
  }
}

function drawFood() {
  const fx = food.x * tile + tile / 2;
  const fy = food.y * tile + tile / 2;
  const r = tile * 0.35;

  const glow = ctx.createRadialGradient(fx, fy, r * 0.3, fx, fy, r * 1.8);
  glow.addColorStop(0, '#fff98f');
  glow.addColorStop(1, '#ffa90000');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(fx, fy, r * 1.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffc045';
  ctx.beginPath();
  ctx.arc(fx, fy, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnake() {
  snake.forEach((part, index) => {
    const x = part.x * tile;
    const y = part.y * tile;
    const radius = index === 0 ? tile * 0.26 : tile * 0.2;

    const segment = ctx.createLinearGradient(x, y, x + tile, y + tile);
    segment.addColorStop(0, index === 0 ? '#76ff89' : '#4adb68');
    segment.addColorStop(1, index === 0 ? '#1cb84b' : '#16953d');

    ctx.fillStyle = segment;
    roundRect(ctx, x + 1.5, y + 1.5, tile - 3, tile - 3, radius);

    if (index === 0) {
      ctx.fillStyle = '#052f12';
      ctx.beginPath();
      ctx.arc(x + tile * 0.32, y + tile * 0.32, tile * 0.07, 0, Math.PI * 2);
      ctx.arc(x + tile * 0.68, y + tile * 0.32, tile * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawParticles() {
  particles.forEach((p) => {
    ctx.globalAlpha = Math.min(1, p.life / 20);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function render() {
  drawGrid();
  drawFood();
  drawSnake();
  drawParticles();

  if (gameOver) {
    ctx.fillStyle = '#00000099';
    ctx.fillRect(0, 0, cols * tile, rows * tile);
    ctx.fillStyle = '#e6ffe7';
    ctx.textAlign = 'center';
    ctx.font = `700 ${tile * 1.1}px system-ui`;
    ctx.fillText('Konec hry', (cols * tile) / 2, (rows * tile) / 2);
  }
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
  context.fill();
}

function updateScore() {
  scoreEl.textContent = score;
  if (score > Number(bestEl.textContent)) {
    bestEl.textContent = score;
    localStorage.setItem('snake-best', String(score));
  }
}

function finishGame() {
  gameOver = true;
  running = false;
  clearInterval(loopId);
  overlay.classList.add('visible');
  overlay.querySelector('h2').textContent = 'Konec hry';
  overlay.querySelector('p').textContent = 'Klepni na Start a zkus to znovu.';
  render();
}

function startGame() {
  newGame();
  overlay.classList.remove('visible');
  running = true;
  render();
  clearInterval(loopId);
  loopId = setInterval(step, speed);
}

window.addEventListener('resize', () => {
  resizeCanvas();
  render();
});

window.addEventListener('keydown', (event) => {
  const map = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
  };
  if (map[event.key]) {
    event.preventDefault();
    setDirection(map[event.key]);
  }
});

document.querySelectorAll('[data-dir]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const dirMap = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };
    setDirection(dirMap[btn.dataset.dir]);
  });
});

let touchStart;
canvas.addEventListener('touchstart', (e) => {
  const touch = e.changedTouches[0];
  touchStart = { x: touch.clientX, y: touch.clientY };
});

canvas.addEventListener('touchend', (e) => {
  if (!touchStart) return;
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStart.x;
  const dy = touch.clientY - touchStart.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    setDirection(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
  } else if (Math.abs(dy) > 10) {
    setDirection(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
  }

  touchStart = null;
});

startBtn.addEventListener('click', startGame);

resizeCanvas();
newGame();
render();
