# Coursework: PDSA (Data Structures and Algorithms) - BSc (Hons) Computing 24.1

This document outlines the requirements for the PDSA coursework for the BSc (Hons) Computing program, Batch 24.1.

## Assessment Details

* **Module Name:** PDSA [cite: 1]
* **Batch:** 24.2 [cite: 1]
* **Assessment Type:** Course work [cite: 1]
* **Assessment Number:** 1 [cite: 1]
* **Assessment Mode:** Group [cite: 1]
* **Group Size:** 5 students [cite: 1]
* **Grouping Criteria:** Students can select their group members [cite: 1]
* **Submission Format and Location:** NIBM Moodle [cite: 1]
* **Assessment Method:** Practical Test, Report, Software Presentation, VIVA [cite: 1] (All tasks in the coursework need to be completed by the students [cite: 1])

## Learning Outcomes Covered

The coursework covers the following learning outcomes:
1.  Understand and select appropriate algorithms for solving a range of problems and reason about their complexity and efficiency. [cite: 1]
2.  Design and implement algorithms and data structures for novel problems. [cite: 1]
3.  Specify and implement methods to estimate solutions to intractable problems. [cite: 1]

## Coursework Tasks

The coursework requires the implementation of a game menu with five different game options.

### 1. Tic-Tac-Toe

* Implement a Human vs. Computer 5x5 Tic Tac Toe Game. [cite: 4]
* Determine the optimal computer move using appropriate data structures and algorithms. [cite: 4]
* Apply two different algorithmic approaches to determine the optimal move. [cite: 4]
* Provide a user interface for players to provide answers. [cite: 5]
* Display messages when players win, lose, or draw. [cite: 5]
* Save the player's name and correct response in the database when they win. [cite: 5]
* Record the time taken for each computer movement based on each algorithm in the database for each game round. [cite: 6]
* Include code for unit testing. [cite: 7]
* Apply appropriate validations and exception handling. [cite: 7]

### 2. Traveling Salesman Problem

* The distance between cities is randomly assigned between 50 and 100 kilometers in each game round. [cite: 7]
* Choose a random city as the home city for each game round. [cite: 8]
* Allow the user to select cities to visit (Cities from A to J) using the user interface. [cite: 9]
* Ask the player to find the shortest route from the home city to the selected cities exactly once and return to the home city. [cite: 10]
* Find the shortest route using three different algorithmic approaches. [cite: 11]
* Record the time taken for each algorithm in each game round in the database. [cite: 12]
* Save the player's name, home city, randomly selected cities, and shortest route in the database when they correctly identify an answer. [cite: 13]
* Analyze the complexity for each algorithm approach. [cite: 15]
* Include code for unit testing. [cite: 15]
* Apply appropriate validations and exception handling. [cite: 15]

### 3. Tower of Hanoi

* Users move N disks from a Source (A) peg to a Destination (C) peg using an Auxiliary (B) peg, following the rules: only one disk can be moved at a time, and a larger disk cannot be placed on a smaller disk. [cite: 16, 17, 18]
* Randomly select the number of disks (N) from 5 to 10 in each game round. [cite: 19]
* Ask the user to enter the "number of moves" and "sequence of moves" to solve the puzzle for that size. [cite: 19]
* Save the player's name and correct response in the database when they correctly identify an answer. [cite: 20]
* Implement both recursive and iterative (non-recursive) solutions to solve the problem. [cite: 21]
* Record the time taken for each algorithm in the database for every game round. [cite: 22]
* Extend the problem to 4 pegs (Frame-Stewart algorithm) and compare it with the classic 3-peg solution. [cite: 23]
* Include code for unit testing. [cite: 22]
* Apply appropriate validations and exception handling. [cite: 24]

### 4. Eight Queens Puzzle

* Place eight chess queens on an 8x8 chessboard so that no two queens threaten each other. [cite: 24]
* Using a Sequential program, find the maximum number of solutions and save them in the database. [cite: 24, 25]
* Record the time taken for the Sequential program in the database. [cite: 25]
* Using a Threaded program, find the maximum number of solutions and save them in the database. [cite: 25, 26]
* Record the time taken for the Threaded program in the database. [cite: 26]
* Compare the Sequential and Threaded programs. [cite: 27]
* Allow game players to provide answers using a user interface. [cite: 27]
* Save the player's name and correct response in the database when they correctly identify an answer. [cite: 28]
* Select appropriate data structures and algorithms to determine the correct answer. [cite: 29]
* If another player provides the same correct response, indicate that the solution has already been recognized and ask them to try again until the maximum number of solutions is achieved. [cite: 30, 31]
* When all solutions are identified, clear the flag indicating recognized solutions so that future players can provide the same answers. [cite: 31]
* Save the player's name and correct response in the database when they correctly identify an answer. [cite: 32]
* Include code for unit testing. [cite: 33]
* Apply appropriate validations and exception handling. [cite: 33]

### 5. Knight's Tour Problem

* On an empty chessboard, a knight starts from a randomly selected position. [cite: 34]
* Identify the sequence of moves for the knight to visit every square exactly once. [cite: 34]
* Allow game players to provide answers using a user interface. [cite: 35]
* Provide user interface feedback when players win, lose, or draw. [cite: 36]
* Select appropriate data structures and algorithms to determine the correct answer. [cite: 37]
* Determine the sequence of moves by applying two different algorithmic approaches. [cite: 38]
* Save the player's name and correct response in the database when they correctly identify an answer. [cite: 38]
* Include code for unit testing. [cite: 39]
* Apply appropriate validations and exception handling. [cite: 39]

## Deliverables

The students are required to submit the following:
* Software with Source Code (via Git Hub Link) [cite: 40]
* Database with Data Dump [cite: 40]
* Individual Report [cite: 40]
* Group Report [cite: 40]
* Small Video Clip indicating the features of the games [cite: 78]

### Individual Report Details

For each game (Tic-Tac-Toe, Traveling Salesman Problem, Tower of Hanoi, Eight Queens Puzzle, Knight's Tour Problem), the individual report should include:
* Explanation of the Program Logic used to solve the problem. [cite: 41, 44, 47, 49, 53]
* Analysis of the Complexity of the algorithms based on Program outputs and logic. [cite: 42, 45, 47, 50, 53]
* Comparison of the algorithmic approaches used (two or three depending on the game). [cite: 42, 45, 48, 51, 54]
* Chart containing the time taken for each algorithm technique when the game is run individually for 10 game rounds. [cite: 43, 46, 48, 52, 54]
* For the Eight Queens Puzzle, compare the time taken and logic used for the Sequential and Threaded programs. [cite: 51]
* For the Tower of Hanoi, compare the classic 3-peg solution and the 4-peg solution (Frame-Stewart algorithm). [cite: 68]

### Group Report Details

For each game (Tic-Tac-Toe, Traveling Salesman Problem, Tower of Hanoi, Eight Queens Puzzle, Knight's Tour Problem), the group report should include:
* UI screenshots when asking the user to enter inputs and answers. [cite: 55, 59, 63, 69, 76]
* Explanation of the Validations and Exception Handling in the application. [cite: 56, 60, 64, 70, 77]
* Code Segment screenshots for unit testing. [cite: 57, 60, 64, 70, 77]
* Screenshot of the Normalized DB Table Structure used for the game option. [cite: 57, 60, 65, 70, 77]
* Code Segment Screenshot of the requirement to "save that person's name along with the correct response in the database". [cite: 57, 60, 65, 71, 75, 77]
* Code Segment Screenshots of the different algorithmic approaches used. [cite: 58, 62, 67, 71, 72, 78]
* For the Traveling Salesman Problem, a code segment screenshot of choosing a random city as the home city. [cite: 61]
* For the Tower of Hanoi, a code segment screenshot of choosing a randomly selected number of disks. [cite: 66]
* For the Eight Queens Puzzle, code segment screenshots related to indicating recognized solutions and clearing the flag. [cite: 73, 74]
* For the Knight's Tour Problem, a code segment screenshot of choosing the knight's starting position randomly. [cite: 78]

## Marking Scheme

Each game option is worth 20 marks, totaling 100 marks for the coursework. The marks for each game are divided as follows:

* **Application & Group Report (10 marks):** [cite: 79, 80, 81, 82, 83]
    * 0-25%: Implement Algorithm & use of appropriate Application Data Structures [cite: 79, 80, 81, 82, 83]
    * 26-50%: Implementation of the Functionality Asked for in the Question [cite: 79, 80, 81, 82, 83]
    * 51-75%: Unit Testing Code, User interface & Validations [cite: 79, 80, 81, 82, 83]
    * 76-100%: Overall Knowledge about the Coursework based on VIVA Q&A [cite: 79, 80, 81, 82, 83]

* **Individual Report (10 marks):** [cite: 79, 80, 81, 82, 83]
    * 0-25%: Chart Containing the time Taken for each algorithm Technique when run the Game Individually for 10 Game Rounds [cite: 79, 80, 81, 82, 83]
    * 26-50%: Explain the Program Logic used to solve the problem [cite: 79, 80, 81, 82, 83]
    * 51-75%: Analyze the Complexity of the algorithms based on the Program outputs & Program logic [cite: 79, 80, 81, 82, 83]
    * 76-100%: Comparison of the algorithmic approaches [cite: 79, 80, 81, 82, 83]
    