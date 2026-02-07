// Whack-a-Mole Game
class WhackAMole {
    constructor(container) {
        this.container = container;
        this.score = 0;
        this.timeLeft = 30;
        this.isPlaying = false;
        this.moleTimer = null;
        this.countdownTimer = null;
        this.activeMole = null;
        this.moleSpeed = 1000;
        this.init();
    }

    init() {
        this.render();
        const saved = stateManager.getGameState('whackAMole');
        if (saved.highScore) {
            document.getElementById('wam-high').textContent = saved.highScore;
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="game-header">
                <h2 class="game-title">Whack-a-Mole 🔨</h2>
                <div class="game-subtitle">Test Your Reflexes!</div>
                <div class="game-score">Score: <span id="wam-score">0</span></div>
                <div class="game-score">Time: <span id="wam-time">30</span>s</div>
                <div class="game-score">Best: <span id="wam-high">${stateManager.getGameState('whackAMole').highScore || 0}</span></div>
                <div class="game-hint">💡 Click the moles before they hide!</div>
            </div>
            <div class="wam-container">
                <div class="wam-grid" id="wam-grid">
                    ${this.createHoles()}
                </div>
            </div>
            <button class="wam-start-btn" id="wam-start">Start Game</button>
            <button class="back-btn">Back to Lobby (ESC)</button>
        `;
        
        document.getElementById('wam-start').addEventListener('click', () => {
            this.startGame();
            soundController.playClick();
        });

        this.setupHoleListeners();
    }

    createHoles() {
        let html = '';
        for (let i = 0; i < 9; i++) {
            html += `
                <div class="wam-hole" data-index="${i}">
                    <div class="wam-mole">🐹</div>
                </div>
            `;
        }
        return html;
    }

    setupHoleListeners() {
        document.querySelectorAll('.wam-hole').forEach(hole => {
            hole.addEventListener('click', () => this.whackMole(hole));
        });
    }

    startGame() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.score = 0;
        this.timeLeft = 30;
        this.moleSpeed = 1000;
        
        document.getElementById('wam-score').textContent = '0';
        document.getElementById('wam-time').textContent = '30';
        document.getElementById('wam-start').textContent = 'Playing...';
        document.getElementById('wam-start').disabled = true;
        
        // Remove all active moles
        document.querySelectorAll('.wam-hole').forEach(hole => {
            hole.classList.remove('active');
        });
        
        this.startCountdown();
        this.showMole();
    }

    startCountdown() {
        this.countdownTimer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('wam-time').textContent = this.timeLeft;
            
            // Speed up as time goes on
            if (this.timeLeft === 20) this.moleSpeed = 800;
            if (this.timeLeft === 10) this.moleSpeed = 600;
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    showMole() {
        if (!this.isPlaying) return;
        
        // Hide previous mole
        if (this.activeMole) {
            this.activeMole.classList.remove('active');
        }
        
        // Show random mole
        const holes = document.querySelectorAll('.wam-hole');
        const randomIndex = Math.floor(Math.random() * holes.length);
        this.activeMole = holes[randomIndex];
        this.activeMole.classList.add('active');
        
        // Schedule next mole
        this.moleTimer = setTimeout(() => {
            if (this.activeMole) {
                this.activeMole.classList.remove('active');
            }
            this.showMole();
        }, this.moleSpeed);
    }

    whackMole(hole) {
        if (!this.isPlaying) return;
        if (!hole.classList.contains('active')) return;
        
        // Hit!
        hole.classList.remove('active');
        hole.classList.add('whacked');
        
        this.score += 10;
        document.getElementById('wam-score').textContent = this.score;
        
        soundController.playClick();
        
        // Create particle effect
        if (window.particleSystem) {
            const rect = hole.getBoundingClientRect();
            particleSystem.createBurst(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                '#ffd93d',
                20
            );
        }
        
        // Remove whacked class after animation
        setTimeout(() => {
            hole.classList.remove('whacked');
        }, 200);
        
        // Show next mole immediately
        clearTimeout(this.moleTimer);
        this.showMole();
    }

    endGame() {
        this.isPlaying = false;
        clearInterval(this.countdownTimer);
        clearTimeout(this.moleTimer);
        
        if (this.activeMole) {
            this.activeMole.classList.remove('active');
        }
        
        document.getElementById('wam-start').textContent = 'Start Game';
        document.getElementById('wam-start').disabled = false;
        
        // Check high score
        const saved = stateManager.getGameState('whackAMole');
        const isNewRecord = !saved.highScore || this.score > saved.highScore;
        
        if (isNewRecord && this.score > 0) {
            stateManager.setGameState('whackAMole', { highScore: this.score });
            document.getElementById('wam-high').textContent = this.score;
            alert(`🎉 NEW RECORD! Score: ${this.score}`);
        } else if (this.score > 0) {
            alert(`Game Over! Score: ${this.score}\nBest: ${saved.highScore}`);
        }
        
        soundController.playShimmer();
    }
}
