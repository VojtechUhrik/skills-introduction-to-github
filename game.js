const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const checkpointEl = document.getElementById("checkpoint");
const totalEl = document.getElementById("total");
const speedEl = document.getElementById("speed");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");

const route = [
  { x: 120, y: 530 },
  { x: 120, y: 430 },
  { x: 260, y: 430 },
  { x: 260, y: 290 },
  { x: 410, y: 290 },
  { x: 410, y: 170 },
  { x: 620, y: 170 },
  { x: 620, y: 340 },
  { x: 780, y: 340 },
  { x: 780, y: 130 },
  { x: 900, y: 130 }
];

const car = {
  x: route[0].x,
  y: route[0].y,
  angle: -Math.PI / 2,
  speed: 0,
  maxSpeed: 4.5,
  accel: 0.12,
  friction: 0.05,
  turnRate: 0.045,
  width: 30,
  height: 16
};

const keys = new Set();
let checkpointIndex = 1;
let score = 0;
let finished = false;
let crashed = false;

const laneWidth = 60;

const cityBlocks = [
  { x: 20, y: 20, w: 220, h: 180 },
  { x: 300, y: 40, w: 180, h: 140 },
  { x: 520, y: 30, w: 180, h: 120 },
  { x: 30, y: 250, w: 170, h: 140 },
  { x: 310, y: 350, w: 200, h: 180 },
  { x: 580, y: 430, w: 360, h: 160 },
  { x: 700, y: 20, w: 230, h: 80 }
];

function resetGame() {
  Object.assign(car, {
    x: route[0].x,
    y: route[0].y,
    angle: -Math.PI / 2,
    speed: 0
  });
  checkpointIndex = 1;
  score = 0;
  finished = false;
  crashed = false;
  statusEl.textContent = "Připrav se a vyjeď!";
  renderHud();
}

function renderHud() {
  checkpointEl.textContent = Math.min(checkpointIndex, route.length - 1);
  totalEl.textContent = route.length - 1;
  speedEl.textContent = Math.abs(car.speed * 28).toFixed(0);
  scoreEl.textContent = Math.round(score);
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const ab2 = abx * abx + aby * aby;
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / ab2));
  const cx = ax + abx * t;
  const cy = ay + aby * t;
  return Math.hypot(px - cx, py - cy);
}

function distanceFromRoute(x, y) {
  let min = Infinity;
  for (let i = 0; i < route.length - 1; i += 1) {
    const a = route[i];
    const b = route[i + 1];
    min = Math.min(min, distanceToSegment(x, y, a.x, a.y, b.x, b.y));
  }
  return min;
}

function update() {
  if (finished || crashed) return;

  const accelerating = keys.has("ArrowUp") || keys.has("w");
  const braking = keys.has("ArrowDown") || keys.has("s");
  const left = keys.has("ArrowLeft") || keys.has("a");
  const right = keys.has("ArrowRight") || keys.has("d");

  if (accelerating) car.speed += car.accel;
  if (braking) car.speed -= car.accel;
  if (!accelerating && !braking) {
    if (car.speed > 0) car.speed = Math.max(0, car.speed - car.friction);
    else if (car.speed < 0) car.speed = Math.min(0, car.speed + car.friction);
  }

  car.speed = Math.max(-2.2, Math.min(car.maxSpeed, car.speed));

  if (Math.abs(car.speed) > 0.2) {
    const steer = (left ? -1 : 0) + (right ? 1 : 0);
    car.angle += steer * car.turnRate * (car.speed / car.maxSpeed);
  }

  car.x += Math.cos(car.angle) * car.speed;
  car.y += Math.sin(car.angle) * car.speed;

  const next = route[checkpointIndex];
  if (next && Math.hypot(car.x - next.x, car.y - next.y) < 35) {
    checkpointIndex += 1;
    score += 125;
    statusEl.textContent = "Skvěle, checkpoint splněn!";
  }

  score += Math.max(0, car.speed) * 0.45;

  const offRoadDistance = distanceFromRoute(car.x, car.y);
  if (offRoadDistance > laneWidth / 2 + 12) {
    crashed = true;
    car.speed = 0;
    statusEl.textContent = "Nehoda! Vyjel jsi mimo trasu. Stiskni R pro restart.";
    statusEl.style.background = "rgb(249 115 22 / 22%)";
    statusEl.style.color = "#fed7aa";
  }

  if (checkpointIndex >= route.length) {
    finished = true;
    car.speed = 0;
    score += 500;
    statusEl.textContent = "Cíl! Perfektní jízda městem 🚗";
    statusEl.style.background = "rgb(34 197 94 / 22%)";
    statusEl.style.color = "#bbf7d0";
  }

  renderHud();
}

function drawBackground() {
  ctx.fillStyle = "#334155";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const block of cityBlocks) {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(block.x, block.y, block.w, block.h);

    ctx.fillStyle = "rgb(148 163 184 / 30%)";
    for (let x = block.x + 12; x < block.x + block.w - 10; x += 26) {
      for (let y = block.y + 10; y < block.y + block.h - 8; y += 24) {
        ctx.fillRect(x, y, 10, 12);
      }
    }
  }
}

function drawRoute() {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = laneWidth;
  ctx.beginPath();
  ctx.moveTo(route[0].x, route[0].y);
  for (const p of route.slice(1)) ctx.lineTo(p.x, p.y);
  ctx.stroke();

  ctx.setLineDash([15, 14]);
  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(route[0].x, route[0].y);
  for (const p of route.slice(1)) ctx.lineTo(p.x, p.y);
  ctx.stroke();
  ctx.setLineDash([]);

  route.forEach((point, index) => {
    if (index === 0) return;
    ctx.beginPath();
    ctx.fillStyle = index < checkpointIndex ? "#22c55e" : "#38bdf8";
    ctx.arc(point.x, point.y, 11, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawCar() {
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);

  ctx.fillStyle = crashed ? "#fb7185" : "#e11d48";
  ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(-8, -5, 16, 10);

  ctx.fillStyle = "#111827";
  ctx.fillRect(-13, -11, 7, 4);
  ctx.fillRect(6, -11, 7, 4);
  ctx.fillRect(-13, 7, 7, 4);
  ctx.fillRect(6, 7, 7, 4);

  ctx.restore();
}

function draw() {
  drawBackground();
  drawRoute();
  drawCar();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.add(key);

  if (key === "r") {
    statusEl.style.background = "rgb(56 189 248 / 15%)";
    statusEl.style.color = "#bae6fd";
    resetGame();
  }
});

window.addEventListener("keyup", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.delete(key);
});

resetGame();
loop();
