/**
 * Client-side router using Browser History API
 */

class Router {
  constructor() {
    this.routes = {};
    this.root = null; // Initialize as null to check later
    this.templates = {};
    this.currentRoute = null;
    
    // Handle back/forward navigation
    window.addEventListener('popstate', (event) => {
      this.handleRoute(window.location.pathname);
    });
    
    // Export router to window for access in HTML
    window.router = this;
  }
  
  /**
   * Initialize the router
   */
  async init() {
    // Make sure app root exists
    this.root = document.getElementById('app-root');
    if (!this.root) {
      console.error('Router initialization failed: app-root element not found');
      return;
    }

    // Pre-load templates for common pages
    await this.loadTemplates([
      'home',
      'knights-tour', 
      'tower-of-hanoi', 
      'eight-queens', 
      'tic-tac-toe', 
      'traveling-salesman'
    ]);
    
    // Initialize with current URL
    const path = window.location.pathname;
    console.log(`Router initializing with path: ${path || '/'}`);
    
    // If path is empty, default to '/'
    this.handleRoute(path || '/');

    console.log('Router initialized successfully');
    return this;
  }
  
  /**
   * Register routes
   * @param {Object} routes - Routes to register
   */
  registerRoutes(routes) {
    this.routes = { ...this.routes, ...routes };
    console.log('Routes registered:', Object.keys(this.routes));
  }
  
  /**
   * Navigate to a route
   * @param {string} path - Path to navigate to
   */
  navigate(path) {
    console.log(`Navigating to: ${path}`);
    
    // Update browser history
    window.history.pushState(
      { path },
      '',
      path
    );
    
    // Handle the new route
    this.handleRoute(path);
  }
  
  /**
   * Handle a route
   * @param {string} path - Current path
   */
  async handleRoute(path) {
    // Default to home page if path is empty
    if (!path || path === '') {
      path = '/';
    }
    
    console.log(`Handling route: ${path}`);
    
    // Make sure root element exists
    if (!this.root) {
      this.root = document.getElementById('app-root');
      if (!this.root) {
        console.error('Cannot handle route: app-root element not found');
        return;
      }
    }

    // Remove trailing slash if present (except for root path)
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    
    // Store current route for reference
    this.currentRoute = path;
    
    // Find matching route
    let routeHandler = null;
    let params = {};
    
    // Check for exact matches first
    if (this.routes[path]) {
      routeHandler = this.routes[path];
    } else {
      // Check for parameterized routes
      for (const route in this.routes) {
        if (this.routes.hasOwnProperty(route) && route.includes(':')) {
          const routeParts = route.split('/');
          const pathParts = path.split('/');
          
          if (routeParts.length === pathParts.length) {
            let match = true;
            const tempParams = {};
            
            for (let i = 0; i < routeParts.length; i++) {
              if (routeParts[i].startsWith(':')) {
                const paramName = routeParts[i].substring(1);
                tempParams[paramName] = pathParts[i];
              } else if (routeParts[i] !== pathParts[i]) {
                match = false;
                break;
              }
            }
            
            if (match) {
              routeHandler = this.routes[route];
              params = tempParams;
              break;
            }
          }
        }
      }
    }
    
    // Handle 404 if no route found
    if (!routeHandler) {
      console.warn(`No route found for ${path}`);
      this.renderError(`Page Not Found: ${path}`, 'The requested page does not exist.', '/home');
      return;
    }
    
    try {
      // Show loading indicator
      this.showLoading();
      
      // Execute route handler
      if (typeof routeHandler === 'function') {
        await routeHandler(params);
      } else if (typeof routeHandler === 'string') {
        // If string, treat as template name
        this.renderTemplate(routeHandler, params);
      } else {
        throw new Error('Invalid route handler');
      }
    } catch (error) {
      console.error('Error handling route:', error);
      this.renderError(`Failed to load route: ${path}`, error.message, '/home');
    }
  }
  
  /**
   * Load templates for pages
   * @param {Array} templateNames - Names of templates to load
   */
  async loadTemplates(templateNames) {
    try {
      for (const name of templateNames) {
        // For simplicity, we'll create dummy templates in memory
        // In a real application, you would load these from files
        this.templates[name] = this.createDummyTemplate(name);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }
  
  /**
   * Create a dummy template for development
   * @param {string} name - Template name
   * @returns {string} HTML template
   */
  createDummyTemplate(name) {
    switch (name) {
      case 'home':
        return `
          <div class="container mt-5">
            <div class="jumbotron">
              <h1 class="display-4">PDSA-II Game Project</h1>
              <p class="lead">Welcome to the Algorithmic Games Collection</p>
              <hr class="my-4">
              <p>This application features five different games implementing various algorithms and data structures.</p>
              <div class="row mt-5">
                <div class="col-md-4 mb-4">
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">Knight's Tour</h5>
                      <p class="card-text">Implement the Knight's Tour chess problem with different algorithms.</p>
                      <button class="btn btn-primary" onclick="window.router.navigate('/games/knights-tour')">Play</button>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 mb-4">
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">Tower of Hanoi</h5>
                      <p class="card-text">Solve the Tower of Hanoi puzzle using various algorithms.</p>
                      <button class="btn btn-primary" onclick="window.router.navigate('/games/tower-of-hanoi')">Play</button>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 mb-4">
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">Eight Queens</h5>
                      <p class="card-text">Place eight queens on a chessboard without threatening each other.</p>
                      <button class="btn btn-primary" onclick="window.router.navigate('/games/eight-queens')">Play</button>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 mb-4">
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">Tic-Tac-Toe</h5>
                      <p class="card-text">Play Tic-Tac-Toe against AI algorithms on a 5×5 grid.</p>
                      <button class="btn btn-primary" onclick="window.router.navigate('/games/tic-tac-toe')">Play</button>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 mb-4">
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">Traveling Salesman</h5>
                      <p class="card-text">Solve the Traveling Salesman Problem with multiple algorithms.</p>
                      <button class="btn btn-primary" onclick="window.router.navigate('/games/traveling-salesman')">Play</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      case '404':
        return `
          <div class="container mt-5">
            <div class="alert alert-danger" role="alert">
              <h4 class="alert-heading">Page Not Found</h4>
              <p>The requested page does not exist.</p>
              <hr>
              <button class="btn btn-primary" onclick="window.router.navigate('/home')">Return Home</button>
            </div>
          </div>
        `;
      case 'knights-tour':
        return `
          <div class="container mt-4">
            <h1>Knight's Tour</h1>
            <div class="row">
              <div class="col-md-8">
                <div id="knights-tour-board" class="mb-4"></div>
              </div>
              <div class="col-md-4">
                <div id="knights-tour-controls"></div>
              </div>
            </div>
            <div id="knights-tour-status" class="mt-4"></div>
          </div>
        `;
      case 'tower-of-hanoi':
        return `
          <div class="container mt-4">
            <h1>Tower of Hanoi</h1>
            <div id="tower-of-hanoi-board" class="mb-4"></div>
            <div id="tower-of-hanoi-controls" class="mb-4"></div>
            <div id="tower-of-hanoi-status" class="mt-4"></div>
          </div>
        `;
      case 'eight-queens':
        return `
          <div class="container mt-4">
            <h1>Eight Queens Puzzle</h1>
            <div id="eight-queens-board" class="mb-4"></div>
            <div id="eight-queens-controls" class="mb-4"></div>
            <div id="eight-queens-status" class="mt-4"></div>
          </div>
        `;
      case 'tic-tac-toe':
        return `
          <div class="container mt-4">
            <h1>Tic-Tac-Toe</h1>
            <div id="tic-tac-toe-board" class="mb-4"></div>
            <div id="tic-tac-toe-controls" class="mb-4"></div>
            <div id="tic-tac-toe-status" class="mt-4"></div>
          </div>
        `;
      case 'traveling-salesman':
        return `
          <div class="container mt-4">
            <h1>Traveling Salesman Problem</h1>
            <div class="canvas-container mb-4">
              <canvas id="tsp-canvas" width="800" height="600"></canvas>
              <div class="canvas-info">
                <div id="tsp-info"></div>
              </div>
            </div>
            <div id="tsp-controls" class="mb-4"></div>
            <div id="tsp-results" class="mt-4"></div>
          </div>
        `;
      default:
        return `
          <div class="container mt-5">
            <div class="alert alert-info">
              <h4>${name}</h4>
              <p>Template for ${name} is loading...</p>
            </div>
          </div>
        `;
    }
  }
  
  /**
   * Render a template
   * @param {string} templateName - Template name
   * @param {Object} data - Data to pass to the template
   */
  renderTemplate(templateName, data = {}) {
    if (this.templates[templateName]) {
      this.root.innerHTML = this.templates[templateName];
      
      // Trigger event for game initialization
      const event = new CustomEvent('router:page-loaded', { 
        detail: { 
          route: this.currentRoute,
          templateName,
          data
        } 
      });
      
      document.dispatchEvent(event);
    } else {
      this.renderError(`Template Error`, `Template "${templateName}" not found`, '/home');
    }
  }
  
  /**
   * Show loading indicator
   */
  showLoading() {
    if (!this.root) return;
    
    this.root.innerHTML = `
      <div class="d-flex justify-content-center align-items-center" style="height: 80vh;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
  }
  
  /**
   * Render error message
   * @param {string} title - Error title
   * @param {string} message - Error message
   * @param {string} returnPath - Path to return to
   */
  renderError(title, message, returnPath = '/home') {
    if (!this.root) return;
    
    this.root.innerHTML = `
      <div class="container mt-5">
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">${title}</h4>
          <p>${message}</p>
          <hr>
          <button class="btn btn-primary" onclick="window.router.navigate('${returnPath}')">Return Home</button>
        </div>
      </div>
    `;
  }
}

// Create and export router
const router = new Router();
export default router;