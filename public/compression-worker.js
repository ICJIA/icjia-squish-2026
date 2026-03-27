self.onmessage = async (e) => {
  const { file, quality, format } = e.data;
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    ctx.drawImage(bitmap, 0, 0);
    const q = format === 'image/png' ? undefined : quality / 100;
    const blob = await canvas.convertToBlob({ type: format, quality: q });
    self.postMessage({ blob });
    bitmap.close();
  } catch (err) {
    self.postMessage({ error: err.message });
  }
};
