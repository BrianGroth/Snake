const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let direction = null; // No direction at start
let food = { x: 5, y: 5 };
let score = 0;
let speed = 200;
let level = 1;
let obstacles = [];
let gameInterval;
let isGameOver = false;
let hasStarted = false;

document.addEventListener("keydown", keyDown);
drawGame(); // Initial draw before game starts

function startGameLoop() {
  if (!gameInterval) {
    gameInterval = setInterval(gameLoop, speed);
  }
}

function keyDown(e) {
  if (isGameOver) return;

  switch (e.key) {
    case "ArrowUp":
      if (!direction || direction.y === 0) direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (!direction || direction.y === 0) direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (!direction || direction.x === 0) direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (!direction || direction.x === 0) direction = { x: 1, y: 0 };
      break;
  }

  if (!hasStarted && direction) {
    hasStarted = true;
    placeFood();
    generateObstacles();
    startGameLoop();
  }
}

function gameLoop() {
  if (!direction || isGameOver) return;

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (
    head.x < 0 || head.x >= tileCount ||
    head.y < 0 || head.y >= tileCount ||
    snake.some(s => s.x === head.x && s.y === head.y) ||
    obstacles.some(o => o.x === head.x && o.y === head.y)
  ) {
    isGameOver = true;
    clearInterval(gameInterval);
    drawGame(true);
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById("score").textContent = `Score: ${score}`;
    placeFood();
    if (score % 5 === 0) {
      level++;
      speed = Math.max(50, speed - 20);
      clearInterval(gameInterval);
      generateObstacles();
      gameInterval = setInterval(gameLoop, speed);
    }
  } else {
    snake.pop();
  }

  drawGame();
}

function drawGame(showGameOver = false) {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  obstacles.forEach(o => {
    ctx.fillStyle = "#666";
    ctx.fillRect(o.x * gridSize, o.y * gridSize, gridSize, gridSize);
  });

  snake.forEach((segment, i) => {
    const hue = (i * 15 + score * 5) % 360;
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.beginPath();
    ctx.roundRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize, 6);
    ctx.fill();
  });

  if (hasStarted && !isGameOver) {
    const gradient = ctx.createRadialGradient(
      food.x * gridSize + 10,
      food.y * gridSize + 10,
      2,
      food.x * gridSize + 10,
      food.y * gridSize + 10,
      10
    );
    gradient.addColorStop(0, "#ff4");
    gradient.addColorStop(1, "#f00");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(food.x * gridSize + 10, food.y * gridSize + 10, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  if (showGameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 5);
    ctx.font = "20px sans-serif";
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 25);
  }

  if (!hasStarted) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, canvas.height / 2 - 60, canvas.width, 120);

    ctx.fillStyle = "#fff";
    ctx.font = "20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Press an arrow key to start", canvas.width / 2, canvas.height / 2);
  }
}

function placeFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (
    snake.some(s => s.x === newFood.x && s.y === newFood.y) ||
    obstacles.some(o => o.x === newFood.x && o.y === newFood.y)
  );
  food = newFood;
}

function generateObstacles() {
  const num = Math.min(level * 3, 30);
  obstacles = [];
  while (obstacles.length < num) {
    const o = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
    const overlap = snake.some(s => s.x === o.x && s.y === o.y) ||
                    (food && food.x === o.x && food.y === o.y) ||
                    obstacles.some(existing => existing.x === o.x && existing.y === o.y);
    if (!overlap) obstacles.push(o);
  }
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
};
