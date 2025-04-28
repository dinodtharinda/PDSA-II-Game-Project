# Development Plan for PDSA-II Game Project (Client-Side Implementation)

This document outlines the development plan, milestones, and task distribution for the PDSA-II Game Project, implemented as a fully client-side web application.

## Game Modules Development Plan (Client-Side)

### 1. Tic-Tac-Toe

#### Completed Features
- 5×5 game board with responsive design (HTML/CSS/JS)
- Human vs Computer gameplay logic (`js/games/ticTacToe/game.js`)
- Win detection logic
- Two AI algorithms implemented in JavaScript (`js/games/ticTacToe/algorithms/`):
  - Minimax with alpha-beta pruning
  - Monte Carlo Tree Search
- Performance measurement using `js/utils/timer.js`
- Client-side database integration (`js/games/ticTacToe/services/api.js`) for storing game results and algorithm performance via SQL.js.
- Mobile-friendly UI

#### Technical Details
- Board representation: 5×5 JavaScript array
- AI move timing: performance measured in milliseconds using client-side timer.
- Database: SQL.js via `js/db.js`.

### 2. Traveling Salesman Problem

#### Completed Features
- Random distance matrix generation in JavaScript (`js/games/tsp/game.js`)
- Random home city selection
- Interactive city selection UI
- Three algorithmic approaches implemented in JavaScript (`js/games/tsp/algorithms/`):
  - Nearest Neighbor
  - Genetic Algorithm
- Performance comparison using `js/utils/timer.js`
- Client-side database integration (`js/games/tsp/services/api.js`) for storing game results, routes, and performance via SQL.js.
- City visualization with route display (e.g., using SVG or Canvas)
- Mobile-friendly UI

#### Technical Details
- Distance representation: JavaScript 2D array
- Algorithms implemented purely in client-side JavaScript.
- Performance tracking: Execution time and solution quality comparison stored in SQL.js.
- UI: SVG/Canvas based map.

### 3. Tower of Hanoi

#### Completed Implementation
- Interactive disk and tower visualization (HTML/CSS/JS)
- Support for 3 and 4 pegs with variable disk count (`js/games/towerOfHanoi/game.js`)
- Three algorithmic approaches implemented in JavaScript (`js/games/towerOfHanoi/algorithms/`):
  - Recursive solution for 3 pegs
  - Frame-Stewart algorithm for 4 pegs
- Performance measurement using `js/utils/timer.js`
- Complete client-side database integration (`js/games/towerOfHanoi/services/api.js`) for game sessions and metrics via SQL.js.
- Mobile-friendly UI
- Comprehensive unit tests (if applicable)

#### Technical Details
- Disk representation: Array-based stack simulation in JavaScript.
- Animation system: CSS transitions or JavaScript animation.
- Performance tracking: Move count and execution time stored in SQL.js.
- Database integration: Game sessions, moves, and algorithm metrics stored via `js/db.js`.

#### Features
- Random disk count generation (5-10)
- Interactive disk movement
- Real-time move validation
- Algorithm visualization
- Performance comparison
- Solution replay functionality
- Progress tracking
- Support for 3-peg and 4-peg variants

### 4. Eight Queens Puzzle

#### Completed Implementation
- Interactive chessboard UI (HTML/CSS/JS)
- Queen placement and validation logic (`js/games/eightQueens/game.js`)
- Algorithmic approaches implemented in JavaScript (`js/games/eightQueens/algorithms/`):
  - Backtracking algorithm (simulating sequential)
  - Potentially optimized backtracking or other approach (simulating threaded/parallel concept, e.g., using Web Workers if implemented, or just comparing different single-threaded JS algorithms)
- Performance comparison using `js/utils/timer.js`
- Client-side database integration (`js/games/eightQueens/services/api.js`) for storing solutions and performance via SQL.js.
- Solution tracking to prevent duplicates.

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
- **Database:** SQL.js (SQLite in WebAssembly)
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

## Team Responsibilities

Thathsika - Game Module 1 (Knights Tour)
Adithya - Game Module 1 (Tower of Hanoi, Knights Tour, Eight Queens, Traveling Salesman Problem)
Dinod - Game Module 2 (Tic-Tac-Toe, Eight Queens)
Sadew - Game Module 3 (Traveling Salesman Problem)
Yasiru - Game Module 4 (Eight Queens)

# Project Architecture and Technical Plan

Last Updated: April 27, 2025

## Project Structure

This document outlines the key architectural decisions and technical plans for the PDSA-II Game Project.

## Overall Architecture

**UPDATED:** The project has been migrated to a fully client-side architecture using SQL.js for in-browser SQLite:

### Client-Side Architecture (Browser)
- Game UI components
- Game state management
- Algorithm implementation and execution
- Client-side SQLite database (SQL.js)
- Client-side routing (History API)
- All application logic

### Key Components
- `index.html` - Main application entry point
- `js/app.js` - Application initialization
- `js/db.js` - Client-side SQLite database operations
- `js/router.js` - Client-side routing
- `js/games/*/services/api.js` - Game service modules

## Client-Side SQLite Architecture

The project now uses SQL.js to provide full database functionality in the browser:

1. **Database Initialization**
   - SQL.js loads SQLite engine in WebAssembly
   - Database loads from existing file or creates new one
   - Same schema maintained as server-side version

2. **Data Persistence**
   - Database state saved to localStorage on page unload
   - Option to export database as downloadable file
   - Database can be reloaded from previous state

3. **Game Module Architecture**
   - Direct database operations from client-side code
   - Maintains same data model and relationships
   - No network requests required

## ES Module Architecture

The project uses modern ES Modules throughout, with the following patterns:

- Named exports for utility classes and functions
- Default exports for main game classes and algorithms
- Dynamic imports for algorithm modules
- Asynchronous database operations

## Game Module Architecture

Each game module follows a consistent architecture:

```
games/[game-name]/
  |- game.js             # Main game logic and initialization
  |- algorithms/         # Algorithm implementations
  |    |- algorithm1.js
  |    |- algorithm2.js
  |- services/           # API service clients for database operations
  |    |- api.js
  |- ui/                 # UI components
       |- index.js
```

### Knight's Tour Architecture

#### Key Components

1. **KnightsTour Class** (`game.js`)
   - Core game state management
   - Move validation
   - Board state representation
   - Static initialization

2. **KnightsTourUI Class** (`ui/index.js`)
   - Board rendering
   - User interaction handling
   - Animation control
   - Algorithm selection

3. **Algorithms**
   - `backtracking.js`: Backtracking algorithm implementation
   - `warnsdorff.js`: Warnsdorff's heuristic algorithm implementation

4. **API Service** (`services/api.js`)
   - `createGameRecord()`: Initialize a new game in the client-side database
   - `saveAlgorithmPerformance()`: Save algorithm execution metrics
   - `endGame()`: Save final game state when complete

#### Data Flow

1. **Initialization**:
   ```
   Page Load → app.js → SQL.js init → db.js init → KnightsTour.init() → new KnightsTour() → new KnightsTourUI().initialize()
   ```

2. **Manual Gameplay**:
   ```
   User Click → handleCellClick() → game.makeMove() → render()
   ```

3. **Automatic Solving**:
   ```
   Solve Click → handleSolveClick() → game.solve() → import algorithm → animateSolution()
   ```

4. **Performance Tracking**:
   ```
   Algorithm Execution → Performance Metrics → Client-side API Service → SQL.js Database
   ```

### Database Model - Knight's Tour

The same database schema is maintained but implemented client-side:

#### Game Table
```sql
CREATE TABLE games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_type VARCHAR(50) NOT NULL,
  player_id INTEGER,
  settings TEXT,
  status VARCHAR(20),
  start_time DATETIME,
  end_time DATETIME,
  duration_seconds INTEGER,
  FOREIGN KEY (player_id) REFERENCES players(id)
);
```

#### Knights Tour Table
```sql
CREATE TABLE knights_tour (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  start_position TEXT,
  move_sequence TEXT,
  algorithm_type VARCHAR(50),
  execution_time FLOAT,
  FOREIGN KEY (game_id) REFERENCES games(id)
);
```

## Deployment Architecture

With the migration to fully client-side architecture, deployment is radically simplified:

1. **Static File Hosting**
   - Any web server can host the application files (Apache, Nginx, etc.)
   - CDN deployment is possible for all assets
   - No Node.js/Express server required

2. **Client-Side Performance Optimization**
   - Minified and bundled JavaScript assets
   - Optimized SQL.js loading
   - WebAssembly usage for SQLite database
   - Lazy loading of algorithm modules

3. **Database Backup Strategy**
   - Local browser storage for session persistence
   - Optional database export/import functionality
   - Automatic backup on page unload

## Performance Optimization Strategies

1. **Dynamic Algorithm Import**
   - Lazy loading of algorithm modules
   - Import only the selected algorithm

2. **Animation Optimization**
   - Throttled rendering
   - Cached DOM elements
   - requestAnimationFrame usage

3. **Database Optimizations**
   - Prepared statements in SQL.js
   - Batch operations when possible
   - Cached query results for repeated operations
