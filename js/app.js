/**
 * Main Application Entry Point
 */

import Router from './router.js';
import DB from './db.js';
import logger from './utils/logger.js';

// Initialize global objects
window.db = DB;
window.router = Router;

// Game templates with consistent layout (content only)
const templates = {
  'home': `
    <div class="container mt-4">
      <div class="jumbotron bg-primary text-white p-5 rounded">
        <h1 class="display-4">Welcome to PDSA-II Game Project</h1>
        <p class="lead">Explore classic algorithms through interactive games and compare their performance.</p>
        <hr class="my-4">
        <p>This project implements five classic algorithm problems as interactive games with different solution approaches.</p>
        <button class="btn btn-light btn-lg" onclick="window.router.navigate('/games/knights-tour')">Explore Games</button>
      </div>

      <div class="row mt-5">
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Tic-Tac-Toe</h5>
              <p class="card-text">Play against AI using Minimax and Monte Carlo Tree Search algorithms.</p>
              <button class="btn btn-primary" onclick="window.router.navigate('/games/tic-tac-toe')">Play Now</button>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Traveling Salesman</h5>
              <p class="card-text">Find the shortest route using various algorithms.</p>
              <button class="btn btn-primary" onclick="window.router.navigate('/games/traveling-salesman')">Play Now</button>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Tower of Hanoi</h5>
              <p class="card-text">Solve the classic puzzle using recursive and iterative approaches.</p>
              <button class="btn btn-primary" onclick="window.router.navigate('/games/tower-of-hanoi')">Play Now</button>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Eight Queens</h5>
              <p class="card-text">Place queens on a chessboard using sequential and threaded solutions.</p>
              <button class="btn btn-primary" onclick="window.router.navigate('/games/eight-queens')">Play Now</button>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Knight's Tour</h5>
              <p class="card-text">Find a path using backtracking and Warnsdorff's algorithm.</p>
              <button class="btn btn-primary" onclick="window.router.navigate('/games/knights-tour')">Play Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  'tower-of-hanoi': `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <h1 class="mb-4 game-title">Tower of Hanoi</h1>
          <p class="lead game-description">Move all disks from the first peg to the last peg. Only move one disk at a time, and never place a larger disk on top of a smaller one.</p>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-8">
          <div id="tower-of-hanoi-board" class="game-board mb-4"></div>
        </div>
        <div class="col-md-4">
          <div class="card game-controls-card">
            <div class="card-body">
              <h5 class="card-title">Game Controls</h5>
              <div id="tower-of-hanoi-controls"></div>
            </div>
          </div>
          <div class="card mt-3 game-status-card">
            <div class="card-body">
              <h5 class="card-title">Status & Performance</h5>
              <div id="tower-of-hanoi-status"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  'eight-queens': `
    <div class="container mt-4">
      <div class="row">
        <div class="col-md-12">
          <h1 class="game-title">Eight Queens Puzzle</h1>
          <p class="game-description">
            Place eight queens on the chessboard so that no two queens threaten each other.
          </p>
        </div>
      </div>

      <div class="row">
        <div class="col-md-8">
          <div id="eight-queens-board" class="game-board mb-4"></div>
        </div>
        <div class="col-md-4">
          <div class="card game-controls-card mb-3">
             <div class="card-body">
               <h5 class="card-title">Controls</h5>
               <div id="eight-queens-controls"></div>
             </div>
          </div>
          <div class="card game-status-card">
             <div class="card-body">
               <h5 class="card-title">Status</h5>
               <div id="eight-queens-status"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,

  'knights-tour': `
    <div class="container mt-4">
      <div class="row">
        <div class="col-md-12">
          <h1 class="game-title">Knight's Tour</h1>
          <p class="game-description">
            Guide the knight to visit every square on the chessboard exactly once.
          </p>
        </div>
      </div>

      <div class="row">
        <div class="col-md-8">
          <div id="knights-tour-board" class="game-board mb-4"></div>
        </div>
        <div class="col-md-4">
          <div class="card game-controls-card mb-3">
             <div class="card-body">
               <h5 class="card-title">Controls</h5>
               <div id="knights-tour-controls"></div>
             </div>
          </div>
          <div class="card game-status-card">
             <div class="card-body">
               <h5 class="card-title">Status & Performance</h5>
               <div id="knights-tour-status"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,

  'tic-tac-toe': `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12 mb-3">
          <h1 class="game-title text-center">
            <i class="fas fa-gamepad me-2 text-primary"></i>Tic-Tac-Toe<i class="fas fa-gamepad ms-2 text-primary"></i>
          </h1>
          <p class="game-description text-center">
            Play against the computer and try to get four in a row on a 5×5 grid.
            <span class="badge bg-info ms-2">AI Powered</span>
          </p>
        </div>
      </div>

      <div class="row justify-content-center">
        <div class="col-md-7 col-lg-8 mb-4">
          <div class="card shadow-sm">
            <div class="card-body p-2 p-sm-3 text-center">
              <div id="tic-tac-toe-board" class="game-board mb-0"></div>
            </div>
          </div>
          
          <!-- Mobile-only game status panel -->
          <div class="d-block d-md-none mt-3">
            <div class="card game-status-card shadow-sm">
              <div class="card-body">
                <h5 class="card-title d-flex align-items-center">
                  <i class="fas fa-info-circle me-2 text-info"></i>Status
                </h5>
                <div id="mobile-game-status"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-5 col-lg-4">
          <div class="card game-controls-card mb-3 shadow-sm">
            <div class="card-body">
              <h5 class="card-title d-flex align-items-center">
                <i class="fas fa-user me-2 text-primary"></i>Player Info
              </h5>
              <div id="tic-tac-toe-controls"></div>
            </div>
          </div>
          
          <!-- Desktop-only game status card -->
          <div class="card game-status-card shadow-sm d-none d-md-block">
            <div class="card-body">
              <h5 class="card-title d-flex align-items-center">
                <i class="fas fa-info-circle me-2 text-info"></i>Status
              </h5>
              <div id="tic-tac-toe-status"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  'traveling-salesman': `
    <div class="container mt-4">
      <div class="row">
        <div class="col-md-12">
          <h1 class="game-title">Traveling Salesman Problem</h1>
          <p class="game-description">
            Find the shortest route that visits each city exactly once and returns to the starting city.
          </p>
        </div>
      </div>

      <div class="row">
        <div class="col-md-8">
          <div id="tsp-map" class="game-board canvas-container mb-4">
             <canvas id="tsp-canvas"></canvas>
             <div id="tsp-info" class="canvas-info"></div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card game-controls-card mb-3">
             <div class="card-body">
               <h5 class="card-title">Controls</h5>
               <div id="tsp-controls"></div>
             </div>
          </div>
          <div class="card game-status-card">
             <div class="card-body">
               <h5 class="card-title">Results</h5>
               <div id="tsp-status"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `
};

// Main App class
class App {
  constructor() {
    this.appRoot = document.getElementById('app-root');
    this.gameModules = {};
  }

  async init() {
    try {
      logger.info('Initializing application...');

      // Initialize database
      logger.info('Initializing database...');
      await window.db.initDatabase();
      logger.info('Database initialized successfully');

      // Register routes
      logger.info('Registering routes...');
      this.registerRoutes();
      logger.info('Routes registered');

      // Add listener for router page loads to update active nav link
      document.addEventListener('router:page-loaded', this.updateActiveNavLink.bind(this));

      logger.info('Application initialized successfully');
    } catch (error) {
      logger.error(`Error initializing application: ${error.message}`);
      console.error(error);
      // Display error in the main content area if initialization fails
      if (this.appRoot) {
          this.appRoot.innerHTML = `
            <div class="container mt-5">
              <div class="alert alert-danger">
                <h4>Application Initialization Error</h4>
                <p>${error.message}</p>
              </div>
            </div>
          `;
      }
    }
  }

  registerRoutes() {
    // Create routes object
    const routes = {
      '/': () => this.renderPage('home'),
      '/home': () => this.renderPage('home'),
      
      // Game routes
      '/games/tower-of-hanoi': () => this.loadGameModule('tower-of-hanoi'),
      '/games/eight-queens': () => this.loadGameModule('eight-queens'),
      '/games/knights-tour': () => this.loadGameModule('knights-tour'),
      '/games/tic-tac-toe': () => this.loadGameModule('tic-tac-toe'),
      '/games/traveling-salesman': () => this.loadGameModule('traveling-salesman'),

      // User authentication routes
      '/login': () => this.renderLoginPage(),
      '/register': () => this.renderRegisterPage(),

      // Stats page
      '/stats': () => this.renderPlaceholder('Statistics')
    };
    
    // Register routes with the router
    window.router.registerRoutes(routes);
  }

  renderPage(templateId) {
    if (!templates[templateId]) {
        logger.error(`Template not found: ${templateId}`);
        this.appRoot.innerHTML = `<div class="container mt-4"><div class="alert alert-danger">Error: Page template not found.</div></div>`;
        return;
    }
    this.appRoot.innerHTML = templates[templateId];
    // Dispatch event after rendering static page
    document.dispatchEvent(new CustomEvent('router:page-loaded', { detail: { route: window.location.pathname } }));
  }

  renderPlaceholder(pageTitle) {
      this.appRoot.innerHTML = `
        <div class="container mt-4">
          <h1>${pageTitle}</h1>
          <p>This page is under construction.</p>
        </div>
      `;
      // Dispatch event after rendering placeholder
      document.dispatchEvent(new CustomEvent('router:page-loaded', { detail: { route: window.location.pathname } }));
  }

  async loadGameModule(gameId) {
    logger.info(`Loading game module: ${gameId}`);
    
    try {
      // Set HTML template for the game
      if (!templates[gameId]) {
        throw new Error(`Template not found for game: ${gameId}`);
      }
      
      this.appRoot.innerHTML = templates[gameId];
      
      // Dynamically import game module if not already loaded
      if (!this.gameModules[gameId]) {
        let GameClass, UIClass;
        
        // Use dynamic imports for game logic and UI
        try {
            // Fix for traveling-salesman to use tsp directory
            if (gameId === 'traveling-salesman') {
                GameClass = (await import(`./games/tsp/game.js`)).default;
                UIClass = (await import(`./games/tsp/ui/index.js`)).default;
            } else {
                GameClass = (await import(`./games/${gameId}/game.js`)).default;
                UIClass = (await import(`./games/${gameId}/ui/index.js`)).default;
            }
        } catch (importError) {
            logger.error(`Failed to import module for ${gameId}: ${importError}`);
            throw new Error(`Could not load necessary files for ${gameId}.`);
        }
        
        logger.info(`Initializing new instance of ${gameId} game`);
        const game = new GameClass();
        const ui = new UIClass();
        
        // Store the game and UI instances
        this.gameModules[gameId] = { game, ui };
      }
      
      // Get appropriate element IDs for each game
      let boardId, controlsId, statusId;
      switch (gameId) {
        case 'tower-of-hanoi':
          boardId = 'tower-of-hanoi-board';
          controlsId = 'tower-of-hanoi-controls';
          statusId = 'tower-of-hanoi-status';
          break;
        case 'eight-queens':
          boardId = 'eight-queens-board';
          controlsId = 'eight-queens-controls';
          statusId = 'eight-queens-status';
          break;
        case 'knights-tour':
          boardId = 'knights-tour-board';
          controlsId = 'knights-tour-controls';
          statusId = 'knights-tour-status';
          break;
        case 'tic-tac-toe':
          boardId = 'tic-tac-toe-board';
          controlsId = 'tic-tac-toe-controls';
          statusId = 'tic-tac-toe-status';
          break;
        case 'traveling-salesman':
          boardId = 'tsp-map'; // The container div
          controlsId = 'tsp-controls';
          statusId = 'tsp-status';
          break;
        default:
             throw new Error(`Unknown game ID for UI initialization: ${gameId}`);
      }
      
      // Initialize the UI, passing all relevant element IDs
      try {
        await this.gameModules[gameId].ui.initialize(
          this.gameModules[gameId].game,
          boardId,
          controlsId,
          statusId // Pass status element ID
        );
        // Dispatch event after game UI is initialized
        document.dispatchEvent(new CustomEvent('router:page-loaded', { detail: { route: window.location.pathname } }));
      } catch (uiError) {
        logger.warn(`Could not initialize UI module for ${gameId}: ${uiError}`);
        console.error(uiError);
        this.appRoot.innerHTML = `
            <div class="container mt-4">
              <div class="alert alert-warning">
                <h4>UI Initialization Error</h4>
                <p>Failed to set up the game interface for ${gameId}.</p>
                <p><small>${uiError.message}</small></p>
                <button class="btn btn-primary" onclick="window.router.navigate('/'); return false;">Return to Home</button>
              </div>
            </div>
          `;
      }
    } catch (error) {
      logger.error(`Error loading game module ${gameId}: ${error.message}`);
      console.error(error);
      this.appRoot.innerHTML = `
        <div class="container mt-4">
          <div class="alert alert-danger">
            <h4>Error Loading Game</h4>
            <p>${error.message}</p>
            <button class="btn btn-primary" onclick="window.router.navigate('/'); return false;">Return to Home</button>
          </div>
        </div>
      `;
      // Dispatch event even if loading fails, to update nav link
      document.dispatchEvent(new CustomEvent('router:page-loaded', { detail: { route: window.location.pathname } }));
    }
  }

  renderLoginPage() {
    this.appRoot.innerHTML = `
      <div class="container mt-5">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">Login</div>
              <div class="card-body">
                <form id="loginForm">
                  <div class="mb-3">
                    <label for="username" class="form-label">Username</label>
                    <input type="text" class="form-control" id="username" required>
                  </div>
                  <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" required>
                  </div>
                  <button type="submit" class="btn btn-primary">Login</button>
                </form>
                <div class="mt-3">
                  <p>Don't have an account? <a href="#" onclick="window.router.navigate('/register'); return false;">Register here</a></p>
                </div>
                <div id="loginMessage" class="mt-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add event listener for form submission
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      try {
        const results = window.db.query(
          'SELECT * FROM players WHERE username = ? AND password = ?',
          [username, password]
        );
        
        if (results && results.length > 0) {
          // Store user data in localStorage
          localStorage.setItem('currentUser', JSON.stringify({
            id: results[0].id,
            username: results[0].username
          }));
          
          // Update last login time
          window.db.execute(
            'UPDATE players SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [results[0].id]
          );
          
          document.getElementById('loginMessage').innerHTML = 
            '<div class="alert alert-success">Login successful! Redirecting...</div>';
          
          // Update UI to show logged in state
          this.updateAuthUI();
          
          // Redirect to home after short delay
          setTimeout(() => window.router.navigate('/'), 1500);
        } else {
          document.getElementById('loginMessage').innerHTML = 
            '<div class="alert alert-danger">Invalid username or password</div>';
        }
      } catch (error) {
        console.error('Login error:', error);
        document.getElementById('loginMessage').innerHTML = 
          '<div class="alert alert-danger">Error during login: ' + error.message + '</div>';
      }
    });
    
    // Dispatch page loaded event
    document.dispatchEvent(new CustomEvent('router:page-loaded', { 
      detail: { route: '/login' } 
    }));
  }
  
  renderRegisterPage() {
    this.appRoot.innerHTML = `
      <div class="container mt-5">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">Register</div>
              <div class="card-body">
                <form id="registerForm">
                  <div class="mb-3">
                    <label for="username" class="form-label">Username</label>
                    <input type="text" class="form-control" id="username" required>
                  </div>
                  <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" required>
                  </div>
                  <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" required>
                  </div>
                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label">Confirm Password</label>
                    <input type="password" class="form-control" id="confirmPassword" required>
                  </div>
                  <button type="submit" class="btn btn-primary">Register</button>
                </form>
                <div class="mt-3">
                  <p>Already have an account? <a href="#" onclick="window.router.navigate('/login'); return false;">Login here</a></p>
                </div>
                <div id="registerMessage" class="mt-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add event listener for form submission
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      // Form validation
      if (password !== confirmPassword) {
        document.getElementById('registerMessage').innerHTML = 
          '<div class="alert alert-danger">Passwords do not match</div>';
        return;
      }
      
      try {
        // Check if username or email already exists
        const checkExisting = window.db.query(
          'SELECT * FROM players WHERE username = ? OR email = ?',
          [username, email]
        );
        
        if (checkExisting && checkExisting.length > 0) {
          document.getElementById('registerMessage').innerHTML = 
            '<div class="alert alert-danger">Username or email already exists</div>';
          return;
        }
        
        // Insert new user
        window.db.execute(
          'INSERT INTO players (username, email, password, created_at, verified) VALUES (?, ?, ?, CURRENT_TIMESTAMP, 1)',
          [username, email, password]
        );
        
        // Get user ID of newly created user
        const results = window.db.query(
          'SELECT id FROM players WHERE username = ?',
          [username]
        );
        
        if (results && results.length > 0) {
          // Store user data in localStorage
          localStorage.setItem('currentUser', JSON.stringify({
            id: results[0].id,
            username: username
          }));
          
          document.getElementById('registerMessage').innerHTML = 
            '<div class="alert alert-success">Registration successful! Redirecting...</div>';
          
          // Update UI to show logged in state
          this.updateAuthUI();
          
          // Redirect to home after short delay
          setTimeout(() => window.router.navigate('/'), 1500);
        }
      } catch (error) {
        console.error('Registration error:', error);
        document.getElementById('registerMessage').innerHTML = 
          '<div class="alert alert-danger">Error during registration: ' + error.message + '</div>';
      }
    });
    
    // Dispatch page loaded event
    document.dispatchEvent(new CustomEvent('router:page-loaded', { 
      detail: { route: '/register' } 
    }));
  }
  
  updateAuthUI() {
    // Get auth buttons container
    const authContainer = document.querySelector('.navbar .d-flex');
    if (!authContainer) return;
    
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (currentUser) {
      // User is logged in, show user info and logout button
      authContainer.innerHTML = `
        <span class="navbar-text me-2">
          Welcome, ${currentUser.username}
        </span>
        <button class="btn btn-outline-light" type="button" id="logoutBtn">Logout</button>
      `;
      
      // Add logout functionality
      document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        this.updateAuthUI();
        window.router.navigate('/');
      });
    } else {
      // User is not logged in, show login/register buttons
      authContainer.innerHTML = `
        <button class="btn btn-outline-light me-2" type="button" onclick="window.router.navigate('/login'); return false;">Login</button>
        <button class="btn btn-primary" type="button" onclick="window.router.navigate('/register'); return false;">Register</button>
      `;
    }
  }

  updateActiveNavLink(event) {
    const currentPath = event.detail.route || window.location.pathname;
    logger.debug(`Updating active nav link for path: ${currentPath}`);
    
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        // Check if the link's navigation target matches the current path
        const onclickAttr = link.getAttribute('onclick');
        if (onclickAttr) {
            // Corrected regex: Removed extra backslashes around quotes
            const match = onclickAttr.match(/navigate\('(.*?)'\)/);
            if (match && match[1]) {
                const linkPath = match[1];
                // Handle exact match or if current path starts with game path
                if (currentPath === linkPath || (linkPath !== '/' && currentPath.startsWith(linkPath))) {
                    link.classList.add('active');
                    // If it's a dropdown item, also activate the parent dropdown toggle
                    const dropdownItem = link.closest('.dropdown-item');
                    if (dropdownItem) {
                        const dropdownToggle = dropdownItem.closest('.dropdown').querySelector('.dropdown-toggle');
                        if (dropdownToggle) {
                            dropdownToggle.classList.add('active');
                        }
                    }
                }
            }
        }
    });

    // Special handling for the brand link if on the home page
    const brandLink = document.querySelector('.navbar-brand');
    if (currentPath === '/' || currentPath === '/home') {
        // Optionally add an active state to the brand or home link
        // Corrected querySelector: Removed unnecessary escaping for single quotes
        const homeLink = document.querySelector(".nav-link[onclick*='navigate(\"/home\")']");
        if (homeLink) homeLink.classList.add('active');
    } 
  }
}

// Create and export a singleton instance of the App
const app = new App();
export default app;