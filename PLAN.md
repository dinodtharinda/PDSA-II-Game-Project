# Development Plan for PDSA-II Game Project

This document outlines the development plan, milestones, and task distribution for the PDSA-II Game Project.

## Game Modules Development Plan

### 1. Tic-Tac-Toe

#### Completed Features
- 5×5 game board with responsive design
- Human vs Computer gameplay
- Win detection for 4-in-a-row horizontally, vertically, and diagonally
- Two AI algorithms:
  - Minimax with alpha-beta pruning (adaptive depth based on board state)
  - Monte Carlo Tree Search with UCT selection
- Performance measurement and algorithm comparison
- Mobile-friendly UI with touch support
- Visual feedback for current player and AI thinking states

#### Technical Details
- Board representation: 5×5 null/X/O array
- Move validation: boundary and occupancy checks
- Win condition: count consecutive symbols in 8 directions
- AI move timing: performance measured in milliseconds
- UI optimizations: debounced rendering, hardware acceleration
- Error handling: input validation and graceful degradation

### 2. Traveling Salesman Problem

### 3. Tower of Hanoi

#### Completed Implementation
- Interactive disk and tower visualization with drag-and-drop support
- Support for both 3 and 4 pegs with variable disk count (5-10)
- Three algorithmic approaches implemented and compared:
  - Recursive solution for 3 pegs (optimal)
  - Iterative solution for 3 pegs
  - Frame-Stewart algorithm for 4 pegs
- Performance measurement and algorithm comparison
- Complete database integration for game sessions and metrics
- Mobile-friendly UI with touch support
- Comprehensive unit tests

#### Technical Details
- Disk representation: Array-based stack for each peg
- Move validation: Size ordering constraints
- Animation system: CSS transitions for smooth disk movement
- Performance tracking: Move count and execution time comparison
- Error handling: Complete move validation and state management
- Database integration: Game sessions, moves, and algorithm metrics stored

#### Features
- Random disk count generation (5-10)
- Interactive disk movement with click/touch support
- Real-time move validation
- Algorithm visualization
- Performance comparison between approaches
- Solution replay functionality
- Progress tracking and optimal move count display
- Support for both 3-peg and 4-peg variants

### 4. Eight Queens Puzzle

### 5. Knight's Tour Problem

## Common Components

## Technology Stack

- **Programming Language:** JavaScript (Node.js)
- **UI Framework:** HTML5, CSS3, Bootstrap 5
- **Database:** SQLite
- **Testing Framework:** Jest
- **Version Control:** Git
- **Documentation:** Markdown, Word/PDF

## Project Structure

```
PDSA-II-Game-Project/
├── README.md            # Project overview
├── PLAN.md              # Development plan and timeline
├── PROGRESS.md          # Progress tracking document
├── package.json         # Node.js project configuration
├── app.js               # Main application entry point
├── server.js            # Express server setup
│
├── public/              # Static public assets
│   ├── css/             # Stylesheets
│   ├── js/              # Client-side JavaScript
│   └── images/          # Game images and icons
│
├── src/                 # Source code
│   ├── config/          # Configuration files
│   │   └── db.js        # Database connection configuration
│   │
│   ├── models/          # Database models
│   │   ├── player.js    # Player model
│   │   ├── game.js      # Game model
│   │   └── performance.js # Performance tracking model
│   │
│   ├── controllers/     # Route controllers
│   │   ├── gameController.js # Main game controller
│   │   └── statsController.js # Statistics controller
│   │
│   ├── routes/          # Express routes
│   │   ├── api.js       # API routes
│   │   └── pages.js     # Page routes
│   │
│   ├── utils/           # Utility functions
│   │   ├── logger.js    # Logging utility
│   │   ├── validator.js # Input validation
│   │   └── timer.js     # Performance timer
│   │
│   ├── games/           # Game implementations
│   │   ├── ticTacToe/
│   │   │   ├── game.js  # Game logic
│   │   │   ├── ui.js    # UI components
│   │   │   ├── algorithms/ # Different AI approaches
│   │   │   │   ├── minimax.js
│   │   │   │   └── mcts.js # Monte Carlo Tree Search
│   │   │   └── tests/   # Unit tests
│   │   │
│   │   ├── tsp/         # Traveling Salesman Problem
│   │   │   ├── game.js
│   │   │   ├── ui.js
│   │   │   ├── algorithms/
│   │   │   │   ├── nearestNeighbor.js
│   │   │   │   ├── dynamicProgramming.js
│   │   │   │   └── geneticAlgorithm.js
│   │   │   └── tests/
│   │   │
│   │   ├── towerOfHanoi/
│   │   │   ├── game.js
│   │   │   ├── ui.js
│   │   │   ├── algorithms/
│   │   │   │   ├── recursive.js
│   │   │   │   ├── iterative.js
│   │   │   │   └── frameStewart.js
│   │   │   └── tests/
│   │   │
│   │   ├── eightQueens/
│   │   │   ├── game.js
│   │   │   ├── ui.js
│   │   │   ├── algorithms/
│   │   │   │   ├── sequential.js
│   │   │   │   └── threaded.js
│   │   │   └── tests/
│   │   │
│   │   └── knightsTour/
│   │       ├── game.js
│   │       ├── ui.js
│   │       ├── algorithms/
│   │       │   ├── backtracking.js
│   │       │   └── warnsdorff.js
│   │       └── tests/
│   │
│   └── middleware/      # Express middleware
│       ├── auth.js      # Authentication middleware
│       └── errorHandler.js # Error handling middleware
│
├── views/               # EJS or Handlebars templates
│   ├── layouts/         # Page layouts
│   ├── partials/        # Reusable template parts
│   └── pages/           # Page templates
│
├── scripts/             # Development and deployment scripts
│   ├── seed.js          # Database seeding
│   └── benchmarks.js    # Performance testing scripts
│
├── database/            # Database related files
│   ├── migrations/      # Schema migrations
│   ├── seeds/           # Seed data
│   └── game.db          # SQLite database file
│
├── tests/               # Integration tests
│   ├── integration/     # Integration tests
│   └── performance/     # Performance tests
│
└── docs/                # Documentation
    ├── individual/      # Individual reports
    ├── group/           # Group report
    ├── schemas/         # Database schemas
    └── api/             # API documentation
```

## Database Schema

### Players Table
```sql
CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Games Table
```sql
CREATE TABLE games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_type TEXT NOT NULL,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  player_id INTEGER,
  result TEXT,
  FOREIGN KEY (player_id) REFERENCES players (id)
);
```

### TicTacToe Table
```sql
CREATE TABLE tic_tac_toe (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  algorithm_type TEXT NOT NULL,
  move_time REAL NOT NULL,
  move_number INTEGER NOT NULL,
  FOREIGN KEY (game_id) REFERENCES games (id)
);
```

### TravelingSalesman Table
```sql
CREATE TABLE traveling_salesman (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  home_city TEXT NOT NULL,
  selected_cities TEXT NOT NULL,
  shortest_route TEXT NOT NULL,
  algorithm_type TEXT NOT NULL,
  execution_time REAL NOT NULL,
  FOREIGN KEY (game_id) REFERENCES games (id)
);
```

### TowerOfHanoi Table
```sql
CREATE TABLE tower_of_hanoi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  disk_count INTEGER NOT NULL,
  move_count INTEGER NOT NULL,
  move_sequence TEXT NOT NULL,
  algorithm_type TEXT NOT NULL,
  execution_time REAL NOT NULL,
  FOREIGN KEY (game_id) REFERENCES games (id)
);
```

### EightQueens Table
```sql
CREATE TABLE eight_queens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  solution TEXT NOT NULL,
  solution_number INTEGER NOT NULL,
  algorithm_type TEXT NOT NULL,
  execution_time REAL NOT NULL,
  is_identified BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (game_id) REFERENCES games (id)
);
```

### KnightsTour Table
```sql
CREATE TABLE knights_tour (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  start_position TEXT NOT NULL,
  move_sequence TEXT NOT NULL,
  algorithm_type TEXT NOT NULL,
  execution_time REAL NOT NULL,
  FOREIGN KEY (game_id) REFERENCES games (id)
);
```

## Team Responsibilities

Thathsika - Game Module 1 (Knights Tour)
Adithya - Game Module 1 (Tower of Hanoi, Knights Tour, Eight Queens)
Dinod - Game Module 2 (Tic-Tac-Toe)
Sadew - Game Module 3 (Traveling Salesman Problem)
Yasiru - Game Module 4 (Eight Queens)