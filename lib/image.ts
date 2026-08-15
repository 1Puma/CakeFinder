import sharp from "sharp";

export class ImageConvertError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageConvertError";
  }
}

function isHeic(buffer: Buffer): boolean {
  if (buffer.byteLength < 12) return false;
  const brand = buffer.subarray(8, 12).toString("ascii");
  return brand === "heic" || brand === "heif" || brand === "mif1" || brand === "avif";
}

export async function resizeForVision(buffer: Buffer): Promise<Buffer> {
  if (buffer.byteLength === 0) {
    throw new ImageConvertError("Couldn't read the cake — the file is empty.");
  }
  if (isHeic(buffer) && buffer.subarray(8, 12).toString("ascii") !== "avif") {
    try {
      return await convertWithSharp(buffer);
    } catch {
      throw new ImageConvertError(
        "iPhone HEIC photos need JPEG or PNG on this server. Save the photo as JPEG, or upload from Safari.",
      );
    }
  }
  try {
    return await convertWithSharp(buffer);
  } catch {
    throw new ImageConvertError(
      "That file is not a photo xAI can read. Use JPEG, PNG, WebP, or GIF.",
    );
  }
}

async function convertWithSharp(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer, { failOn: "none", animated: false })
    .rotate()
    .flatten({ background: "#ffffff" })
    .resize({
      width: 1568,
      height: 1568,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toBuffer();
}
