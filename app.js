(() => {
  const $ = (id) => document.getElementById(id);
  const imageInput = $('imageInput');
  const colorCount = $('colorCount');
  const colorCountVal = $('colorCountVal');
  const generateBtn = $('generateBtn');
  const output = $('output');
  const srcCanvas = $('srcCanvas');
  const resultCanvas = $('resultCanvas');
  const legend = $('legend');
  const cropSection = $('cropSection');
  const cropCanvas = $('cropCanvas');
  const pageSizeEl = $('pageSize');
  const cropConfirmBtn = $('cropConfirmBtn');
  const cropResetBtn = $('cropResetBtn');
  const cropSkipBtn = $('cropSkipBtn');
  const downloadBtn = $('downloadBtn');
  const zoomInBtn = $('zoomInBtn');
  const zoomOutBtn = $('zoomOutBtn');
  const zoomResetBtn = $('zoomResetBtn');
  const resultViewport = $('resultViewport');
  const previewAnimBtn = $('previewAnimBtn');
  const dropZone = $('dropZone');
  const uploadPlaceholder = $('uploadPlaceholder');
  const uploadPreview = $('uploadPreview');
  const previewImg = $('previewImg');
  const removeBtn = $('removeBtn');
  const detailLevel = $('detailLevel');
  const detailVal = $('detailVal');

  let loadedImage = null;
  let cropRect = null;
  let dragging = false;
  let dragStart = null;
  let displayScale = 1;

  // Stored render data for re-drawing (outline toggle)
  let renderData = null;
  let animId = null;
  let lastCrop = null; // remember crop for live slider updates
  let regenTimer = null;
  const outlineOnly = $('outlineOnly');

  const PAGE_RATIOS = {
    free: null, letter: 8.5/11, 'letter-l': 11/8.5,
    a4: 210/297, 'a4-l': 297/210, a3: 297/420, 'a3-l': 420/297,
    '4x6': 4/6, '5x7': 5/7, square: 1,
  };

  // --- Upload / drag-drop ---
  colorCount.addEventListener('input', () => {
    colorCountVal.textContent = colorCount.value;
    liveRegenerate();
  });
  detailLevel.addEventListener('input', () => {
    detailVal.textContent = detailLevel.value + 'px';
    liveRegenerate();
  });

  function liveRegenerate() {
    // Only auto-regen if the output is already showing
    if (!loadedImage || output.hidden) return;
    stopAnim();
    clearTimeout(regenTimer);
    regenTimer = setTimeout(() => {
      generate(loadedImage, parseInt(colorCount.value), lastCrop);
    }, 300);
  }

  function setImage(file) {
    const img = new Image();
    img.onload = () => {
      loadedImage = img;
      generateBtn.disabled = false;
      output.hidden = true;
      cropSection.hidden = true;
      previewImg.src = img.src;
      uploadPlaceholder.hidden = true;
      uploadPreview.hidden = false;
    };
    img.src = URL.createObjectURL(file);
  }

  imageInput.addEventListener('change', (e) => { if (e.target.files[0]) setImage(e.target.files[0]); });

  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('dragover'); });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault(); dropZone.classList.remove('dragover');
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) setImage(f);
  });

  removeBtn.addEventListener('click', () => {
    loadedImage = null;
    generateBtn.disabled = true;
    uploadPlaceholder.hidden = false;
    uploadPreview.hidden = true;
    imageInput.value = '';
    output.hidden = true;
    cropSection.hidden = true;
  });

  generateBtn.addEventListener('click', () => {
    if (!loadedImage) return;
    output.hidden = true;
    showCrop(loadedImage);
  });

  // --- Crop UI ---
  function showCrop(img) {
    cropSection.hidden = false;
    const MAX = 600;
    let dw = img.width, dh = img.height;
    if (dw > MAX || dh > MAX) { const s = MAX / Math.max(dw, dh); dw = Math.round(dw * s); dh = Math.round(dh * s); }
    displayScale = img.width / dw;
    cropCanvas.width = dw;
    cropCanvas.height = dh;
    cropRect = null;
    drawCropPreview(img, dw, dh);
    cropSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawCropPreview(img, dw, dh) {
    const ctx = cropCanvas.getContext('2d');
    ctx.clearRect(0, 0, dw, dh);
    ctx.drawImage(img, 0, 0, dw, dh);
    if (!cropRect) return;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, dw, cropRect.y);
    ctx.fillRect(0, cropRect.y + cropRect.h, dw, dh - cropRect.y - cropRect.h);
    ctx.fillRect(0, cropRect.y, cropRect.x, cropRect.h);
    ctx.fillRect(cropRect.x + cropRect.w, cropRect.y, dw - cropRect.x - cropRect.w, cropRect.h);
    ctx.strokeStyle = var_primary();
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
    ctx.setLineDash([]);
  }
  function var_primary() { return '#4f6ef7'; }

  function canvasCoords(e) {
    const r = cropCanvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (cropCanvas.width / r.width), y: (e.clientY - r.top) * (cropCanvas.height / r.height) };
  }

  cropCanvas.addEventListener('mousedown', (e) => { dragging = true; dragStart = canvasCoords(e); });
  cropCanvas.addEventListener('mousemove', (e) => {
    if (!dragging || !dragStart || !loadedImage) return;
    const pos = canvasCoords(e);
    const ratio = PAGE_RATIOS[pageSizeEl.value];
    let x = Math.min(dragStart.x, pos.x), y = Math.min(dragStart.y, pos.y);
    let w = Math.abs(pos.x - dragStart.x), h = Math.abs(pos.y - dragStart.y);
    if (ratio) { h = w / ratio; if (pos.y < dragStart.y) y = dragStart.y - h; }
    if (x < 0) x = 0; if (y < 0) y = 0;
    if (x + w > cropCanvas.width) w = cropCanvas.width - x;
    if (y + h > cropCanvas.height) h = cropCanvas.height - y;
    cropRect = { x, y, w, h };
    drawCropPreview(loadedImage, cropCanvas.width, cropCanvas.height);
  });
  cropCanvas.addEventListener('mouseup', () => { dragging = false; });
  cropCanvas.addEventListener('mouseleave', () => { dragging = false; });

  // Touch
  cropCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); dragging = true; dragStart = canvasCoords(e.touches[0]); }, { passive: false });
  cropCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); if (!dragging) return;
    const t = e.touches[0];
    cropCanvas.dispatchEvent(new MouseEvent('mousemove', { clientX: t.clientX, clientY: t.clientY }));
  }, { passive: false });
  cropCanvas.addEventListener('touchend', () => { dragging = false; });

  cropResetBtn.addEventListener('click', () => { cropRect = null; if (loadedImage) drawCropPreview(loadedImage, cropCanvas.width, cropCanvas.height); });
  cropSkipBtn.addEventListener('click', () => { cropRect = null; runGenerate(); });
  cropConfirmBtn.addEventListener('click', () => { runGenerate(); });

  function runGenerate() {
    cropSection.hidden = true;
    generateBtn.disabled = true;
    generateBtn.textContent = 'Processing…';
    requestAnimationFrame(() => setTimeout(() => {
      lastCrop = cropRect ? {
        x: Math.round(cropRect.x * displayScale), y: Math.round(cropRect.y * displayScale),
        w: Math.round(cropRect.w * displayScale), h: Math.round(cropRect.h * displayScale),
      } : null;
      generate(loadedImage, parseInt(colorCount.value), lastCrop);
      generateBtn.disabled = false;
      generateBtn.textContent = 'Generate';
    }, 50));
  }

  // --- Download ---
  downloadBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.download = 'paint-by-number.png';
    a.href = resultCanvas.toDataURL('image/png');
    a.click();
  });

  // --- Zoom & Pan ---
  let zoom = 1, panX = 0, panY = 0;
  let isPanning = false, panStartX = 0, panStartY = 0, panOriginX = 0, panOriginY = 0;
  const ZOOM_MIN = 0.5, ZOOM_MAX = 8, ZOOM_STEP = 1.3;

  function applyTransform() {
    resultCanvas.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  }

  function resetView() {
    const vw = resultViewport.clientWidth, vh = resultViewport.clientHeight;
    const cw = resultCanvas.width, ch = resultCanvas.height;
    zoom = Math.min(vw / cw, vh / ch, 1);
    panX = (vw - cw * zoom) / 2;
    panY = (vh - ch * zoom) / 2;
    applyTransform();
  }

  function zoomAt(cx, cy, factor) {
    const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom * factor));
    const ratio = newZoom / zoom;
    panX = cx - (cx - panX) * ratio;
    panY = cy - (cy - panY) * ratio;
    zoom = newZoom;
    applyTransform();
  }

  zoomInBtn.addEventListener('click', () => {
    const r = resultViewport.getBoundingClientRect();
    zoomAt(r.width / 2, r.height / 2, ZOOM_STEP);
  });
  zoomOutBtn.addEventListener('click', () => {
    const r = resultViewport.getBoundingClientRect();
    zoomAt(r.width / 2, r.height / 2, 1 / ZOOM_STEP);
  });
  zoomResetBtn.addEventListener('click', resetView);

  // Scroll to zoom
  resultViewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const r = resultViewport.getBoundingClientRect();
    const cx = e.clientX - r.left, cy = e.clientY - r.top;
    zoomAt(cx, cy, e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP);
  }, { passive: false });

  // Drag to pan
  resultViewport.addEventListener('mousedown', (e) => {
    isPanning = true; panStartX = e.clientX; panStartY = e.clientY;
    panOriginX = panX; panOriginY = panY;
    resultViewport.classList.add('grabbing');
  });
  window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    panX = panOriginX + (e.clientX - panStartX);
    panY = panOriginY + (e.clientY - panStartY);
    applyTransform();
  });
  window.addEventListener('mouseup', () => { isPanning = false; resultViewport.classList.remove('grabbing'); });

  // Touch pan + pinch zoom
  let lastTouchDist = 0;
  resultViewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isPanning = true; panStartX = e.touches[0].clientX; panStartY = e.touches[0].clientY;
      panOriginX = panX; panOriginY = panY;
    } else if (e.touches.length === 2) {
      lastTouchDist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
    }
  }, { passive: true });
  resultViewport.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && isPanning) {
      panX = panOriginX + (e.touches[0].clientX - panStartX);
      panY = panOriginY + (e.touches[0].clientY - panStartY);
      applyTransform();
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
      if (lastTouchDist) {
        const r = resultViewport.getBoundingClientRect();
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
        zoomAt(cx, cy, dist / lastTouchDist);
      }
      lastTouchDist = dist;
    }
  }, { passive: false });
  resultViewport.addEventListener('touchend', () => { isPanning = false; lastTouchDist = 0; });

  // --- Generate ---
  function generate(img, numColors, crop) {
    const MAX = parseInt(detailLevel.value);
    let sw = img.width, sh = img.height, sx = 0, sy = 0;
    if (crop) { sx = crop.x; sy = crop.y; sw = crop.w; sh = crop.h; }
    let w = sw, h = sh;
    if (w > MAX || h > MAX) { const s = MAX / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); }

    srcCanvas.width = w; srcCanvas.height = h;
    const sCtx = srcCanvas.getContext('2d');
    sCtx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    const pixels = sCtx.getImageData(0, 0, w, h).data;

    const colors = [];
    for (let i = 0; i < pixels.length; i += 4) colors.push([pixels[i], pixels[i+1], pixels[i+2]]);

    let palette = medianCut(colors, Math.min(colors.length, numColors * 2));
    // Always include white in the palette
    palette.unshift([255, 255, 255]);

    // Merge down to exactly numColors by repeatedly merging the closest pair
    palette = mergeToCount(palette, numColors);

    let mapped = new Uint8Array(w * h);
    for (let i = 0; i < colors.length; i++) mapped[i] = nearestColor(colors[i], palette);
    mapped = modeFilter(mapped, w, h);

    const regionMap = new Int32Array(w * h).fill(-1);
    const regionColors = [];
    let regionId = 0;
    for (let i = 0; i < w * h; i++) {
      if (regionMap[i] !== -1) continue;
      floodFill(mapped, regionMap, w, h, i % w, Math.floor(i / w), mapped[i], regionId);
      regionColors.push(mapped[i]);
      regionId++;
    }

    const paletteNumbers = new Map();
    let num = 1;
    for (const ci of regionColors) { if (!paletteNumbers.has(ci)) paletteNumbers.set(ci, num++); }

    const regionPixels = Array.from({ length: regionId }, () => []);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const rid = regionMap[y * w + x];
      if (rid >= 0 && rid < regionId) regionPixels[rid].push(x | (y << 16));
    }

    // Pre-compute label positions
    const MIN_REGION = 30;
    const labels = [];
    for (let r = 0; r < regionId; r++) {
      const pxList = regionPixels[r];
      if (pxList.length < MIN_REGION) continue;
      const pt = findInteriorPoint(regionMap, w, h, r, pxList);
      labels.push({
        x: pt.x, y: pt.y,
        text: String(paletteNumbers.get(regionColors[r])),
        fs: Math.max(7, Math.min(13, Math.sqrt(pxList.length) / 3)),
      });
    }

    // Store for re-render
    renderData = { w, h, mapped, palette, regionMap, labels, paletteNumbers, regionColors, regionPixels, regionId };

    renderCanvas(outlineOnly.checked);

    // Legend
    legend.innerHTML = '';
    for (const [ci, n] of paletteNumbers) {
      const c = palette[ci], hex = rgbToHex(c);
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `<span class="legend-swatch" style="background:${hex}">${n}</span><span>${hex}</span>`;
      legend.appendChild(item);
    }
    output.hidden = false;
    requestAnimationFrame(resetView);
    output.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderCanvas(outlineMode) {
    if (!renderData) return;
    const { w, h, mapped, palette, regionMap, labels } = renderData;

    resultCanvas.width = w; resultCanvas.height = h;
    const ctx = resultCanvas.getContext('2d');

    // Fill
    const outData = ctx.createImageData(w, h);
    for (let i = 0; i < w * h; i++) {
      const pi = i * 4;
      if (outlineMode) {
        outData.data[pi] = 255; outData.data[pi+1] = 255; outData.data[pi+2] = 255;
      } else {
        const c = palette[mapped[i]];
        outData.data[pi]   = Math.round(c[0] * 0.25 + 255 * 0.75);
        outData.data[pi+1] = Math.round(c[1] * 0.25 + 255 * 0.75);
        outData.data[pi+2] = Math.round(c[2] * 0.25 + 255 * 0.75);
      }
      outData.data[pi+3] = 255;
    }
    ctx.putImageData(outData, 0, 0);

    // Outlines
    ctx.strokeStyle = outlineMode ? 'rgba(0,0,0,0.85)' : 'rgba(80,80,80,0.7)';
    ctx.lineWidth = outlineMode ? 0.8 : 0.6;
    ctx.beginPath();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const idx = y * w + x, rid = regionMap[idx];
      if (x < w - 1 && regionMap[idx + 1] !== rid) { ctx.moveTo(x + 1, y); ctx.lineTo(x + 1, y + 1); }
      if (y < h - 1 && regionMap[idx + w] !== rid) { ctx.moveTo(x, y + 1); ctx.lineTo(x + 1, y + 1); }
    }
    ctx.stroke();

    // Numbers
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const lb of labels) {
      ctx.font = `500 ${lb.fs}px Inter,system-ui`;
      if (outlineMode) {
        ctx.fillStyle = '#000';
        ctx.fillText(lb.text, lb.x, lb.y);
      } else {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeText(lb.text, lb.x, lb.y);
        ctx.fillStyle = '#222'; ctx.fillText(lb.text, lb.x, lb.y);
      }
    }
  }

  outlineOnly.addEventListener('change', () => {
    stopAnim();
    renderCanvas(outlineOnly.checked);
  });

  // --- Animated Preview ---
  function stopAnim() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    previewAnimBtn.textContent = '▶ Preview Paint';
    previewAnimBtn.disabled = false;
  }

  previewAnimBtn.addEventListener('click', () => {
    if (!renderData) return;

    // If already animating, stop and restore static view
    if (animId) {
      stopAnim();
      renderCanvas(outlineOnly.checked);
      return;
    }

    const { w, h, palette, regionMap, regionColors, regionPixels, regionId } = renderData;

    // 1. Render the outline-only base and snapshot its pixels
    renderCanvas(true);
    const ctx = resultCanvas.getContext('2d');
    const baseSnapshot = ctx.getImageData(0, 0, w, h).data;

    // 2. Create a fresh working buffer copied from the base
    const workBuf = new Uint8ClampedArray(baseSnapshot);

    // 3. Sort regions largest-first
    const order = [];
    for (let i = 0; i < regionId; i++) {
      if (regionPixels[i] && regionPixels[i].length > 0) order.push(i);
    }
    order.sort((a, b) => (regionPixels[b].length || 0) - (regionPixels[a].length || 0));

    const totalRegions = order.length;
    const DURATION = 10000;
    let painted = 0;

    previewAnimBtn.textContent = '⏹ Stop';
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / DURATION, 1);
      const target = Math.floor(progress * totalRegions);

      // Paint newly revealed regions into the working buffer
      for (let ri = painted; ri < target; ri++) {
        const r = order[ri];
        const pxList = regionPixels[r];
        if (!pxList) continue;
        const c = palette[regionColors[r]];
        if (!c) continue;
        for (let p = 0; p < pxList.length; p++) {
          const px = pxList[p] & 0xFFFF, py = pxList[p] >> 16;
          const pi = (py * w + px) * 4;
          // Keep dark outline pixels from the base, only color the white areas
          if (baseSnapshot[pi] > 180) {
            workBuf[pi] = c[0];
            workBuf[pi + 1] = c[1];
            workBuf[pi + 2] = c[2];
          }
        }
      }
      painted = target;

      // Write buffer to canvas
      const imgData = new ImageData(new Uint8ClampedArray(workBuf), w, h);
      ctx.putImageData(imgData, 0, 0);

      if (progress < 1) {
        animId = requestAnimationFrame(tick);
      } else {
        animId = null;
        previewAnimBtn.textContent = '▶ Preview Paint';
      }
    }

    animId = requestAnimationFrame(tick);
  });

  // Find the point inside a region that is farthest from any region boundary.
  // Uses distance-to-edge: for each pixel in the region, compute min distance to
  // a pixel NOT in this region. Pick the pixel with the largest such distance.
  // For performance, samples up to 200 candidate pixels spread across the region.
  function findInteriorPoint(regionMap, w, h, rid, pxList) {
    // Sample candidates evenly
    const maxSamples = 200;
    const step = Math.max(1, Math.floor(pxList.length / maxSamples));
    let bestX = pxList[0] & 0xFFFF, bestY = pxList[0] >> 16, bestDist = 0;

    for (let i = 0; i < pxList.length; i += step) {
      const px = pxList[i] & 0xFFFF, py = pxList[i] >> 16;
      // Distance to nearest edge of region (pixel where neighbor differs)
      let minEdgeDist = Infinity;
      // Check expanding rings until we hit an edge
      const maxR = 30;
      let found = false;
      for (let ring = 1; ring <= maxR && !found; ring++) {
        for (let d = -ring; d <= ring; d++) {
          const checks = [
            [px + d, py - ring], [px + d, py + ring],
            [px - ring, py + d], [px + ring, py + d],
          ];
          for (const [cx, cy] of checks) {
            if (cx < 0 || cx >= w || cy < 0 || cy >= h || regionMap[cy * w + cx] !== rid) {
              const dist = Math.abs(d) > Math.abs(ring) ? Math.abs(d) : ring;
              if (dist < minEdgeDist) minEdgeDist = dist;
              found = true;
            }
          }
        }
      }
      if (!found) minEdgeDist = maxR;
      if (minEdgeDist > bestDist) { bestDist = minEdgeDist; bestX = px; bestY = py; }
    }
    return { x: bestX, y: bestY };
  }

  // --- Utilities ---

  // Standard median cut — splits on whichever RGB channel has the widest range
  function medianCut(pixels, numColors) {
    let buckets = [pixels.slice()];

    while (buckets.length < numColors) {
      let maxRange = -1, splitIdx = -1, splitCh = 0;

      for (let b = 0; b < buckets.length; b++) {
        if (buckets[b].length < 2) continue;
        for (let ch = 0; ch < 3; ch++) {
          let lo = 255, hi = 0;
          for (const p of buckets[b]) { if (p[ch] < lo) lo = p[ch]; if (p[ch] > hi) hi = p[ch]; }
          if (hi - lo > maxRange) { maxRange = hi - lo; splitIdx = b; splitCh = ch; }
        }
      }

      if (splitIdx === -1 || maxRange <= 0) break;

      const bucket = buckets.splice(splitIdx, 1)[0];
      bucket.sort((a, b) => a[splitCh] - b[splitCh]);
      const mid = Math.floor(bucket.length / 2);
      const left = bucket.slice(0, mid);
      const right = bucket.slice(mid);
      if (left.length > 0) buckets.push(left);
      if (right.length > 0) buckets.push(right);
    }

    // Compute averages then boost saturation for more vivid paint colors
    return buckets.filter(b => b.length > 0).map(b => {
      let sr = 0, sg = 0, sb = 0;
      for (const p of b) { sr += p[0]; sg += p[1]; sb += p[2]; }
      const avg = [sr / b.length, sg / b.length, sb / b.length];
      return boostSaturation(avg, 1.3);
    });
  }

  // Boost saturation of an RGB color by a factor (>1 = more vivid)
  function boostSaturation([r, g, b], factor) {
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    return [
      Math.round(Math.min(255, Math.max(0, gray + (r - gray) * factor))),
      Math.round(Math.min(255, Math.max(0, gray + (g - gray) * factor))),
      Math.round(Math.min(255, Math.max(0, gray + (b - gray) * factor))),
    ];
  }

  // Merge palette down to targetCount by repeatedly combining the two closest colors
  function mergeToCount(palette, targetCount) {
    // Work with [r, g, b, weight] so merged colors are weighted averages
    let entries = palette.map(c => ({ r: c[0], g: c[1], b: c[2], w: 1 }));

    while (entries.length > targetCount) {
      // Find the closest pair (perceptual distance)
      let bestDist = Infinity, bestI = 0, bestJ = 1;
      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const dr = entries[i].r - entries[j].r;
          const dg = entries[i].g - entries[j].g;
          const db = entries[i].b - entries[j].b;
          const d = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
          if (d < bestDist) { bestDist = d; bestI = i; bestJ = j; }
        }
      }
      // Merge j into i (weighted average)
      const a = entries[bestI], b = entries[bestJ];
      const tw = a.w + b.w;
      a.r = (a.r * a.w + b.r * b.w) / tw;
      a.g = (a.g * a.w + b.g * b.w) / tw;
      a.b = (a.b * a.w + b.b * b.w) / tw;
      a.w = tw;
      entries.splice(bestJ, 1);
    }

    return entries.map(e => [Math.round(e.r), Math.round(e.g), Math.round(e.b)]);
  }

  function nearestColor(pixel, palette) {
    let minDist = Infinity, best = 0;
    for (let i = 0; i < palette.length; i++) {
      const dr = pixel[0] - palette[i][0];
      const dg = pixel[1] - palette[i][1];
      const db = pixel[2] - palette[i][2];
      const d = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
      if (d < minDist) { minDist = d; best = i; }
    }
    return best;
  }

  function floodFill(mapped, regionMap, w, h, sx, sy, colorIdx, regionId) {
    const stack = [sx + sy * w];
    while (stack.length) {
      const idx = stack.pop();
      if (regionMap[idx] !== -1 || mapped[idx] !== colorIdx) continue;
      regionMap[idx] = regionId;
      const x = idx % w, y = (idx - x) / w;
      if (x > 0) stack.push(idx - 1);
      if (x < w - 1) stack.push(idx + 1);
      if (y > 0) stack.push(idx - w);
      if (y < h - 1) stack.push(idx + w);
    }
  }

  function modeFilter(mapped, w, h) {
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const counts = {};
      let best = mapped[y * w + x], bestCount = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const ny = y + dy, nx = x + dx;
        if (ny < 0 || ny >= h || nx < 0 || nx >= w) continue;
        const v = mapped[ny * w + nx], c = (counts[v] || 0) + 1;
        counts[v] = c;
        if (c > bestCount) { bestCount = c; best = v; }
      }
      out[y * w + x] = best;
    }
    return out;
  }

  function rgbToHex([r, g, b]) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }
})();
