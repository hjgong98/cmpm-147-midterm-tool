// Global variables
let roomTypes = [
  { id: 0, name: 'Empty', color: '#f0f0f0', chance: 50, symbol: '' },
  { id: 1, name: 'Combat', color: '#ffcccc', chance: 15, symbol: 'F' },
  { id: 2, name: 'Puzzle', color: '#ccffcc', chance: 15, symbol: '?' },
  { id: 3, name: 'Chest', color: '#ccccff', chance: 20, symbol: 'C' },
];

let nextRoomId = 4;
let maze = {
  width: 10,
  height: 10,
  rooms: [],
  start: { x: 0, y: 0 },
  exits: [],
};

// Available colors for new room types
const availableColors = [
  '#ffcc99',
  '#ccffff',
  '#ffccff',
  '#ffffcc',
  '#ccffcc',
  '#ffcccc',
  '#ccccff',
  '#e6e6ff',
  '#ffe6e6',
  '#e6ffe6',
  '#e6e6e6',
  '#ffe6cc',
];

// Available symbols for new room types
const availableSymbols = ['T', 'B', 'M', 'W', 'H', 'D', 'P', 'R'];

// When page loads
window.onload = function () {
  console.log('Maze generator loaded!');
  setupPage();
  renderRoomControls();
  renderKey();
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
  const addRoomBtn = document.getElementById('addRoomBtn');

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

    // Check if total is 100%
    const total = calculateTotalPercent();
    const errorMessage = document.getElementById('errorMessage');

    if (total !== 100) {
      errorMessage.style.display = 'block';
      errorMessage.textContent =
        `Total must be exactly 100%! Currently: ${total}%`;
      return;
    } else {
      errorMessage.style.display = 'none';
      makeNewMaze();
    }
  };

  // Add new room type when button clicked
  addRoomBtn.onclick = function () {
    addNewRoomType();
  };
}

// Render room controls in the format: [X] Name [-] % [+]
function renderRoomControls() {
  const roomControls = document.getElementById('roomControls');
  roomControls.innerHTML = '';

  roomTypes.forEach((room, index) => {
    const roomElement = document.createElement('div');
    roomElement.className = 'room-control';
    roomElement.dataset.id = room.id;

    // Delete button [X] - using simple "X" instead of special character
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'X';
    deleteBtn.title = 'Delete this room type';

    deleteBtn.onclick = function () {
      // Check if this is one of the last two rooms
      if (roomTypes.length <= 2) {
        alert('You must have at least 2 room types!');
        return;
      }

      if (
        confirm(`Are you sure you want to remove the "${room.name}" room type?`)
      ) {
        roomTypes.splice(index, 1);
        renderRoomControls();
        renderKey();
        updateTotal();
      }
    };

    // Room name (editable)
    const nameSpan = document.createElement('span');
    nameSpan.className = 'room-name';
    nameSpan.textContent = room.name + ':';

    // Make name editable on click
    nameSpan.onclick = function () {
      const newName = prompt('Enter new room name:', room.name);
      if (newName && newName.trim() !== '') {
        room.name = newName.trim();
        renderRoomControls();
        renderKey();
      }
    };

    // Percentage controls container
    const percentContainer = document.createElement('div');
    percentContainer.className = 'percent-container';

    // Decrease button [-]
    const decreaseBtn = document.createElement('button');
    decreaseBtn.className = 'percent-btn decrease';
    decreaseBtn.textContent = '-';
    decreaseBtn.onclick = function () {
      if (room.chance > 0) {
        room.chance--;
        updatePercentDisplay(index);
        updateTotal();
      }
    };

    // Percent display
    const percentDisplay = document.createElement('span');
    percentDisplay.className = 'percent-display';
    percentDisplay.textContent = room.chance + '%';
    percentDisplay.dataset.index = index;

    // Increase button [+]
    const increaseBtn = document.createElement('button');
    increaseBtn.className = 'percent-btn increase';
    increaseBtn.textContent = '+';
    increaseBtn.onclick = function () {
      if (room.chance < 100) {
        room.chance++;
        updatePercentDisplay(index);
        updateTotal();
      }
    };

    // Assemble percentage controls
    percentContainer.appendChild(decreaseBtn);
    percentContainer.appendChild(percentDisplay);
    percentContainer.appendChild(increaseBtn);

    // Assemble room control in the requested format: [X] Name [-] % [+]
    roomElement.appendChild(deleteBtn);
    roomElement.appendChild(nameSpan);
    roomElement.appendChild(percentContainer);

    roomControls.appendChild(roomElement);
  });

  updateTotal();
}

// Update a single percent display
function updatePercentDisplay(index) {
  const display = document.querySelector(
    `.percent-display[data-index="${index}"]`,
  );
  if (display) {
    display.textContent = roomTypes[index].chance + '%';
  }
}

// Update total percentage display
function updateTotal() {
  const total = calculateTotalPercent();
  document.getElementById('totalPercent').textContent = total;

  // Update error message if needed
  const errorMessage = document.getElementById('errorMessage');
  if (total !== 100) {
    errorMessage.style.display = 'block';
    errorMessage.textContent =
      `Total must be exactly 100%! Currently: ${total}%`;
  } else {
    errorMessage.style.display = 'none';
  }
}

// Calculate total percentage
function calculateTotalPercent() {
  return roomTypes.reduce((sum, room) => sum + room.chance, 0);
}

// Add a new room type
function addNewRoomType() {
  // Find an available color
  const usedColors = roomTypes.map((r) => r.color);
  const availableColor =
    availableColors.find((color) => !usedColors.includes(color)) || '#cccccc';

  // Find an available symbol
  const usedSymbols = roomTypes.map((r) => r.symbol);
  const availableSymbol =
    availableSymbols.find((symbol) => !usedSymbols.includes(symbol)) || 'X';

  const newRoom = {
    id: nextRoomId++,
    name: `Room ${nextRoomId - 3}`,
    color: availableColor,
    chance: 0,
    symbol: availableSymbol,
  };

  roomTypes.push(newRoom);
  renderRoomControls();
  renderKey();
  updateTotal();
}

// Render the key/legend
function renderKey() {
  const keyItems = document.getElementById('keyItems');
  keyItems.innerHTML = '';

  // Add start and exit first
  const startDiv = document.createElement('div');
  startDiv.innerHTML = '<div class="key-color start"></div> Start';
  keyItems.appendChild(startDiv);

  const exitDiv = document.createElement('div');
  exitDiv.innerHTML = '<div class="key-color exit"></div> Exit';
  keyItems.appendChild(exitDiv);

  // Add each room type
  roomTypes.forEach((room) => {
    const roomDiv = document.createElement('div');
    const colorBox = document.createElement('div');
    colorBox.className = 'key-color';
    colorBox.style.backgroundColor = room.color;

    roomDiv.appendChild(colorBox);
    roomDiv.appendChild(document.createTextNode(` ${room.name}`));
    keyItems.appendChild(roomDiv);
  });
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
    maze.rooms[row] = [];

    for (let col = 0; col < maze.width; col++) {
      // Pick a random room type based on chances
      const roomType = pickRoomType();

      // Save this room
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
    for (let j = 0; j < room.chance; j++) {
      weightedList.push(room);
    }
  }

  // If total isn't 100, the list might be empty
  if (weightedList.length === 0) {
    // Default to first room type
    return roomTypes[0];
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

      // Connect the rooms
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

// Pick a random start position
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

      // Count connections
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
      const wallColor = '#2c3e50';
      const wallThickness = '3px';

      // Set individual border properties
      if (row === 0) {
        roomDiv.style.borderTop = room.isExit
          ? 'none'
          : wallThickness + ' solid ' + wallColor;
      } else {
        roomDiv.style.borderTop = hasUp
          ? 'none'
          : wallThickness + ' solid ' + wallColor;
      }

      if (col === maze.width - 1) {
        roomDiv.style.borderRight = room.isExit
          ? 'none'
          : wallThickness + ' solid ' + wallColor;
      } else {
        roomDiv.style.borderRight = hasRight
          ? 'none'
          : wallThickness + ' solid ' + wallColor;
      }

      if (row === maze.height - 1) {
        roomDiv.style.borderBottom = room.isExit
          ? 'none'
          : wallThickness + ' solid ' + wallColor;
      } else {
        roomDiv.style.borderBottom = hasDown
          ? 'none'
          : wallThickness + ' solid ' + wallColor;
      }

      if (col === 0) {
        roomDiv.style.borderLeft = room.isExit
          ? 'none'
          : wallThickness + ' solid ' + wallColor;
      } else {
        roomDiv.style.borderLeft = hasLeft
          ? 'none'
          : wallThickness + ' solid ' + wallColor;
      }

      // Show coordinates when hovering
      roomDiv.title = room.type.name + ' at (' + (col + 1) + ', ' + (row + 1) +
        ')';

      mazeDiv.appendChild(roomDiv);
    }
  }
}

// Update the info displays
function updateInfo() {
  // Update start position
  document.getElementById('startDisplay').textContent = '(' +
    (maze.start.x + 1) + ', ' + (maze.start.y + 1) + ')';

  // Update exit count
  document.getElementById('exitDisplay').textContent = maze.exits.length;

  // Log exits to console
  if (maze.exits.length > 0) {
    console.log('Exit positions (1-indexed):');
    for (let i = 0; i < maze.exits.length; i++) {
      console.log(
        '  (' + (maze.exits[i].x + 1) + ', ' + (maze.exits[i].y + 1) + ')',
      );
    }
  }
}
