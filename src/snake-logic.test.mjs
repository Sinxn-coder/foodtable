import test from "node:test";
import assert from "node:assert/strict";

import {
  createFoodPosition,
  createInitialState,
  hitsBoundary,
  hitsSnake,
  queueDirection,
  setStatus,
  tickGame,
} from "./snake-logic.js";

test("snake moves one cell in the active direction", () => {
  const running = setStatus(createInitialState(8), "running");
  const next = tickGame(running, () => 0);

  assert.deepEqual(next.snake[0], { x: 5, y: 4 });
  assert.equal(next.score, 0);
});

test("snake grows and score increments when food is eaten", () => {
  const initial = createInitialState(8);
  const running = setStatus(
    {
      ...initial,
      food: { x: initial.snake[0].x + 1, y: initial.snake[0].y },
    },
    "running",
  );

  const next = tickGame(running, () => 0);

  assert.equal(next.snake.length, running.snake.length + 1);
  assert.equal(next.score, 1);
  assert.notDeepEqual(next.food, running.food);
});

test("reverse direction input is ignored", () => {
  const next = queueDirection(createInitialState(8), "left");
  assert.equal(next.pendingDirection, "right");
});

test("boundary collision ends the game", () => {
  const over = tickGame(
    {
      gridSize: 4,
      snake: [{ x: 3, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 1 }],
      direction: "right",
      pendingDirection: "right",
      food: { x: 0, y: 0 },
      score: 0,
      status: "running",
    },
    () => 0,
  );

  assert.equal(over.status, "over");
});

test("food placement skips snake cells", () => {
  const food = createFoodPosition(
    3,
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
    () => 0,
  );

  assert.deepEqual(food, { x: 2, y: 2 });
});

test("helpers detect collisions", () => {
  assert.equal(hitsBoundary({ x: -1, y: 0 }, 4), true);
  assert.equal(hitsSnake({ x: 1, y: 2 }, [{ x: 1, y: 2 }]), true);
});
