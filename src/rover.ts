export {};

const canvas = document.querySelector<HTMLCanvasElement>("#rover-canvas")!;
const ctx = canvas.getContext("2d")!;
const readout = document.querySelector<HTMLParagraphElement>("#rover-readout")!;
const headings = ["North", "East", "South", "West"];
let x = 2;
let y = 2;
let direction = 0;

type Command = {
  label: string;
  execute: () => void;
};

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
  ctx.rotate(direction * Math.PI / 2);
  ctx.fillStyle = "#27766b";
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(17, 16);
  ctx.lineTo(-17, 16);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  readout.textContent = `Position: (${x}, ${y}) · Facing: ${
    headings[direction]
  }`;
}

function moveForward(): void {
  if (direction === 0) y = Math.max(0, y - 1);
  if (direction === 1) x = Math.min(4, x + 1);
  if (direction === 2) y = Math.min(4, y + 1);
  if (direction === 3) x = Math.max(0, x - 1);
}

function turnRight(): void {
  direction = (direction + 1) % 4;
}

function resetRover(): void {
  x = 2;
  y = 2;
  direction = 0;
}
const forwardCommand: Command = { label: "Forward", execute: moveForward };
const turnRightCommand: Command = { label: "Right", execute: turnRight };

function runCommand(command: Command): void {
  command.execute();
  drawRover();
}

document.querySelector<HTMLButtonElement>("#rover-forward")!.onclick = () => {
  runCommand(forwardCommand);
};
document.querySelector<HTMLButtonElement>("#rover-right")!.onclick = () => {
  runCommand(turnRightCommand);
};
document.querySelector<HTMLButtonElement>("#rover-reset")!.onclick = () => {
  resetRover();
  drawRover();
};
drawRover();
