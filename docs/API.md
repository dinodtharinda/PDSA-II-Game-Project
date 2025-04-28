# Client-Side Service API Documentation

Last Updated: April 29, 2025

This document describes the functions provided by the client-side API services located in `js/games/*/services/api.js`. These services interact with the in-browser SQL.js database via the `js/db.js` module.

## Core Database Module (`js/db.js`)

Provides low-level database interaction functions like `initDb`, `execQuery`, `getDb`, `saveDb`, `exportDb`, etc. The game-specific services use this module.

## Common Service Patterns

Each game-specific service (`js/games/*/services/api.js`) typically exports functions for:

-   **`createGameRecord(settings, playerId = null)`**: Creates a new entry in the `games` table and potentially a game-specific table.
    -   `settings`: An object containing game-specific configuration (e.g., board size, disk count).
    -   Returns: The ID of the created game record.
-   **`saveAlgorithmPerformance(gameId, algorithmName, executionTime, solutionFound = true, details = {})`**: Records the performance of an algorithm run.
    -   `gameId`: The ID of the game record.
    -   `algorithmName`: Name of the algorithm used.
    -   `executionTime`: Time taken in milliseconds.
    -   `solutionFound`: Boolean indicating if a solution was found.
    -   `details`: Optional game-specific details about the run.
-   **`endGame(gameId, status, finalState = {})`**: Updates the main game record with completion status and end time.
    -   `gameId`: The ID of the game record.
    -   `status`: e.g., 'completed', 'abandoned'.
    -   `finalState`: Optional game-specific final state data.
-   **`getStats()`**: Retrieves aggregated statistics for the specific game type.
    -   Returns: An object containing statistics (e.g., total games, average times, algorithm comparisons).
-   **Game-Specific Functions**: Additional functions tailored to the game's needs (e.g., `validateMove`, `saveSolution`).

## Game-Specific Service Functions

*(Note: This section provides examples. Refer to the actual `api.js` files within each `js/games/*/services/` directory for the definitive list of exported functions and their parameters.)*

### Knight's Tour (`js/games/knightsTour/services/api.js`)

-   `createGameRecord(settings, playerId = null)`: Creates game record with board size, start position.
-   `saveAlgorithmPerformance(...)`: Saves performance data.
-   `endGame(gameId, completed, moveSequence)`: Saves completion status and the final move sequence.
-   `getStats()`: Retrieves stats like completion rate, average time per algorithm.

### Tower of Hanoi (`js/games/towerOfHanoi/services/api.js`)

-   `createGameRecord(settings, playerId = null)`: Creates game record with disk and peg count.
-   `saveAlgorithmPerformance(...)`: Saves performance data.
-   `endGame(gameId, status, moveCount)`: Saves completion status and total moves.
-   `getStats()`: Retrieves stats comparing algorithms by disk/peg count.
-   `validateMove(...)`: (Potentially, or handled purely in UI/game logic).

### Tic Tac Toe (`js/games/ticTacToe/services/api.js`)

-   `createGameRecord(settings, playerId = null)`: Creates game record with board size.
-   `saveAlgorithmPerformance(...)`: Saves AI move calculation time.
-   `endGame(gameId, status, winner, moveCount)`: Saves winner and move count.
-   `getStats()`: Retrieves stats on win/loss rates, algorithm performance.

### Traveling Salesman Problem (`js/games/tsp/services/api.js`)

-   `createGameRecord(settings, playerId = null)`: Creates game record with city/distance data.
-   `saveAlgorithmPerformance(...)`: Saves route calculation time and distance found.
-   `endGame(gameId, status, path, totalDistance)`: Saves the final path and distance.
-   `getStats()`: Retrieves stats comparing algorithm solution quality and time.

### Eight Queens (`js/games/eightQueens/services/api.js`)

-   `createGameRecord(settings, playerId = null)`: Creates game record.
-   `saveAlgorithmPerformance(...)`: Saves solution finding time (distinguishing sequential/threaded if applicable client-side).
-   `saveSolution(gameId, solution, algorithmType)`: Saves a found valid solution.
-   `isSolutionAlreadyFound(solution)`: Checks if a specific solution is already in the database.
-   `getStats()`: Retrieves stats on solutions found, algorithm comparison.

## Authentication & User Management

Since the migration to a fully client-side application, traditional user authentication (login/register) via API endpoints is **no longer applicable**. User identification might be handled simply (e.g., prompting for a name stored in localStorage) or removed entirely, depending on how the project requirements are adapted for the client-side context. The `Players` table might store locally entered player names.