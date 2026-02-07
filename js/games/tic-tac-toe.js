// Tic-Tac-Toe Game
class TicTacToe {
    constructor(container) {
        this.container = container;
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.init();
    }

    init() {
        this.render();
        this.setupControls();
    }

    render() {
        const stats = stateManager.getGameState('ticTacToe');
        this.container.innerHTML = `
            <div class="game-header">
                <h2 class="game-title">Tic-Tac-Toe</h2>
                <div class="game-score">W: ${stats.wins || 0} | L: ${stats.losses || 0} | D: ${stats.draws || 0}</div>
            </div>
            <div class="ttt-board" id="ttt-board"></div>
            <div class="ttt-status" id="ttt-status">Player X's Turn</div>
            <button class="ttt-reset-btn">New Game</button>
            <button class="back-btn">Back to Lobby (ESC)</button>
        `;
        this.renderBoard();
    }

    renderBoard() {
        const boardEl = document.getElementById('ttt-board');
        boardEl.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'ttt-cell';
            cell.dataset.index = i;
            cell.textContent = this.board[i] || '';
            
            if (this.board[i]) {
                cell.classList.add('filled');
            }
            
            boardEl.appendChild(cell);
        }
    }

    setupControls() {
        document.getElementById('ttt-board').addEventListener('click', (e) => {
            if (e.target.classList.contains('ttt-cell')) {
                const index = parseInt(e.target.dataset.index);
                this.makeMove(index);
            }
        });

        document.querySelector('.ttt-reset-btn').addEventListener('click', () => this.reset());

        document.addEventListener('keydown', (e) => {
            if (this.container.classList.contains('hidden')) return;
            
            const numpadMap = {
                'Numpad7': 0, 'Numpad8': 1, 'Numpad9': 2,
                'Numpad4': 3, 'Numpad5': 4, 'Numpad6': 5,
                'Numpad1': 6, 'Numpad2': 7, 'Numpad3': 8
            };
            
            if (numpadMap[e.code] !== undefined) {
                this.makeMove(numpadMap[e.code]);
            }
        });
    }

    makeMove(index) {
        if (this.gameOver || this.board[index]) return;
        
        this.board[index] = this.currentPlayer;
        soundController.playClick();
        this.renderBoard();
        
        const winner = this.checkWinner();
        if (winner) {
            this.endGame(winner);
        } else if (this.board.every(cell => cell !== null)) {
            this.endGame('draw');
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            document.getElementById('ttt-status').textContent = `Player ${this.currentPlayer}'s Turn`;
            
            if (this.currentPlayer === 'O') {
                setTimeout(() => this.aiMove(), 500);
            }
        }
    }

    aiMove() {
        const empty = this.board.map((cell, i) => cell === null ? i : null).filter(i => i !== null);
        if (empty.length > 0) {
            const move = empty[Math.floor(Math.random() * empty.length)];
            this.makeMove(move);
        }
    }

    checkWinner() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (const [a, b, c] of lines) {
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.highlightWinningLine([a, b, c]);
                return this.board[a];
            }
        }
        return null;
    }

    highlightWinningLine(indices) {
        const cells = document.querySelectorAll('.ttt-cell');
        indices.forEach(i => cells[i].classList.add('winner'));
    }

    endGame(result) {
        this.gameOver = true;
        const stats = stateManager.getGameState('ticTacToe');
        
        if (result === 'X') {
            document.getElementById('ttt-status').textContent = 'You Win!';
            stats.wins = (stats.wins || 0) + 1;
            soundController.playShimmer();
        } else if (result === 'O') {
            document.getElementById('ttt-status').textContent = 'You Lose!';
            stats.losses = (stats.losses || 0) + 1;
            soundController.playGameOver();
        } else {
            document.getElementById('ttt-status').textContent = 'Draw!';
            stats.draws = (stats.draws || 0) + 1;
        }
        
        stateManager.setGameState('ticTacToe', stats);
    }

    reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.renderBoard();
        document.getElementById('ttt-status').textContent = "Player X's Turn";
        soundController.playClick();
    }
}
