# PDSA-II Game Project

This repository contains a collection of algorithmic games implemented as a fully client-side web application for the PDSA-II (Problem-solving and Data Structures & Algorithms II) coursework. Each game demonstrates different algorithmic approaches to solve classical computer science problems using JavaScript, HTML, and CSS, with data persistence handled by SQL.js in the browser.

## Table of Contents
- [Overview](#overview)
- [Game Modules](#game-modules)
  - [Tic-Tac-Toe](#tic-tac-toe)
  - [Traveling Salesman Problem](#traveling-salesman-problem)
  - [Tower of Hanoi](#tower-of-hanoi)
  - [Eight Queens Puzzle](#eight-queens-puzzle)
  - [Knight's Tour Problem](#knights-tour-problem)
- [Getting Started](#getting-started)
- [Development Guide](#development-guide)
  - [Game Development Workflow](#game-development-workflow)
  - [Implementing a Game](#implementing-a-game)
- [Architecture](#architecture)
- [Deliverables](#deliverables)
- [Evaluation Criteria](#evaluation-criteria)
- [Documentation](#documentation)

## Overview

This project implements a suite of five classical algorithmic games, each showcasing different algorithms and data structures. For each game, multiple algorithmic approaches are implemented and compared for performance and efficiency. The entire application runs in the browser, utilizing client-side routing and an in-browser SQLite database (SQL.js) for data storage and persistence via localStorage.

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

```bash
npx serve
```
Open your browser and navigate to `http://localhost:3000` to access the application.

## Development Guide

### Game Development Workflow

The project follows this general workflow for each game:

1. **Game Logic Development**: Implement the core game mechanics in the `js/games/<gameName>/game.js` file.
2. **UI Component Development**: Create the user interface in the `js/games/<gameName>/ui/index.js` file.
3. **Algorithm Implementation**: Implement required algorithms in the `js/games/<gameName>/algorithms/` directory.
4. **Client-Side API Service**: Implement database interactions in `js/games/<gameName>/services/api.js` using the core `js/db.js` module.
5. **Testing**: Add unit tests (if applicable).
6. **Validation & Exception Handling**: Add input validation and error handling in UI and service layers.

### Implementing a Game

Here's a step-by-step guide reflecting the client-side structure:

#### 1. Tic-Tac-Toe

1. Implement the 5×5 grid UI in `js/games/ticTacToe/ui/index.js`.
2. Create the game state management in `js/games/ticTacToe/game.js`.
3. Implement algorithms in `js/games/ticTacToe/algorithms/`.
4. Implement database interactions in `js/games/ticTacToe/services/api.js`.

#### 2. Traveling Salesman Problem

1. Implement the city selection UI in `js/games/tsp/ui/index.js`.
2. Create distance matrix generation in `js/games/tsp/game.js`.
3. Implement algorithms in `js/games/tsp/algorithms/`.
4. Implement database interactions in `js/games/tsp/services/api.js`.

#### 3. Tower of Hanoi

1. Create the disk and tower visualization in `js/games/towerOfHanoi/ui/index.js`.
2. Implement game mechanics in `js/games/towerOfHanoi/game.js`.
3. Implement algorithms in `js/games/towerOfHanoi/algorithms/`.
4. Implement database interactions in `js/games/towerOfHanoi/services/api.js`.

#### 4. Eight Queens Puzzle

1. Create the chessboard UI in `js/games/eightQueens/ui/index.js`.
2. Implement game logic in `js/games/eightQueens/game.js`.
3. Implement algorithms in `js/games/eightQueens/algorithms/`.
4. Implement database interactions in `js/games/eightQueens/services/api.js`.

#### 5. Knight's Tour Problem

1. Create the chessboard visualization in `js/games/knightsTour/ui/index.js`.
2. Implement game logic in `js/games/knightsTour/game.js`.
3. Implement algorithms in `js/games/knightsTour/algorithms/`.
4. Implement database interactions in `js/games/knightsTour/services/api.js`.

### Common Components To Use

- Use the client-side database module in `js/db.js`.
- Use the performance timer in `js/utils/timer.js`.
- Use the logger for debugging in `js/utils/logger.js`.
- Use the client-side router in `js/router.js`.

## Architecture

✅ The project utilizes a fully client-side architecture:
- **Frontend**: HTML, CSS, JavaScript (ES Modules)
- **Routing**: Client-side routing using the History API (`js/router.js`).
- **Database**: In-browser SQLite database using SQL.js (`js/lib/sql-wasm.js`, `js/db.js`).
- **Persistence**: Database state is persisted across sessions using browser localStorage.
- **No Server**: The application is served as static files and requires no backend server.

## Deliverables

1. **Software with Source Code** (GitHub Repository containing the client-side application).
2. **Database with Data Dump** (Exported data from the client-side SQL.js database, likely via a UI feature).
3. **Individual Reports** for each game module including:
   - Program logic explanation
   - Algorithm complexity analysis
   - Comparison of algorithmic approaches
   - Performance charts for 10 game rounds (generated from client-side data)
4. **Group Report** including:
   - UI screenshots
   - Explanation of validations and exception handling
   - Code segments for unit testing (if applicable)
   - Database structure screenshots (from `docs/SCHEMA.md`)
   - Implementation code segments (from the `js/` directory)
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
- [MEMORY.md](docs/MEMORY.md): Tracks significant current changes and decisions.
- [PROGRESS.md](docs/PROGRESS.md): Detailed progress tracking for the project.
- [PLAN.md](docs/PLAN.md): Project structure and technical details.
- [API.md](docs/API.md): Documentation for the client-side API services (`js/games/.../services/api.js`).
- [SCHEMA.md](docs/SCHEMA.md): Client-side database schema.
- [STRUCTURE.md](docs/STRUCTURE.md): Project file structure.