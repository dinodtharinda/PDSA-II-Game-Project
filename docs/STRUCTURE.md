## Project Structure

```
game-project/
├── index.html                                  # Main HTML entry point
├── README.md                                   # Project overview
├── css/
│   ├── games.css                               # Game-specific styles
│   └── style.css                               # General styles
├── database/
│   ├── game.db                                 # SQLite database file (used by SQL.js, stored in localStorage)
│   └── migrations/
│       └── create-tables.js                    # Script to define table creation logic (used by db.js)
├── docs/
│   ├── API.md                                  # Client-side service function documentation
│   ├── COURSEWORK.md                           # Coursework requirements
│   ├── MEMORY.md                               # Recent changes and decisions
│   ├── PLAN.md                                 # Development plan
│   ├── PROGRESS.md                             # Project progress tracker
│   ├── SCHEMA.md                               # Client-side database schema
│   └── STRUCTURE.md                            # This file
├── images/
│   ├── hanoi.svg
│   ├── knight.svg
│   ├── pattern.svg
│   ├── queens.svg
│   ├── stats.svg
│   ├── tic-tac-toe.svg
│   └── tsp.svg
├── js/
│   ├── app.js                                  # Main application initialization script
│   ├── db.js                                   # Client-side database module (using SQL.js)
│   ├── router.js                               # Client-side router (using History API)
│   ├── games/
│   │   ├── BaseGame.js                         # Base game class (optional)
│   │   ├── eightQueens/
│   │   │   ├── game.js                         # Game logic
│   │   │   ├── algorithms/                     # Algorithm implementations
│   │   │   ├── services/
│   │   │   │   └── api.js                      # Client-side DB interaction service
│   │   │   └── ui/
│   │   │       └── index.js                    # UI logic
│   │   ├── knightsTour/
│   │   │   ├── game.js
│   │   │   ├── algorithms/
│   │   │   │   ├── backtracking.js
│   │   │   │   └── warnsdorff.js
│   │   │   ├── services/
│   │   │   │   └── api.js
│   │   │   └── ui/
│   │   │       └── index.js
│   │   ├── ticTacToe/
│   │   │   ├── game.js
│   │   │   ├── algorithms/
│   │   │   ├── services/
│   │   │   │   └── api.js
│   │   │   └── ui/
│   │   │       └── index.js
│   │   ├── towerOfHanoi/
│   │   │   ├── game.js
│   │   │   ├── algorithms/
│   │   │   ├── services/
│   │   │   │   └── api.js
│   │   │   └── ui/
│   │   │       └── index.js
│   │   └── tsp/
│   │       ├── game.js
│   │       ├── algorithms/
│   │       ├── services/
│   │       │   └── api.js
│   │       └── ui/
│   │           └── index.js
│   ├── lib/
│   │   ├── sql-wasm.js                         # SQL.js library
│   │   └── sql-wasm.wasm                       # SQL.js WebAssembly module
│   └── utils/
│       ├── logger.js                           # Logging utility
│       └── timer.js                            # Performance timer utility
└── tests/                                      # Test files (if any)
    └── unit/
```