import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import pngToIco from "png-to-ico";
import { PNG } from "pngjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const input = path.join(root, "src", "assets", "logo.png");
const outputDir = path.join(root, "assets");
const output = path.join(outputDir, "logo.ico");

/**
 * Pads a PNG to a square (max dimension) with transparent pixels,
 * centering the original image. Returns the padded PNG as a Buffer.
 */
async function padToSquare(inputPath) {
  const data = fs.readFileSync(inputPath);
  const src = PNG.sync.read(data);
  const size = Math.max(src.width, src.height);

  if (src.width === src.height) {
    return data; // Already square – use original bytes.
  }

  const dst = new PNG({ width: size, height: size, colorType: 6 });
  // Fill destination with transparent pixels.
  dst.data.fill(0);

  const xOff = Math.floor((size - src.width) / 2);
  const yOff = Math.floor((size - src.height) / 2);

  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      const srcIdx = (y * src.width + x) * 4;
      const dstIdx = ((yOff + y) * size + (xOff + x)) * 4;
      dst.data[dstIdx]     = src.data[srcIdx];
      dst.data[dstIdx + 1] = src.data[srcIdx + 1];
      dst.data[dstIdx + 2] = src.data[srcIdx + 2];
      dst.data[dstIdx + 3] = src.data[srcIdx + 3];
    }
  }

  return PNG.sync.write(dst);
}

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
    const squarePng = await padToSquare(input);

    // Write padded PNG to a temp file so png-to-ico can read it.
    const tmpFile = path.join(os.tmpdir(), `kiosk-icon-${Date.now()}.png`);
    fs.writeFileSync(tmpFile, squarePng);

    const buffer = await pngToIco(tmpFile);
    fs.writeFileSync(output, buffer);
    console.log(`Generated icon at ${output}`);

    fs.unlinkSync(tmpFile);
  } catch (error) {
    console.warn(`Warning: Could not generate icon (${error.message}). Using default Electron icon.`);
    process.exit(0);
  }
}

run();
