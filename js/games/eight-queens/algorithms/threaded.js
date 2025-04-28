/**
 * Eight Queens Threaded Algorithm (using Web Worker)
 */

/**
 * Solves the N-Queens problem using backtracking in a Web Worker.
 * @param {Object} options - Options object.
 * @param {number} [options.boardSize=8] - The size of the board (N).
 * @param {number} [options.maxSolutions=0] - Max solutions to find (0 for all).
 * @param {number} [options.threads] - Ignored, as we use one worker for the whole task.
 * @returns {Promise<Array<Array<Object>>>} A promise that resolves with an array of solutions.
 */
async function solve({ boardSize = 8, maxSolutions = 0 } = {}) {
    return new Promise((resolve, reject) => {
        // Note: Ensure the worker path is correct relative to the HTML file or use an absolute path.
        // Using an absolute path from the root is generally more reliable.
        const worker = new Worker('/js/games/eight-queens/algorithms/eight_queens_worker.js');

        worker.onmessage = (event) => {
            if (event.data.type === 'complete') {
                resolve(event.data.solutions);
                worker.terminate(); // Clean up the worker
            } else if (event.data.type === 'error') {
                reject(new Error(event.data.message));
                worker.terminate(); // Clean up the worker
            }
        };

        worker.onerror = (error) => {
            reject(new Error(`Worker error: ${error.message}`));
            worker.terminate(); // Clean up the worker
        };

        // Start the worker
        worker.postMessage({ boardSize, maxSolutions });
    });
}

export default solve;
