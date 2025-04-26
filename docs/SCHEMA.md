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
  algorithm_used TEXT,
  solution_found BOOLEAN,
  execution_time REAL,
  status TEXT DEFAULT 'in_progress',
  duration_seconds INTEGER,
  settings JSON,
  FOREIGN KEY (player_id) REFERENCES players (id)
);
```

### Performances Table
```sql
CREATE TABLE performances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  algorithm_name TEXT NOT NULL,
  execution_time REAL NOT NULL,
  memory_used INTEGER,
  iterations INTEGER,
  solution_quality REAL,
  parameters JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games (id)
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
