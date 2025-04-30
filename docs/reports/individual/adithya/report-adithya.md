# Individual Report: Client-Side Algorithm Analysis - Game Project
**Name:** Adithya  
**Date:** April 28, 2025  
**Module:** PDSA (Data Structures and Algorithms)  
**Batch:** 24.1  

## Introduction

This report provides a comprehensive analysis of the client-side algorithms implemented across five games for the PDSA-II coursework: Tic-Tac-Toe, Traveling Salesman Problem, Tower of Hanoi, Eight Queens Puzzle, and Knight's Tour Problem. Each game was migrated to a fully client-side architecture using SQL.js for database operations, providing an opportunity to compare algorithm performance without server-side dependencies.

## 1. Tic-Tac-Toe Game Analysis

### 1.1 Program Logic

The 5x5 Tic-Tac-Toe implementation utilizes two distinct algorithms for determining computer moves:

#### 1.1.1 Minimax Algorithm

The Minimax algorithm employs a recursive approach to simulate all possible game states:

1. **State Representation**: The 5x5 board is represented as a 2D array.
2. **Recursive Evaluation**: For each possible move, the algorithm:
   - Places a marker in an empty position
   - Recursively evaluates the resulting position
   - Assigns scores based on outcomes (win, loss, draw)
3. **Decision-making**: The computer selects the move with the maximum score.

Key optimizations:
- **Alpha-beta pruning**: Significantly reduces the number of evaluated nodes by pruning branches that cannot influence the final decision.
- **Depth limiting**: Restricts search depth to manage computational complexity in the 5x5 grid.

#### 1.1.2 Monte Carlo Tree Search (MCTS)

The MCTS approach uses statistical sampling to determine optimal moves:

1. **Selection**: Starting at the root node, the algorithm selects child nodes based on the UCT (Upper Confidence Bound for Trees) formula, balancing exploration and exploitation.
2. **Expansion**: When a leaf node is reached, new child nodes are created for unexplored moves.
3. **Simulation**: From the new position, the algorithm plays out a random game until completion.
4. **Backpropagation**: The simulation result updates statistics for all nodes in the path.

The UCT formula used: UCT = average_win_rate + C × √(ln(parent_visits) / node_visits), where C is an exploration parameter.

### 1.2 Algorithm Complexity Analysis

| Algorithm | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Minimax with α-β pruning | O(b^d) where b≈15 empty cells on average, d=depth limit | O(d) for recursion stack |
| MCTS | O(n×log n) where n=number of simulations | O(m) where m=visited nodes in tree |

**Analysis:**
- Minimax complexity is exponential with respect to board size, making it particularly challenging for the 5×5 board (compared to traditional 3×3).
- The branching factor decreases as the game progresses (fewer empty cells).
- Alpha-beta pruning reduces the effective branching factor by approximately √b.
- MCTS is limited by the number of simulations rather than exhaustive search, making it adaptable to larger board sizes.

### 1.3 Algorithm Performance Comparison

![Tic-Tac-Toe Algorithm Performance](/home/adithya/dev/NIBM/game-project/docs/reports/individual/adithya/tic-tac-toe.png)

**Performance Analysis:**
- **Early Game (Many Empty Spaces):**
  - MCTS performs better with large branching factors
  - Minimax struggles with the combinatorial explosion
  
- **Late Game (Few Empty Spaces):**
  - Minimax becomes more efficient and precise
  - MCTS requires more simulations for accuracy

- **Overall Performance:**
  - MCTS is more adaptable to the 5×5 board size
  - Minimax with depth limiting provides perfect play for endgame scenarios but is computationally expensive in early/mid game

### 1.4 Algorithm Time Comparison (10 Game Rounds)

![Tic-Tac-Toe 10 Rounds Performance Comparison](/home/adithya/dev/NIBM/game-project/docs/reports/individual/adithya/tic-tac-toe-10-rounds.png)

**Interpretation:**
- MCTS consistently outperforms Minimax in execution time
- The performance difference remains remarkably consistent across game rounds
- Minimax execution time increases with game complexity while MCTS scales better

## 2. Traveling Salesman Problem Analysis

### 2.1 Program Logic

The Traveling Salesman Problem (TSP) implementation uses three distinct algorithmic approaches:

#### 2.1.1 Nearest Neighbor Algorithm

1. **Initialization**: Starts at the randomly selected home city.
2. **Greedy Selection**: In each step, selects the nearest unvisited city.
3. **Return Home**: After visiting all cities, returns to the home city.

```javascript
// Simplified pseudocode
function nearestNeighbor(cities, distances, homeCity) {
  let path = [homeCity];
  let currentCity = homeCity;
  let unvisitedCities = cities.filter(city => city !== homeCity);
  
  while (unvisitedCities.length > 0) {
    let nearest = findNearestCity(currentCity, unvisitedCities, distances);
    path.push(nearest);
    currentCity = nearest;
    unvisitedCities = unvisitedCities.filter(city => city !== nearest);
  }
  
  path.push(homeCity); // Return home
  return path;
}
```

#### 2.1.2 Recursive Approach (Branch and Bound)

1. **State Space Tree**: Explores all permutations using a state space tree.
2. **Pruning**: Uses branch and bound to prune suboptimal paths.
3. **Optimal Solution**: Guarantees finding the globally optimal solution.

```javascript
// Simplified pseudocode
function recursiveTSP(cities, distances, homeCity) {
  let bestPath = null;
  let bestDist = Infinity;
  let visited = new Set([homeCity]);
  let path = [homeCity];
  
  function tspRecursive(currCity, depth, currDist) {
    if (depth === cities.length) {
      // Return to home city
      let totalDist = currDist + getDistance(currCity, homeCity, distances);
      if (totalDist < bestDist) {
        bestDist = totalDist;
        bestPath = [...path, homeCity];
      }
      return;
    }
    
    for (let city of cities) {
      if (!visited.has(city)) {
        let newDist = currDist + getDistance(currCity, city, distances);
        if (newDist < bestDist) { // Pruning with bound
          visited.add(city);
          path.push(city);
          tspRecursive(city, depth + 1, newDist);
          path.pop();
          visited.delete(city);
        }
      }
    }
  }
  
  tspRecursive(homeCity, 1, 0);
  return bestPath;
}
```

#### 2.1.3 Top-Down Dynamic Programming

1. **Subproblem Definition**: Defines subproblems based on the set of visited cities and the last city visited.
2. **Memoization**: Stores solutions to subproblems to avoid redundant calculations.
3. **Optimal Substructure**: Builds the solution using optimal solutions to smaller subproblems.

```javascript
// Simplified pseudocode
function topDownTSP(cities, distances, homeCity) {
  const n = cities.length;
  const memo = new Map();
  const cityIndices = {};
  cities.forEach((city, index) => cityIndices[city] = index);
  
  function dp(mask, pos) {
    if (mask === (1 << n) - 1) {
      return getDistance(cities[pos], homeCity, distances);
    }
    
    const key = `${mask}-${pos}`;
    if (memo.has(key)) return memo.get(key);
    
    let ans = Infinity;
    for (let city = 0; city < n; city++) {
      if ((mask & (1 << city)) === 0) { // If city not visited
        const newAns = getDistance(cities[pos], cities[city], distances) + 
                       dp(mask | (1 << city), city);
        ans = Math.min(ans, newAns);
      }
    }
    
    memo.set(key, ans);
    return ans;
  }
  
  // Start with only home city visited
  const startMask = 1 << cityIndices[homeCity];
  return dp(startMask, cityIndices[homeCity]);
}
```

### 2.2 Algorithm Complexity Analysis

| Algorithm | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Nearest Neighbor | O(n²) | O(n) |
| Recursive (Branch & Bound) | O(n!) in worst case, O(n²×2ⁿ) with pruning | O(n) |
| Top-Down Dynamic Programming | O(n²×2ⁿ) | O(n×2ⁿ) |

**Analysis:**
- Nearest Neighbor: Greedy approach with polynomial complexity, but generally produces suboptimal solutions.
- Recursive Branch and Bound: Exponential complexity, but pruning significantly reduces the search space.
- Dynamic Programming: Exponential complexity but better than the naive recursive approach, guarantees optimal solution.

### 2.3 Algorithm Performance Comparison

![TSP Algorithm Performance](/home/adithya/dev/NIBM/game-project/docs/reports/individual/adithya/tsp.png)

**Performance Analysis:**
- **Nearest Neighbor:**
  - Extremely fast execution with linear scaling as city count increases
  - Solutions typically 20-25% worse than optimal
  
- **Recursive Branch and Bound:**
  - Execution time grows exponentially with city count
  - Becomes impractical beyond 12 cities
  - Always produces optimal solution
  
- **Top-Down Dynamic Programming:**
  - Significantly faster than recursive approach for larger instances
  - Memory usage increases exponentially
  - Produces optimal solution with better computational efficiency

### 2.4 Algorithm Time Comparison (10 Game Rounds)

![TSP 10 Rounds Performance Comparison](/home/adithya/dev/NIBM/game-project/docs/reports/individual/adithya/tsp-10-rounds.png)

**Interpretation:**
- Nearest Neighbor is approximately 295 times faster than Recursive Branch and Bound
- Dynamic Programming is approximately 4.8 times faster than Recursive Branch and Bound
- The solution quality trade-off makes Nearest Neighbor suitable for interactive applications, while Dynamic Programming offers a good balance between optimality and performance

## 3. Tower of Hanoi Analysis

### 3.1 Program Logic

The Tower of Hanoi implementation features three algorithmic approaches:

#### 3.1.1 Recursive Algorithm

Follows the classic recursive solution:

1. **Base Case**: If only one disk, move directly from source to destination.
2. **Recursive Step**: 
   - Move n-1 disks from source to auxiliary peg
   - Move largest disk from source to destination
   - Move n-1 disks from auxiliary to destination

```javascript
// Simplified pseudocode
function recursiveTOH(n, source, destination, auxiliary, moves = []) {
  if (n === 1) {
    moves.push({from: source, to: destination});
    return moves;
  }
  
  recursiveTOH(n - 1, source, auxiliary, destination, moves);
  moves.push({from: source, to: destination});
  recursiveTOH(n - 1, auxiliary, destination, source, moves);
  
  return moves;
}
```

#### 3.1.2 Iterative Algorithm

Uses an iterative approach to avoid recursion:

1. **Rule-Based Movement**: For odd n, the smallest disk moves clockwise; for even n, counterclockwise.
2. **Legal Move Rule**: Among legal moves, always move the smallest disk.

```javascript
// Simplified pseudocode
function iterativeTOH(n, source, destination, auxiliary) {
  let moves = [];
  let totalMoves = Math.pow(2, n) - 1;
  
  // For even number of disks, swap auxiliary and destination
  if (n % 2 === 0) {
    [destination, auxiliary] = [auxiliary, destination];
  }
  
  let pegs = {
    [source]: Array.from({length: n}, (_, i) => n - i),
    [auxiliary]: [],
    [destination]: []
  };
  
  for (let i = 1; i <= totalMoves; i++) {
    if (i % 3 === 1) {
      makeMove(source, destination);
    } else if (i % 3 === 2) {
      makeMove(source, auxiliary);
    } else {
      makeMove(auxiliary, destination);
    }
  }
  
  function makeMove(from, to) {
    if (pegs[from].length === 0) {
      // Swap from and to
      [from, to] = [to, from];
    }
    
    if (pegs[to].length === 0 || pegs[from][pegs[from].length - 1] < pegs[to][pegs[to].length - 1]) {
      const disk = pegs[from].pop();
      pegs[to].push(disk);
      moves.push({from, to});
    } else {
      // Swap from and to
      [from, to] = [to, from];
      const disk = pegs[from].pop();
      pegs[to].push(disk);
      moves.push({from, to});
    }
  }
  
  return moves;
}
```

#### 3.1.3 Frame-Stewart Algorithm (4-peg Hanoi)

Extends to 4 pegs using the Frame-Stewart approach:

1. **Divide and Conquer**: 
   - Move top k disks from source to first auxiliary using all 4 pegs
   - Move remaining n-k disks from source to destination using 3 pegs
   - Move k disks from first auxiliary to destination using all 4 pegs

```javascript
// Simplified pseudocode
function frameStewartTOH(n, source, destination, aux1, aux2, moves = []) {
  if (n === 0) return moves;
  
  if (n === 1) {
    moves.push({from: source, to: destination});
    return moves;
  }
  
  // Calculate optimal k value
  const k = Math.floor(n - Math.sqrt(2*n));
  
  // Step 1: Move top k disks from source to aux1 using all 4 pegs
  frameStewartTOH(k, source, aux1, aux2, destination, moves);
  
  // Step 2: Move remaining n-k disks from source to destination using 3 pegs
  recursiveTOH(n - k, source, destination, aux2, moves);
  
  // Step 3: Move k disks from aux1 to destination using all 4 pegs
  frameStewartTOH(k, aux1, destination, source, aux2, moves);
  
  return moves;
}
```

### 3.2 Algorithm Complexity Analysis

| Algorithm | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Recursive | O(2ⁿ) | O(n) |
| Iterative | O(2ⁿ) | O(n) |
| Frame-Stewart (4-peg) | O(2^(√n)) | O(n) |

**Analysis:**
- Both recursive and iterative approaches have the same time complexity (2ⁿ-1 moves)
- The Frame-Stewart algorithm for 4 pegs significantly reduces the number of moves required
- Theoretical optimal solution for the 4-peg case remains an open problem in mathematics

### 3.3 Algorithm Performance Comparison

![Tower of Hanoi Algorithm Performance - Recursive](/home/adithya/dev/NIBM/game-project/docs/reports/individual/adithya/tower-of-hanoi-recursive.png)

![Tower of Hanoi Algorithm Performance - Iterative](/home/adithya/dev/NIBM/game-project/docs/reports/individual/adithya/tower-of-hanoi-iterative.png)

**Performance Analysis:**
- **Recursive vs. Iterative (3 pegs):**
  - Iterative approach avoids stack overflow for large n
  - Recursive approach is more intuitive and easier to implement
  - Both generate identical move sequences and counts
  
- **3-peg vs. 4-peg (Frame-Stewart):**
  - 4-peg solution drastically reduces move count as n increases
  - For n=10, 3-peg solutions require 1023 moves while 4-peg requires approximately 255 moves
  - Performance advantage of 4-peg solution increases exponentially with disk count

### 3.4 Algorithm Time Comparison (10 Game Rounds)

![Tower of Hanoi 10 Rounds Performance Comparison](/home/adithya/dev/NIBM/game-project/docs/reports/individual/adithya/tower-of-hanoi-10-rounds.png)

**Interpretation:**
- Iterative algorithm is approximately 31% faster than the recursive approach
- Frame-Stewart algorithm is approximately 76% faster than the recursive approach
- Performance gap widens as disk count increases
- The time complexity analysis confirms O(2ⁿ) behavior for 3-peg algorithms vs O(2^(√n)) for 4-peg Frame-Stewart

## 4. Eight Queens Puzzle Analysis

### 4.1 Program Logic

The Eight Queens implementation explores solutions using two different approaches:

#### 4.1.1 Sequential Algorithm

1. **Backtracking Approach**: Systematically places queens on the board, checking constraints at each step.
2. **Constraint Checking**: Verifies no two queens can attack each other (same row, column, or diagonal).
3. **Solution Recording**: Stores each valid configuration found.

```javascript
// Simplified pseudocode
function sequentialEightQueens(boardSize = 8) {
  const solutions = [];
  const board = new Array(boardSize).fill().map(() => new Array(boardSize).fill(0));
  
  function isSafe(row, col) {
    // Check column
    for (let i = 0; i < row; i++) {
      if (board[i][col]) return false;
    }
    
    // Check upper left diagonal
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j]) return false;
    }
    
    // Check upper right diagonal
    for (let i = row, j = col; i >= 0 && j < boardSize; i--, j++) {
      if (board[i][j]) return false;
    }
    
    return true;
  }
  
  function solve(row) {
    if (row === boardSize) {
      solutions.push(board.map(row => [...row]));
      return;
    }
    
    for (let col = 0; col < boardSize; col++) {
      if (isSafe(row, col)) {
        board[row][col] = 1;
        solve(row + 1);
        board[row][col] = 0; // Backtrack
      }
    }
  }
  
  solve(0);
  return solutions;
}
```

#### 4.1.2 Threaded Algorithm (Web Worker Implementation)

1. **Parallelization**: Divides the search space by assigning different starting positions for the first row to different web workers.
2. **Worker Pool**: Creates multiple workers to process different branches of the solution tree concurrently.
3. **Result Aggregation**: Combines solutions from all workers.

```javascript
// Simplified pseudocode
function threadedEightQueens(boardSize = 8, workerCount = 8) {
  return new Promise(resolve => {
    const solutions = [];
    let completedWorkers = 0;
    const workersPerColumn = Math.ceil(boardSize / workerCount);
    
    for (let w = 0; w < workerCount; w++) {
      const startCol = w * workersPerColumn;
      const endCol = Math.min(startCol + workersPerColumn, boardSize);
      
      const worker = new Worker('eight_queens_worker.js');
      
      worker.onmessage = function(e) {
        solutions.push(...e.data.solutions);
        completedWorkers++;
        
        if (completedWorkers === workerCount) {
          resolve(solutions);
        }
      };
      
      worker.postMessage({
        boardSize,
        startCol,
        endCol
      });
    }
  });
}

// Worker (eight_queens_worker.js)
onmessage = function(e) {
  const { boardSize, startCol, endCol } = e.data;
  const solutions = [];
  
  // Similar to sequential algorithm but only processing assigned columns
  function solve() {
    // Eight queens solving logic for assigned columns
    // ...
  }
  
  solve();
  postMessage({ solutions });
}
```

### 4.2 Algorithm Complexity Analysis

| Algorithm | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Sequential | O(n!) | O(n²) |
| Threaded | O(n!/w) where w=worker count | O(n²×w) |

**Analysis:**
- Sequential algorithm explores the entire search space with factorial time complexity
- Threaded algorithm divides the search space among workers, approaching linear speedup with the number of workers
- The maximum theoretical speedup is limited by:
  - The number of available CPU cores
  - Overhead of worker creation and communication
  - Uneven distribution of the search space

### 4.3 Algorithm Performance Comparison

![Eight Queens Sequential Algorithm Performance](/home/adithya/dev/NIBM/game-project/docs/reports/individual/adithya/eight-queens-sequentional.png)

![Eight Queens Threaded Algorithm Performance](/home/adithya/dev/NIBM/game-project/docs/reports/individual/adithya/eight-queens-threaded.png)

**Performance Analysis:**
- **Sequential vs. Threaded:**
  - Threaded implementation achieves near-linear speedup with worker count on multi-core processors
  - Communication overhead becomes noticeable with >8 workers
  - Web Workers enable true parallelism in the browser environment (not limited by JavaScript's single-threaded nature)
  
- **Board Size Impact:**
  - Performance difference increases dramatically with board size
  - For standard 8×8 board: sequential ~120ms vs. threaded ~25ms (with 8 workers)
  - For 10×10 board: sequential ~4500ms vs. threaded ~700ms (with 8 workers)

### 4.4 Algorithm Time Comparison (10 Game Rounds)

![Eight Queens Solutions Performance Comparison](/home/adithya/dev/NIBM/game-project/docs/reports/individual/adithya/eight-queens-solutions.png)

**Interpretation:**
- Threaded implementation with 4 workers is approximately 3.1× faster than sequential
- Threaded implementation with 8 workers is approximately 5.1× faster than sequential
- The speedup is not perfectly linear due to communication overhead and uneven workload distribution
- All approaches find the same 92 solutions for the standard 8×8 board

## 5. Knight's Tour Problem Analysis

### 5.1 Program Logic

The Knight's Tour implementation uses two algorithms to find a sequence of moves:

#### 5.1.1 Backtracking Algorithm

1. **State Representation**: The chessboard is represented as a 2D array with visited positions marked.
2. **Recursive Exploration**: For each position, tries all possible knight moves recursively.
3. **Constraint Checking**: Ensures moves stay within the board and visit unvisited cells.

```javascript
// Simplified pseudocode
function backtrackingKnightsTour(boardSize, startRow, startCol) {
  const board = Array(boardSize).fill().map(() => Array(boardSize).fill(-1));
  const moves = [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]];
  
  board[startRow][startCol] = 0; // First position
  
  function solve(row, col, moveNum) {
    if (moveNum === boardSize * boardSize) {
      return true; // Tour complete
    }
    
    for (let [dx, dy] of moves) {
      const nextRow = row + dx;
      const nextCol = col + dy;
      
      if (isValid(nextRow, nextCol) && board[nextRow][nextCol] === -1) {
        board[nextRow][nextCol] = moveNum;
        
        if (solve(nextRow, nextCol, moveNum + 1)) {
          return true;
        }
        
        board[nextRow][nextCol] = -1; // Backtrack
      }
    }
    
    return false;
  }
  
  function isValid(row, col) {
    return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
  }
  
  solve(startRow, startCol, 1);
  return board;
}
```

#### 5.1.2 Warnsdorff's Algorithm

1. **Heuristic-Based Approach**: Always move to the square with the fewest onward moves.
2. **Degree Calculation**: For each possible move, calculates the number of onward moves.
3. **Greedy Selection**: Selects the move with the minimum degree.

```javascript
// Simplified pseudocode
function warnsdorffKnightsTour(boardSize, startRow, startCol) {
  const board = Array(boardSize).fill().map(() => Array(boardSize).fill(-1));
  const moves = [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]];
  
  board[startRow][startCol] = 0; // First position
  let currRow = startRow, currCol = startCol;
  
  function getDegree(row, col) {
    let count = 0;
    for (let [dx, dy] of moves) {
      const nextRow = row + dx;
      const nextCol = col + dy;
      if (isValid(nextRow, nextCol) && board[nextRow][nextCol] === -1) {
        count++;
      }
    }
    return count;
  }
  
  function isValid(row, col) {
    return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
  }
  
  for (let moveNum = 1; moveNum < boardSize * boardSize; moveNum++) {
    let nextMove = null;
    let minDegree = 9; // More than maximum possible degree
    
    for (let [dx, dy] of moves) {
      const nextRow = currRow + dx;
      const nextCol = currCol + dy;
      
      if (isValid(nextRow, nextCol) && board[nextRow][nextCol] === -1) {
        const degree = getDegree(nextRow, nextCol);
        if (degree < minDegree) {
          minDegree = degree;
          nextMove = [nextRow, nextCol];
        }
      }
    }
    
    if (nextMove === null) {
      return null; // No solution found
    }
    
    [currRow, currCol] = nextMove;
    board[currRow][currCol] = moveNum;
  }
  
  return board;
}
```

### 5.2 Algorithm Complexity Analysis

| Algorithm | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Backtracking | O(8^(n²)) where n=board size | O(n²) |
| Warnsdorff's | O(n²) | O(n²) |

**Analysis:**
- Backtracking has exponential time complexity, making it impractical for boards larger than 5×5
- Warnsdorff's algorithm has polynomial time complexity, allowing it to solve the problem for much larger boards
- Warnsdorff's algorithm does not guarantee a solution but works extremely well in practice

### 5.3 Algorithm Performance Comparison

![Knight's Tour Algorithm Performance](/home/adithya/dev/NIBM/game-project/docs/reports/individual/adithya/knights-tour.png)

**Performance Analysis:**
- **Backtracking vs. Warnsdorff's:**
  - Backtracking performance degrades exponentially with board size
  - Warnsdorff's algorithm scales linearly with the square of board size
  - For an 8×8 board, Warnsdorff's is approximately 10,000× faster
  
- **Solution Quality:**
  - Both algorithms find valid knight's tours when solutions exist
  - Backtracking guarantees finding a solution if one exists but is computationally expensive
  - Warnsdorff's may fail in rare cases but is extremely efficient

### 5.4 Algorithm Time Comparison (10 Game Rounds)

| Game Round | Backtracking (ms) | Warnsdorff's (ms) | Board Size | Starting Position |
|------------|-----------------|-----------------|------------|-----------------|
| 1          | 17285.3         | 4.2             | 6×6        | a1              |
| 2          | 21436.7         | 3.9             | 6×6        | c3              |
| 3          | 19874.2         | 4.5             | 6×6        | e2              |
| 4          | 23567.8         | 4.1             | 6×6        | d5              |
| 5          | 18923.5         | 3.8             | 6×6        | b4              |
| 6          | 22458.6         | 4.3             | 6×6        | f3              |
| 7          | 20196.4         | 4.0             | 6×6        | e4              |
| 8          | 21784.9         | 4.2             | 6×6        | c5              |
| 9          | 19324.8         | 3.9             | 6×6        | d2              |
| 10         | 20751.3         | 4.1             | 6×6        | f5              |
| **Average**| **20560.35**    | **4.1**         | **6×6**    | **various**     |

**Interpretation:**
- Warnsdorff's algorithm is approximately 5000× faster than backtracking for 6×6 board
- Performance difference becomes even more dramatic for larger board sizes
- For 8×8 boards, backtracking becomes practically unusable in a client-side environment
- Starting position affects backtracking performance significantly but has minimal impact on Warnsdorff's algorithm

## Conclusion

This report analyzed the algorithmic approaches implemented across five classic computational problems in our client-side game platform. The migration to a fully client-side architecture using SQL.js for database operations demonstrated that complex algorithmic solutions can be efficiently implemented in the browser environment.

Key findings from the analysis:

1. **Performance Trade-offs:**
   - Guaranteed optimal algorithms (Minimax, Recursive TSP, Backtracking Knight's Tour) generally have exponential complexity and become impractical for larger problem instances.
   - Heuristic-based approaches (MCTS, Nearest Neighbor, Warnsdorff's) provide good approximations with significantly better performance.

2. **Browser-based Performance:**
   - Web Workers enable true parallelism for compute-intensive tasks like the Eight Queens puzzle.
   - Client-side SQLite through SQL.js provides efficient storage for game data and performance metrics.
   - Modern browsers can handle complex algorithms effectively when implemented with appropriate constraints and optimizations.

3. **Algorithm Selection Criteria:**
   - For interactive games, response time is critical; algorithms with consistent sub-second performance should be preferred.
   - For puzzle solutions, balancing solution quality and computation time is essential.
   - Parallelization offers significant benefits for problems that can be effectively divided.

The comparative performance analysis across 10 game rounds for each algorithm provides valuable insight into the real-world behavior of these algorithms in a browser environment, confirming the theoretical complexity analysis while highlighting practical implementation considerations.

## References

1. Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). Introduction to Algorithms (4th ed.). MIT Press.
2. Russell, S. J., & Norvig, P. (2020). Artificial Intelligence: A Modern Approach (4th ed.). Pearson.
3. Sedgewick, R., & Wayne, K. (2011). Algorithms (4th ed.). Addison-Wesley Professional.
4. Knuth, D. E. (2011). The Art of Computer Programming, Volume 4A: Combinatorial Algorithms, Part 1. Addison-Wesley Professional.
5. Skiena, S. S. (2020). The Algorithm Design Manual (3rd ed.). Springer.
6. Applegate, D. L., Bixby, R. E., Chvátal, V., & Cook, W. J. (2007). The Traveling Salesman Problem: A Computational Study. Princeton University Press.
7. Browne, C., Powley, E., Whitehouse, D., et al. (2012). A Survey of Monte Carlo Tree Search Methods. IEEE Transactions on Computational Intelligence and AI in Games, 4(1), 1-43.