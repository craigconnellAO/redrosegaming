// Game Variables
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = false;
let gamePaused = false;

// Player paddle (left side)
const player = {
    x: 10,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100,
    dy: 0,
    speed: 6,
    color: '#00ff88'
};

// Computer paddle (right side)
const computer = {
    x: canvas.width - 20,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100,
    dy: 0,
    speed: 4.5,
    color: '#ff006e'
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 5,
    dy: 5,
    speed: 5,
    maxSpeed: 8,
    color: '#00ffff'
};

// Score
let playerScore = 0;
let computerScore = 0;

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        if (gameRunning) {
            gamePaused = !gamePaused;
            updateStatusBar();
        } else {
            startGame();
        }
    }
    
    if (e.key.toLowerCase() === 'r') {
        resetGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update status bar
function updateStatusBar() {
    const statusBar = document.getElementById('statusBar');
    if (!gameRunning) {
        statusBar.textContent = 'Press SPACE to start • Use ARROW KEYS or MOUSE to move • Press R to reset';
    } else if (gamePaused) {
        statusBar.textContent = '⏸️ PAUSED - Press SPACE to resume';
    } else {
        statusBar.textContent = '🎮 PLAYING - Press SPACE to pause • Press R to reset';
    }
}

// Start game
function startGame() {
    gameRunning = true;
    gamePaused = false;
    updateStatusBar();
    gameLoop();
}

// Reset game
function resetGame() {
    gameRunning = false;
    gamePaused = false;
    playerScore = 0;
    computerScore = 0;
    updateScore();
    resetBall();
    player.y = canvas.height / 2 - 50;
    computer.y = canvas.height / 2 - 50;
    updateStatusBar();
    draw();
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 8;
    ball.speed = 5;
}

// Update player paddle
function updatePlayer() {
    // Arrow key controls
    if (keys['arrowup'] || keys['w']) {
        player.y = Math.max(0, player.y - player.speed);
    }
    if (keys['arrowdown'] || keys['s']) {
        player.y = Math.min(canvas.height - player.height, player.y + player.speed);
    }
    
    // Mouse controls (smooth following)
    const targetY = mouseY - player.height / 2;
    player.y = Math.max(0, Math.min(canvas.height - player.height, 
                        player.y + (targetY - player.y) * 0.15));
}

// Update computer paddle with AI
function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    
    // AI follows the ball with slight imperfection for playability
    const difficulty = 0.85; // Lower = easier for player
    
    if (computerCenter < ballCenter - 35) {
        computer.y = Math.min(canvas.height - computer.height, 
                             computer.y + computer.speed * difficulty);
    } else if (computerCenter > ballCenter + 35) {
        computer.y = Math.max(0, computer.y - computer.speed * difficulty);
    }
}

// Update ball
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall collisions (top and bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }
    
    // Paddle collisions
    if (checkPaddleCollision(player)) {
        ball.dx = Math.abs(ball.dx);
        ball.x = player.x + player.width + ball.radius;
        addPaddleSpin(player);
    }
    
    if (checkPaddleCollision(computer)) {
        ball.dx = -Math.abs(ball.dx);
        ball.x = computer.x - ball.radius;
        addPaddleSpin(computer);
    }
    
    // Scoring
    if (ball.x - ball.radius < 0) {
        computerScore++;
        updateScore();
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        updateScore();
        resetBall();
    }
}

// Paddle collision detection
function checkPaddleCollision(paddle) {
    return ball.x - ball.radius < paddle.x + paddle.width &&
           ball.x + ball.radius > paddle.x &&
           ball.y - ball.radius < paddle.y + paddle.height &&
           ball.y + ball.radius > paddle.y;
}

// Add spin to ball based on paddle hit location
function addPaddleSpin(paddle) {
    const hitPos = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
    ball.dy += hitPos * 4;
    
    // Speed increase on hit (cap at maxSpeed)
    ball.speed = Math.min(ball.maxSpeed, ball.speed + 0.5);
    ball.dx *= (ball.speed / 5);
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw functions
function draw() {
    // Clear canvas with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0e27');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw paddles
    drawPaddle(player);
    drawPaddle(computer);
    
    // Draw ball
    drawBall();
}

function drawPaddle(paddle) {
    // Glow effect
    ctx.shadowColor = paddle.color;
    ctx.shadowBlur = 20;
    
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    ctx.shadowBlur = 0;
}

function drawBall() {
    // Glow effect
    ctx.shadowColor = ball.color;
    ctx.shadowBlur = 30;
    
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(ball.x - 3, ball.y - 3, ball.radius / 2, 0, Math.PI * 2);
    ctx.fill();
}

// Game loop
function gameLoop() {
    if (!gamePaused) {
        updatePlayer();
        updateComputer();
        updateBall();
    }
    
    draw();
    
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Initialize
updateStatusBar();
draw();
