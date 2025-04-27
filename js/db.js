/**
 * Client-side SQLite database module
 * Uses SQL.js to provide SQLite functionality in the browser
 */

// SQL.js instance
let db = null;
let initialized = false;

// SQLite module config
const config = {
  locateFile: filename => `js/lib/${filename}`
};

/**
 * Initialize the database
 */
export async function initDatabase() {
  if (initialized) {
    console.log('Database already initialized');
    return;
  }
  
  try {
    // Load SQL.js WebAssembly module
    const SQL = await initSqlJs(config);
    
    // Check for existing database in localStorage
    const savedDb = localStorage.getItem('game_db');
    
    let needToSetupTables = false;
    
    if (savedDb) {
      try {
        // Convert base64 string to Uint8Array
        const dbData = _base64ToArrayBuffer(savedDb);
        db = new SQL.Database(new Uint8Array(dbData));
        console.log('Database loaded from localStorage');
        
        // Check if tables exist and have the correct schema
        try {
          // Check if algorithm_performance table has the details column
          const columnsResult = query(`PRAGMA table_info(algorithm_performance)`);
          let hasDetailsColumn = false;
          
          for (let col of columnsResult) {
            if (col.name === 'details') {
              hasDetailsColumn = true;
              break;
            }
          }
          
          if (!hasDetailsColumn) {
            console.log('Database schema is outdated, missing details column. Resetting database...');
            needToSetupTables = true;
            resetDatabase();
          }
        } catch (schemaError) {
          console.error('Error checking database schema:', schemaError);
          needToSetupTables = true;
        }
      } catch (err) {
        console.error('Failed to load database from localStorage:', err);
        db = new SQL.Database();
        console.log('Created new database after load failure');
        needToSetupTables = true;
      }
    } else {
      // Create new database
      db = new SQL.Database();
      console.log('Created new database - no existing database found');
      needToSetupTables = true;
    }
    
    // Setup tables if needed
    if (needToSetupTables) {
      setupTables();
      console.log('Database tables created with updated schema');
      // Force an immediate save of the new database
      saveToLocalStorage();
    }
    
    // Setup auto-save on page unload
    setupAutoSave();
    
    // Make db available globally for debugging/resets
    window.db = {
      execute,
      query,
      exportDatabase,
      createGameRecord,
      saveAlgorithmPerformance,
      endGame,
      resetDatabase
    };
    
    // Make resetDatabase easy to access for debugging
    window.resetDB = resetDatabase;
    
    initialized = true;
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Set up auto-save functionality
 */
function setupAutoSave() {
  window.addEventListener('beforeunload', () => {
    saveToLocalStorage();
  });
  
  // Also save every minute
  setInterval(saveToLocalStorage, 60000);
}

/**
 * Save database to localStorage
 */
function saveToLocalStorage() {
  if (!db) return;
  
  try {
    const data = db.export();
    const base64 = _arrayBufferToBase64(data);
    localStorage.setItem('game_db', base64);
    console.log('Database saved to localStorage');
  } catch (error) {
    console.error('Failed to save database to localStorage:', error);
  }
}

/**
 * Export database as a downloadable file
 */
export function exportDatabase() {
  if (!db) {
    console.error('Database not initialized');
    return;
  }
  
  try {
    // Get database as Uint8Array
    const data = db.export();
    
    // Create a blob
    const blob = new Blob([data], { type: 'application/octet-stream' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-database-${new Date().toISOString().slice(0, 10)}.db`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    console.log('Database exported successfully');
  } catch (error) {
    console.error('Failed to export database:', error);
    alert('Failed to export database: ' + error.message);
  }
}

/**
 * Execute SQL statement
 * @param {string} sql - SQL statement
 * @param {Array} params - Parameters
 * @returns {Object} Result
 */
export function execute(sql, params = []) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  try {
    return db.run(sql, params);
  } catch (error) {
    console.error('Failed to execute SQL:', sql, params, error);
    throw error;
  }
}

/**
 * Execute SQL query and return results
 * @param {string} sql - SQL query
 * @param {Array} params - Parameters
 * @returns {Array} Results
 */
export function query(sql, params = []) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  try {
    const stmt = db.prepare(sql);
    const results = [];
    
    if (params.length) {
      stmt.bind(params);
    }
    
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    
    stmt.free();
    return results;
  } catch (error) {
    console.error('Failed to execute query:', sql, params, error);
    throw error;
  }
}

/**
 * Set up database tables if starting with a new database
 */
function setupTables() {
  // Players table
  execute(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE, 
      password VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      verified BOOLEAN DEFAULT FALSE
    )
  `);

  // Games table
  execute(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_type VARCHAR(50) NOT NULL,
      player_id INTEGER,
      settings TEXT,
      status VARCHAR(20),
      start_time DATETIME,
      end_time DATETIME,
      duration_seconds INTEGER,
      FOREIGN KEY (player_id) REFERENCES players(id)
    )
  `);

  // Algorithm Performance table
  execute(`
    CREATE TABLE IF NOT EXISTS algorithm_performance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      algorithm_name VARCHAR(50) NOT NULL,
      execution_time FLOAT NOT NULL,
      solution_found BOOLEAN DEFAULT TRUE,
      execution_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      details TEXT,
      FOREIGN KEY (game_id) REFERENCES games(id)
    )
  `);

  // Knights Tour table
  execute(`
    CREATE TABLE IF NOT EXISTS knights_tour (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      start_position TEXT NOT NULL,
      move_sequence TEXT,
      algorithm_type VARCHAR(50),
      execution_time FLOAT,
      FOREIGN KEY (game_id) REFERENCES games(id)
    )
  `);

  // Tic Tac Toe table
  execute(`
    CREATE TABLE IF NOT EXISTS tic_tac_toe (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      board_size INTEGER DEFAULT 5,
      moves TEXT,
      winner VARCHAR(10),
      move_count INTEGER,
      algorithm_type VARCHAR(50),
      FOREIGN KEY (game_id) REFERENCES games(id)
    )
  `);

  // Traveling Salesman table
  execute(`
    CREATE TABLE IF NOT EXISTS tsp (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      cities TEXT NOT NULL,
      distances TEXT NOT NULL,
      home_city VARCHAR(10),
      path TEXT,
      total_distance FLOAT,
      algorithm_type VARCHAR(50),
      FOREIGN KEY (game_id) REFERENCES games(id)
    )
  `);

  // Tower of Hanoi table
  execute(`
    CREATE TABLE IF NOT EXISTS tower_of_hanoi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      disk_count INTEGER NOT NULL,
      peg_count INTEGER NOT NULL,
      move_sequence TEXT,
      move_count INTEGER,
      algorithm_type VARCHAR(50),
      FOREIGN KEY (game_id) REFERENCES games(id)
    )
  `);

  // Eight Queens table
  execute(`
    CREATE TABLE IF NOT EXISTS eight_queens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      board_size INTEGER DEFAULT 8,
      algorithm_type VARCHAR(50),
      thread_count INTEGER DEFAULT 1,
      FOREIGN KEY (game_id) REFERENCES games(id)
    )
  `);

  // Eight Queens Solutions table (New)
  execute(`
    CREATE TABLE IF NOT EXISTS eight_queens_solutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      solution TEXT NOT NULL UNIQUE, -- Store solution as JSON string of {row, col} array
      found_by_player BOOLEAN DEFAULT FALSE,
      first_found_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database tables created successfully');
}

/**
 * Create a new game record
 * @param {Object} gameData - Game data to save
 * @returns {Object} Game object with ID
 */
export function createGameRecord(gameData) {
  if (!initialized) {
    throw new Error('Database not initialized');
  }
  
  try {
    // Insert into games table
    const gameInsert = db.prepare(
      'INSERT INTO games (game_type, player_id, settings, status, start_time) VALUES (?, ?, ?, ?, datetime("now"))'
    );
    
    gameInsert.run([
      gameData.gameType,
      gameData.playerId || null,
      JSON.stringify(gameData.settings || {}),
      'active'
    ]);
    
    // Get the inserted ID
    const result = query('SELECT last_insert_rowid() as id');
    const gameId = result[0].id;
    
    // Create game-specific records based on game type
    switch (gameData.gameType) {
      case 'knightsTour': {
        const startPosition = gameData.settings.startPosition || 'a1';
        const ktInsert = db.prepare(
          'INSERT INTO knights_tour (game_id, start_position) VALUES (?, ?)'
        );
        ktInsert.run([gameId, startPosition]);
        ktInsert.free();
        break;
      }
        
      case 'towerOfHanoi': {
        const settings = gameData.settings || {};
        const tohInsert = db.prepare(
          'INSERT INTO tower_of_hanoi (game_id, disk_count, peg_count) VALUES (?, ?, ?)'
        );
        tohInsert.run([gameId, settings.diskCount || 3, settings.pegCount || 3]);
        tohInsert.free();
        break;
      }
        
      case 'eightQueens': {
        const eqInsert = db.prepare(
          'INSERT INTO eight_queens (game_id, board_size) VALUES (?, ?)'
        );
        eqInsert.run([gameId, gameData.settings?.boardSize || 8]);
        eqInsert.free();
        break;
      }
        
      case 'ticTacToe': {
        const tttInsert = db.prepare(
          'INSERT INTO tic_tac_toe (game_id, board_size) VALUES (?, ?)'
        );
        tttInsert.run([gameId, gameData.settings?.boardSize || 5]);
        tttInsert.free();
        break;
      }
        
      case 'tsp': {
        const settings = gameData.settings || {};
        const tspInsert = db.prepare(
          'INSERT INTO tsp (game_id, cities, distances, home_city) VALUES (?, ?, ?, ?)'
        );
        tspInsert.run([
          gameId, 
          JSON.stringify(settings.cities || []), 
          JSON.stringify(settings.distances || []),
          settings.homeCity || 'A'
        ]);
        tspInsert.free();
        break;
      }
    }
    
    gameInsert.free();
    
    return {
      success: true,
      gameId: gameId,
      message: 'Game created successfully'
    };
  } catch (error) {
    console.error('Failed to create game record:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save algorithm performance data
 * @param {Object} data - Performance data
 * @param {number} data.gameId - Game ID
 * @param {string} data.algorithmName - Algorithm name
 * @param {number} data.executionTime - Execution time in ms
 * @param {boolean} data.solutionFound - Whether solution was found
 * @param {string} data.gameType - Game type
 * @param {Object} data.details - Additional details (optional)
 * @returns {Object} Result with success/error
 */
export function saveAlgorithmPerformance(data) {
  try {
    // Validate required fields
    if (!data.gameId || !data.algorithmName || data.executionTime === undefined) {
      return { 
        success: false, 
        error: 'Missing required fields for algorithm performance' 
      };
    }
    
    // Insert into algorithm_performance table
    execute(`
      INSERT INTO algorithm_performance (
        game_id,
        algorithm_name,
        execution_time,
        solution_found,
        execution_date,
        details
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
    `, [
      data.gameId,
      data.algorithmName,
      data.executionTime,
      data.solutionFound ? 1 : 0,
      data.details ? JSON.stringify(data.details) : null
    ]);
    
    // Save to localStorage after the operation
    saveToLocalStorage();
    
    return { 
      success: true, 
      message: 'Algorithm performance saved successfully' 
    };
  } catch (error) {
    console.error('Failed to save algorithm performance:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * End a game
 * @param {Object} data - End game data
 * @returns {Object} Result object
 */
export function endGame(data) {
  if (!initialized) {
    throw new Error('Database not initialized');
  }
  
  try {
    // Calculate duration
    const gameData = query(
      'SELECT start_time FROM games WHERE id = ?', 
      [data.gameId]
    );
    
    let durationSeconds = 0;
    
    if (gameData.length > 0) {
      const startTime = new Date(gameData[0].start_time);
      const endTime = new Date();
      durationSeconds = Math.floor((endTime - startTime) / 1000);
    }
    
    // Update games table
    const gameUpdate = db.prepare(
      'UPDATE games SET status = ?, end_time = datetime("now"), duration_seconds = ? WHERE id = ?'
    );
    
    gameUpdate.run([
      data.status || 'completed',
      durationSeconds,
      data.gameId
    ]);
    
    gameUpdate.free();
    
    return {
      success: true,
      message: 'Game ended successfully'
    };
  } catch (error) {
    console.error('Failed to end game:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reset the database - clears all data and recreates tables
 * @returns {Object} Result with success/error
 */
export function resetDatabase() {
  if (!db) {
    console.error('Database not initialized');
    return { success: false, message: 'Database not initialized' };
  }
  
  try {
    // Drop all tables
    execute('DROP TABLE IF EXISTS algorithm_performance');
    execute('DROP TABLE IF EXISTS knights_tour');
    execute('DROP TABLE IF EXISTS tic_tac_toe');
    execute('DROP TABLE IF EXISTS tsp');
    execute('DROP TABLE IF EXISTS tower_of_hanoi');
    execute('DROP TABLE IF EXISTS eight_queens');
    execute('DROP TABLE IF EXISTS eight_queens_solutions');
    execute('DROP TABLE IF EXISTS games');
    execute('DROP TABLE IF EXISTS players');
    
    // Recreate tables
    setupTables();
    
    // Save to localStorage
    saveToLocalStorage();
    
    console.log('Database reset successfully');
    return { success: true, message: 'Database reset successfully' };
  } catch (error) {
    console.error('Failed to reset database:', error);
    return { success: false, error: error.message };
  }
}

// Make resetDatabase globally accessible
window.dbReset = resetDatabase;

/**
 * Convert ArrayBuffer to Base64
 * @param {ArrayBuffer} buffer - ArrayBuffer to convert
 * @returns {string} Base64 string
 */
function _arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return window.btoa(binary);
}

/**
 * Convert Base64 to ArrayBuffer
 * @param {string} base64 - Base64 string to convert
 * @returns {ArrayBuffer} ArrayBuffer
 */
function _base64ToArrayBuffer(base64) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  
  return bytes.buffer;
}

export default {
  initDatabase,
  execute,
  query,
  exportDatabase,
  createGameRecord,
  saveAlgorithmPerformance,
  endGame
};