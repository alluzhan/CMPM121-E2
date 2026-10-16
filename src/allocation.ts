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

let supplyCrewCnt = startingSupplyCrew;

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

function updateDisplay(): void {
  const production = supplyCrewCnt * suppliesPerProducer;
  const consumption = crewSize * suppliesNeededPerCrew;
  const balance = production - consumption;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let crewIndex = 0; crewIndex < crewSize; crewIndex++) {
    const onSupplyDuty = crewIndex < supplyCrewCnt;
    ctx.fillStyle = onSupplyDuty ? "#27766b" : "#c9d2c9";
    ctx.fillRect(18 + crewIndex * 45, 16, 36, 36);
    ctx.fillStyle = onSupplyDuty ? "#ffffff" : "#233e43";
    ctx.font = "16px system-ui";
    ctx.fillText(String(crewIndex + 1), 31 + crewIndex * 45, 40);
  }
  ctx.fillStyle = "#233e43";
  ctx.font = "14px system-ui";
  ctx.fillText(`Producers: ${supplyCrewCnt} / ${crewSize}`, 18, 76);
  drawBar("Production", production, "#27766b", 102);
  drawBar("Consumption", consumption, "#a44d23", 154);

  const balanceText = `${balance > 0 ? "+" : ""}${balance}`;
  readout.textContent =
    `Assigned: ${supplyCrewCnt}/${crewSize} · Production: ${production} · ` +
    `Consumption: ${consumption} · Balance: ${balanceText}`;
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
