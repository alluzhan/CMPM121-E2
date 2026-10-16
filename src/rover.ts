export {};

const canvas = document.querySelector<HTMLCanvasElement>("#rover-canvas")!;
const ctx = canvas.getContext("2d")!;
const readout = document.querySelector<HTMLParagraphElement>("#rover-readout")!;
const pendingList = document.querySelector<HTMLOListElement>("#rover-pending")!;
const queueStatus = document.querySelector<HTMLParagraphElement>(
  "#rover-queue-status",
)!;
const runButton = document.querySelector<HTMLButtonElement>("#rover-run")!;
const clearButton = document.querySelector<HTMLButtonElement>("#rover-clear")!;

const gridSize = 5;
const startingX = 2;
const startingY = 2;
const startingDirectionIndex = 0;

type Command = {
  label: string;
  execute: () => void;
};
const commandQueue: Command[] = [];

function showPendingCommands(): void {
  pendingList.replaceChildren();
  commandQueue.forEach((command) => {
    const item = document.createElement("li");
    item.textContent = command.label;
    pendingList.append(item);
  });
  const count = commandQueue.length;
  queueStatus.textContent = count === 0 ? "Empty" : `${count} pending`;
}

function enqueue(command: Command): void {
  commandQueue.push(command);
  showPendingCommands();
}

function runPendingCommands(): void {
  commandQueue.splice(0).forEach((command) => command.execute());
  drawRover();
  showPendingCommands();
}

function clearPendingCommands(): void {
  commandQueue.length = 0;
  showPendingCommands();
}

type Direction = {
  name: string;
  x: number;
  y: number;
};
const directions: Direction[] = [
  { name: "North", x: 0, y: -1 },
  { name: "East", x: 1, y: 0 },
  { name: "South", x: 0, y: 1 },
  { name: "West", x: -1, y: 0 },
];

let x = startingX;
let y = startingY;
let directionIndex = startingDirectionIndex;

function drawRover(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#718881";
  for (let row = 0; row < 5; row++) {
    for (let column = 0; column < 5; column++) {
      ctx.strokeRect(10 + column * 56, 10 + row * 56, 56, 56);
    }
  }
  ctx.save();
  ctx.translate(38 + x * 56, 38 + y * 56);
  ctx.rotate(directionIndex * Math.PI / 2);
  ctx.fillStyle = "#27766b";
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(17, 16);
  ctx.lineTo(-17, 16);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  const heading = directions[directionIndex];
  readout.textContent = `Position: (${x}, ${y}) · Facing: ${heading.name}`;
}

function boundMovement(value: number): number {
  return Math.max(0, Math.min(gridSize - 1, value));
}

function moveForward(): void {
  const heading = directions[directionIndex];
  x = boundMovement(x + heading.x);
  y = boundMovement(y + heading.y);
}

function turnRight(): void {
  directionIndex = (directionIndex + 1) % directions.length;
}

function resetRover(): void {
  x = startingX;
  y = startingY;
  directionIndex = startingDirectionIndex;
}
const forwardCommand: Command = { label: "Forward", execute: moveForward };
const turnRightCommand: Command = { label: "Right", execute: turnRight };

document.querySelector<HTMLButtonElement>("#rover-forward")!.onclick = () => {
  enqueue(forwardCommand);
};
document.querySelector<HTMLButtonElement>("#rover-right")!.onclick = () => {
  enqueue(turnRightCommand);
};
document.querySelector<HTMLButtonElement>("#rover-reset")!.onclick = () => {
  resetRover();
  clearPendingCommands();
  drawRover();
};

runButton.disabled = false;
clearButton.disabled = false;
runButton.onclick = runPendingCommands;
clearButton.onclick = clearPendingCommands;
drawRover();
showPendingCommands();
