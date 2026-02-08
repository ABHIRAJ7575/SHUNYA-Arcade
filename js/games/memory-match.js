class MemoryMatch {
    constructor(container) {
        this.container = container;
        this.cards = [];
        this.hasFlippedCard = false;
        this.lockBoard = false;
        this.firstCard = null;
        this.secondCard = null;
        this.matchedPairs = 0;
        this.startTime = null;
        this.timer = null;

        // Pool of 24 unique icons/emojis
        this.allSymbols = [
            '⚡', '🔥', '💧', '💎', '🌙', '☀️', '⭐', '🪐',
            '🍎', '🍒', '🍇', '🍉', '🍕', '🍔', '🍟', '🍦',
            '⚽', '🏀', '🏈', '🎾', '🚗', '🚀', '🚁', '🚂'
        ];

        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="mm-container">
                <div class="game-header">
                    <h2 class="game-title">Memory Match</h2>
                    <div class="game-stats">
                        <span class="game-score">Time: <span id="memory-timer">0</span>s</span>
                        <span class="game-score" style="margin-left: 20px">Best: <span id="memory-best">--</span>s</span>
                    </div>
                </div>
                <div class="mm-grid"></div>
                <button class="back-btn">Back to Lobby</button>
            </div>
            
            <div id="victory-overlay" class="victory-overlay hidden" style="position: absolute; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 100;">
                <div class="victory-content" style="text-align: center; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); padding: 3rem; border-radius: 20px; border: 2px solid var(--success);">
                    <h1 class="arcade-title" style="font-size: 3rem; margin-bottom: 1rem;">Victory!</h1>
                    <p style="font-size: 1.5rem; margin-bottom: 2rem;">Time: <span id="final-time" style="color: var(--success); font-weight: bold;">0</span>s</p>
                    <button id="restart-btn" class="mm-reset-btn">Play Again</button>
                </div>
            </div>
        `;

        this.grid = this.container.querySelector('.mm-grid');
        this.timerDisplay = this.container.querySelector('#memory-timer');
        this.bestTimeDisplay = this.container.querySelector('#memory-best');

        const bestTime = localStorage.getItem('memory-best-time');
        if (bestTime) this.bestTimeDisplay.textContent = bestTime;

        this.container.querySelector('#restart-btn').addEventListener('click', () => {
            this.resetGame();
        });

        this.setupGame();
    }

    setupGame() {
        // Randomly select 8 icons from the pool of 24
        const selectedSymbols = this.allSymbols
            .sort(() => 0.5 - Math.random())
            .slice(0, 8);

        // Create pairs
        const deck = [...selectedSymbols, ...selectedSymbols];

        // Fisher-Yates Shuffle the deck
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        this.grid.innerHTML = '';
        deck.forEach(symbol => {
            const card = document.createElement('div');
            card.classList.add('mm-card');
            card.dataset.symbol = symbol;

            // Structure for 3D flip (Outer > Inner > Front/Back)
            card.innerHTML = `
                <div class="mm-card-inner">
                    <div class="mm-card-front"></div>
                    <div class="mm-card-back">${symbol}</div>
                </div>
            `;

            card.addEventListener('click', () => this.flipCard(card));
            this.grid.appendChild(card);
        });

        this.startTimer();
    }

    startTimer() {
        this.startTime = Date.now();
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.timerDisplay.textContent = elapsed;
        }, 1000);
    }

    flipCard(card) {
        if (this.lockBoard) return;
        if (card === this.firstCard) return; // Prevent double clicking same card
        if (card.classList.contains('matched')) return; // Ignore matched cards

        card.classList.add('flipped');

        if (!this.hasFlippedCard) {
            this.hasFlippedCard = true;
            this.firstCard = card;
            return;
        }

        this.secondCard = card;
        this.checkForMatch();
    }

    checkForMatch() {
        let isMatch = this.firstCard.dataset.symbol === this.secondCard.dataset.symbol;

        isMatch ? this.disableCards() : this.unflipCards();
    }

    disableCards() {
        this.lockBoard = true; // Lock briefly to show animation safely

        // Wait for flip animation to finish slightly before showing match effect
        setTimeout(() => {
            this.firstCard.classList.add('matched');
            this.secondCard.classList.add('matched');

            // Green Glow Pulse (handled by CSS .matched animation)
            // But we can add a specific class for the "pulse" if needed, 
            // current CSS .matched has matchPulse animation.

            this.resetBoard();
            this.matchedPairs++;

            if (this.matchedPairs === 8) {
                this.endGame();
            }
        }, 500);
    }

    unflipCards() {
        this.lockBoard = true;

        // Add "Red Shake" effect
        setTimeout(() => {
            this.firstCard.classList.add('shake-mismatch');
            this.secondCard.classList.add('shake-mismatch');
        }, 400);

        setTimeout(() => {
            this.firstCard.classList.remove('flipped', 'shake-mismatch');
            this.secondCard.classList.remove('flipped', 'shake-mismatch');
            this.resetBoard();
        }, 1200);
    }

    resetBoard() {
        [this.hasFlippedCard, this.lockBoard] = [false, false];
        [this.firstCard, this.secondCard] = [null, null];
    }

    endGame() {
        clearInterval(this.timer);
        const finalTime = this.timerDisplay.textContent;
        this.container.querySelector('#final-time').textContent = finalTime;

        const bestTime = localStorage.getItem('memory-best-time');
        if (!bestTime || parseInt(finalTime) < parseInt(bestTime)) {
            localStorage.setItem('memory-best-time', finalTime);
            this.bestTimeDisplay.textContent = finalTime;
        }

        // Show victory overlay
        const overlay = this.container.querySelector('#victory-overlay');
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex'; // Ensure flex display
    }

    resetGame() {
        const overlay = this.container.querySelector('#victory-overlay');
        overlay.classList.add('hidden');
        overlay.style.display = 'none';

        this.matchedPairs = 0;
        clearInterval(this.timer);
        this.timerDisplay.textContent = '0';
        this.resetBoard();
        this.setupGame();
    }
}
