import {
  BinaryBitmap,
  HybridBinarizer,
  RGBLuminanceSource,
  MultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";
import sharp from "sharp";

export interface ScanValidationResult {
  valid: boolean;
  decoded?: string;
  confidence: "high" | "unverified";
}

/**
 * Validates a custom visual QR code's readability programmatically.
 * Uses advanced Sharp binarization and threshold filters before passing it to ZXing.
 */
export async function validateQRScan(
  imageBuffer: Buffer,
  expectedContent?: string
): Promise<ScanValidationResult> {
  try {
    // Convert styled QR shapes, gradients, and filters into a clean, high-contrast B&W grid for local library reading
    const { data, info } = await sharp(imageBuffer)
      .greyscale()
      .normalize()
      .threshold(128)
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
    const decoded = result.getText();

    if (expectedContent) {
      const normalizedExpected = expectedContent.trim();
      const normalizedDecoded = decoded.trim();
      const valid =
        normalizedDecoded === normalizedExpected ||
        normalizedDecoded.includes(normalizedExpected) ||
        normalizedExpected.includes(normalizedDecoded);
      
      return { 
        valid, 
        decoded, 
        confidence: valid ? "high" : "unverified" 
      };
    }

    return { valid: true, decoded, confidence: "high" };
  } catch {
    // If the legacy reader fails, we mark the confidence rating as unverified
    // indicating to the client UI that contrast or density might be risky
    return { 
      valid: false, 
      confidence: "unverified" 
    };
  }
}
