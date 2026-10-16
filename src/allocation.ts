export {};

const canvas = document.querySelector<HTMLCanvasElement>("#allocation-canvas")!;
const ctx = canvas.getContext("2d")!;
const readout = document.querySelector<HTMLParagraphElement>(
  "#allocation-readout",
)!;

const crewSize = 6;
const suppliesPerProducer = 3;
const suppliesNeededPerCrew = 1;
const startingSupplyCrew = 2;
const barScale = 14;
const firstRowLabelYAxis = 102;
const rowSpacing = 52;

let supplyCrewCnt = startingSupplyCrew;

type DisplayRow = {
  label: string;
  color: string;
  quantity: "production" | "consumption";
};

const displayRows: DisplayRow[] = [
  { label: "Production", color: "#27766b", quantity: "production" },
  { label: "Consumption", color: "#a44d23", quantity: "consumption" },
];
function setSupplyCrew(count: number): void {
  supplyCrewCnt = Math.max(0, Math.min(crewSize, count));
  updateDisplay();
}

function drawBar(
  label: string,
  value: number,
  color: string,
  labelY: number,
): void {
  ctx.fillStyle = "#233e43";
  ctx.font = "14px system-ui";
  ctx.fillText(`${label}: ${value}`, 18, labelY);
  ctx.fillStyle = color;
  ctx.fillRect(18, labelY + 8, value * barScale, 20);
}

function renderCanvas(report: ShiftResults): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let crewIndex = 0; crewIndex < report.crewSize; crewIndex++) {
    const onSupplyDuty = crewIndex < report.supplyCrew;
    ctx.fillStyle = onSupplyDuty ? "#27766b" : "#c9d2c9";
    ctx.fillRect(18 + crewIndex * 45, 16, 36, 36);
    ctx.fillStyle = onSupplyDuty ? "#ffffff" : "#233e43";
    ctx.font = "16px system-ui";
    ctx.fillText(String(crewIndex + 1), 31 + crewIndex * 45, 40);
  }

  ctx.fillStyle = "#233e43";
  ctx.font = "14px system-ui";
  ctx.fillText(
    `Producers: ${report.supplyCrew} / ${report.crewSize}`,
    18,
    76,
  );

  displayRows.forEach((row, index) => {
    const labelY = firstRowLabelYAxis + index * rowSpacing;
    drawBar(row.label, report[row.quantity], row.color, labelY);
  });
}

function writeShiftSummary(report: ShiftResults): void {
  const balanceText = `${report.balance > 0 ? "+" : ""}${report.balance}`;
  readout.textContent = `Assigned: ${report.supplyCrew}/${report.crewSize} · ` +
    `Production: ${report.production} · ` +
    `Consumption: ${report.consumption} · Balance: ${balanceText}`;
}

function updateDisplay(): void {
  const report = shiftCalculation(supplyCrewCnt);
  renderCanvas(report);
  writeShiftSummary(report);
}

type ShiftResults = {
  supplyCrew: number;
  crewSize: number;
  production: number;
  consumption: number;
  balance: number;
};

function shiftCalculation(supplyCrew: number): ShiftResults {
  const production = supplyCrew * suppliesPerProducer;
  const consumption = crewSize * suppliesNeededPerCrew;
  return {
    supplyCrew,
    crewSize,
    production,
    consumption,
    balance: production - consumption,
  };
}

document.querySelector<HTMLButtonElement>("#allocation-less")!.onclick = () => {
  setSupplyCrew(supplyCrewCnt - 1);
};
document.querySelector<HTMLButtonElement>("#allocation-more")!.onclick = () => {
  setSupplyCrew(supplyCrewCnt + 1);
};
document.querySelector<HTMLButtonElement>("#allocation-reset")!.onclick =
  () => {
    setSupplyCrew(startingSupplyCrew);
  };

updateDisplay();
