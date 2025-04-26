# PDSA-II Game Project

This repository contains a collection of algorithmic games implemented as part of the PDSA-II (Problem-solving and Data Structures & Algorithms II) coursework. Each game demonstrates different algorithmic approaches to solve classical computer science problems.

## Table of Contents
- [Overview](#overview)
- [Game Modules](#game-modules)
  - [Tic-Tac-Toe](#tic-tac-toe)
  - [Traveling Salesman Problem](#traveling-salesman-problem)
  - [Tower of Hanoi](#tower-of-hanoi)
  - [Eight Queens Puzzle](#eight-queens-puzzle)
  - [Knight's Tour Problem](#knights-tour-problem)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Project](#running-the-project)
- [Development Guide](#development-guide)
  - [Game Development Workflow](#game-development-workflow)
  - [Implementing a Game](#implementing-a-game)
- [ES Modules Migration](#es-modules-migration)
- [Deliverables](#deliverables)
- [Evaluation Criteria](#evaluation-criteria)

## Overview

This project implements a suite of five classical algorithmic games, each showcasing different algorithms and data structures. For each game, multiple algorithmic approaches are implemented and compared for performance and efficiency.

## Game Modules

### Tic-Tac-Toe

A 5×5 Human vs. Computer Tic-Tac-Toe game with intelligent computer moves.

**Key Features:**
- Implementation of a 5×5 grid for gameplay
- Two different algorithmic approaches for determining optimal computer moves
- User interface for gameplay and displaying game outcomes (win/lose/draw)
- Database storage of player information and response times
- Unit testing and proper exception handling

### Traveling Salesman Problem

An implementation of the classic Traveling Salesman Problem with city distances randomized between 50-100 km.

**Key Features:**
- Random assignment of distances between cities (A-J)
- Random selection of a home city for each game round
- User interface for selecting cities to visit
- Three different algorithms for finding the shortest route
- Performance measurement and complexity analysis
- Database storage of player information, routes, and algorithm performance
- Unit testing and proper exception handling

### Tower of Hanoi

A Tower of Hanoi implementation with variable disk numbers and support for both 3 and 4 pegs.

**Key Features:**
- Random selection of disk numbers (5-10) per game round
- User interface for entering moves
- Both recursive and iterative algorithmic implementations
- Extension to 4 pegs using the Frame-Stewart algorithm
- Comparison between 3-peg and 4-peg solutions
- Performance measurement for different approaches
- Database storage of player information and algorithm performance
- Unit testing and proper exception handling

### Eight Queens Puzzle

An implementation of the Eight Queens chess puzzle with both sequential and threaded approaches.

**Key Features:**
- Sequential program implementation for finding solutions
- Threaded program implementation for finding solutions
- Performance comparison between sequential and threaded approaches
- User interface for proposing solutions
- Tracking of previously identified solutions
- Database storage of player information, solutions, and algorithm performance
- Unit testing and proper exception handling

### Knight's Tour Problem

An implementation of the Knight's Tour chess problem with random starting positions.

**Key Features:**
- Random selection of knight's starting position for each game round
- User interface for proposing move sequences
- Two different algorithmic approaches
- Database storage of player information, correct solutions, and performance metrics
- Unit testing and proper exception handling

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd game-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npm run db:setup
   ```
   or
   ```bash
   npm run db:reset
   ```

### Running the Project

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Access the application in your browser:
   ```
   http://localhost:3000
   ```

## Development Guide

### Game Development Workflow

The project follows this general workflow for each game:

1. **Game Logic Development**: Implement the core game mechanics in the `game.js` file
2. **UI Component Development**: Create the user interface in the `ui.js` file
3. **Algorithm Implementation**: Implement required algorithms in the `algorithms/` directory
4. **Testing**: Write unit tests in the `tests/` directory
5. **Database Integration**: Connect game to database to store performance metrics
6. **Validation & Exception Handling**: Add input validation and error handling

### Implementing a Game

Here's a step-by-step guide to implementing each game:

#### 1. Tic-Tac-Toe

1. Implement the 5×5 grid in `src/games/ticTacToe/ui.js`
2. Create the game state management in `src/games/ticTacToe/game.js`
3. Implement the Minimax algorithm in `src/games/ticTacToe/algorithms/minimax.js`
4. Implement the Monte Carlo Tree Search in `src/games/ticTacToe/algorithms/mcts.js`
5. Connect to the database using `src/models` to store game results
6. Add unit tests in the `tests/` directory

#### 2. Traveling Salesman Problem

1. Implement the city selection UI in `src/games/tsp/ui.js`
2. Create distance matrix generation in `src/games/tsp/game.js`
3. Implement the three algorithms:
   - Nearest Neighbor in `src/games/tsp/algorithms/nearestNeighbor.js`
   - Dynamic Programming in `src/games/tsp/algorithms/dynamicProgramming.js`
   - Genetic Algorithm in `src/games/tsp/algorithms/geneticAlgorithm.js`
4. Add database connections for storing performance metrics
5. Write unit tests for each component

#### 3. Tower of Hanoi

1. Create the disk and tower visualization in `src/games/towerOfHanoi/ui.js`
2. Implement the game mechanics in `src/games/towerOfHanoi/game.js`
3. Implement the algorithms:
   - Recursive solution in `src/games/towerOfHanoi/algorithms/recursive.js`
   - Iterative solution in `src/games/towerOfHanoi/algorithms/iterative.js`
   - Frame-Stewart algorithm for 4 pegs in `src/games/towerOfHanoi/algorithms/frameStewart.js`
4. Add performance measurement using the timer utility
5. Connect to the database for storing solutions and metrics

#### 4. Eight Queens Puzzle

1. Create the chessboard UI in `src/games/eightQueens/ui.js`
2. Implement game logic and queen placement validation in `src/games/eightQueens/game.js`
3. Implement the algorithms:
   - Sequential solution in `src/games/eightQueens/algorithms/sequential.js`
   - Threaded solution in `src/games/eightQueens/algorithms/threaded.js`
4. Add database connection for solution tracking
5. Write performance comparison tests

#### 5. Knight's Tour Problem

1. Create the chessboard visualization in `src/games/knightsTour/ui.js`
2. Implement starting position randomization in `src/games/knightsTour/game.js`
3. Implement the algorithms:
   - Backtracking in `src/games/knightsTour/algorithms/backtracking.js`
   - Warnsdorff's algorithm in `src/games/knightsTour/algorithms/warnsdorff.js`
4. Add database integration for storing performance metrics
5. Write unit tests for move validation and algorithm correctness

### Common Components To Use

- Use the database connection in `src/config/db.js`
- Use the performance timer in `src/utils/timer.js`
- Use the validation utilities in `src/utils/validator.js`
- Use the logger for debugging in `src/utils/logger.js`

## ES Modules Migration

✅ The project has been fully migrated from CommonJS to ES Modules, improving code maintainability and enabling modern JavaScript features. This migration included:

### Completed Migration
- Base project configuration with `"type": "module"` in package.json
- Vite setup for module bundling and modern development workflow
- Core utilities (Timer, Logger, Validator) migrated to ES Modules
- Database connectivity layer migrated to async ES Module patterns
- All game modules successfully migrated:
  - Knight's Tour module
  - Tower of Hanoi module
  - Eight Queens module 
  - Tic Tac Toe module
  - Traveling Salesman Problem module

### Current Focus (Post-Migration)
Now that the ES Module migration is complete, the focus has shifted to:
1. Completing database integration for all game modules
2. Performing end-to-end testing of the application
3. Optimizing performance of dynamic imports
4. Finalizing documentation and reporting

### Development with ES Modules
When developing new features or updating existing ones:
- Use `import` and `export` syntax instead of `require` and `module.exports`
- Add `.js` extensions to all import paths
- For dynamic imports, use `import()` function with async/await
- Use the getSequelize() pattern for database connections
- Follow the established patterns for dynamic algorithm loading

## Deliverables

1. **Software with Source Code** (GitHub Repository)
2. **Database with Data Dump**
3. **Individual Reports** for each game module including:
   - Program logic explanation
   - Algorithm complexity analysis
   - Comparison of algorithmic approaches
   - Performance charts for 10 game rounds
4. **Group Report** including:
   - UI screenshots
   - Explanation of validations and exception handling
   - Code segments for unit testing
   - Database structure screenshots
   - Implementation code segments
5. **Video Demonstration** of game features

## Evaluation Criteria

Each game module is worth 20 marks, split between:
- **Application & Group Report (10 marks)**
  - Implementation of algorithms and data structures
  - Implementation of required functionality
  - Unit testing, UI, and validations
  - Overall knowledge demonstrated in Q&A
- **Individual Report (10 marks)**
  - Performance measurement charts
  - Program logic explanation
  - Algorithm complexity analysis
  - Comparison of algorithmic approaches

## Documentation
- [MEMORY.md](docs/MEMORY.md): Tracks significant current changes and decisions that need immediate attention.
- [PROGRESS.md](docs/PROGRESS.md): Detailed progress tracking for the project.
- [PLAN.md](docs/PLAN.md): Project structure and technical details.
- [API.md](docs/API.md): API documentation for the project.
- [SCHEMA.md](docs/SCHEMA.md): Database schema and relationships.