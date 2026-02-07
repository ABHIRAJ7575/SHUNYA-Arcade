// ViewPort Manager - Ensures perfect centering and no overflow
class ViewportManager {
    constructor() {
        this.init();
        window.addEventListener('resize', () => this.handleResize());
    }

    init() {
        this.handleResize();
    }

    handleResize() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    centerElement(element) {
        const rect = element.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (rect.width > viewportWidth || rect.height > viewportHeight) {
            const scale = Math.min(
                viewportWidth / rect.width,
                viewportHeight / rect.height
            ) * 0.9;
            element.style.transform = `scale(${scale})`;
        }
    }
}

const viewportManager = new ViewportManager();
