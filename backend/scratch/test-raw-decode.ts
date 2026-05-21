import {
  BinaryBitmap,
  HybridBinarizer,
  RGBLuminanceSource,
  MultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const imageBuffer = fs.readFileSync("C:\\Users\\Suvesh\\.gemini\\antigravity-ide\\brain\\7cbec329-bf0f-4a92-86ab-1ce2bb41ee6e\\scratch\\google-qr.png");

  try {
    const { data, info } = await sharp(imageBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = new Uint8ClampedArray(info.width * info.height * 4);
    for (let i = 0; i < info.width * info.height; i++) {
      const idx = i * 4;
      pixels[idx] = data[idx];
      pixels[idx + 1] = data[idx + 1];
      pixels[idx + 2] = data[idx + 2];
      pixels[idx + 3] = 255;
    }

    const luminanceSource = new RGBLuminanceSource(
      pixels,
      info.width,
      info.height
    );
    const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const reader = new MultiFormatReader();
    reader.setHints(hints);

    const result = reader.decode(binaryBitmap);
    console.log("Raw Decoded Text successfully read:", result.getText());
  } catch (err) {
    console.error("Raw decoding failed:", err);
  }
}

main().catch(console.error);
