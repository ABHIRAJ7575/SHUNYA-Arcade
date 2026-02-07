// Chrome Dino Game
class DinoGame {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.dino = { x: 50, y: 0, width: 40, height: 50, velocityY: 0, jumping: false };
        this.obstacles = [];
        this.clouds = [];
        this.score = 0;
        this.gameSpeed = 5;
        this.gameOver = false;
        this.groundY = 300;
        this.gravity = 0.6;
        this.jumpPower = -12;
        this.doubleJumpPower = -15;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        this.gameLoop = null;
        this.lastObstacleSpawn = 0;
        this.minObstacleGap = 100; // Minimum frames between obstacles
        this.frameCount = 0;
        this.init();
    }

    init() {
        this.render();
        this.setupCanvas();
        this.setupControls();
        this.dino.y = this.groundY - this.dino.height;
        this.start();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-header">
                <h2 class="game-title">Dino Run</h2>
                <div class="game-score">Score: <span id="dino-score">0</span></div>
                <div class="game-score">High: <span id="dino-high">${stateManager.getGameState('dino').highScore || 0}</span></div>
            </div>
            <canvas id="dino-canvas" width="600" height="350"></canvas>
            <div class="dino-controls">Press SPACE to Jump | Double-tap SPACE for Super Jump!</div>
            <button class="dino-reset-btn">New Game</button>
            <button class="back-btn">Back to Lobby (ESC)</button>
        `;
    }

    setupCanvas() {
        this.canvas = document.getElementById('dino-canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    setupControls() {
        document.querySelector('.dino-reset-btn').addEventListener('click', () => this.reset());

        const jump = () => {
            if (this.gameOver) {
                this.reset();
                return;
            }

            // First jump - from ground
            if (!this.dino.jumping) {
                this.dino.velocityY = this.jumpPower;
                this.dino.jumping = true;
                this.canDoubleJump = true;
                this.hasDoubleJumped = false;
                soundController.playClick();
            }
            // Double jump - while in air
            else if (this.canDoubleJump && !this.hasDoubleJumped && this.dino.velocityY > -5) {
                this.dino.velocityY = this.doubleJumpPower;
                this.hasDoubleJumped = true;
                this.canDoubleJump = false;
                soundController.playShimmer();
            }
        };

        document.addEventListener('keydown', (e) => {
            if (this.container.classList.contains('hidden')) return;
            if (e.code === 'Space') {
                e.preventDefault();
                jump();
            }
        });

        this.canvas.addEventListener('click', jump);
    }

    start() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), 1000 / 60);
    }

    update() {
        if (this.gameOver) return;

        this.frameCount++;

        // Update dino
        this.dino.velocityY += this.gravity;
        this.dino.y += this.dino.velocityY;

        if (this.dino.y >= this.groundY - this.dino.height) {
            this.dino.y = this.groundY - this.dino.height;
            this.dino.velocityY = 0;
            this.dino.jumping = false;
            this.canDoubleJump = false;
            this.hasDoubleJumped = false;
        }

        // Spawn clouds
        if (Math.random() < 0.01) {
            this.clouds.push({
                x: this.canvas.width,
                y: 50 + Math.random() * 100,
                width: 40 + Math.random() * 20,
                speed: 1 + Math.random()
            });
        }

        // Update clouds
        this.clouds.forEach((cloud, index) => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.width < 0) {
                this.clouds.splice(index, 1);
            }
        });

        // Spawn obstacles with proper spacing
        const framesSinceLastObstacle = this.frameCount - this.lastObstacleSpawn;
        const shouldSpawn = framesSinceLastObstacle > this.minObstacleGap && Math.random() < 0.015;
        
        if (shouldSpawn && (this.obstacles.length === 0 || this.obstacles[this.obstacles.length - 1].x < this.canvas.width - 200)) {
            this.obstacles.push({
                x: this.canvas.width,
                y: this.groundY - 30,
                width: 20,
                height: 30
            });
            this.lastObstacleSpawn = this.frameCount;
        }

        // Update obstacles
        this.obstacles.forEach((obs, index) => {
            obs.x -= this.gameSpeed;
            
            // Remove off-screen obstacles
            if (obs.x + obs.width < 0) {
                this.obstacles.splice(index, 1);
                this.score += 10;
                this.updateDisplay();
            }

            // Collision detection
            if (this.checkCollision(this.dino, obs)) {
                this.endGame();
            }
        });

        // Gradually increase difficulty
        if (this.score % 100 === 0 && this.score > 0) {
            this.gameSpeed = Math.min(10, this.gameSpeed + 0.1);
            this.minObstacleGap = Math.max(60, this.minObstacleGap - 2);
        }

        this.draw();
    }

    checkCollision(dino, obs) {
        return dino.x < obs.x + obs.width &&
               dino.x + dino.width > obs.x &&
               dino.y < obs.y + obs.height &&
               dino.y + dino.height > obs.y;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#16213e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw clouds
        this.ctx.fillStyle = 'rgba(234, 234, 234, 0.3)';
        this.clouds.forEach(cloud => {
            this.ctx.fillRect(cloud.x, cloud.y, cloud.width, 15);
            this.ctx.fillRect(cloud.x + 10, cloud.y - 8, cloud.width - 20, 15);
        });

        // Draw ground
        this.ctx.fillStyle = '#4ecca3';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, 2);

        // Draw dino
        this.ctx.fillStyle = '#4ecca3';
        this.ctx.fillRect(this.dino.x, this.dino.y, this.dino.width, this.dino.height);
        
        // Dino eye
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(this.dino.x + 30, this.dino.y + 10, 5, 5);

        // Double jump indicator
        if (this.canDoubleJump && !this.hasDoubleJumped) {
            this.ctx.fillStyle = '#f39c12';
            this.ctx.beginPath();
            this.ctx.arc(this.dino.x + 20, this.dino.y - 10, 5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Pulsing effect
            const pulse = Math.sin(Date.now() / 100) * 2 + 5;
            this.ctx.strokeStyle = 'rgba(243, 156, 18, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(this.dino.x + 20, this.dino.y - 10, pulse, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Draw obstacles
        this.ctx.fillStyle = '#e74c3c';
        this.obstacles.forEach(obs => {
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        });

        // Draw game over
        if (this.gameOver) {
            this.ctx.fillStyle = '#eaeaea';
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '20px Arial';
            this.ctx.fillText('Click or Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }

    updateDisplay() {
        document.getElementById('dino-score').textContent = this.score;
        if (stateManager.updateHighScore('dino', this.score)) {
            document.getElementById('dino-high').textContent = this.score;
        }
    }

    endGame() {
        this.gameOver = true;
        soundController.playGameOver();
    }

    reset() {
        this.dino = { x: 50, y: this.groundY - 50, width: 40, height: 50, velocityY: 0, jumping: false };
        this.obstacles = [];
        this.clouds = [];
        this.score = 0;
        this.gameSpeed = 5;
        this.gameOver = false;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        this.frameCount = 0;
        this.lastObstacleSpawn = 0;
        this.minObstacleGap = 100;
        this.updateDisplay();
        soundController.playClick();
    }
}
