// Snake Game
class Snake {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.food = { x: 15, y: 15 };
        this.score = 0;
        this.gameLoop = null;
        this.gridSize = 20;
        this.tileSize = 20;
        this.speed = 200; // Start much slower
        this.minSpeed = 80; // Fastest speed
        this.init();
    }

    init() {
        this.render();
        this.setupCanvas();
        this.setupControls();
        this.start();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-header">
                <h2 class="game-title">Snake</h2>
                <div class="game-score">Score: <span id="snake-score">0</span></div>
                <div class="game-score">High: <span id="snake-high">${stateManager.getGameState('snake').highScore || 0}</span></div>
            </div>
            <canvas id="snake-canvas" width="400" height="400"></canvas>
            <div class="snake-controls">Use WASD or Arrow Keys</div>
            <button class="snake-reset-btn">New Game</button>
            <button class="back-btn">Back to Lobby (ESC)</button>
        `;
    }

    setupCanvas() {
        this.canvas = document.getElementById('snake-canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    setupControls() {
        document.querySelector('.snake-reset-btn').addEventListener('click', () => this.reset());

        document.addEventListener('keydown', (e) => {
            if (this.container.classList.contains('hidden')) return;
            
            const keyMap = {
                'ArrowUp': { x: 0, y: -1 }, 'w': { x: 0, y: -1 }, 'W': { x: 0, y: -1 },
                'ArrowDown': { x: 0, y: 1 }, 's': { x: 0, y: 1 }, 'S': { x: 0, y: 1 },
                'ArrowLeft': { x: -1, y: 0 }, 'a': { x: -1, y: 0 }, 'A': { x: -1, y: 0 },
                'ArrowRight': { x: 1, y: 0 }, 'd': { x: 1, y: 0 }, 'D': { x: 1, y: 0 }
            };
            
            const newDir = keyMap[e.key];
            if (newDir && (newDir.x !== -this.direction.x || newDir.y !== -this.direction.y)) {
                e.preventDefault();
                this.direction = newDir;
            }
        });
    }

    start() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }

    update() {
        const head = { 
            x: this.snake[0].x + this.direction.x, 
            y: this.snake[0].y + this.direction.y 
        };

        // Wall collision
        if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
            this.gameOver();
            return;
        }

        // Self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.spawnFood();
            soundController.playShimmer();
            this.updateDisplay();
            
            // Gradually increase speed every 3 points
            if (this.score % 3 === 0 && this.speed > this.minSpeed) {
                this.speed = Math.max(this.minSpeed, this.speed - 5);
                clearInterval(this.gameLoop);
                this.start();
            }
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#16213e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.snake.forEach((segment, index) => {
            const alpha = 1 - (index / this.snake.length) * 0.5;
            this.ctx.fillStyle = `rgba(78, 204, 163, ${alpha})`;
            this.ctx.fillRect(
                segment.x * this.tileSize, 
                segment.y * this.tileSize, 
                this.tileSize - 2, 
                this.tileSize - 2
            );
        });

        // Draw food
        this.ctx.fillStyle = '#f39c12';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.tileSize + this.tileSize / 2,
            this.food.y * this.tileSize + this.tileSize / 2,
            this.tileSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    spawnFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
    }

    updateDisplay() {
        document.getElementById('snake-score').textContent = this.score;
        if (stateManager.updateHighScore('snake', this.score)) {
            document.getElementById('snake-high').textContent = this.score;
        }
    }

    gameOver() {
        clearInterval(this.gameLoop);
        soundController.playGameOver();
        alert(`Game Over! Score: ${this.score}`);
    }

    reset() {
        clearInterval(this.gameLoop);
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.score = 0;
        this.speed = 200; // Reset to slow speed
        this.spawnFood();
        this.updateDisplay();
        this.start();
        soundController.playClick();
    }
}
