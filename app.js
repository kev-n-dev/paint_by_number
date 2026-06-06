/**
 * Paint by Number Studio
 * Core algorithm based on pbnify by Daniel Munro (MIT License)
 * CIE Lab color space for perceptual accuracy
 * Async processing with progress feedback
 */
'use strict';

(() => {
  const $ = id => document.getElementById(id);

  // --- Elements ---
  const dropZone = $('dropZone');
  const imageInput = $('imageInput');
  const uploadState = $('uploadState');
  const canvasViewport = $('canvasViewport');
  const processingOverlay = $('processingOverlay');
  const processingCanvas = $('processingCanvas');
  const processingLabel = $('processingLabel');
  const progressFill = $('progressFill');
  const processingPercent = $('processingPercent');
  const generateBtn = $('generateBtn');
  const generateText = $('generateText');
  const generateSpinner = $('generateSpinner');
  const colorSlider = $('colorSlider');
  const colorCountValue = $('colorCountValue');
  const smoothSlider = $('smoothSlider');
  const smoothValue = $('smoothValue');
  const minRegionSlider = $('minRegionSlider');
  const minRegionValue = $('minRegionValue');
  const widthSlider = $('widthSlider');
  const widthValue = $('widthValue');
  const colorSpaceSelect = $('colorSpaceSelect');
  const filledCanvas = $('filledCanvas');
  const outlineCanvas = $('outlineCanvas');
  const paletteCanvas = $('paletteCanvas');
  const resultCanvasAfter = $('resultCanvasAfter');
  const resultCanvasBefore = $('resultCanvasBefore');
  const comparisonSlider = $('comparisonSlider');
  const comparisonClip = $('comparisonClip');
  const comparisonHandle = $('comparisonHandle');
  const comparisonContainer = $('comparisonContainer');
  const singleView = $('singleView');
  const saveDesignBtn = $('saveDesignBtn');
  const startOverBtn = $('newImageBtn');
  const statsBar = $('statsBar');
  const statsSection = $('statsSection');
  const myDesignsBtn = $('myDesignsBtn');
  const designsModal = $('designsModal');
  const closeModal = $('closeModal');
  const designsGrid = $('designsGrid');
  const designCount = $('designCount');

  let loadedImage = null;
  let currentView = 'comparison';
  let generatedData = null; // {palette, mat, labels, w, h}

  // --- Slider bindings ---
  colorSlider.addEventListener('input', () => {
    colorCountValue.textContent = colorSlider.value;
    updateColorPresetHighlight();
  });
  smoothSlider.addEventListener('input', () => { smoothValue.textContent = smoothSlider.value; });
  minRegionSlider.addEventListener('input', () => { minRegionValue.textContent = minRegionSlider.value; });
  widthSlider.addEventListener('input', () => { widthValue.textContent = widthSlider.value; });

  // Color presets
  document.querySelectorAll('.color-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.colors;
      colorSlider.value = val;
      colorCountValue.textContent = val;
      updateColorPresetHighlight();
    });
  });

  function updateColorPresetHighlight() {
    const val = colorSlider.value;
    document.querySelectorAll('.color-preset').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.colors === val);
    });
  }

  // --- Upload ---
  dropZone.addEventListener('click', e => {
    imageInput.click();
  });
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('dragover');
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleFile(f);
  });
  imageInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });

  function handleFile(file) {
    const img = new Image();
    img.onload = () => {
      loadedImage = img;
      generateBtn.disabled = false;
      // Update dropzone to show selected state
      dropZone.innerHTML = `<img src="${img.src}" style="max-width:100%;max-height:200px;border-radius:4px;display:block;margin:0 auto;" alt="Selected"><p style="margin-top:8px;font-size:11px;color:var(--text-muted)">Click to change · ${img.naturalWidth}×${img.naturalHeight}</p>`;
    };
    img.src = URL.createObjectURL(file);
  }

  // --- Generate ---
  generateBtn.addEventListener('click', startGeneration);

  async function startGeneration() {
    if (!loadedImage) return;

    // Show processing overlay in viewport
    uploadState.hidden = true;
    comparisonContainer.hidden = true;
    singleView.hidden = true;
    processingOverlay.hidden = false;

    const targetW = parseInt(widthSlider.value);
    const scale = targetW / loadedImage.naturalWidth;
    const w = targetW;
    const h = Math.round(loadedImage.naturalHeight * scale);

    // Draw source to processing canvas for visual feedback
    processingCanvas.width = w;
    processingCanvas.height = h;
    const pCtx = processingCanvas.getContext('2d');
    pCtx.drawImage(loadedImage, 0, 0, w, h);

    const numColors = parseInt(colorSlider.value);
    const smoothRange = parseInt(smoothSlider.value);
    const minRegionSize = parseInt(minRegionSlider.value);
    const colorSpace = colorSpaceSelect.value;

    setProgress(0, 'Analyzing image...');

    // Use setTimeout to allow UI to render before heavy computation
    await sleep(50);

    try {
      // Step 1: Get image data
      const imgData = pCtx.getImageData(0, 0, w, h);
      setProgress(5, 'Picking optimal colors...');
      await sleep(20);

      // Step 2: K-means to find optimal palette
      const palette = findPalette(imgData, numColors, colorSpace);
      setProgress(25, `Found ${palette.length} colors. Mapping pixels...`);
      await sleep(20);

      // Step 3: Map pixels to nearest palette color
      const mat = mapPixels(imgData, palette, colorSpace);
      setProgress(40, 'Smoothing regions...');
      await sleep(20);

      // Step 4: Smooth (majority filter)
      const matSmooth = pbnifySmooth(mat, w, h, smoothRange);
      setProgress(60, 'Finding regions...');
      await sleep(20);

      // Step 5: Find regions, remove small ones, get label locations
      const { labels, regionCount } = processRegions(matSmooth, w, h, minRegionSize);
      setProgress(80, 'Drawing outline...');
      await sleep(20);

      // Step 6: Build outline
      const matLine = buildOutline(matSmooth, w, h);
      setProgress(90, 'Rendering...');
      await sleep(20);

      // Step 7: Render all outputs
      renderFilled(matSmooth, palette, w, h);
      renderOutline(matLine, matSmooth, labels, palette, w, h);
      renderPaletteGuide(palette);
      renderComparison(matSmooth, palette, w, h);

      generatedData = { palette, mat: matSmooth, labels, w, h, matLine, regionCount };

      // Pre-render export canvases so downloads are instant
      generatedData.outlineColorCanvas = renderOutlineWithColor(generatedData);
      generatedData.filledOutlineCanvas = renderFilledWithOutline(generatedData);

      // Stats
      statsSection.hidden = false;
      const exportSection = $('exportSection');
      exportSection.hidden = false;
      statsBar.innerHTML = `
        <span><strong>${palette.length}</strong> colors</span>
        <span><strong>${regionCount}</strong> regions</span>
        <span><strong>${w}×${h}</strong> pixels</span>
        <span>Smooth: ${smoothRange} · Min: ${minRegionSize}px</span>
      `;

      setProgress(100, 'Done!');
      await sleep(300);

      // Show result
      processingOverlay.hidden = true;
      switchView('comparison');

    } catch (err) {
      console.error('Generation failed:', err);
      setProgress(0, 'Error: ' + err.message);
      setTimeout(() => {
        processingOverlay.hidden = true;
        uploadState.hidden = false;
      }, 2000);
    }
  }

  function setProgress(pct, label) {
    progressFill.style.width = pct + '%';
    processingPercent.textContent = Math.round(pct) + '%';
    if (label) processingLabel.textContent = label;
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ===== COLOR SCIENCE =====

  // sRGB to CIE Lab
  function rgbToLab(r, g, b) {
    // Normalize to 0-1
    let rr = r / 255, gg = g / 255, bb = b / 255;
    // Linearize
    rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92;
    gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92;
    bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92;
    // XYZ (D65)
    let x = (rr * 0.4124564 + gg * 0.3575761 + bb * 0.1804375) / 0.95047;
    let y = (rr * 0.2126729 + gg * 0.7151522 + bb * 0.0721750);
    let z = (rr * 0.0193339 + gg * 0.1191920 + bb * 0.9503041) / 1.08883;
    // Lab
    x = x > 0.008856 ? Math.cbrt(x) : (7.787 * x + 16 / 116);
    y = y > 0.008856 ? Math.cbrt(y) : (7.787 * y + 16 / 116);
    z = z > 0.008856 ? Math.cbrt(z) : (7.787 * z + 16 / 116);
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
  }

  function colorDistSq(c1, c2, space) {
    if (space === 'lab') {
      const lab1 = rgbToLab(c1[0], c1[1], c1[2]);
      const lab2 = rgbToLab(c2[0], c2[1], c2[2]);
      return (lab1[0]-lab2[0])**2 + (lab1[1]-lab2[1])**2 + (lab1[2]-lab2[2])**2;
    }
    return (c1[0]-c2[0])**2 + (c1[1]-c2[1])**2 + (c1[2]-c2[2])**2;
  }

  // ===== K-MEANS++ with deduplication =====
  function findPalette(imgData, numColors, colorSpace) {
    const pixels = [];
    const step = Math.max(1, Math.floor(imgData.data.length / 4 / 8000));
    for (let i = 0; i < imgData.data.length; i += step * 4) {
      pixels.push([imgData.data[i], imgData.data[i+1], imgData.data[i+2]]);
    }

    // K-means++ initialization
    const centroids = [pixels[Math.floor(Math.random() * pixels.length)].slice()];
    for (let c = 1; c < numColors; c++) {
      let totalDist = 0;
      const dists = pixels.map(p => {
        let minD = Infinity;
        for (const cent of centroids) {
          const d = colorDistSq(p, cent, colorSpace);
          if (d < minD) minD = d;
        }
        totalDist += minD;
        return minD;
      });
      // Weighted random selection
      let target = Math.random() * totalDist;
      for (let i = 0; i < pixels.length; i++) {
        target -= dists[i];
        if (target <= 0) { centroids.push(pixels[i].slice()); break; }
      }
      if (centroids.length <= c) centroids.push(pixels[Math.floor(Math.random() * pixels.length)].slice());
    }

    // Run k-means iterations
    const maxIter = 15;
    for (let iter = 0; iter < maxIter; iter++) {
      const sums = Array.from({length: numColors}, () => [0,0,0]);
      const counts = new Int32Array(numColors);
      let changed = false;

      for (const p of pixels) {
        let best = 0, bestD = Infinity;
        for (let c = 0; c < centroids.length; c++) {
          const d = colorDistSq(p, centroids[c], colorSpace);
          if (d < bestD) { bestD = d; best = c; }
        }
        sums[best][0] += p[0]; sums[best][1] += p[1]; sums[best][2] += p[2];
        counts[best]++;
      }

      for (let c = 0; c < centroids.length; c++) {
        if (counts[c] > 0) {
          const nr = Math.round(sums[c][0] / counts[c]);
          const ng = Math.round(sums[c][1] / counts[c]);
          const nb = Math.round(sums[c][2] / counts[c]);
          if (nr !== centroids[c][0] || ng !== centroids[c][1] || nb !== centroids[c][2]) changed = true;
          centroids[c] = [nr, ng, nb];
        }
      }
      if (!changed) break;
    }

    // Deduplicate near-identical colors (Lab distance < 5)
    const unique = [centroids[0]];
    for (let i = 1; i < centroids.length; i++) {
      let isDup = false;
      for (const u of unique) {
        if (colorDistSq(centroids[i], u, 'lab') < 25) { isDup = true; break; }
      }
      if (!isDup) unique.push(centroids[i]);
    }

    return unique.map(c => ({ r: c[0], g: c[1], b: c[2] }));
  }

  // ===== PIXEL MAPPING =====
  function mapPixels(imgData, palette, colorSpace) {
    const w = imgData.width, h = imgData.height;
    const mat = new Uint8Array(w * h);
    const palArr = palette.map(c => [c.r, c.g, c.b]);

    // Pre-compute Lab values for palette if using Lab
    let palLab = null;
    if (colorSpace === 'lab') {
      palLab = palArr.map(c => rgbToLab(c[0], c[1], c[2]));
    }

    for (let i = 0; i < imgData.data.length; i += 4) {
      const r = imgData.data[i], g = imgData.data[i+1], b = imgData.data[i+2];
      let best = 0, bestD = Infinity;

      if (colorSpace === 'lab') {
        const lab = rgbToLab(r, g, b);
        for (let j = 0; j < palLab.length; j++) {
          const d = (lab[0]-palLab[j][0])**2 + (lab[1]-palLab[j][1])**2 + (lab[2]-palLab[j][2])**2;
          if (d < bestD) { bestD = d; best = j; }
        }
      } else {
        for (let j = 0; j < palArr.length; j++) {
          const dr = r - palArr[j][0], dg = g - palArr[j][1], db = b - palArr[j][2];
          const d = dr*dr + dg*dg + db*db;
          if (d < bestD) { bestD = d; best = j; }
        }
      }
      mat[i / 4] = best;
    }
    return mat;
  }

  // ===== SMOOTHING (pbnify majority filter) =====
  function pbnifySmooth(mat, w, h, range) {
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const counts = {};
        let best = mat[y * w + x], bestCount = 0;
        const yMin = Math.max(0, y - range), yMax = Math.min(h - 1, y + range);
        const xMin = Math.max(0, x - range), xMax = Math.min(w - 1, x + range);
        for (let yy = yMin; yy <= yMax; yy++) {
          for (let xx = xMin; xx <= xMax; xx++) {
            const v = mat[yy * w + xx];
            const c = (counts[v] || 0) + 1;
            counts[v] = c;
            if (c > bestCount) { bestCount = c; best = v; }
          }
        }
        out[y * w + x] = best;
      }
    }
    return out;
  }

  // ===== REGION DETECTION =====
  function processRegions(mat, w, h, minSize) {
    const covered = new Uint8Array(w * h);
    const labels = [];
    let regionCount = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (covered[y * w + x]) continue;
        const region = floodFillRegion(mat, covered, x, y, w, h);
        if (region.pixels.length >= minSize) {
          regionCount++;
          const loc = findBestLabelLoc(mat, region, w, h);
          labels.push({ value: region.value, x: loc.x, y: loc.y, radius: loc.radius });
        } else {
          removeSmallRegion(mat, region, w, h);
        }
      }
    }
    return { labels, regionCount };
  }

  function floodFillRegion(mat, covered, sx, sy, w, h) {
    const value = mat[sy * w + sx];
    const pixels = [];
    const stack = [[sx, sy]];
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const idx = y * w + x;
      if (x < 0 || x >= w || y < 0 || y >= h) continue;
      if (covered[idx] || mat[idx] !== value) continue;
      covered[idx] = 1;
      pixels.push([x, y]);
      stack.push([x-1,y], [x+1,y], [x,y-1], [x,y+1]);
    }
    return { value, pixels };
  }

  function findBestLabelLoc(mat, region, w, h) {
    let bestX = region.pixels[0][0], bestY = region.pixels[0][1], bestScore = 0;
    let bestRadius = 1;
    const step = Math.max(1, Math.floor(region.pixels.length / 300));
    for (let i = 0; i < region.pixels.length; i += step) {
      const [x, y] = region.pixels[i];
      const left = countSame(mat, x, y, -1, 0, w, h);
      const right = countSame(mat, x, y, 1, 0, w, h);
      const up = countSame(mat, x, y, 0, -1, w, h);
      const down = countSame(mat, x, y, 0, 1, w, h);
      const score = left * right * up * down;
      if (score > bestScore) {
        bestScore = score;
        bestX = x;
        bestY = y;
        // The "radius" is the min distance to any edge — determines how much space for a label
        bestRadius = Math.min(left, right, up, down);
      }
    }
    return { x: bestX, y: bestY, radius: bestRadius };
  }

  function countSame(mat, x, y, dx, dy, w, h) {
    const value = mat[y * w + x];
    let count = 0;
    let cx = x + dx, cy = y + dy;
    while (cx >= 0 && cx < w && cy >= 0 && cy < h && mat[cy * w + cx] === value) {
      count++; cx += dx; cy += dy;
    }
    return count;
  }

  function removeSmallRegion(mat, region, w, h) {
    // Find most common neighboring color
    const neighborCounts = {};
    for (const [x, y] of region.pixels) {
      const neighbors = [[x-1,y],[x+1,y],[x,y-1],[x,y+1]];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nv = mat[ny * w + nx];
          if (nv !== region.value) {
            neighborCounts[nv] = (neighborCounts[nv] || 0) + 1;
          }
        }
      }
    }
    // Pick most common neighbor
    let newVal = region.value;
    let maxCount = 0;
    for (const [v, c] of Object.entries(neighborCounts)) {
      if (c > maxCount) { maxCount = c; newVal = parseInt(v); }
    }
    for (const [x, y] of region.pixels) {
      mat[y * w + x] = newVal;
    }
  }

  // ===== OUTLINE =====
  function buildOutline(mat, w, h) {
    const line = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        const v = mat[idx];
        if ((x < w-1 && mat[idx+1] !== v) || (y < h-1 && mat[idx+w] !== v)) {
          line[idx] = 1;
        }
      }
    }
    return line;
  }

  // ===== RENDERING =====
  function renderFilled(mat, palette, w, h) {
    filledCanvas.width = w; filledCanvas.height = h;
    const ctx = filledCanvas.getContext('2d');
    const imgData = ctx.createImageData(w, h);
    for (let i = 0; i < w * h; i++) {
      const c = palette[mat[i]] || palette[0];
      imgData.data[i*4] = c.r; imgData.data[i*4+1] = c.g;
      imgData.data[i*4+2] = c.b; imgData.data[i*4+3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  function renderOutline(matLine, mat, labels, palette, w, h) {
    // Render at 3x resolution for crisp, readable numbers
    const scale = 3;
    const ow = w * scale;
    const oh = h * scale;
    outlineCanvas.width = ow;
    outlineCanvas.height = oh;
    const ctx = outlineCanvas.getContext('2d');

    // Draw white background + outlines scaled up
    const imgData = ctx.createImageData(ow, oh);
    for (let y = 0; y < oh; y++) {
      for (let x = 0; x < ow; x++) {
        const srcX = Math.floor(x / scale);
        const srcY = Math.floor(y / scale);
        const isLine = matLine[srcY * w + srcX];
        const gray = isLine ? 80 : 255;
        const idx = (y * ow + x) * 4;
        imgData.data[idx] = gray;
        imgData.data[idx+1] = gray;
        imgData.data[idx+2] = gray;
        imgData.data[idx+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Draw numbers — size adapts to available space in the region
    // All coordinates and sizes are now in the scaled space
    const baseFontSize = Math.max(12, Math.round(ow / 70));
    const minFontSize = Math.max(8, Math.round(ow / 180));
    const maxFontSize = Math.round(ow / 30);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const loc of labels) {
      const num = String(loc.value + 1);
      const numDigits = num.length;
      // radius is in original pixels, scale it up
      const r = loc.radius * scale;
      const maxByWidth = (r * 1.6) / (0.6 * numDigits);
      const maxByHeight = r * 1.6;
      let fontSize = Math.min(maxByWidth, maxByHeight, maxFontSize);
      fontSize = Math.max(minFontSize, Math.min(baseFontSize, fontSize));
      fontSize = Math.round(fontSize);

      const lx = loc.x * scale;
      const ly = loc.y * scale;

      ctx.font = `bold ${fontSize}px 'Instrument Sans', sans-serif`;
      const metrics = ctx.measureText(num);
      const tw = metrics.width + 4;
      const th = fontSize + 3;

      // White background for readability
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillRect(lx - tw/2, ly - th/2, tw, th);

      ctx.fillStyle = '#1c1917';
      ctx.fillText(num, lx, ly);
    }
  }

  function renderPaletteGuide(palette) {
    const cols = Math.min(palette.length, 8);
    const rows = Math.ceil(palette.length / cols);
    const cellW = 90, cellH = 70;
    const padX = 16, padY = 50;
    const canW = cols * cellW + padX * 2;
    const canH = rows * cellH + padY + padX;

    paletteCanvas.width = canW;
    paletteCanvas.height = canH;
    const ctx = paletteCanvas.getContext('2d');

    // Background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canW, canH);

    // Title
    ctx.fillStyle = '#1c1917';
    ctx.font = "bold 16px 'Instrument Sans', sans-serif";
    ctx.textAlign = 'left';
    ctx.fillText('Color Guide', padX, 30);
    ctx.fillStyle = '#736e69';
    ctx.font = "12px 'Instrument Sans', sans-serif";
    ctx.fillText(`${palette.length} colors`, padX + 110, 30);

    palette.forEach((c, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = padX + col * cellW;
      const y = padY + row * cellH;

      // Color swatch
      ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 4, cellW - 8, cellH - 20, 6);
      ctx.fill();

      // Border
      ctx.strokeStyle = '#e7e5e4';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Number
      ctx.fillStyle = '#1c1917';
      ctx.font = "bold 11px 'Instrument Sans', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), x + cellW / 2, y + cellH - 6);
    });
  }

  function renderComparison(mat, palette, w, h) {
    // "After" = filled PBN result
    resultCanvasAfter.width = w;
    resultCanvasAfter.height = h;
    const ctxA = resultCanvasAfter.getContext('2d');
    const imgA = ctxA.createImageData(w, h);
    for (let i = 0; i < w * h; i++) {
      const c = palette[mat[i]] || palette[0];
      imgA.data[i*4] = c.r; imgA.data[i*4+1] = c.g;
      imgA.data[i*4+2] = c.b; imgA.data[i*4+3] = 255;
    }
    ctxA.putImageData(imgA, 0, 0);

    // "Before" = original image at same size
    resultCanvasBefore.width = w;
    resultCanvasBefore.height = h;
    const ctxB = resultCanvasBefore.getContext('2d');
    ctxB.drawImage(loadedImage, 0, 0, w, h);

    // Reset slider to 50%
    setComparisonPosition(50);
  }

  // ===== COMPARISON SLIDER =====
  function setComparisonPosition(pct) {
    comparisonClip.style.width = pct + '%';
    comparisonHandle.style.left = pct + '%';
  }

  let dragging = false;
  function startDrag(e) {
    dragging = true;
    updateDrag(e);
  }
  function updateDrag(e) {
    if (!dragging) return;
    const rect = comparisonSlider.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setComparisonPosition(pct);
  }
  function endDrag() { dragging = false; }

  comparisonSlider.addEventListener('mousedown', startDrag);
  comparisonSlider.addEventListener('touchstart', startDrag, { passive: true });
  document.addEventListener('mousemove', updateDrag);
  document.addEventListener('touchmove', updateDrag, { passive: true });
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);

  // ===== VIEW SWITCHING =====
  document.querySelectorAll('#viewTabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#viewTabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      switchView(tab.dataset.view);
    });
  });

  function switchView(view) {
    currentView = view;
    const isComparison = view === 'comparison';
    comparisonContainer.hidden = !isComparison;
    singleView.hidden = isComparison;
    uploadState.hidden = true;

    if (!isComparison) {
      singleView.hidden = false;
      filledCanvas.hidden = view !== 'filled';
      outlineCanvas.hidden = view !== 'outline';
      paletteCanvas.hidden = view !== 'palette';
    }
  }

  // ===== ACTIONS =====
  startOverBtn.addEventListener('click', () => {
    comparisonContainer.hidden = true;
    singleView.hidden = true;
    uploadState.hidden = false;
    statsSection.hidden = true;
    const exportSection = $('exportSection');
    exportSection.hidden = true;
    generatedData = null;
    generateBtn.disabled = true;
    loadedImage = null;
    // Reset dropzone
    dropZone.innerHTML = `
      <input type="file" id="imageInput" accept="image/*" hidden>
      <div class="dropzone-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 5h6M19 2v6M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/></svg></div>
      <p class="dropzone-title">Drop image here</p>
      <p class="dropzone-sub">or <label class="dropzone-link" for="imageInput">browse files</label></p>
      <p class="dropzone-hint">JPEG · PNG · WEBP</p>
    `;
    // Re-bind input
    const newInput = dropZone.querySelector('#imageInput');
    if (newInput) newInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });
  });

  // ===== EXPORT =====
  const dlOutlineBtn = $('dlOutlineBtn');
  const dlOutlineColorBtn = $('dlOutlineColorBtn');
  const dlPaletteBtn = $('dlPaletteBtn');
  const dlFilledBtn = $('dlFilledBtn');
  const dlFilledOutlineBtn = $('dlFilledOutlineBtn');
  const dlPdfBtn = $('dlPdfBtn');

  // 1. Outline + Numbers
  dlOutlineBtn.addEventListener('click', () => {
    if (!generatedData) return;
    downloadCanvas(outlineCanvas, 'pbn-outline-numbers.png');
  });

  // 2. Outline + Numbers + Light color overlay
  dlOutlineColorBtn.addEventListener('click', () => {
    if (!generatedData) return;
    downloadCanvas(generatedData.outlineColorCanvas, 'pbn-outline-color-hint.png');
  });

  // 3. Color Palette
  dlPaletteBtn.addEventListener('click', () => {
    if (!generatedData) return;
    downloadCanvas(paletteCanvas, 'pbn-color-palette.png');
  });

  // 4. Finished painting (filled)
  dlFilledBtn.addEventListener('click', () => {
    if (!generatedData) return;
    downloadCanvas(filledCanvas, 'pbn-finished-painting.png');
  });

  // 5. Finished painting + outline (no numbers)
  dlFilledOutlineBtn.addEventListener('click', () => {
    if (!generatedData) return;
    downloadCanvas(generatedData.filledOutlineCanvas, 'pbn-finished-outline.png');
  });

  // 6. PDF (3 pages)
  dlPdfBtn.addEventListener('click', () => {
    if (!generatedData) return;
    generatePDF();
  });

  function downloadCanvas(canvas, filename) {
    const a = document.createElement('a');
    a.download = filename;
    a.href = canvas.toDataURL('image/png');
    a.click();
  }

  // Render: outline + numbers with light color underneath
  function renderOutlineWithColor(data) {
    const d = data || generatedData;
    const { mat, palette, matLine, labels, w, h } = d;
    const scale = 3;
    const ow = w * scale, oh = h * scale;
    const canvas = document.createElement('canvas');
    canvas.width = ow; canvas.height = oh;
    const ctx = canvas.getContext('2d');

    // Draw light colors (low opacity fill)
    const imgData = ctx.createImageData(ow, oh);
    for (let y = 0; y < oh; y++) {
      for (let x = 0; x < ow; x++) {
        const srcX = Math.floor(x / scale);
        const srcY = Math.floor(y / scale);
        const idx = srcY * w + srcX;
        const isLine = matLine[idx];
        const c = palette[mat[idx]] || palette[0];
        const pi = (y * ow + x) * 4;
        if (isLine) {
          imgData.data[pi] = 60; imgData.data[pi+1] = 60; imgData.data[pi+2] = 60; imgData.data[pi+3] = 255;
        } else {
          // Blend: 20% color + 80% white
          imgData.data[pi]   = Math.round(c.r * 0.2 + 255 * 0.8);
          imgData.data[pi+1] = Math.round(c.g * 0.2 + 255 * 0.8);
          imgData.data[pi+2] = Math.round(c.b * 0.2 + 255 * 0.8);
          imgData.data[pi+3] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Draw numbers
    const baseFontSize = Math.max(12, Math.round(ow / 70));
    const minFontSize = Math.max(8, Math.round(ow / 180));
    const maxFontSize = Math.round(ow / 30);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const loc of labels) {
      const num = String(loc.value + 1);
      const numDigits = num.length;
      const r = loc.radius * scale;
      const maxByWidth = (r * 1.6) / (0.6 * numDigits);
      const maxByHeight = r * 1.6;
      let fontSize = Math.min(maxByWidth, maxByHeight, maxFontSize);
      fontSize = Math.max(minFontSize, Math.min(baseFontSize, fontSize));
      fontSize = Math.round(fontSize);
      const lx = loc.x * scale, ly = loc.y * scale;
      ctx.font = `bold ${fontSize}px -apple-system, sans-serif`;
      const metrics = ctx.measureText(num);
      const tw = metrics.width + 4, th = fontSize + 3;
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fillRect(lx - tw/2, ly - th/2, tw, th);
      ctx.fillStyle = '#1c1917';
      ctx.fillText(num, lx, ly);
    }
    return canvas;
  }

  // Render: filled painting + outline (no numbers)
  function renderFilledWithOutline(data) {
    const d = data || generatedData;
    const { mat, palette, matLine, w, h } = d;
    const scale = 3;
    const ow = w * scale, oh = h * scale;
    const canvas = document.createElement('canvas');
    canvas.width = ow; canvas.height = oh;
    const ctx = canvas.getContext('2d');

    const imgData = ctx.createImageData(ow, oh);
    for (let y = 0; y < oh; y++) {
      for (let x = 0; x < ow; x++) {
        const srcX = Math.floor(x / scale);
        const srcY = Math.floor(y / scale);
        const idx = srcY * w + srcX;
        const isLine = matLine[idx];
        const c = palette[mat[idx]] || palette[0];
        const pi = (y * ow + x) * 4;
        if (isLine) {
          // Darken the color for outline
          imgData.data[pi]   = Math.round(c.r * 0.3);
          imgData.data[pi+1] = Math.round(c.g * 0.3);
          imgData.data[pi+2] = Math.round(c.b * 0.3);
          imgData.data[pi+3] = 255;
        } else {
          imgData.data[pi] = c.r; imgData.data[pi+1] = c.g; imgData.data[pi+2] = c.b; imgData.data[pi+3] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  // PDF generation (actual PDF with 3 pages)
  function generatePDF() {
    const { palette, mat, matLine, labels, w, h, regionCount } = generatedData;

    // Get image data URLs for each page
    const outlineDataUrl = outlineCanvas.toDataURL('image/jpeg', 0.92);
    const colorHintDataUrl = generatedData.outlineColorCanvas.toDataURL('image/jpeg', 0.92);
    const paletteDataUrl = paletteCanvas.toDataURL('image/jpeg', 0.95);
    const filledDataUrl = filledCanvas.toDataURL('image/jpeg', 0.92);

    // Use a print window approach — creates a proper PDF via browser print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the PDF.');
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>Paint by Number Kit</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4 portrait; margin: 0; }
  @media print {
    .page { page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    .no-print { display: none; }
  }
  body { font-family: -apple-system, sans-serif; color: #1c1917; }
  .page {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .page-full img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .page-padded {
    padding: 20px;
  }
  .page-header {
    width: 100%;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e0e0e0;
  }
  .page-header h2 { font-size: 18px; font-weight: 700; }
  .page-header p { font-size: 12px; color: #6a6a6a; margin-top: 4px; }
  .page-padded img {
    max-width: 100%;
    max-height: calc(100vh - 120px);
    object-fit: contain;
    border: 1px solid #e0e0e0;
  }
  .page3-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    width: 100%;
    flex: 1;
  }
  .page3-grid img {
    width: 100%;
    height: auto;
    max-height: calc(100vh - 140px);
    object-fit: contain;
    border: 1px solid #e0e0e0;
  }
  .print-btn {
    position: fixed;
    top: 16px;
    right: 16px;
    padding: 10px 24px;
    background: #0078d4;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    z-index: 100;
  }
  .print-btn:hover { background: #005a9e; }
</style>
</head><body>
<button class="print-btn no-print" onclick="window.print(); setTimeout(() => window.close(), 500);">Save as PDF</button>

<div class="page page-full">
  <img src="${outlineDataUrl}" alt="Outline">
</div>

<div class="page page-full">
  <img src="${colorHintDataUrl}" alt="Color Hint">
</div>

<div class="page page-padded">
  <div class="page-header">
    <h2>Color Palette & Finished Example</h2>
    <p>${palette.length} colors · ${regionCount} regions</p>
  </div>
  <div class="page3-grid">
    <img src="${paletteDataUrl}" alt="Color Palette">
    <img src="${filledDataUrl}" alt="Finished Painting">
  </div>
</div>

</body></html>`);
    printWindow.document.close();
  }

  // ===== SAVE TO GALLERY =====
  saveDesignBtn.addEventListener('click', () => {
    if (!generatedData) return;
    const designs = JSON.parse(localStorage.getItem('pbn_designs') || '[]');
    const thumbnail = filledCanvas.toDataURL('image/jpeg', 0.6);
    designs.unshift({
      id: Date.now(),
      thumbnail,
      colors: generatedData.palette.length,
      regions: generatedData.regionCount,
      date: new Date().toLocaleDateString(),
    });
    // Keep max 20
    if (designs.length > 20) designs.length = 20;
    localStorage.setItem('pbn_designs', JSON.stringify(designs));
    updateDesignCount();
    saveDesignBtn.textContent = '✓ Saved!';
    setTimeout(() => { saveDesignBtn.textContent = '💾 Save to Gallery'; }, 2000);
  });

  // ===== MY DESIGNS MODAL =====
  myDesignsBtn.addEventListener('click', () => {
    designsModal.hidden = false;
    renderDesignsGrid();
  });
  closeModal.addEventListener('click', () => { designsModal.hidden = true; });
  designsModal.addEventListener('click', e => {
    if (e.target === designsModal) designsModal.hidden = true;
  });

  function renderDesignsGrid() {
    const designs = JSON.parse(localStorage.getItem('pbn_designs') || '[]');
    if (designs.length === 0) {
      designsGrid.innerHTML = '<div class="empty-state"><p>No saved designs yet.</p><p>Generate a design and click "Save to Gallery".</p></div>';
      return;
    }
    designsGrid.innerHTML = '<div class="designs-grid">' + designs.map(d => `
      <div class="design-thumb">
        <img src="${d.thumbnail}" alt="Design">
        <div class="design-thumb-info">${d.colors} colors · ${d.date}</div>
      </div>
    `).join('') + '</div>';
  }

  function updateDesignCount() {
    const designs = JSON.parse(localStorage.getItem('pbn_designs') || '[]');
    designCount.textContent = designs.length;
  }
  updateDesignCount();

})();
