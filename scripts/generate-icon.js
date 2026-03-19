import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pngToIco from "png-to-ico";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const input = path.join(root, "src", "assets", "logo.png");
const outputDir = path.join(root, "assets");
const output = path.join(outputDir, "logo.ico");

async function run() {
  if (!fs.existsSync(input)) {
    console.error("Unable to find src/assets/logo.png; cannot generate icon.");
    console.log("Skipping icon generation. Icon defaults will be used.");
    process.exit(0);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    const buffer = await pngToIco(input);
    fs.writeFileSync(output, buffer);
    console.log(`Generated icon at ${output}`);
  } catch (error) {
    console.warn(`Warning: Could not generate icon (${error.message}). Using default Electron icon.`);
    process.exit(0);
  }
}

run();
