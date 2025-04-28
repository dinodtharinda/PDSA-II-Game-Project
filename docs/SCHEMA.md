# Client-Side Database Schema (SQL.js)

Last Updated: April 29, 2025

This document provides details about the database schema used by the client-side SQL.js implementation in this project. The database runs entirely within the user's browser and is persisted using localStorage.

## Core Tables

### Players Table

```sql
CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  verified BOOLEAN DEFAULT FALSE
);
```

### Games Table

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

### Algorithm Performance Table

```sql
CREATE TABLE algorithm_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  algorithm_name VARCHAR(50) NOT NULL,
  execution_time FLOAT NOT NULL,
  solution_found BOOLEAN DEFAULT TRUE,
  execution_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id)
);
```

## Game-Specific Tables

### Knight's Tour Table

```sql
CREATE TABLE knights_tour (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  start_position TEXT NOT NULL,
  move_sequence TEXT,
  algorithm_type VARCHAR(50),
  execution_time FLOAT,
  FOREIGN KEY (game_id) REFERENCES games(id)
);
```

The `knights_tour` table stores Knight's Tour specific data:
- `start_position`: The starting position in algebraic notation (e.g., "e4")
- `move_sequence`: Comma-separated list of positions in algebraic notation
- `algorithm_type`: The algorithm used (e.g., "backtracking", "warnsdorff", "player")
- `execution_time`: Time taken by the algorithm in milliseconds

### Tic Tac Toe Table

```sql
CREATE TABLE tic_tac_toe (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  board_size INTEGER DEFAULT 5,
  moves TEXT,
  winner VARCHAR(10),
  move_count INTEGER,
  algorithm_type VARCHAR(50),
  FOREIGN KEY (game_id) REFERENCES games(id)
);
```

### Traveling Salesman Table

```sql
CREATE TABLE tsp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  cities TEXT NOT NULL,
  distances TEXT NOT NULL,
  home_city VARCHAR(10),
  path TEXT,
  total_distance FLOAT,
  algorithm_type VARCHAR(50),
  FOREIGN KEY (game_id) REFERENCES games(id)
);
```

### Tower of Hanoi Table

```sql
CREATE TABLE tower_of_hanoi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  disk_count INTEGER NOT NULL,
  peg_count INTEGER NOT NULL,
  move_sequence TEXT,
  move_count INTEGER,
  algorithm_type VARCHAR(50),
  FOREIGN KEY (game_id) REFERENCES games(id)
);
```

### Eight Queens Table

```sql
CREATE TABLE eight_queens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  board_size INTEGER DEFAULT 8,
  algorithm_type VARCHAR(50),
  thread_count INTEGER DEFAULT 1,
  FOREIGN KEY (game_id) REFERENCES games(id)
);
```

### Eight Queens Solutions Table (New)

```sql
CREATE TABLE eight_queens_solutions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  solution TEXT NOT NULL UNIQUE, -- Store solution as JSON string of {row, col} array
  found_by_player BOOLEAN DEFAULT FALSE,
  first_found_at DATETIME DEFAULT CURRENT_TIMESTAMP 
  -- No game_id link needed if solutions are universal across games
);
```

## Relationships

### Core Relationships

```
Player (1) ---< Games (N)
Games (1) ---< Algorithm Performance (N)
```

### Game-Specific Relationships

```
Games (1) ---< Knight's Tour (N)
Games (1) ---< Tic Tac Toe (N)
Games (1) ---< TSP (N)
Games (1) ---< Tower of Hanoi (N)
Games (1) ---< Eight Queens (N) 
-- eight_queens_solutions is independent, storing all unique solutions found globally
```

## Sample Queries

### Knight's Tour Performance Query

```sql
SELECT 
  g.id, 
  g.start_time, 
  kt.algorithm_type,
  kt.execution_time,
  kt.start_position
FROM games g
JOIN knights_tour kt ON g.id = kt.game_id
WHERE g.game_type = 'knightsTour'
ORDER BY kt.execution_time ASC
LIMIT 10;
```

### Algorithm Performance Comparison

```sql
SELECT 
  algorithm_name,
  AVG(execution_time) as avg_time,
  MIN(execution_time) as min_time,
  MAX(execution_time) as max_time,
  COUNT(*) as run_count
FROM algorithm_performance
WHERE solution_found = TRUE
GROUP BY algorithm_name
ORDER BY avg_time ASC;
```

### Player Progress Query

```sql
SELECT 
  p.username,
  g.game_type,
  COUNT(*) as games_played,
  SUM(CASE WHEN g.status = 'completed' THEN 1 ELSE 0 END) as completed_games,
  AVG(g.duration_seconds) as avg_duration
FROM players p
JOIN games g ON p.id = g.player_id
GROUP BY p.username, g.game_type
ORDER BY p.username, g.game_type;
```
