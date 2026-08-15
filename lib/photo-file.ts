export async function photoToJpegFile(file: File): Promise<File> {
  if (file.size === 0) {
    throw new Error("Couldn't read the cake — the file is empty.");
  }
  try {
    const bitmap = await createImageBitmap(file);
    const max = 1568;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.85);
    });
    if (!blob) return file;
    return new File([blob], "cake.jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}
