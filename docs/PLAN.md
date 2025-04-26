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

#### Completed Features
- Random distance matrix generation (50-100 km between cities A-J)
- Random home city selection for each game round
- Interactive city selection UI with visual feedback
- Three algorithmic approaches implemented and compared:
  - Nearest Neighbor algorithm (greedy approach)
  - Dynamic Programming solution (exact optimal solution)
  - Genetic Algorithm implementation (population-based approximation)
- Performance comparison between algorithms with detailed metrics
- City visualization with route display
- Mobile-friendly UI with touch support

#### Technical Details
- Distance representation: 10×10 matrix (cities A-J)
- Random generation: Distances between 50-100 km, symmetric matrix
- Path validation: Complete circuit validation including home city return
- Algorithms:
  - Nearest Neighbor: O(n²) greedy approach
  - Dynamic Programming: O(n²2ⁿ) Held-Karp algorithm
  - Genetic Algorithm: Population-based with crossover and mutation
- Performance tracking: Execution time and solution quality comparison
- UI: SVG-based city map with path animation
- Error handling: Input validation with user feedback

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

#### Completed Implementation
- Interactive chessboard visualization with queen placement functionality
- Solution verification with threat detection and visual feedback
- Two algorithmic approaches implemented and compared:
  - Sequential solution finder (single-threaded)
  - Multi-threaded solution with configurable thread count
- Performance comparison between sequential and threaded approaches
- Solution tracking with storage and display of all valid configurations
- Complete game session management
- Mobile-friendly UI with touch support

#### Technical Details
- Board representation: 8×8 boolean array for queen placement
- Solution verification: Row, column, and diagonal checking
- Threading model: Task-based parallelism with shared result collection
- Performance tracking: Execution time and thread utilization metrics
- UI components: Drag-and-drop queen placement with validation
- Animation system: CSS transitions for queen placement and removal
- Error handling: Complete state validation with user feedback

### 5. Knight's Tour Problem

#### Completed Implementation
- Interactive chessboard visualization with coordinate labeling and move indicators
- Support for variable board sizes (5x5, 6x6, 7x7, 8x8)
- Two algorithmic approaches fully implemented and compared:
  - Backtracking algorithm with progress reporting
  - Warnsdorff's heuristic algorithm for optimized solution
- Performance measurement with detailed metrics display
- Client-side implementation with placeholders for database integration
- Complete move validation and visualization
- Configurable animation speed for solution playback
- Random start position with reset to same position functionality
- UI components for algorithm selection and board size control

#### Technical Details
- Board representation: 2D array with null/number values
- Knight move validation: L-shape movement constraints and boundary checks
- Solution visualization: Animated replay of discovered knight's tour 
- Performance tracking: Move count and execution time comparison
- Tour completion detection: Full board visitation check
- Move handling: Click-based interface with valid move highlighting
- Algebraic notation: Chess-standard notation (e.g., "e4") for position tracking

#### Features
- Random starting position or manual position selection
- Interactive knight movement with valid move highlighting
- Real-time move validation and game state tracking
- Algorithm visualization with step-by-step replay
- Performance comparison between backtracking and Warnsdorff's approaches
- Solution playback with adjustable animation speed
- Complete UI controls for game settings
- Support for different board sizes with automatic scaling

## Common Components

## Technology Stack

- **Frontend Build Tool:** Vite
- **Programming Language:** JavaScript (ES Modules)
- **Runtime Environment:** Node.js
- **UI Framework:** HTML5, CSS3, Bootstrap 5
- **Database:** SQLite
- **Testing Framework:** Jest with ES Module support
- **Template Engine:** EJS
- **Version Control:** Git
- **Documentation:** Markdown, Word/PDF

## Development Infrastructure

### Build System
- Vite for development and production builds
- Multi-page application setup
- Source map support for debugging
- Asset optimization and bundling
- Hot Module Replacement (HMR) in development

### Module System
- ES Modules for both client and server code
- Dynamic imports for code splitting
- Proper path aliasing and module resolution
- Browser-compatible module loading

### Development Workflow
- NPM scripts for common tasks
- Automated testing with Jest
- ESLint for code quality
- Prettier for code formatting
- Git hooks for pre-commit validation

## Project Structure

```
PDSA-II-Game-Project/
├── README.md            # Project overview
├── package.json         # Node.js project configuration with ES Module support
├── vite.config.js       # Vite configuration for bundling and development
├── eslint.config.mjs    # ESLint configuration for ES Modules
│
├── public/              # Static public assets
│   ├── css/             # Stylesheets
│   ├── js/              # Client-side JavaScript
│   └── images/          # Game images and icons
│
├── src/                 # Source code
│   ├── server.js        # Express server setup (ES Modules)
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
│   │   ├── BaseGame.js  # Base game class with common functionality
│   │   ├── ticTacToe/
│   │   │   ├── ui/      # UI components
│   │   │   │   └── index.js # Entry point
│   │   │   ├── game.js  # Game logic
│   │   │   └── algorithms/ # Different AI approaches
│   │   │       ├── minimax.js
│   │   │       └── mcts.js # Monte Carlo Tree Search
│   │   │
│   │   ├── tsp/         # Traveling Salesman Problem
│   │   │   ├── ui/      # UI components
│   │   │   │   └── index.js # Entry point
│   │   │   ├── game.js
│   │   │   └── algorithms/
│   │   │       ├── nearestNeighbor.js
│   │   │       ├── dynamicProgramming.js
│   │   │       └── geneticAlgorithm.js
│   │   │
│   │   ├── towerOfHanoi/
│   │   │   ├── ui/      # UI components
│   │   │   │   └── index.js # Entry point
│   │   │   ├── game.js
│   │   │   └── algorithms/
│   │   │       ├── recursive.js
│   │   │       ├── iterative.js
│   │   │       └── frameStewart.js
│   │   │
│   │   ├── eightQueens/
│   │   │   ├── ui/      # UI components
│   │   │   │   └── index.js # Entry point
│   │   │   ├── game.js
│   │   │   └── algorithms/
│   │   │       ├── sequential.js
│   │   │       └── threaded.js
│   │   │
│   │   └── knightsTour/
│   │       ├── ui/      # UI components
│   │       │   └── index.js # Entry point
│   │       ├── game.js
│   │       └── algorithms/
│   │           ├── backtracking.js
│   │           └── warnsdorff.js
│   │
│   └── middleware/      # Express middleware
│       ├── auth.js      # Authentication middleware
│       └── errorHandler.js # Error handling middleware
│
├── views/               # EJS templates
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
│   └── game.db          # SQLite database file
│
├── tests/               # Test files
│   ├── setup.js         # Test setup
│   ├── integration/     # Integration tests
│   └── unit/            # Unit tests
│
└── docs/                # Documentation
    ├── API.md           # API documentation
    ├── PLAN.md          # Development plan and timeline
    ├── PROGRESS.md      # Progress tracking document
    ├── SCHEMA.md         # Database schema documentation
    └── MEMORY.md        # Memory management and performance analysis
```

## Team Responsibilities

Thathsika - Game Module 1 (Knights Tour)
Adithya - Game Module 1 (Tower of Hanoi, Knights Tour, Eight Queens)
Dinod - Game Module 2 (Tic-Tac-Toe)
Sadew - Game Module 3 (Traveling Salesman Problem)
Yasiru - Game Module 4 (Eight Queens)