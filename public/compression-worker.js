// Squish compression worker.
//
// One worker serves the whole page. It keeps recently opened pictures as decoded
// bitmaps, keyed by picture, so that moving the quality slider re-encodes a
// picture without opening the file again. The cache is bounded by pixel count.

const cache = new Map(); // key -> ImageBitmap, oldest first
let cachedPixels = 0;

function forget(key) {
  const bitmap = cache.get(key);
  if (!bitmap) return;
  cachedPixels -= bitmap.width * bitmap.height;
  bitmap.close();
  cache.delete(key);
}

function remember(key, bitmap, budget) {
  const pixels = bitmap.width * bitmap.height;
  if (!key || pixels > budget || cache.has(key)) return false;
  while (cachedPixels + pixels > budget && cache.size > 0) {
    forget(cache.keys().next().value);
  }
  cache.set(key, bitmap);
  cachedPixels += pixels;
  return true;
}

async function open(key, file) {
  const cached = key ? cache.get(key) : undefined;
  if (cached) {
    // Mark as most recently used
    cache.delete(key);
    cache.set(key, cached);
    return cached;
  }
  return createImageBitmap(file);
}

self.onmessage = async (e) => {
  const msg = e.data;

  if (msg.type === 'release') {
    if (msg.key) forget(msg.key);
    else for (const key of [...cache.keys()]) forget(key);
    return;
  }

  const { id, key, file, quality, format, maxPixels, maxDimension, cachePixels } = msg;
  let bitmap;
  let kept = false;
  try {
    bitmap = await open(key, file);
    kept = cache.get(key) === bitmap;

    if (maxPixels && bitmap.width * bitmap.height > maxPixels) {
      self.postMessage({ id, code: 'dimensions', width: bitmap.width, height: bitmap.height });
      return;
    }

    const longest = Math.max(bitmap.width, bitmap.height);
    const scale = maxDimension && longest > maxDimension ? maxDimension / longest : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    if (format === 'image/jpeg') {
      // JPEG has no transparency: see-through areas would otherwise turn black.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);

    const q = format === 'image/png' ? undefined : quality / 100;
    const blob = await canvas.convertToBlob({ type: format, quality: q });
    self.postMessage({ id, blob, width, height });

    if (!kept) kept = remember(key, bitmap, cachePixels || 0);
  } catch (err) {
    self.postMessage({ id, error: err && err.message ? err.message : 'Compression failed' });
  } finally {
    if (bitmap && !kept) bitmap.close();
  }
};
