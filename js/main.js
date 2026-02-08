// Main Application Controller
class ArcadeApp {
    constructor() {
        this.currentGame = null;
        this.currentGameInstance = null;
        this.init();
    }

    init() {
        this.setupLoadingScreen();
        this.setupLobby();
        this.setupGlobalControls();
    }

    setupLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('lobby').classList.remove('hidden');
        }, 3000);
    }

    setupLobby() {
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const game = card.dataset.game;
                this.startGame(game);
                soundController.playClick();
            });
        });
    }

    setupGlobalControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.returnToLobby();
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('back-btn')) {
                this.returnToLobby();
            }
        });
    }

    startGame(gameName) {
        // Hide lobby
        document.getElementById('lobby').classList.add('hidden');

        // Hide all game containers
        document.querySelectorAll('.game-container').forEach(container => {
            container.classList.add('hidden');
        });

        // Show selected game
        const container = document.getElementById(`${gameName}-game`);
        container.classList.remove('hidden');

        // Initialize game
        this.currentGame = gameName;

        switch (gameName) {
            case 'memory-match':
                this.currentGameInstance = new MemoryMatch(container);
                break;

            case 'tic-tac-toe':
                this.currentGameInstance = new TicTacToe(container);
                break;
            case 'dino':
                this.currentGameInstance = new DinoGame(container);
                break;
            case 'snake':
                this.currentGameInstance = new Snake(container);
                break;
        }
    }

    returnToLobby() {
        // Clean up current game
        if (this.currentGameInstance && this.currentGameInstance.gameLoop) {
            clearInterval(this.currentGameInstance.gameLoop);
        }

        // Hide all game containers
        document.querySelectorAll('.game-container').forEach(container => {
            container.classList.add('hidden');
            container.innerHTML = '';
        });

        // Show lobby
        document.getElementById('lobby').classList.remove('hidden');

        this.currentGame = null;
        this.currentGameInstance = null;
        soundController.playClick();
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ArcadeApp());
} else {
    new ArcadeApp();
}
