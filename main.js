// Room types with their chances
const roomTypes = [
  { name: 'Empty', color: '#f0f0f0', chance: 50, symbol: '' },
  { name: 'Combat', color: '#ffcccc', chance: 15, symbol: 'F' },
  { name: 'Puzzle', color: '#ccffcc', chance: 15, symbol: '?' },
  { name: 'Chest', color: '#ccccff', chance: 20, symbol: 'C' },
];

// Maze data
let maze = {
  width: 10,
  height: 10,
  rooms: [], // 2D array for the maze
  start: { x: 0, y: 0 },
  exits: [], // Array of exit positions
};

// When page loads
window.onload = function () {
  console.log('Maze generator loaded!');
  setupPage();
  makeNewMaze();
};

// Set up the page controls
function setupPage() {
  // Get all the elements we need
  const widthSlider = document.getElementById('widthSlider');
  const heightSlider = document.getElementById('heightSlider');
  const widthNum = document.getElementById('widthNum');
  const heightNum = document.getElementById('heightNum');
  const makeButton = document.getElementById('makeMaze');

  // Update number display when sliders move
  widthSlider.oninput = function () {
    widthNum.textContent = this.value;
  };

  heightSlider.oninput = function () {
    heightNum.textContent = this.value;
  };

  // Make maze when button clicked
  makeButton.onclick = function () {
    console.log('Making new maze...');
    makeNewMaze();
  };
}

// Make a new maze
function makeNewMaze() {
  // Get size from sliders
  const widthSlider = document.getElementById('widthSlider');
  const heightSlider = document.getElementById('heightSlider');

  maze.width = parseInt(widthSlider.value);
  maze.height = parseInt(heightSlider.value);

  console.log('Making maze size: ' + maze.width + 'x' + maze.height);

  // Update the size display
  document.getElementById('sizeDisplay').textContent = maze.width + 'x' +
    maze.height;

  // Make the maze grid
  makeMazeGrid();

  // Generate proper maze connections
  generateMazeConnections();

  // Pick a random start (can be anywhere now)
  pickStart();

  // Find exits (dead ends)
  findExits();

  // Show the maze
  showMaze();

  // Update info
  updateInfo();
}

// Make the maze grid with rooms
function makeMazeGrid() {
  // Clear old maze
  maze.rooms = [];

  // Make 2D array for maze
  for (let row = 0; row < maze.height; row++) {
    maze.rooms[row] = []; // Make a new row

    for (let col = 0; col < maze.width; col++) {
      // Pick a random room type based on chances
      const roomType = pickRoomType();

      // Save this room (connections will be added later)
      maze.rooms[row][col] = {
        x: col,
        y: row,
        type: roomType,
        connections: [],
        visited: false,
        isStart: false,
        isExit: false,
        onBorder: (row === 0 || row === maze.height - 1 ||
          col === 0 || col === maze.width - 1),
      };
    }
  }
}

// Pick a room type based on chances
function pickRoomType() {
  // Make a list with room types repeated based on their chance
  let weightedList = [];

  for (let i = 0; i < roomTypes.length; i++) {
    const room = roomTypes[i];
    // Add the room to the list as many times as its chance
    for (let j = 0; j < room.chance; j++) {
      weightedList.push(room);
    }
  }

  // Pick a random one from the weighted list
  const randomIndex = Math.floor(Math.random() * weightedList.length);
  return weightedList[randomIndex];
}

// Generate maze connections using DFS
function generateMazeConnections() {
  // Reset all connections
  for (let row = 0; row < maze.height; row++) {
    for (let col = 0; col < maze.width; col++) {
      maze.rooms[row][col].connections = [];
      maze.rooms[row][col].visited = false;
    }
  }

  // Choose a random starting point for maze generation
  const startRow = Math.floor(Math.random() * maze.height);
  const startCol = Math.floor(Math.random() * maze.width);

  // Use stack for DFS
  const stack = [[startRow, startCol]];
  maze.rooms[startRow][startCol].visited = true;

  // Directions: up, right, down, left
  const directions = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ];

  while (stack.length > 0) {
    const [row, col] = stack[stack.length - 1];

    // Get unvisited neighbors
    const neighbors = [];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      // Check if within bounds
      if (
        newRow >= 0 && newRow < maze.height &&
        newCol >= 0 && newCol < maze.width
      ) {
        if (!maze.rooms[newRow][newCol].visited) {
          neighbors.push([newRow, newCol, dr, dc]);
        }
      }
    }

    if (neighbors.length > 0) {
      // Pick random neighbor
      const [newRow, newCol, dr, dc] =
        neighbors[Math.floor(Math.random() * neighbors.length)];

      // Connect the rooms (store as direction)
      maze.rooms[row][col].connections.push([dr, dc]);
      maze.rooms[newRow][newCol].connections.push([-dr, -dc]);

      // Mark as visited and add to stack
      maze.rooms[newRow][newCol].visited = true;
      stack.push([newRow, newCol]);
    } else {
      // Backtrack
      stack.pop();
    }
  }
}

// Pick a random start position (can be anywhere in the maze now)
function pickStart() {
  const startRow = Math.floor(Math.random() * maze.height);
  const startCol = Math.floor(Math.random() * maze.width);

  maze.start = { x: startCol, y: startRow };
  maze.rooms[startRow][startCol].isStart = true;

  console.log('Start at: (' + startCol + ', ' + startRow + ')');
}

// Find dead ends to use as exits
function findExits() {
  maze.exits = [];

  // Reset all exit flags
  for (let row = 0; row < maze.height; row++) {
    for (let col = 0; col < maze.width; col++) {
      maze.rooms[row][col].isExit = false;
    }
  }

  // Check each room
  for (let row = 0; row < maze.height; row++) {
    for (let col = 0; col < maze.width; col++) {
      const room = maze.rooms[row][col];

      // Don't make start an exit
      if (room.isStart) continue;

      // Count connections (only real maze connections)
      let connectionCount = room.connections.length;

      // If it's a dead end (only 1 connection) AND it's on the border, it's an exit
      if (connectionCount === 1 && room.onBorder) {
        room.isExit = true;
        maze.exits.push({ x: col, y: row });
      }
    }
  }

  console.log('Found ' + maze.exits.length + ' exit(s)');
}

// Show the maze on the page
function showMaze() {
  const mazeDiv = document.getElementById('maze');

  // Clear old maze
  mazeDiv.innerHTML = '';

  // Set grid size
  mazeDiv.style.gridTemplateColumns = 'repeat(' + maze.width + ', 1fr)';
  mazeDiv.style.gridTemplateRows = 'repeat(' + maze.height + ', 1fr)';

  // Add each room to the maze display
  for (let row = 0; row < maze.height; row++) {
    for (let col = 0; col < maze.width; col++) {
      const room = maze.rooms[row][col];
      const roomDiv = document.createElement('div');

      // Set room color
      roomDiv.style.backgroundColor = room.type.color;
      roomDiv.className = 'room';

      // Add room type symbol
      roomDiv.textContent = room.type.symbol;

      // Mark if start or exit
      if (room.isStart) {
        roomDiv.classList.add('start-room');
      }
      if (room.isExit) {
        roomDiv.classList.add('exit-room');
      }

      // Check for connections in each direction
      const hasUp = room.connections.some(([dr, dc]) => dr === -1 && dc === 0);
      const hasRight = room.connections.some(([dr, dc]) =>
        dr === 0 && dc === 1
      );
      const hasDown = room.connections.some(([dr, dc]) => dr === 1 && dc === 0);
      const hasLeft = room.connections.some(([dr, dc]) =>
        dr === 0 && dc === -1
      );

      // Make walls darker where there are no connections
      const wallColor = '#2c3e50'; // Dark walls
      const wallThickness = '3px'; // Thicker walls

      // Set individual border properties for visibility
      // For top border: no wall if connected up OR if at top and not an exit
      if (row === 0) {
        // Top edge of maze - only no wall if this is an exit room
        roomDiv.style.borderTop = room.isExit
          ? 'none'
          : wallThickness + ' solid ' + wallColor;
      } else {
        roomDiv.style.borderTop = hasUp
          ? 'none'
          : wallThickness + ' solid ' + wallColor;
      }

      // For right border: no wall if connected right OR if at right edge and not an exit
      if (col === maze.width - 1) {
        // Right edge of maze - only no wall if this is an exit room
        roomDiv.style.borderRight = room.isExit
          ? 'none'
          : wallThickness + ' solid ' + wallColor;
      } else {
        roomDiv.style.borderRight = hasRight
          ? 'none'
          : wallThickness + ' solid ' + wallColor;
      }

      // For bottom border: no wall if connected down OR if at bottom edge and not an exit
      if (row === maze.height - 1) {
        // Bottom edge of maze - only no wall if this is an exit room
        roomDiv.style.borderBottom = room.isExit
          ? 'none'
          : wallThickness + ' solid ' + wallColor;
      } else {
        roomDiv.style.borderBottom = hasDown
          ? 'none'
          : wallThickness + ' solid ' + wallColor;
      }

      // For left border: no wall if connected left OR if at left edge and not an exit
      if (col === 0) {
        // Left edge of maze - only no wall if this is an exit room
        roomDiv.style.borderLeft = room.isExit
          ? 'none'
          : wallThickness + ' solid ' + wallColor;
      } else {
        roomDiv.style.borderLeft = hasLeft
          ? 'none'
          : wallThickness + ' solid ' + wallColor;
      }

      // Show coordinates when hovering - FIXED: add 1 to make it human-readable (1-indexed)
      roomDiv.title = room.type.name + ' at (' + (col + 1) + ', ' + (row + 1) +
        ')';

      mazeDiv.appendChild(roomDiv);
    }
  }
}

// Update the info displays
function updateInfo() {
  // Update start position - FIXED: add 1 to make it human-readable (1-indexed)
  document.getElementById('startDisplay').textContent = '(' +
    (maze.start.x + 1) + ', ' + (maze.start.y + 1) + ')';

  // Update exit count
  document.getElementById('exitDisplay').textContent = maze.exits.length;

  // Log exits to console for checking
  if (maze.exits.length > 0) {
    console.log('Exit positions (1-indexed):');
    for (let i = 0; i < maze.exits.length; i++) {
      console.log(
        '  (' + (maze.exits[i].x + 1) + ', ' + (maze.exits[i].y + 1) + ')',
      );
    }
  }
}
