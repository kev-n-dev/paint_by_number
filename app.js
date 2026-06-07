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
    // Don't double-trigger if clicking the label (it already opens the input)
    if (e.target.tagName === 'LABEL' || e.target.closest('label')) return;
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

      generatedData = { palette, mat: matSmooth, labels, w, h, matLine, regionCount,
        settings: { numColors, smoothRange, minRegionSize, targetW: w, colorSpace }
      };

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

    // Deduplicate visually similar colors (Lab distance < 15)
    // Aggressive merge — colors that look the same when mixed as paint get combined
    const unique = [centroids[0]];
    for (let i = 1; i < centroids.length; i++) {
      let isDup = false;
      for (const u of unique) {
        if (colorDistSq(centroids[i], u, 'lab') < 225) { isDup = true; break; } // Lab dist < 15
      }
      if (!isDup) unique.push(centroids[i]);
    }

    // Sort palette from lightest to darkest (by Lab L value)
    unique.sort((a, b) => {
      const labA = rgbToLab(a[0], a[1], a[2]);
      const labB = rgbToLab(b[0], b[1], b[2]);
      return labB[0] - labA[0]; // highest L (lightest) first
    });

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

    // Pre-compute lightness for each palette color
    const paletteLightness = palette.map(c => rgbToLab(c.r, c.g, c.b)[0]);

    // Draw background + adaptive outlines
    // Light regions get dark outlines, dark regions get light outlines
    const imgData = ctx.createImageData(ow, oh);
    for (let y = 0; y < oh; y++) {
      for (let x = 0; x < ow; x++) {
        const srcX = Math.floor(x / scale);
        const srcY = Math.floor(y / scale);
        const srcIdx = srcY * w + srcX;
        const isLine = matLine[srcIdx];
        const colorIdx = mat[srcIdx];
        const lightness = paletteLightness[colorIdx] || 50;
        const idx = (y * ow + x) * 4;

        if (isLine) {
          // Adaptive outline: dark outline on light areas, light outline on dark areas
          if (lightness > 55) {
            // Light region — use dark grey outline
            imgData.data[idx] = 60; imgData.data[idx+1] = 60; imgData.data[idx+2] = 60;
          } else {
            // Dark region — use light grey outline (easier to cover with dark paint)
            imgData.data[idx] = 180; imgData.data[idx+1] = 180; imgData.data[idx+2] = 180;
          }
        } else {
          imgData.data[idx] = 255; imgData.data[idx+1] = 255; imgData.data[idx+2] = 255;
        }
        imgData.data[idx+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Draw numbers — size adapts to available space in the region
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

      const lx = loc.x * scale;
      const ly = loc.y * scale;

      // Adaptive number color based on region lightness
      const colorIdx = mat[loc.y * w + loc.x];
      const lightness = paletteLightness[colorIdx] || 50;

      ctx.font = `bold ${fontSize}px -apple-system, sans-serif`;
      const metrics = ctx.measureText(num);
      const tw = metrics.width + 4;
      const th = fontSize + 3;

      if (lightness > 55) {
        // Light region: dark number on semi-transparent white background
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(lx - tw/2, ly - th/2, tw, th);
        ctx.fillStyle = '#333333';
      } else {
        // Dark region: light number on semi-transparent dark background
        // Uses lighter ink that's easy to cover with dark paint
        ctx.fillStyle = 'rgba(200,200,200,0.4)';
        ctx.fillRect(lx - tw/2, ly - th/2, tw, th);
        ctx.fillStyle = '#aaaaaa';
      }
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

  // ===== PAINT SETS & MIXING =====
  const PAINT_SETS = {
    'Acrylic Basic': [
      { name: 'Titanium White',  rgb: [255, 255, 255] },
      { name: 'Scarlet',         rgb: [255, 36, 0] },
      { name: 'Cerulean Blue',   rgb: [0, 123, 167] },
      { name: 'Sap Green',       rgb: [80, 125, 42] },
      { name: 'Lemon Yellow',    rgb: [255, 247, 0] },
      { name: 'Lamp Black',      rgb: [20, 20, 20] },
      { name: 'Burnt Sienna',    rgb: [138, 72, 51] },
      { name: 'Burnt Umber',     rgb: [101, 67, 33] },
      { name: 'Deep Blue',       rgb: [0, 47, 108] },
      { name: 'Deep Green',      rgb: [0, 73, 53] },
      { name: 'Crimson Red',     rgb: [153, 0, 51] },
      { name: 'Medium Yellow',   rgb: [255, 204, 0] },
    ]
  };

  // Color name lookup — art/paint-oriented names
  const COLOR_NAMES = [
    ['#FFFFFF','White'],['#000000','Black'],['#FF0000','Red'],['#00FF00','Green'],['#0000FF','Blue'],
    ['#FFFF00','Yellow'],['#FF00FF','Magenta'],['#00FFFF','Cyan'],['#FFA500','Orange'],['#800080','Purple'],
    ['#FFC0CB','Pink'],['#A52A2A','Brown'],['#808080','Grey'],['#C0C0C0','Silver'],['#FFD700','Gold'],
    ['#F5F5DC','Beige'],['#FFFFF0','Ivory'],['#F0E68C','Khaki'],['#E6E6FA','Lavender'],['#FFF0F5','Blush'],
    ['#FAEBD7','Antique White'],['#D2691E','Chocolate'],['#8B4513','Saddle Brown'],['#DEB887','Burlywood'],
    ['#F4A460','Sandy Brown'],['#CD853F','Peru'],['#D2B48C','Tan'],['#BC8F8F','Rosy Brown'],
    ['#FFE4C4','Bisque'],['#FFDEAD','Navajo White'],['#FFE4B5','Moccasin'],['#FFF8DC','Cornsilk'],
    ['#FFFACD','Lemon Chiffon'],['#FAFAD2','Light Goldenrod'],['#EEE8AA','Pale Goldenrod'],
    ['#BDB76B','Dark Khaki'],['#DAA520','Goldenrod'],['#B8860B','Dark Goldenrod'],
    ['#FF6347','Tomato'],['#FF4500','Orange Red'],['#FF8C00','Dark Orange'],['#FFA07A','Light Salmon'],
    ['#FA8072','Salmon'],['#E9967A','Dark Salmon'],['#F08080','Light Coral'],['#CD5C5C','Indian Red'],
    ['#DC143C','Crimson'],['#B22222','Firebrick'],['#8B0000','Dark Red'],['#FF69B4','Hot Pink'],
    ['#FF1493','Deep Pink'],['#DB7093','Pale Violet Red'],['#C71585','Medium Violet Red'],
    ['#800000','Maroon'],['#A0522D','Sienna'],['#D2691E','Cocoa'],['#F5DEB3','Wheat'],
    ['#4B0082','Indigo'],['#8A2BE2','Blue Violet'],['#9400D3','Dark Violet'],['#9932CC','Dark Orchid'],
    ['#BA55D3','Medium Orchid'],['#DDA0DD','Plum'],['#EE82EE','Violet'],['#DA70D6','Orchid'],
    ['#FF00FF','Fuchsia'],['#D8BFD8','Thistle'],
    ['#000080','Navy'],['#00008B','Dark Blue'],['#0000CD','Medium Blue'],['#4169E1','Royal Blue'],
    ['#1E90FF','Dodger Blue'],['#6495ED','Cornflower Blue'],['#87CEEB','Sky Blue'],
    ['#87CEFA','Light Sky Blue'],['#ADD8E6','Light Blue'],['#B0E0E6','Powder Blue'],
    ['#4682B4','Steel Blue'],['#5F9EA0','Cadet Blue'],['#008B8B','Dark Cyan'],['#20B2AA','Light Sea Green'],
    ['#008080','Teal'],['#48D1CC','Medium Turquoise'],['#40E0D0','Turquoise'],['#7FFFD4','Aquamarine'],
    ['#006400','Dark Green'],['#228B22','Forest Green'],['#32CD32','Lime Green'],['#90EE90','Light Green'],
    ['#00FA9A','Medium Spring Green'],['#3CB371','Medium Sea Green'],['#2E8B57','Sea Green'],
    ['#6B8E23','Olive Drab'],['#808000','Olive'],['#556B2F','Dark Olive Green'],['#66CDAA','Medium Aquamarine'],
    ['#8FBC8F','Dark Sea Green'],['#ADFF2F','Green Yellow'],['#7CFC00','Lawn Green'],
    ['#9ACD32','Yellow Green'],['#006400','Hunter Green'],['#355E3B','Pine Green'],
    ['#2F4F4F','Dark Slate Grey'],['#708090','Slate Grey'],['#778899','Light Slate Grey'],
    ['#696969','Dim Grey'],['#A9A9A9','Dark Grey'],['#D3D3D3','Light Grey'],['#DCDCDC','Gainsboro'],
    ['#F5F5F5','White Smoke'],['#F0FFF0','Honeydew'],['#F0FFFF','Azure'],['#FFF5EE','Seashell'],
    ['#F5FFFA','Mint Cream'],['#FFFAF0','Floral White'],['#FAF0E6','Linen'],['#FDF5E6','Old Lace'],
    ['#FFE4E1','Misty Rose'],['#FFEFD5','Papaya Whip'],['#FFF0F5','Lavender Blush'],
    ['#E0B0FF','Mauve'],['#CC8899','Dusty Rose'],['#C9A0DC','Wisteria'],['#ACE5EE','Pale Blue'],
    ['#98FB98','Pale Green'],['#FFBF00','Amber'],['#E2725B','Terracotta'],['#CB4154','Brick Red'],
    ['#536878','Dark Electric Blue'],['#36454F','Charcoal'],['#E1AD21','Mustard'],
    ['#3D0C02','Black Bean'],['#480607','Dark Sienna'],['#704214','Sepia'],['#C19A6B','Camel'],
    ['#EDC9AF','Desert Sand'],['#C2B280','Sand'],['#967117','Sandy Taupe'],['#483C32','Taupe'],
    ['#614051','Eggplant'],['#722F37','Wine'],['#4A0100','Dark Burgundy'],['#900020','Burgundy'],
    ['#F28500','Tangerine'],['#FF7F50','Coral'],['#E34234','Vermilion'],['#CC5500','Burnt Orange'],
    ['#997A8D','Mountbatten Pink'],['#B0C4DE','Light Steel Blue'],['#CCCCFF','Periwinkle'],
    ['#C8A2C8','Lilac'],['#E0218A','Barbie Pink'],['#FF007F','Rose'],['#7B3F00','Chocolate Brown'],
  ];

  function getColorName(r, g, b) {
    const targetLab = rgbToLab(r, g, b);
    let bestName = 'Unknown';
    let bestDist = Infinity;
    for (const [hex, name] of COLOR_NAMES) {
      const hr = parseInt(hex.slice(1,3), 16);
      const hg = parseInt(hex.slice(3,5), 16);
      const hb = parseInt(hex.slice(5,7), 16);
      const lab = rgbToLab(hr, hg, hb);
      const d = (targetLab[0]-lab[0])**2 + (targetLab[1]-lab[1])**2 + (targetLab[2]-lab[2])**2;
      if (d < bestDist) { bestDist = d; bestName = name; }
    }
    return bestName;
  }

  // Convert ratios to simple integer ratio string (e.g. "3:1" or "2:1:1")
  function toRatioString(components) {
    if (components.length === 1) return '—';
    // Find ratios relative to smallest
    const ratios = components.map(c => c.ratio);
    const minR = Math.min(...ratios);
    const normalized = ratios.map(r => r / minR);
    // Round to nearest 0.5 then express as integers
    // Multiply to get whole numbers
    let multiplier = 1;
    for (let m = 1; m <= 12; m++) {
      const all = normalized.map(n => n * m);
      if (all.every(v => Math.abs(v - Math.round(v)) < 0.15)) {
        multiplier = m;
        break;
      }
    }
    const parts = normalized.map(n => Math.round(n * multiplier));
    return parts.join(':');
  }

  // Find the best mix of base paints to approximate a target color
  // Uses least-squares optimization over Lab space
  function findMixRecipe(targetRgb, basePaints, maxComponents = 4) {
    const targetLab = rgbToLab(targetRgb.r, targetRgb.g, targetRgb.b);
    const baseLabs = basePaints.map(p => rgbToLab(p.rgb[0], p.rgb[1], p.rgb[2]));

    let bestRecipe = null;
    let bestDist = Infinity;

    // Try single paints first
    for (let i = 0; i < basePaints.length; i++) {
      const d = labDist(targetLab, baseLabs[i]);
      if (d < bestDist) {
        bestDist = d;
        bestRecipe = [{ idx: i, ratio: 1 }];
      }
    }

    // Try pairs
    for (let i = 0; i < basePaints.length; i++) {
      for (let j = i + 1; j < basePaints.length; j++) {
        const result = optimizeMix2(targetLab, baseLabs[i], baseLabs[j]);
        if (result.dist < bestDist) {
          bestDist = result.dist;
          bestRecipe = [
            { idx: i, ratio: result.ratioA },
            { idx: j, ratio: result.ratioB },
          ].filter(r => r.ratio >= 0.05);
        }
      }
    }

    // Try triples (if still not close enough)
    if (bestDist > 8) {
      for (let i = 0; i < basePaints.length; i++) {
        for (let j = i + 1; j < basePaints.length; j++) {
          for (let k = j + 1; k < basePaints.length; k++) {
            const result = optimizeMix3(targetLab, baseLabs[i], baseLabs[j], baseLabs[k]);
            if (result.dist < bestDist) {
              bestDist = result.dist;
              bestRecipe = [
                { idx: i, ratio: result.a },
                { idx: j, ratio: result.b },
                { idx: k, ratio: result.c },
              ].filter(r => r.ratio >= 0.05);
            }
          }
        }
      }
    }

    // Normalize ratios
    const total = bestRecipe.reduce((s, r) => s + r.ratio, 0);
    bestRecipe.forEach(r => r.ratio = r.ratio / total);

    return {
      components: bestRecipe.map(r => ({
        name: basePaints[r.idx].name,
        rgb: basePaints[r.idx].rgb,
        ratio: r.ratio
      })),
      distance: bestDist
    };
  }

  function labDist(a, b) {
    return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2);
  }

  // Mix Lab colors (subtractive approximation: weighted average in Lab)
  function mixLab(labA, labB, ratioA) {
    const ratioB = 1 - ratioA;
    return [
      labA[0]*ratioA + labB[0]*ratioB,
      labA[1]*ratioA + labB[1]*ratioB,
      labA[2]*ratioA + labB[2]*ratioB
    ];
  }

  function optimizeMix2(target, labA, labB) {
    let bestR = 0.5, bestD = Infinity;
    for (let r = 0; r <= 1; r += 0.05) {
      const mixed = mixLab(labA, labB, r);
      const d = labDist(target, mixed);
      if (d < bestD) { bestD = d; bestR = r; }
    }
    // Fine-tune
    for (let r = Math.max(0, bestR - 0.05); r <= Math.min(1, bestR + 0.05); r += 0.01) {
      const mixed = mixLab(labA, labB, r);
      const d = labDist(target, mixed);
      if (d < bestD) { bestD = d; bestR = r; }
    }
    return { ratioA: bestR, ratioB: 1 - bestR, dist: bestD };
  }

  function optimizeMix3(target, labA, labB, labC) {
    let bestA = 0.33, bestB = 0.33, bestD = Infinity;
    for (let a = 0; a <= 1; a += 0.1) {
      for (let b = 0; b <= 1 - a; b += 0.1) {
        const c = 1 - a - b;
        const mixed = [
          labA[0]*a + labB[0]*b + labC[0]*c,
          labA[1]*a + labB[1]*b + labC[1]*c,
          labA[2]*a + labB[2]*b + labC[2]*c
        ];
        const d = labDist(target, mixed);
        if (d < bestD) { bestD = d; bestA = a; bestB = b; }
      }
    }
    return { a: bestA, b: bestB, c: 1 - bestA - bestB, dist: bestD };
  }

  // Generate packing sheet HTML for the PDF
  function generatePackingSheetHTML(palette, logoUrl) {
    const basePaints = PAINT_SETS['Acrylic Basic'];
    const { mat, w, h, regionCount } = generatedData;

    // Calculate coverage (pixel count) per color
    const coverage = new Array(palette.length).fill(0);
    for (let i = 0; i < mat.length; i++) {
      coverage[mat[i]]++;
    }
    const totalPixels = w * h;

    // Canvas size calculation based on user's 720 DPI printer
    const DPI = 720;
    const printWidthInches = (w * 3) / DPI; // outline is 3x
    const printHeightInches = (h * 3) / DPI;
    const printWidthCm = (printWidthInches * 2.54).toFixed(1);
    const printHeightCm = (printHeightInches * 2.54).toFixed(1);

    // Paint volume calculation
    // Assume: 1ml acrylic covers ~30 cm² at 1 coat on canvas
    // Canvas area in cm²
    const canvasAreaCm2 = printWidthCm * printHeightCm;
    const ML_PER_CM2 = 1 / 30; // ml per cm² coverage
    const BUFFER = 1.3; // 30% extra for mixing waste

    // Difficulty rating
    let difficulty = 'Beginner';
    let diffStars = '⭐';
    if (palette.length > 40 || regionCount > 400) { difficulty = 'Expert'; diffStars = '⭐⭐⭐⭐⭐'; }
    else if (palette.length > 32 || regionCount > 250) { difficulty = 'Advanced'; diffStars = '⭐⭐⭐⭐'; }
    else if (palette.length > 24 || regionCount > 150) { difficulty = 'Intermediate'; diffStars = '⭐⭐⭐'; }
    else if (palette.length > 16) { difficulty = 'Easy'; diffStars = '⭐⭐'; }

    // Brush recommendation
    const smallRegions = coverage.filter(c => c / totalPixels < 0.01).length;
    const largeRegions = coverage.filter(c => c / totalPixels > 0.05).length;
    const brushes = [];
    if (largeRegions > 0) brushes.push('Flat brush 10mm (large areas)');
    brushes.push('Round brush 4mm (medium areas)');
    if (smallRegions > 5) brushes.push('Detail brush 1mm (fine details)');

    // Order info
    const orderId = 'PBN-' + Date.now().toString(36).toUpperCase().slice(-6);
    const orderDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    // Build color rows with volume
    const baseConsumption = {}; // track total ml of each base paint
    const rows = palette.map((color, i) => {
      const recipe = findMixRecipe(color, basePaints);
      const colorName = getColorName(color.r, color.g, color.b);
      const ratio = toRatioString(recipe.components);
      const coveragePct = (coverage[i] / totalPixels * 100).toFixed(1);
      const areaCm2 = (coverage[i] / totalPixels) * canvasAreaCm2;
      const volumeMl = Math.max(0.5, (areaCm2 * ML_PER_CM2 * BUFFER)).toFixed(1);

      // Track base paint consumption
      for (const comp of recipe.components) {
        const mlForThis = parseFloat(volumeMl) * comp.ratio;
        baseConsumption[comp.name] = (baseConsumption[comp.name] || 0) + mlForThis;
      }

      const swatchStyle = `display:inline-block;width:10px;height:10px;border-radius:2px;border:1px solid #ccc;vertical-align:middle;margin-right:3px;background:rgb(${color.r},${color.g},${color.b})`;
      const mixParts = recipe.components.map(c => {
        const pct = Math.round(c.ratio * 100);
        return `${c.name} ${pct}%`;
      }).join(' + ');

      // Visual ratio circles — sized proportionally (max 24px for the largest component)
      const maxRatio = Math.max(...recipe.components.map(c => c.ratio));
      const ratioDots = recipe.components.map(c => {
        const size = Math.max(10, Math.round((c.ratio / maxRatio) * 24));
        return `<span style="display:inline-block;width:${size}px;height:${size}px;border-radius:50%;background:rgb(${c.rgb[0]},${c.rgb[1]},${c.rgb[2]});border:1px solid #999;vertical-align:middle;margin-right:2px;"></span>`;
      }).join(' ');

      return `<tr style="border-bottom:1px solid #eee;">
        <td style="padding:2px 4px;font-weight:700;">${i + 1}</td>
        <td style="padding:2px 4px;white-space:nowrap;"><span style="${swatchStyle}"></span>${colorName}</td>
        <td style="padding:2px 4px;">${mixParts}</td>
        <td style="padding:2px 4px;font-family:monospace;">${ratio}</td>
        <td style="padding:2px 4px;white-space:nowrap;">${ratioDots}</td>
        <td style="padding:2px 4px;font-weight:600;">${volumeMl}ml</td>
      </tr>`;
    }).join('');

    // Total paint volume
    const totalVolumeMl = palette.reduce((sum, _, i) => {
      const areaCm2 = (coverage[i] / totalPixels) * canvasAreaCm2;
      return sum + Math.max(0.5, areaCm2 * ML_PER_CM2 * BUFFER);
    }, 0).toFixed(1);

    // Base paint consumption table
    const baseRows = Object.entries(baseConsumption)
      .sort((a, b) => b[1] - a[1])
      .map(([name, ml]) => {
        const paint = basePaints.find(p => p.name === name);
        const swatch = paint ? `display:inline-block;width:10px;height:10px;border-radius:2px;border:1px solid #ccc;vertical-align:middle;background:rgb(${paint.rgb[0]},${paint.rgb[1]},${paint.rgb[2]})` : '';
        return `<tr>
          <td style="font-size:10px;padding:3px 6px;"><span style="${swatch}"></span> ${name}</td>
          <td style="font-size:10px;padding:3px 6px;text-align:right;font-weight:600;">${ml.toFixed(1)} ml</td>
        </tr>`;
      }).join('');

    // Color accuracy swatch strip with empty check squares
    const swatchStrip = palette.map((c, i) => 
      `<div style="display:inline-flex;flex-direction:column;align-items:center;gap:2px;">
        <span style="display:block;width:36px;height:36px;background:rgb(${c.r},${c.g},${c.b});border:1px solid #ccc;border-radius:3px;font-size:9px;text-align:center;line-height:36px;font-weight:700;color:${(c.r+c.g+c.b) > 380 ? '#333' : '#fff'}">${i+1}</span>
        <span style="display:block;width:36px;height:36px;border:1.5px dashed #aaa;border-radius:3px;"></span>
      </div>`
    ).join('');

    return `
      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #333;">
        <div style="display:flex;align-items:center;gap:8px;">
          <img src="${logoUrl}" style="height:24px;width:auto;" alt="">
          <div>
            <h2 style="font-size:13px;margin-bottom:2px;">Packing Sheet — Paint Mixing Guide</h2>
            <p style="font-size:8px;color:#666;">Pixel Haven Digital Art Studios · Acrylic Basic (${basePaints.length} tubes) · ${palette.length} colors</p>
          </div>
        </div>
        <div style="text-align:right;font-size:9px;color:#666;">
          <strong style="color:#333;">${orderId}</strong><br>
          ${orderDate}
        </div>
      </div>

      <!-- Kit Info Bar -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-bottom:8px;">
        <div style="padding:5px;border:1px solid #e0e0e0;border-radius:3px;background:#fafafa;font-size:8px;">
          <strong style="display:block;font-size:7px;color:#888;text-transform:uppercase;margin-bottom:1px;">Canvas Size</strong>
          ${printWidthCm}×${printHeightCm} cm
        </div>
        <div style="padding:5px;border:1px solid #e0e0e0;border-radius:3px;background:#fafafa;font-size:8px;">
          <strong style="display:block;font-size:7px;color:#888;text-transform:uppercase;margin-bottom:1px;">Difficulty</strong>
          ${diffStars} ${difficulty}
        </div>
        <div style="padding:5px;border:1px solid #e0e0e0;border-radius:3px;background:#fafafa;font-size:8px;">
          <strong style="display:block;font-size:7px;color:#888;text-transform:uppercase;margin-bottom:1px;">Total Paint</strong>
          ${totalVolumeMl} ml
        </div>
        <div style="padding:5px;border:1px solid #e0e0e0;border-radius:3px;background:#fafafa;font-size:8px;">
          <strong style="display:block;font-size:7px;color:#888;text-transform:uppercase;margin-bottom:1px;">Brushes</strong>
          ${brushes.length} included
        </div>
      </div>

      <!-- Brushes -->
      <div style="margin-bottom:6px;padding:4px 8px;border:1px solid #e0e0e0;border-radius:3px;font-size:8px;">
        <strong>Brushes:</strong> ${brushes.join(' · ')}
      </div>

      <!-- Generation Settings -->
      <div style="margin-bottom:6px;padding:4px 8px;border:1px solid #e0e0e0;border-radius:3px;font-size:8px;display:flex;gap:12px;flex-wrap:wrap;">
        <span><strong>Colors:</strong> ${generatedData.settings.numColors}</span>
        <span><strong>Detail:</strong> ${generatedData.settings.smoothRange}</span>
        <span><strong>Min Region:</strong> ${generatedData.settings.minRegionSize}px</span>
        <span><strong>Width:</strong> ${generatedData.settings.targetW}px</span>
        <span><strong>Color Space:</strong> ${generatedData.settings.colorSpace === 'lab' ? 'CIE Lab' : 'RGB'}</span>
        <span><strong>Output:</strong> ${palette.length} colors · ${regionCount} regions</span>
      </div>

      <!-- Main Content: Color Table (left) + Stock & Checklist (right) -->
      <div style="display:grid;grid-template-columns:1fr 200px;gap:12px;margin-bottom:10px;">
        <!-- Left: Color Table -->
        <div>
          <table style="width:100%;border-collapse:collapse;font-size:8px;">
            <thead>
              <tr style="border-bottom:1.5px solid #333;text-align:left;">
                <th style="padding:3px 4px;">#</th>
                <th style="padding:3px 4px;">Color</th>
                <th style="padding:3px 4px;">Mix</th>
                <th style="padding:3px 4px;">Ratio</th>
                <th style="padding:3px 4px;">Visual</th>
                <th style="padding:3px 4px;">Vol.</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>

        <!-- Right: Base Paint Stock + Kit Checklist -->
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div style="border:1px solid #e0e0e0;border-radius:4px;padding:8px;">
            <strong style="font-size:9px;display:block;margin-bottom:4px;">Base Paint Stock Required</strong>
            <table style="width:100%;border-collapse:collapse;font-size:8px;">
              ${baseRows}
            </table>
          </div>
          <div style="border:1px solid #e0e0e0;border-radius:4px;padding:8px;">
            <strong style="font-size:9px;display:block;margin-bottom:4px;">Kit Contents Checklist</strong>
            <div style="font-size:8px;line-height:1.7;">
              ☐ Canvas (${printWidthCm}×${printHeightCm} cm)<br>
              ☐ Paint pots ×${palette.length}<br>
              ☐ Brushes ×${brushes.length}<br>
              ☐ Color guide card<br>
              ☐ Reference print<br>
              ☐ Instructions sheet
            </div>
          </div>
        </div>
      </div>

      <!-- Color Accuracy Swatch Strip (full width, larger) -->
      <div style="border:1px solid #e0e0e0;border-radius:4px;padding:10px;page-break-inside:avoid;">
        <strong style="font-size:10px;display:block;margin-bottom:8px;">Color Accuracy Check — dab mixed paint in the empty square below each swatch to compare:</strong>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${swatchStrip}
        </div>
      </div>

      <!-- Footer -->
      <div style="border-top:1px solid #e0e0e0;padding-top:8px;margin-top:10px;font-size:9px;color:#999;display:flex;justify-content:space-between;">
        <span>Generated by Pixel Haven · ${orderDate}</span>
        <span>${orderId} · ${palette.length} colors · ${regionCount} regions</span>
      </div>
    `;
  }

  function getUsedBasePaints(palette, basePaints) {
    const used = new Set();
    for (const color of palette) {
      const recipe = findMixRecipe(color, basePaints);
      for (const c of recipe.components) {
        used.add(c.name);
      }
    }
    return basePaints.filter(p => used.has(p.name));
  }

  // Load logo as base64 for PDF embedding
  function getLogoDataUrl(filename) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        c.getContext('2d').drawImage(img, 0, 0);
        resolve(c.toDataURL('image/png'));
      };
      img.onerror = () => resolve('');
      img.src = filename || 'logo.png';
    });
  }

  // PDF generation (actual PDF with 5 pages)
  async function generatePDF() {
    const { palette, mat, matLine, labels, w, h, regionCount } = generatedData;

    // Get image data URLs for each page
    const outlineDataUrl = outlineCanvas.toDataURL('image/jpeg', 0.92);
    const colorHintDataUrl = generatedData.outlineColorCanvas.toDataURL('image/jpeg', 0.92);
    const paletteDataUrl = paletteCanvas.toDataURL('image/jpeg', 0.95);
    const filledDataUrl = filledCanvas.toDataURL('image/jpeg', 0.92);

    // Load logos as data URLs for embedding in print
    const logoDataUrl = await getLogoDataUrl('logo-no-bg.png');
    const logoIconUrl = await getLogoDataUrl('logo-icon.png');

    // Use a print window approach — creates a proper PDF via browser print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the PDF.');
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>Paint by Number Kit</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  img { border: none; outline: none; }
  @page { size: letter portrait; margin: 0; }
  @media print {
    .page { page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    .no-print { display: none; }
    .page-padded { padding: 0.4in 0.5in; font-size: 8px; }
    .page-instructions { padding: 0.5in 0.6in; font-size: 11px; }
    .page-instructions h2 { font-size: 18px; margin-bottom: 4px; }
    .page-instructions h3 { font-size: 12px; }
    .page-instructions ul { font-size: 11px; line-height: 1.8; }
  }
  body { font-family: -apple-system, sans-serif; color: #1c1917; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .page-full {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .page-full img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  .page-padded {
    padding: 20px;
    overflow: hidden;
  }
  .page-padded > * {
    page-break-inside: avoid;
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
  }
  .page-padded img.page-img {
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
    max-height: 40vh;
    object-fit: contain;
  }
  table { border-collapse: collapse; }
  tbody tr { border-bottom: 1px solid #eee; }
  tbody td { padding: 5px 4px; vertical-align: middle; }
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
  .pdf-logo { height: 30px; width: auto; border: none; }
  .pdf-brand { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .pdf-brand img { border: none; }
  .pdf-brand-name { font-size: 14px; font-weight: 700; color: #333; }
  .pdf-brand-sub { font-size: 9px; color: #888; }
  .pdf-footer { position: absolute; bottom: 12px; left: 20px; right: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 8px; color: #aaa; }
  .pdf-footer img { height: 16px; opacity: 0.5; border: none; }
</style>
</head><body>
<button class="print-btn no-print" onclick="window.print(); setTimeout(() => window.close(), 500);">Save as PDF</button>

<div class="page page-full">
  <img src="${outlineDataUrl}" alt="Outline">
</div>

<div class="page page-full">
  <img src="${colorHintDataUrl}" alt="Color Hint">
</div>

<div class="page page-padded" style="position:relative;">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding-bottom:10px;border-bottom:2px solid #333;width:100%;">
    <img src="${logoDataUrl}" style="height:40px;width:auto;border:none;" alt="Pixel Haven">
    <div>
      <h2 style="font-size:18px;margin:0;font-weight:700;">Reference Guide</h2>
      <p style="font-size:10px;color:#888;margin:0;">${palette.length} colors · ${regionCount} regions</p>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
    <div>
      <img src="${paletteDataUrl}" alt="Color Palette" class="page-img" style="width:100%;height:auto;max-height:35vh;object-fit:contain;margin-bottom:10px;">
      ${generateInstructionSheet(palette, logoDataUrl)}
    </div>
    <div>
      <img src="${filledDataUrl}" alt="Finished Painting" class="page-img" style="width:100%;height:auto;max-height:70vh;object-fit:contain;">
    </div>
  </div>
  <div class="pdf-footer"><img src="${logoIconUrl}" alt="">Pixel Haven Digital Art Studios</div>
</div>

<div class="page page-padded" style="position:relative;">
  ${generatePackingSheetHTML(palette, logoDataUrl)}
  <div class="pdf-footer"><img src="${logoIconUrl}" alt="">Pixel Haven Digital Art Studios</div>
</div>

</body></html>`);
    printWindow.document.close();
  }

  // Generate instruction sheet HTML
  function generateInstructionSheet(palette, logoUrl) {
    const { regionCount } = generatedData;
    const estHours = Math.round(regionCount * 2 / 60);
    const timeRange = `${Math.max(1, estHours - 1)}–${estHours + 2} hours`;

    return `
      <div style="border-top:1px solid #e0e0e0;padding-top:6px;">
        <h3 style="font-size:9px;margin-bottom:5px;">🎨 How to Paint Your Masterpiece <span style="font-weight:400;color:#888;font-size:7px;">· Est. ${timeRange}</span></h3>
        
        <div style="font-size:7px;line-height:1.6;margin-bottom:4px;">
          <strong>🧰 Setup:</strong> Work on a flat surface with good lighting. Lay out all numbered pots and match them to the color guide. Keep a cup of water, paper towel, and your reference image nearby. Wear old clothes — acrylic is permanent once dry.
        </div>

        <div style="font-size:7px;line-height:1.6;margin-bottom:4px;">
          <strong>🖌️ Technique:</strong> Paint one color at a time across the whole canvas — finish every section numbered "1" before moving to "2", and so on. This avoids constant brush cleaning. Work light to dark — darker colors cover light ones easily if you overlap a border, but light paint struggles to cover dark mistakes. Start with the largest numbered areas using the flat brush, then switch to the fine brush for small sections. Work top to bottom so you don't rest your hand on wet paint. For each section: paint along the border edges first, then fill in the middle. Apply thin even coats — if the canvas texture shows through, let it dry 5–10 minutes and add a second coat. Make sure paint fully covers the printed numbers and lines.
        </div>

        <div style="font-size:7px;line-height:1.6;margin-bottom:4px;">
          <strong>🎯 Tips & Tricks:</strong> Stay inside the lines — paint right up to the border but don't cross into neighboring numbered sections. If you accidentally paint over a line, let it dry and paint the correct color back over it. Use a steady hand for small sections — rest your wrist on the table or your other hand. If a number is hard to read, check the color guide before painting. Dip only the tip of the brush into paint — you need less than you think. If the canvas shows through after one coat, let it dry and add a second thin coat. Close each pot immediately after dipping — don't leave them open while you paint.
        </div>

        <div style="font-size:7px;line-height:1.6;margin-bottom:4px;">
          <strong>✏️ Optional Outlining:</strong> Once all sections are fully dry (wait at least 1 hour), you can trace along the borders between sections with a 0.3–0.5mm permanent marker or felt-tip pen. Use black for a bold graphic look or dark brown for a softer natural feel. This hides any small gaps between colors and gives the painting a polished, defined appearance — especially effective on portraits and pets. Only outline the major borders. Test your pen on a painted edge first to check it doesn't smudge on the acrylic surface.
        </div>

        <div style="font-size:7px;line-height:1.6;margin-bottom:4px;">
          <strong>🧹 Paint Care:</strong> Seal pots tightly after every use — acrylic dries permanently in minutes. If paint thickens, add 1–2 drops of water max. Clean brushes immediately with water (dried acrylic ruins bristles). Reshape brush tips after washing and lay flat to dry. Never leave brushes standing in water.
        </div>

        <div style="font-size:7px;line-height:1.6;">
          <strong>✅ Finally:</strong> Let the completed painting dry 24 hours before handling or framing. But most importantly — relax and have fun! This is YOUR masterpiece. Mistakes happen and that's totally fine — they add character. Don't overthink it, just enjoy the process. Put on some music, grab a drink, and take your time. There's no wrong way to do this. When you're done, step back and admire what you created. You did that! 🎉
        </div>
      </div>
    `;
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
