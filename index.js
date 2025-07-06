const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 12;
const paddleHeight = 80;
const ballRadius = 10;

const player = {
  x: 10,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  color: '#29b6f6',
  score: 0,
};

const ai = {
  x: canvas.width - paddleWidth - 10,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  color: '#ff5252',
  score: 0,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 5 * (Math.random() > 0.5 ? 1 : -1),
  vy: 3 * (Math.random() > 0.5 ? 1 : -1),
  radius: ballRadius,
  color: '#fff',
  speed: 5,
};

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
}

function drawText(text, x, y, color, size = "32px") {
  ctx.fillStyle = color;
  ctx.font = `${size} Arial`;
  ctx.fillText(text, x, y);
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.vx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
  ball.vy = (Math.random() * 4 - 2) || 2; // Randomize vertical speed, avoid 0
}

function render() {
  // Clear canvas
  drawRect(0, 0, canvas.width, canvas.height, '#222');
  // Draw center dashed line
  for (let i = 20; i < canvas.height; i += 40) {
    drawRect(canvas.width / 2 - 1, i, 2, 20, '#fff');
  }
  // Draw paddles and ball
  drawRect(player.x, player.y, player.width, player.height, player.color);
  drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
  drawCircle(ball.x, ball.y, ball.radius, ball.color);

  // Draw scores
  drawText(player.score, canvas.width / 2 - 60, 40, '#29b6f6');
  drawText(ai.score, canvas.width / 2 + 40, 40, '#ff5252');
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function update() {
  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Top/bottom collision
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
    ball.vy *= -1;
    ball.y = clamp(ball.y, ball.radius, canvas.height - ball.radius);
  }

  // Left paddle collision
  if (
    ball.x - ball.radius < player.x + player.width &&
    ball.y + ball.radius > player.y &&
    ball.y - ball.radius < player.y + player.height
  ) {
    ball.x = player.x + player.width + ball.radius; // Reposition ball to avoid sticking
    ball.vx *= -1.08; // Bounce and slightly speed up
    // Add a bit of "spin" depending on where it hits the paddle
    let hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
    ball.vy = ball.speed * hitPos;
  }

  // Right paddle collision (AI)
  if (
    ball.x + ball.radius > ai.x &&
    ball.y + ball.radius > ai.y &&
    ball.y - ball.radius < ai.y + ai.height
  ) {
    ball.x = ai.x - ball.radius; // Reposition ball
    ball.vx *= -1.08;
    let hitPos = (ball.y - (ai.y + ai.height / 2)) / (ai.height / 2);
    ball.vy = ball.speed * hitPos;
  }

  // Score update
  if (ball.x - ball.radius < 0) {
    ai.score++;
    resetBall();
  }
  if (ball.x + ball.radius > canvas.width) {
    player.score++;
    resetBall();
  }

  // Simple AI for right paddle
  let aiCenter = ai.y + ai.height / 2;
  if (aiCenter < ball.y - 15) {
    ai.y += 4;
  } else if (aiCenter > ball.y + 15) {
    ai.y -= 4;
  }
  ai.y = clamp(ai.y, 0, canvas.height - ai.height);
}

// Mouse movement for player paddle
canvas.addEventListener('mousemove', function (evt) {
  const rect = canvas.getBoundingClientRect();
  let mouseY = evt.clientY - rect.top;
  player.y = clamp(mouseY - player.height / 2, 0, canvas.height - player.height);
});

// Game loop
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

resetBall();
gameLoop();