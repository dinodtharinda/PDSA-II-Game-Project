import { KnightsTour } from './game.js';
import { KnightsTourUI } from './ui/index.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Knight\'s Tour gameLoader.js executing...'); // Add console log
    try {
        const game = new KnightsTour();
        const ui = new KnightsTourUI();
        await ui.initialize(game);
        console.log('Knight\'s Tour UI initialized.'); // Add console log
    } catch (error) {
        console.error('Error initializing Knight\'s Tour:', error);
    }
});
