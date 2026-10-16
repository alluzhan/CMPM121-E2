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

type Inspector = {
  panel: HTMLParagraphElement;
  listener: EventListener;
};
let inspector: Inspector | null = null;

const shieldChangedEvent = "shield-changed";
const shieldEvents = new EventTarget();

let shieldCharge = 0;
let panelUpdates = 0;

function takeShieldSnapshot(): ShieldSnapshot {
  return {
    charge: shieldCharge,
    capacity: shieldMax,
    missingCharge: shieldMax - shieldCharge,
  };
}

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

function renderStats(panel: HTMLParagraphElement, snapshot: ShieldSnapshot) {
  panel.textContent =
    `Shield charge: ${snapshot.charge} · Missing charge: ${snapshot.missingCharge}`;
}

function setCount(next: number) {
  const bounded = Math.max(0, Math.min(shieldMax, next));
  if (bounded === shieldCharge) return;
  shieldCharge = bounded;
  shieldAnnouncement(takeShieldSnapshot());
}

function openInspector() {
  if (inspector) return;
  const panel = document.createElement("p");
  const listener: EventListener = (event) => {
    panelUpdates++;

    diagnostic.textContent = `Inspector deliveries: ${panelUpdates}`;
    renderStats(panel, snapshotOf(event));
  };
  renderStats(panel, takeShieldSnapshot());
  host.append(panel);
  shieldEvents.addEventListener(shieldChangedEvent, listener);
  inspector = { panel, listener };
}

function closeInspector() {
  if (!inspector) return;
  shieldEvents.removeEventListener(shieldChangedEvent, inspector.listener);

  inspector.panel.remove();
  inspector = null;
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
document.querySelector<HTMLButtonElement>("#counter-open")!.onclick =
  openInspector;

document.querySelector<HTMLButtonElement>("#counter-close")!.onclick =
  closeInspector;

drawMeter(takeShieldSnapshot());
