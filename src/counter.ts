export {};

const canvas = document.querySelector<HTMLCanvasElement>("#counter-canvas")!;
const ctx = canvas.getContext("2d")!;
const readout = document.querySelector<HTMLParagraphElement>(
  "#counter-readout",
)!;
const host = document.querySelector<HTMLDivElement>("#counter-panel-host")!;
const diagnostic = document.querySelector<HTMLParagraphElement>(
  "#counter-diagnostic",
)!;

const shieldMax = 10;

type ShieldSnapshot = {
  charge: number;
  capacity: number;
  missingCharge: number;
};
const shieldChangedEvent = "shield-changed";
const shieldEvents = new EventTarget();

let shieldCharge = 0;
let panel: HTMLParagraphElement | null = null;
let panelUpdates = 0;

function takeShieldSnapshot(): ShieldSnapshot {
  return {
    charge: shieldCharge,
    capacity: shieldMax,
    missingCharge: shieldMax - shieldCharge,
  };
}

// EventTarget hands listeners a plain Event, so read the snapshot out here.
function snapshotOf(event: Event): ShieldSnapshot {
  return (event as CustomEvent<ShieldSnapshot>).detail;
}

function shieldAnnouncement(snapshot: ShieldSnapshot): void {
  shieldEvents.dispatchEvent(
    new CustomEvent<ShieldSnapshot>(shieldChangedEvent, { detail: snapshot }),
  );
}

function drawMeter(snapshot: ShieldSnapshot) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < snapshot.capacity; i++) {
    ctx.fillStyle = i < snapshot.charge ? "#27766b" : "#c9d2c9";
    ctx.fillRect(12 + i * 28, 24, 24, 48);
  }
  ctx.fillStyle = "#233e43";
  ctx.font = "16px system-ui";
  ctx.fillText(`${snapshot.charge} / ${snapshot.capacity} shield`, 12, 100);
  readout.textContent =
    `Shield charge: ${snapshot.charge} / ${snapshot.capacity}`;
}

function updateStats(snapshot: ShieldSnapshot) {
  panelUpdates++;
  diagnostic.textContent = `Inspector deliveries: ${panelUpdates}`;
  renderStats(snapshot);
}

function renderStats(snapshot: ShieldSnapshot) {
  if (!panel) return;
  panel.textContent =
    `Shield charge: ${snapshot.charge} · Missing charge: ${snapshot.missingCharge}`;
}

function setCount(next: number) {
  const bounded = Math.max(0, Math.min(shieldMax, next));
  if (bounded === shieldCharge) return;
  shieldCharge = bounded;
  const snapshot = takeShieldSnapshot();
  shieldAnnouncement(snapshot);
  if (panel) updateStats(snapshot);
}

shieldEvents.addEventListener(shieldChangedEvent, (event) => {
  drawMeter(snapshotOf(event));
});

document.querySelector<HTMLButtonElement>("#counter-less")!.onclick = () => {
  setCount(shieldCharge - 1);
};
document.querySelector<HTMLButtonElement>("#counter-more")!.onclick = () => {
  setCount(shieldCharge + 1);
};
document.querySelector<HTMLButtonElement>("#counter-reset")!.onclick = () => {
  setCount(0);
};
document.querySelector<HTMLButtonElement>("#counter-open")!.onclick = () => {
  if (panel) return;
  panel = document.createElement("p");
  host.append(panel);
  renderStats(takeShieldSnapshot());
};
document.querySelector<HTMLButtonElement>("#counter-close")!.onclick = () => {
  if (!panel) return;
  panel.remove();
  panel = null;
};

drawMeter(takeShieldSnapshot());
