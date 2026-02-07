// State Manager - localStorage persistence
class StateManager {
    constructor() {
        this.storageKey = 'shunya_arcade_state';
        this.state = this.loadState();
    }

    loadState() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : this.getDefaultState();
        } catch (e) {
            console.warn('Failed to load state:', e);
            return this.getDefaultState();
        }
    }

    getDefaultState() {
        return {
            memoryMatch: { highScore: 0 },
            ticTacToe: { wins: 0, losses: 0, draws: 0 },
            dino: { highScore: 0 },
            snake: { highScore: 0 }
        };
    }

    saveState() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        } catch (e) {
            console.warn('Failed to save state:', e);
        }
    }

    getGameState(game) {
        return this.state[game] || {};
    }

    setGameState(game, data) {
        this.state[game] = { ...this.state[game], ...data };
        this.saveState();
    }

    updateHighScore(game, score) {
        if (score > (this.state[game].highScore || 0)) {
            this.state[game].highScore = score;
            this.saveState();
            return true;
        }
        return false;
    }
}

const stateManager = new StateManager();
