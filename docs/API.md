# Game Project API Documentation

This document provides detailed information about the available API endpoints for the PDSA-II Game Project.

## Table of Contents

- [Authentication](#authentication)
- [Common Endpoints](#common-endpoints)
- [Tic-Tac-Toe](#tic-tac-toe)
- [Traveling Salesman Problem](#traveling-salesman-problem)
- [Tower of Hanoi](#tower-of-hanoi)
- [Eight Queens Puzzle](#eight-queens-puzzle)
- [Knight's Tour](#knights-tour)
- [Statistics](#statistics)
- [User API](#user-api)

## Authentication

Authentication is required for creating, updating, and saving game states. Use the User API to register and log in to obtain an authentication token.

**Authentication Header Format:**
```
Authorization: Bearer <token>
```

## Common Endpoints

### Get All Games

Retrieves a list of all available games.

- **URL**: `/api/games`
- **Method**: `GET`
- **Authentication**: Not required
- **Response**: Array of game objects

### Get Game by ID

Retrieves a specific game by its ID.

- **URL**: `/api/games/:id`
- **Method**: `GET`
- **Authentication**: Not required
- **Response**: Game object

### Create New Game

Creates a new game and saves it to the database.

- **URL**: `/api/games`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "gameType": "tic-tac-toe|tsp|tower-of-hanoi|eight-queens|knights-tour",
    "playerName": "string",
    "initialState": {}
  }
  ```
- **Response**: Created game object with ID

### Update Game

Updates an existing game.

- **URL**: `/api/games/:id`
- **Method**: `PUT`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "gameState": {},
    "completed": boolean,
    "score": number
  }
  ```
- **Response**: Updated game object

## Tic-Tac-Toe

### Get Tic-Tac-Toe Game

Retrieves a Tic-Tac-Toe game by ID.

- **URL**: `/api/games/tic-tac-toe/:id`
- **Method**: `GET`
- **Authentication**: Not required
- **Response**: Tic-Tac-Toe game object

### Make AI Move

Gets the next move from the AI based on the current board state.

- **URL**: `/api/games/tic-tac-toe/ai-move`
- **Method**: `POST`
- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "board": [[]],
    "player": "X|O",
    "algorithm": "minimax|mcts"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "move": { "row": 0, "col": 0 },
    "executionTime": 0.05,
    "algorithm": "minimax|mcts"
  }
  ```

### Minimax Algorithm Move

Gets the next move using specifically the Minimax algorithm.

- **URL**: `/api/games/tic-tac-toe/ai-move/minimax`
- **Method**: `POST`
- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "board": [[]],
    "player": "X|O"
  }
  ```
- **Response**: Same as AI Move

### MCTS Algorithm Move

Gets the next move using specifically the Monte Carlo Tree Search algorithm.

- **URL**: `/api/games/tic-tac-toe/ai-move/mcts`
- **Method**: `POST`
- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "board": [[]],
    "player": "X|O"
  }
  ```
- **Response**: Same as AI Move

### Save Tic-Tac-Toe Game

Saves the current state of a Tic-Tac-Toe game.

- **URL**: `/api/games/tic-tac-toe/save`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "board": [[]],
    "currentPlayer": "X|O",
    "gameOver": boolean,
    "winner": "X|O|null"
  }
  ```
- **Response**: Saved game object with ID

### Get Tic-Tac-Toe Statistics

Retrieves statistics about Tic-Tac-Toe games.

- **URL**: `/api/games/tic-tac-toe/stats`
- **Method**: `GET`
- **Authentication**: Not required
- **Response**: Statistics object

## Traveling Salesman Problem

### Calculate TSP Route

Generic endpoint for calculating a TSP route.

- **URL**: `/api/games/tsp/route`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "distanceMatrix": [[]],
    "homeCity": 0,
    "algorithm": "nearest-neighbor|dynamic-programming|genetic-algorithm"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "route": [0, 1, 2, ..., 0],
    "distance": 500,
    "executionTime": 0.5,
    "algorithm": "nearest-neighbor|dynamic-programming|genetic-algorithm"
  }
  ```

### Nearest Neighbor Algorithm

Calculates a TSP route using the Nearest Neighbor algorithm.

- **URL**: `/api/games/tsp/route/nearest-neighbor`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "distanceMatrix": [[]],
    "homeCity": 0
  }
  ```
- **Response**: Same as Calculate TSP Route

### Dynamic Programming Algorithm

Calculates a TSP route using the Dynamic Programming algorithm.

- **URL**: `/api/games/tsp/route/dynamic-programming`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "distanceMatrix": [[]],
    "homeCity": 0
  }
  ```
- **Response**: Same as Calculate TSP Route

### Genetic Algorithm

Calculates a TSP route using the Genetic Algorithm.

- **URL**: `/api/games/tsp/route/genetic-algorithm`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "distanceMatrix": [[]],
    "homeCity": 0,
    "populationSize": 100,
    "generations": 500,
    "mutationRate": 0.01
  }
  ```
- **Response**: Same as Calculate TSP Route, with added `generations` parameter

### Save TSP Game

Saves the current state of a TSP game.

- **URL**: `/api/games/traveling-salesman/save`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "distanceMatrix": [[]],
    "homeCity": 0,
    "selectedRoute": [],
    "optimal": {
      "route": [],
      "distance": 500
    }
  }
  ```
- **Response**: Saved game object with ID

### Get TSP Statistics

Retrieves statistics about TSP games.

- **URL**: `/api/games/traveling-salesman/stats`
- **Method**: `GET`
- **Authentication**: Not required
- **Response**: Statistics object

## Tower of Hanoi

### Validate Tower of Hanoi Move

Validates if a move in Tower of Hanoi is legal.

- **URL**: `/api/games/tower-of-hanoi/move`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "fromPeg": 0,
    "toPeg": 2,
    "currentState": [[3,2,1],[],[]]
  }
  ```
- **Response**:
  ```json
  {
    "valid": true,
    "message": "Move is valid"
  }
  ```

### Solve Tower of Hanoi

Solves the Tower of Hanoi puzzle with the specified algorithm.

- **URL**: `/api/games/tower-of-hanoi/solve`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "disks": 3,
    "pegs": 3,
    "algorithm": "recursive|iterative|frame-stewart"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "solution": [
      {"disk": 1, "from": 0, "to": 2},
      {"disk": 2, "from": 0, "to": 1},
      {"disk": 1, "from": 2, "to": 1}
    ],
    "moves": 7,
    "executionTime": 0.001,
    "algorithm": "recursive|iterative|frame-stewart"
  }
  ```

### Recursive Algorithm Solution

Solves the Tower of Hanoi using the recursive algorithm.

- **URL**: `/api/games/tower-of-hanoi/solve/recursive`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "disks": 3
  }
  ```
- **Response**: Same as Solve Tower of Hanoi

### Iterative Algorithm Solution

Solves the Tower of Hanoi using the iterative algorithm.

- **URL**: `/api/games/tower-of-hanoi/solve/iterative`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "disks": 3
  }
  ```
- **Response**: Same as Solve Tower of Hanoi

### Frame-Stewart Algorithm Solution

Solves the Tower of Hanoi using the Frame-Stewart algorithm for 4 pegs.

- **URL**: `/api/games/tower-of-hanoi/solve/frame-stewart`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "disks": 3
  }
  ```
- **Response**: Same as Solve Tower of Hanoi

### Save Tower of Hanoi Game

Saves the current state of a Tower of Hanoi game.

- **URL**: `/api/games/tower-of-hanoi/save`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "disks": 3,
    "pegs": 3,
    "currentState": [[3,2],[1],[]],
    "moves": 1
  }
  ```
- **Response**: Saved game object with ID

### Get Tower of Hanoi Statistics

Retrieves statistics about Tower of Hanoi games.

- **URL**: `/api/games/tower-of-hanoi/stats`
- **Method**: `GET`
- **Authentication**: Not required
- **Response**: Statistics object

## Eight Queens Puzzle

### Validate Eight Queens Solution

Validates if a proposed solution to the Eight Queens puzzle is correct.

- **URL**: `/api/games/eight-queens/validate`
- **Method**: `POST`
- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "queens": [
      {"row": 0, "col": 0},
      {"row": 1, "col": 2},
      {"row": 2, "col": 4},
      {"row": 3, "col": 1},
      {"row": 4, "col": 7},
      {"row": 5, "col": 5},
      {"row": 6, "col": 3},
      {"row": 7, "col": 6}
    ]
  }
  ```
- **Response**:
  ```json
  {
    "valid": true,
    "conflicts": []
  }
  ```

### Solve Eight Queens

Solves the Eight Queens puzzle with the specified algorithm.

- **URL**: `/api/games/eight-queens/solve`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "algorithm": "sequential|threaded",
    "maxSolutions": 10
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "solutions": [
      [0, 4, 7, 5, 2, 6, 1, 3],
      [0, 5, 7, 2, 6, 3, 1, 4]
    ],
    "count": 2,
    "executionTime": 0.001,
    "algorithm": "sequential|threaded"
  }
  ```

### Sequential Algorithm Solution

Solves the Eight Queens puzzle using the sequential algorithm.

- **URL**: `/api/games/eight-queens/solve/sequential`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "maxSolutions": 10
  }
  ```
- **Response**: Same as Solve Eight Queens

### Threaded Algorithm Solution

Solves the Eight Queens puzzle using the threaded algorithm.

- **URL**: `/api/games/eight-queens/solve/threaded`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "maxSolutions": 10,
    "threads": 4
  }
  ```
- **Response**: Same as Solve Eight Queens, with added `threads` parameter

### Save Eight Queens Game

Saves the current state of an Eight Queens game.

- **URL**: `/api/games/eight-queens/save`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "queens": [
      {"row": 0, "col": 0},
      {"row": 1, "col": 2},
      {"row": 2, "col": 4},
      {"row": 3, "col": 1}
    ]
  }
  ```
- **Response**: Saved game object with ID

### Get Eight Queens Statistics

Retrieves statistics about Eight Queens games.

- **URL**: `/api/games/eight-queens/stats`
- **Method**: `GET`
- **Authentication**: Not required
- **Response**: Statistics object

## Knight's Tour

### Validate Knight's Move

Validates if a knight's move is legal on the given board.

- **URL**: `/api/games/knights-tour/validate-move`
- **Method**: `POST`
- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "board": [[]],
    "currentPosition": {"row": 0, "col": 0},
    "newPosition": {"row": 2, "col": 1}
  }
  ```
- **Response**:
  ```json
  {
    "valid": true,
    "message": "Move is valid"
  }
  ```

### Solve Knight's Tour

Solves the Knight's Tour problem with the specified algorithm.

- **URL**: `/api/games/knights-tour/solve`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "startPosition": {"row": 0, "col": 0},
    "boardSize": 8,
    "algorithm": "backtracking|warnsdorff"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "solution": [
      {"row": 0, "col": 0},
      {"row": 2, "col": 1},
      {"row": 4, "col": 0}
      // ... more positions
    ],
    "executionTime": 0.123,
    "algorithm": "backtracking|warnsdorff"
  }
  ```

### Backtracking Algorithm Solution

Solves the Knight's Tour using the backtracking algorithm.

- **URL**: `/api/games/knights-tour/solve/backtracking`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "startPosition": {"row": 0, "col": 0},
    "boardSize": 8
  }
  ```
- **Response**: Same as Solve Knight's Tour

### Warnsdorff's Algorithm Solution

Solves the Knight's Tour using Warnsdorff's algorithm.

- **URL**: `/api/games/knights-tour/solve/warnsdorff`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "startPosition": {"row": 0, "col": 0},
    "boardSize": 8
  }
  ```
- **Response**: Same as Solve Knight's Tour

### Save Knight's Tour Game

Saves the current state of a Knight's Tour game.

- **URL**: `/api/games/knights-tour/save`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "board": [[]],
    "moveSequence": [
      {"row": 0, "col": 0},
      {"row": 2, "col": 1}
    ],
    "startPosition": {"row": 0, "col": 0},
    "currentPosition": {"row": 2, "col": 1},
    "boardSize": 8
  }
  ```
- **Response**: Saved game object with ID

### Get Knight's Tour Statistics

Retrieves statistics about Knight's Tour games.

- **URL**: `/api/games/knights-tour/stats`
- **Method**: `GET`
- **Authentication**: Not required
- **Response**: Statistics object

## Statistics

### Get Overview Statistics

Retrieves overview statistics for all games.

- **URL**: `/api/stats/overview`
- **Method**: `GET`
- **Authentication**: Not required
- **Response**: Overview statistics object

### Get Player Statistics

Retrieves statistics for a specific player.

- **URL**: `/api/stats/player/:id`
- **Method**: `GET`
- **Authentication**: Not required
- **Response**: Player statistics object

### Get Game Type Statistics

Retrieves statistics for a specific game type.

- **URL**: `/api/stats/game/:gameType`
- **Method**: `GET`
- **Authentication**: Not required
- **Response**: Game type statistics object

### Get Algorithm Statistics

Retrieves statistics for a specific algorithm in a game.

- **URL**: `/api/stats/algorithm/:gameType/:algorithm`
- **Method**: `GET`
- **Authentication**: Not required
- **Response**: Algorithm statistics object

## User API

### Register User

Registers a new user.

- **URL**: `/api/user/register`
- **Method**: `POST`
- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "created": "timestamp"
  }
  ```

### Login User

Logs in a user and returns an authentication token.

- **URL**: `/api/user/login`
- **Method**: `POST`
- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "userId": "uuid",
    "username": "string",
    "token": "string"
  }
  ```

### Get User Profile

Retrieves the profile of the authenticated user.

- **URL**: `/api/user/profile`
- **Method**: `GET`
- **Authentication**: Required
- **Response**:
  ```json
  {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "created": "timestamp",
    "gameStats": {}
  }
  ```

### Logout User

Logs out the authenticated user and invalidates the token.

- **URL**: `/api/user/logout`
- **Method**: `POST`
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```