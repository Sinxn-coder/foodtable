export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = "right";
export const TICK_MS = 160;

const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITES = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function createInitialState(gridSize = GRID_SIZE) {
  const center = Math.floor(gridSize / 2);
  const snake = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];

  return {
    gridSize,
    snake,
    direction: INITIAL_DIRECTION,
    pendingDirection: INITIAL_DIRECTION,
    food: createFoodPosition(gridSize, snake),
    score: 0,
    status: "ready",
  };
}

export function queueDirection(state, nextDirection) {
  if (!DIRECTION_VECTORS[nextDirection]) {
    return state;
  }

  const referenceDirection =
    state.pendingDirection && state.pendingDirection !== state.direction
      ? state.pendingDirection
      : state.direction;

  if (OPPOSITES[referenceDirection] === nextDirection) {
    return state;
  }

  return {
    ...state,
    pendingDirection: nextDirection,
  };
}

export function tickGame(state, random = Math.random) {
  if (state.status !== "running") {
    return state;
  }

  const direction = state.pendingDirection ?? state.direction;
  const movement = DIRECTION_VECTORS[direction];
  const head = state.snake[0];
  const nextHead = { x: head.x + movement.x, y: head.y + movement.y };
  const willEat =
    state.food !== null && nextHead.x === state.food.x && nextHead.y === state.food.y;
  const nextSnake = willEat
    ? [nextHead, ...state.snake]
    : [nextHead, ...state.snake.slice(0, -1)];

  if (hitsBoundary(nextHead, state.gridSize) || hitsSnake(nextHead, nextSnake.slice(1))) {
    return {
      ...state,
      direction,
      pendingDirection: direction,
      status: "over",
    };
  }

  const nextFood = willEat ? createFoodPosition(state.gridSize, nextSnake, random) : state.food;

  return {
    ...state,
    snake: nextSnake,
    direction,
    pendingDirection: direction,
    food: nextFood,
    score: willEat ? state.score + 1 : state.score,
    status: willEat && nextFood === null ? "over" : state.status,
  };
}

export function setStatus(state, status) {
  return {
    ...state,
    status,
  };
}

export function createFoodPosition(gridSize, snake, random = Math.random) {
  const openCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      if (!snake.some((segment) => segment.x === x && segment.y === y)) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) {
    return null;
  }

  const index = Math.floor(random() * openCells.length);
  return openCells[index];
}

export function hitsBoundary(position, gridSize) {
  return position.x < 0 || position.y < 0 || position.x >= gridSize || position.y >= gridSize;
}

export function hitsSnake(position, snake) {
  return snake.some((segment) => segment.x === position.x && segment.y === position.y);
}
