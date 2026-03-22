import * as fs from "fs";
import * as path from "path";

const ARTIFACTS_DIR = path.join(__dirname, "../artifacts/contracts");
const OUTPUT_DIR = path.join(__dirname, "../../frontend/src/lib/abi");

const contracts = ["SimpleStorage", "MeritCoin", "MeetupManager"];

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const name of contracts) {
    const artifactPath = path.join(ARTIFACTS_DIR, `${name}.sol`, `${name}.json`);
    if (!fs.existsSync(artifactPath)) {
      console.error(`Artifact not found: ${artifactPath}. Run 'hardhat compile' first.`);
      process.exit(1);
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
    const output = { abi: artifact.abi };
    const outputPath = path.join(OUTPUT_DIR, `${name}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`Exported ABI: ${outputPath}`);
  }
}

main();
