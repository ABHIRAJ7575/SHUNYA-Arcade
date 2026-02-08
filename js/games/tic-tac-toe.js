// Tic-Tac-Toe Game (Local PvP)
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
        const stats = stateManager.getGameState('ticTacToePvP');
        this.container.innerHTML = `
            <div class="game-header">
                <h2 class="game-title">Tic-Tac-Toe <span style="font-size: 1rem; color: var(--text-secondary);">(PvP)</span></h2>
                <div class="game-score">X Wins: ${stats.xWins || 0} | O Wins: ${stats.oWins || 0} | Draws: ${stats.draws || 0}</div>
            </div>
            <div class="ttt-board" id="ttt-board"></div>
            <div class="ttt-status" id="ttt-status">
                Current Turn: <span class="player-indicator player-x">Player X</span>
            </div>
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

            if (this.board[i]) {
                cell.textContent = this.board[i];
                cell.classList.add('filled');
                cell.classList.add(this.board[i] === 'X' ? 'cell-x' : 'cell-o');
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

        // 1. Update Board State
        this.board[index] = this.currentPlayer;
        soundController.playClick();
        this.renderBoard();

        // 2. Check Win/Draw
        const winner = this.checkWinner();
        if (winner) {
            this.endGame(winner);
        } else if (this.board.every(cell => cell !== null)) {
            this.endGame('draw');
        } else {
            // 3. Switch Turn
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateStatus();
        }
    }

    updateStatus() {
        const statusEl = document.getElementById('ttt-status');
        const playerClass = this.currentPlayer === 'X' ? 'player-x' : 'player-o';
        const playerName = `Player ${this.currentPlayer}`;

        statusEl.innerHTML = `Current Turn: <span class="player-indicator ${playerClass}">${playerName}</span>`;
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
        const stats = stateManager.getGameState('ticTacToePvP') || { xWins: 0, oWins: 0, draws: 0 };
        const statusEl = document.getElementById('ttt-status');

        if (result === 'X') {
            statusEl.innerHTML = '<span class="player-indicator player-x">Player X Wins!</span>';
            stats.xWins = (stats.xWins || 0) + 1;
            soundController.playShimmer();
        } else if (result === 'O') {
            statusEl.innerHTML = '<span class="player-indicator player-o">Player O Wins!</span>';
            stats.oWins = (stats.oWins || 0) + 1;
            soundController.playShimmer();
        } else {
            statusEl.textContent = 'Draw!';
            stats.draws = (stats.draws || 0) + 1;
        }

        stateManager.setGameState('ticTacToePvP', stats);

        // Update score display
        document.querySelector('.game-score').textContent = `X Wins: ${stats.xWins || 0} | O Wins: ${stats.oWins || 0} | Draws: ${stats.draws || 0}`;
    }

    reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X'; // X starts
        this.gameOver = false;
        this.renderBoard();
        this.updateStatus();
        soundController.playClick();
    }
}
