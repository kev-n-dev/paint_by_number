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
  const detailAuto = $('detailAuto');
  const pageSizeEl = $('pageSize');
  const sharpness = $('sharpness');
  const sharpnessVal = $('sharpnessVal');
  const structure = $('structure');
  const structureVal = $('structureVal');
  const brightnessEl = $('brightness');
  const brightnessVal = $('brightnessVal');
  const contrastEl = $('contrast');
  const contrastVal = $('contrastVal');
  const saturationEl = $('saturation');
  const saturationVal = $('saturationVal');
  const warmthEl = $('warmth');
  const warmthVal = $('warmthVal');
  const cartoonOutlines = $('cartoonOutlines');
  const useCustomPalette = $('useCustomPalette');
  const styleSection = $('styleSection');
  const controlsSection = $('controlsSection');
  const styleGrid = $('styleGrid');
  const stylePreviewCanvas = $('stylePreviewCanvas');
  const customPaletteUI = $('customPaletteUI');
  const paintColorPicker = $('paintColorPicker');
  const paintNameInput = $('paintNameInput');
  const addPaintBtn = $('addPaintBtn');
  const paintChips = $('paintChips');
  const paletteHint = $('paletteHint');
  const paletteSelect = $('paletteSelect');
  const newPaletteBtn = $('newPaletteBtn');
  const renamePaletteBtn = $('renamePaletteBtn');
  const deletePaletteBtn = $('deletePaletteBtn');
  const loadPresetBtn = $('loadPresetBtn');
  const allowMixing = $('allowMixing');
  const minRegionSize = $('minRegionSize');
  const minRegionVal = $('minRegionVal');
  const difficultyBar = $('difficultyBar');
  const coverageTable = $('coverageTable');
  const downloadPdfBtn = $('downloadPdfBtn');
  const downloadLegendBtn = $('downloadLegendBtn');
  const downloadPaintListBtn = $('downloadPaintListBtn');
  const toggleCompare = $('toggleCompare');
  const compareWrap = $('compareWrap');
  const compareCanvas = $('compareCanvas');
  const compareSlider = $('compareSlider');
  const orderSummary = $('orderSummary');
  const orderContent = $('orderContent');

  let loadedImage = null;
  let dragging = false;
  let dragStart = null;

  let renderData = null;
  let animId = null;
  let lastCrop = null;
  let currentStyle = 'none';
  let styledImage = null; // canvas with style applied
  const outlineOnly = $('outlineOnly');

  // Multi-palette storage: { palettes: [{name, colors: [{r,g,b,hex,name}]}], active: 0 }

  // Predefined acrylic paint palettes (must be before loadPaletteStore call)
  function makeColor(hex, name) {
    const v = parseInt(hex.replace('#',''), 16);
    return { r: (v>>16)&255, g: (v>>8)&255, b: v&255, hex, name };
  }

  const PRESET_PALETTES = [
    { name: 'Basic Acrylics (12)', colors: [
      makeColor('#FFFFFF','Titanium White'), makeColor('#1A1A1A','Mars Black'),
      makeColor('#C41E3A','Cadmium Red'), makeColor('#FF6347','Vermilion'),
      makeColor('#FFD700','Cadmium Yellow'), makeColor('#FFA500','Yellow Ochre'),
      makeColor('#1E90FF','Cerulean Blue'), makeColor('#00008B','Ultramarine Blue'),
      makeColor('#228B22','Sap Green'), makeColor('#2E8B57','Viridian'),
      makeColor('#8B4513','Burnt Sienna'), makeColor('#A0522D','Raw Umber'),
    ]},
    { name: 'Earth Tones (10)', colors: [
      makeColor('#FFFFFF','Titanium White'), makeColor('#2F2F2F','Payne\'s Grey'),
      makeColor('#FFA500','Yellow Ochre'), makeColor('#DAA520','Raw Sienna'),
      makeColor('#8B4513','Burnt Sienna'), makeColor('#A0522D','Raw Umber'),
      makeColor('#3D2B1F','Burnt Umber'), makeColor('#CD853F','Gold Ochre'),
      makeColor('#D2B48C','Buff Titanium'), makeColor('#556B2F','Olive Green'),
    ]},
    { name: 'Portrait Set (12)', colors: [
      makeColor('#FFFFFF','Titanium White'), makeColor('#1A1A1A','Mars Black'),
      makeColor('#FFDAB9','Unbleached Titanium'), makeColor('#FFE4C4','Naples Yellow'),
      makeColor('#FFA500','Yellow Ochre'), makeColor('#8B4513','Burnt Sienna'),
      makeColor('#A0522D','Raw Umber'), makeColor('#C41E3A','Cadmium Red'),
      makeColor('#DC143C','Alizarin Crimson'), makeColor('#00008B','Ultramarine Blue'),
      makeColor('#2E8B57','Viridian'), makeColor('#2F4F4F','Payne\'s Grey'),
    ]},
    { name: 'Landscape Set (14)', colors: [
      makeColor('#FFFFFF','Titanium White'), makeColor('#1A1A1A','Mars Black'),
      makeColor('#87CEEB','Cerulean Blue'), makeColor('#00008B','Ultramarine Blue'),
      makeColor('#191970','Prussian Blue'), makeColor('#228B22','Sap Green'),
      makeColor('#2E8B57','Viridian'), makeColor('#556B2F','Olive Green'),
      makeColor('#FFD700','Cadmium Yellow'), makeColor('#FFFF00','Lemon Yellow'),
      makeColor('#FFA500','Yellow Ochre'), makeColor('#8B4513','Burnt Sienna'),
      makeColor('#A0522D','Raw Umber'), makeColor('#C41E3A','Cadmium Red'),
    ]},
    { name: 'Pastel Set (10)', colors: [
      makeColor('#FFFFFF','Titanium White'), makeColor('#FFB6C1','Pink'),
      makeColor('#FFD1DC','Blush'), makeColor('#E6E6FA','Lavender'),
      makeColor('#ADD8E6','Light Blue'), makeColor('#B0E0E6','Powder Blue'),
      makeColor('#98FB98','Mint Green'), makeColor('#FFFACD','Lemon Chiffon'),
      makeColor('#FFDAB9','Peach'), makeColor('#D3D3D3','Light Grey'),
    ]},
  ];

  let paletteStore = loadPaletteStore();
  let customPaints = getActivePaletteColors();

  // --- Palette Storage ---
  function hexToRgb(hex) {
    const v = parseInt(hex.replace('#', ''), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }

  function loadPaletteStore() {
    try {
      const raw = JSON.parse(localStorage.getItem('pbn_palette_store'));
      if (raw && raw.palettes && raw.palettes.length > 0) return raw;
    } catch(e) {}
    // Migrate old single-palette format or start fresh with presets
    let migrated = [];
    try { migrated = JSON.parse(localStorage.getItem('pbn_paints')) || []; } catch(e) {}
    const palettes = [{ name: 'My Paints', colors: migrated }];
    // Add presets
    for (const p of PRESET_PALETTES) {
      palettes.push({ name: p.name, colors: p.colors.slice() });
    }
    return { palettes, active: 0 };
  }

  function savePaletteStore() {
    try { localStorage.setItem('pbn_palette_store', JSON.stringify(paletteStore)); } catch(e) {}
  }

  function getActivePaletteColors() {
    const p = paletteStore.palettes[paletteStore.active];
    return p ? p.colors : [];
  }

  function syncCustomPaints() {
    customPaints = getActivePaletteColors();
  }

  function renderPaletteSelect() {
    paletteSelect.innerHTML = '';
    paletteStore.palettes.forEach((p, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = p.name + ` (${p.colors.length})`;
      opt.selected = i === paletteStore.active;
      paletteSelect.appendChild(opt);
    });
  }

  function renderChips() {
    paintChips.innerHTML = '';
    for (let i = 0; i < customPaints.length; i++) {
      const p = customPaints[i];
      const chip = document.createElement('span');
      chip.className = 'paint-chip';
      chip.innerHTML = `<span class="paint-chip-swatch" style="background:${p.hex}"></span>` +
        `<span>${p.name || p.hex}</span>` +
        `<button class="paint-chip-remove" data-idx="${i}" aria-label="Remove">✕</button>`;
      paintChips.appendChild(chip);
    }
    paletteHint.textContent = customPaints.length < 2
      ? 'Add at least 2 colors from your paint set.'
      : `${customPaints.length} paints in this palette.`;
  }

  function refreshPaletteUI() {
    syncCustomPaints();
    renderPaletteSelect();
    renderChips();
  }

  // --- Palette Events ---
  paletteSelect.addEventListener('change', () => {
    paletteStore.active = parseInt(paletteSelect.value);
    savePaletteStore();
    refreshPaletteUI();
    liveRegenerate();
  });

  newPaletteBtn.addEventListener('click', () => {
    const name = window.prompt('Palette name:', 'New Palette');
    if (name === null || !name.trim()) return;
    paletteStore.palettes.push({ name: name.trim(), colors: [] });
    paletteStore.active = paletteStore.palettes.length - 1;
    savePaletteStore();
    refreshPaletteUI();
  });

  renamePaletteBtn.addEventListener('click', () => {
    const current = paletteStore.palettes[paletteStore.active];
    const name = window.prompt('Rename palette:', current.name);
    if (name === null || !name.trim()) return;
    current.name = name.trim();
    savePaletteStore();
    renderPaletteSelect();
  });

  deletePaletteBtn.addEventListener('click', () => {
    if (paletteStore.palettes.length <= 1) { window.alert('You need at least one palette.'); return; }
    const name = paletteStore.palettes[paletteStore.active].name;
    if (!window.confirm('Delete "' + name + '"?')) return;
    paletteStore.palettes.splice(paletteStore.active, 1);
    paletteStore.active = Math.min(paletteStore.active, paletteStore.palettes.length - 1);
    savePaletteStore();
    refreshPaletteUI();
  });

  loadPresetBtn.addEventListener('click', () => {
    const names = PRESET_PALETTES.map((p, i) => (i + 1) + '. ' + p.name).join('\n');
    const choice = window.prompt('Pick a preset number:\n' + names);
    if (choice === null) return;
    const idx = parseInt(choice) - 1;
    if (isNaN(idx) || idx < 0 || idx >= PRESET_PALETTES.length) { window.alert('Invalid choice.'); return; }
    const preset = PRESET_PALETTES[idx];
    paletteStore.palettes.push({ name: preset.name, colors: preset.colors.map(c => ({...c})) });
    paletteStore.active = paletteStore.palettes.length - 1;
    savePaletteStore();
    refreshPaletteUI();
  });

  useCustomPalette.addEventListener('change', () => {
    customPaletteUI.hidden = !useCustomPalette.checked;
  });

  allowMixing.addEventListener('change', () => { liveRegenerate(); });

  addPaintBtn.addEventListener('click', () => {
    const hex = paintColorPicker.value;
    const [r, g, b] = hexToRgb(hex);
    const name = paintNameInput.value.trim();
    customPaints.push({ r, g, b, hex, name });
    savePaletteStore();
    renderChips();
    renderPaletteSelect(); // update count in dropdown
    paintNameInput.value = '';
    liveRegenerate();
  });

  paintChips.addEventListener('click', (e) => {
    const btn = e.target.closest('.paint-chip-remove');
    if (!btn) return;
    customPaints.splice(parseInt(btn.dataset.idx), 1);
    savePaletteStore();
    renderChips();
    renderPaletteSelect();
  });

  refreshPaletteUI();

  // --- Page size to detail mapping ---
  // Each page size maps to optimal detail (max dimension in px) that ensures
  // readable numbers when printed. Based on ~150 DPI with min 8pt numbers.
  const PAGE_DETAIL = {
    custom: null,
    '4x6': 400,
    '5x7': 500,
    a5: 500,
    letter: 700,
    a4: 750,
    a3: 1000,
    a2: 1400,
  };

  let autoDetail = true;

  pageSizeEl.addEventListener('change', () => {
    const detail = PAGE_DETAIL[pageSizeEl.value];
    if (detail) {
      autoDetail = true;
      detailLevel.value = detail;
      detailVal.textContent = detail + 'px';
      detailAuto.textContent = '(auto)';
      detailAuto.hidden = false;
    } else {
      autoDetail = false;
      detailAuto.hidden = true;
    }
  });

  // --- Upload / drag-drop ---
  colorCount.addEventListener('input', () => { colorCountVal.textContent = colorCount.value; });
  detailLevel.addEventListener('input', () => {
    detailVal.textContent = detailLevel.value + 'px';
    autoDetail = false;
    detailAuto.textContent = '(manual)';
  });
  sharpness.addEventListener('input', () => {
    sharpnessVal.textContent = sharpness.value + '%';
    updateStylePreview();
  });
  structure.addEventListener('input', () => {
    structureVal.textContent = structure.value + '%';
    updateStylePreview();
  });
  brightnessEl.addEventListener('input', () => {
    brightnessVal.textContent = brightnessEl.value;
    updateStylePreview();
  });
  contrastEl.addEventListener('input', () => {
    contrastVal.textContent = contrastEl.value;
    updateStylePreview();
  });
  saturationEl.addEventListener('input', () => {
    saturationVal.textContent = saturationEl.value;
    updateStylePreview();
  });
  warmthEl.addEventListener('input', () => {
    warmthVal.textContent = warmthEl.value;
    updateStylePreview();
  });
  cartoonOutlines.addEventListener('change', () => { updateStylePreview(); });
  minRegionSize.addEventListener('input', () => { minRegionVal.textContent = minRegionSize.value + 'px'; });

  function updateStylePreview() {
    if (!loadedImage) return;
    applyStylePreview();
  }

  function setImage(file) {
    const img = new Image();
    img.onload = () => {
      loadedImage = img;
      output.hidden = true;
      controlsSection.hidden = true;
      previewImg.src = img.src;
      uploadPlaceholder.hidden = true;
      uploadPreview.hidden = false;
      // Show style picker
      styleSection.hidden = false;
      applyStylePreview();
      styleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    styledImage = null;
    generateBtn.disabled = true;
    uploadPlaceholder.hidden = false;
    uploadPreview.hidden = true;
    imageInput.value = '';
    output.hidden = true;
    styleSection.hidden = true;
    controlsSection.hidden = true;
  });

  const generateText = $('generateText');
  const generateSpinner = $('generateSpinner');

  generateBtn.addEventListener('click', () => {
    if (!styledImage) return;
    output.hidden = true;
    generateBtn.disabled = true;
    generateText.textContent = 'Painting…';
    generateSpinner.hidden = false;
    requestAnimationFrame(() => setTimeout(() => {
      // Re-apply style with current settings before generating
      applyStylePreview();
      generate(styledImage, parseInt(colorCount.value), null);
      generateBtn.disabled = false;
      generateText.textContent = '🎨 Generate';
      generateSpinner.hidden = true;
    }, 80));
  });

  // --- Style Selection ---
  styleGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.style-card');
    if (!card) return;
    styleGrid.querySelectorAll('.style-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    currentStyle = card.dataset.style;
    applyStylePreview();
  });

  function applyStylePreview() {
    if (!loadedImage) return;
    const MAX = 400;
    let w = loadedImage.width, h = loadedImage.height;
    if (w > MAX || h > MAX) { const s = MAX / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); }
    stylePreviewCanvas.width = w;
    stylePreviewCanvas.height = h;
    const ctx = stylePreviewCanvas.getContext('2d');
    ctx.drawImage(loadedImage, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h);
    applyStyleFilter(imgData, currentStyle, w, h);
    ctx.putImageData(imgData, 0, 0);

    // Store full-res styled image for generate
    const fullW = loadedImage.width, fullH = loadedImage.height;
    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = fullW; fullCanvas.height = fullH;
    const fCtx = fullCanvas.getContext('2d');
    fCtx.drawImage(loadedImage, 0, 0);
    const fullData = fCtx.getImageData(0, 0, fullW, fullH);
    applyStyleFilter(fullData, currentStyle, fullW, fullH);
    fCtx.putImageData(fullData, 0, 0);
    // Convert to an Image
    const sImg = new Image();
    sImg.onload = () => {
      styledImage = sImg;
      generateBtn.disabled = false;
      controlsSection.hidden = false;
    };
    sImg.src = fullCanvas.toDataURL();
  }

  function applyStyleFilter(imgData, style, w, h) {
    const d = imgData.data;
    switch (style) {
      case 'none': break; // raw image, no style filter
      case 'realistic': break; // sharpness/structure sliders handle it
      case 'watercolor': filterWatercolor(d, w, h); break;
      case 'cartoon': filterCartoon(d, w, h); break;
      case 'posterize': filterPosterize(d, w, h); break;
      case 'softpastel': filterSoftPastel(d, w, h); break;
      case 'oilpaint': filterOilPaint(d, w, h); break;
      case 'oilpaint2': filterOilPaint2(d, w, h); break;
    }
    // Always apply sharpness and structure from sliders
    const sharpAmt = parseInt(sharpness.value) / 100;
    const structAmt = parseInt(structure.value) / 100;
    if (sharpAmt > 0) {
      const blurred = new Uint8ClampedArray(d);
      boxBlur(blurred, w, h, 2);
      for (let i = 0; i < d.length; i += 4) {
        d[i]   = clamp(d[i]   + (d[i]   - blurred[i])   * sharpAmt);
        d[i+1] = clamp(d[i+1] + (d[i+1] - blurred[i+1]) * sharpAmt);
        d[i+2] = clamp(d[i+2] + (d[i+2] - blurred[i+2]) * sharpAmt);
      }
    }
    if (structAmt > 0) {
      // Contrast boost for structure
      for (let i = 0; i < d.length; i += 4) {
        d[i]   = clamp((d[i]   - 128) * (1 + structAmt) + 128);
        d[i+1] = clamp((d[i+1] - 128) * (1 + structAmt) + 128);
        d[i+2] = clamp((d[i+2] - 128) * (1 + structAmt) + 128);
      }
      // Saturation boost proportional to structure
      const satBoost = 1 + structAmt * 0.5;
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
        d[i]   = clamp(gray + (d[i]   - gray) * satBoost);
        d[i+1] = clamp(gray + (d[i+1] - gray) * satBoost);
        d[i+2] = clamp(gray + (d[i+2] - gray) * satBoost);
      }
    }
    // Brightness
    const bright = parseInt(brightnessEl.value);
    if (bright !== 0) {
      const b = bright * 2.55; // map -100..100 to -255..255
      for (let i = 0; i < d.length; i += 4) {
        d[i] = clamp(d[i] + b); d[i+1] = clamp(d[i+1] + b); d[i+2] = clamp(d[i+2] + b);
      }
    }
    // Contrast
    const cont = parseInt(contrastEl.value);
    if (cont !== 0) {
      const f = (259 * (cont + 255)) / (255 * (259 - cont));
      for (let i = 0; i < d.length; i += 4) {
        d[i]   = clamp(f * (d[i]   - 128) + 128);
        d[i+1] = clamp(f * (d[i+1] - 128) + 128);
        d[i+2] = clamp(f * (d[i+2] - 128) + 128);
      }
    }
    // Saturation
    const sat = parseInt(saturationEl.value);
    if (sat !== 0) {
      const s = 1 + sat / 100;
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
        d[i]   = clamp(gray + (d[i]   - gray) * s);
        d[i+1] = clamp(gray + (d[i+1] - gray) * s);
        d[i+2] = clamp(gray + (d[i+2] - gray) * s);
      }
    }
    // Warmth (shift red up / blue down, or vice versa)
    const warm = parseInt(warmthEl.value);
    if (warm !== 0) {
      const shift = warm * 0.3;
      for (let i = 0; i < d.length; i += 4) {
        d[i]   = clamp(d[i]   + shift);      // red
        d[i+2] = clamp(d[i+2] - shift);      // blue
      }
    }
    // Cartoon outlines: Sobel edge detection, darken edges
    if (cartoonOutlines.checked) {
      const gray = new Float32Array(w * h);
      for (let i = 0; i < w * h; i++) {
        gray[i] = 0.299*d[i*4] + 0.587*d[i*4+1] + 0.114*d[i*4+2];
      }
      const edges = new Float32Array(w * h);
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        const gx = -gray[idx-w-1] - 2*gray[idx-1] - gray[idx+w-1]
                   + gray[idx-w+1] + 2*gray[idx+1] + gray[idx+w+1];
        const gy = -gray[idx-w-1] - 2*gray[idx-w] - gray[idx-w+1]
                   + gray[idx+w-1] + 2*gray[idx+w] + gray[idx+w+1];
        edges[idx] = Math.sqrt(gx*gx + gy*gy);
      }
      let maxEdge = 0;
      for (let i = 0; i < edges.length; i++) if (edges[i] > maxEdge) maxEdge = edges[i];
      if (maxEdge > 0) {
        const threshold = 0.15;
        for (let i = 0; i < w * h; i++) {
          const e = edges[i] / maxEdge;
          if (e > threshold) {
            const darken = Math.min(1, (e - threshold) / (1 - threshold));
            const factor = 1 - darken * 0.85;
            const pi = i * 4;
            d[pi]   = clamp(d[pi]   * factor);
            d[pi+1] = clamp(d[pi+1] * factor);
            d[pi+2] = clamp(d[pi+2] * factor);
          }
        }
      }
    }
  }

  function filterWatercolor(d, w, h) {
    // Edge-preserving smooth to flatten areas while keeping edges
    edgePreservingSmooth(d, w, h, 4, 25);
    // Quantize to fewer tonal steps for that watercolor "wash" look
    const steps = 10;
    for (let i = 0; i < d.length; i += 4) {
      d[i]   = Math.round(d[i]   / (256/steps)) * (256/steps);
      d[i+1] = Math.round(d[i+1] / (256/steps)) * (256/steps);
      d[i+2] = Math.round(d[i+2] / (256/steps)) * (256/steps);
    }
    // Boost saturation + lighten for translucent watercolor feel
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
      d[i]   = clamp(gray + (d[i]   - gray) * 1.5);
      d[i+1] = clamp(gray + (d[i+1] - gray) * 1.5);
      d[i+2] = clamp(gray + (d[i+2] - gray) * 1.5);
      d[i]   = clamp(d[i]   * 0.82 + 255 * 0.18);
      d[i+1] = clamp(d[i+1] * 0.82 + 255 * 0.18);
      d[i+2] = clamp(d[i+2] * 0.82 + 255 * 0.18);
    }
  }

  function filterCartoon(d, w, h) {
    // Posterize to fewer levels + boost contrast
    const levels = 6;
    for (let i = 0; i < d.length; i += 4) {
      d[i]   = Math.round(d[i]   / (256/levels)) * (256/levels);
      d[i+1] = Math.round(d[i+1] / (256/levels)) * (256/levels);
      d[i+2] = Math.round(d[i+2] / (256/levels)) * (256/levels);
      // Boost contrast
      d[i]   = clamp((d[i]   - 128) * 1.4 + 128);
      d[i+1] = clamp((d[i+1] - 128) * 1.4 + 128);
      d[i+2] = clamp((d[i+2] - 128) * 1.4 + 128);
    }
  }

  function filterPosterize(d, w, h) {
    // Strong posterize + vivid saturation
    const levels = 4;
    for (let i = 0; i < d.length; i += 4) {
      d[i]   = Math.round(d[i]   / (256/levels)) * (256/levels);
      d[i+1] = Math.round(d[i+1] / (256/levels)) * (256/levels);
      d[i+2] = Math.round(d[i+2] / (256/levels)) * (256/levels);
      const gray = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
      d[i]   = clamp(gray + (d[i]   - gray) * 2.0);
      d[i+1] = clamp(gray + (d[i+1] - gray) * 2.0);
      d[i+2] = clamp(gray + (d[i+2] - gray) * 2.0);
    }
  }

  function filterSoftPastel(d, w, h) {
    // Edge-preserving smooth for soft look without losing structure
    edgePreservingSmooth(d, w, h, 3, 20);
    // Desaturate partially + lighten for chalky pastel feel
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
      // Partial desaturation
      d[i]   = clamp(gray + (d[i]   - gray) * 0.65);
      d[i+1] = clamp(gray + (d[i+1] - gray) * 0.65);
      d[i+2] = clamp(gray + (d[i+2] - gray) * 0.65);
      // Lighten
      d[i]   = clamp(d[i]   * 0.72 + 255 * 0.28);
      d[i+1] = clamp(d[i+1] * 0.72 + 255 * 0.28);
      d[i+2] = clamp(d[i+2] * 0.72 + 255 * 0.28);
    }
    // Slight quantize for that grainy pastel texture
    const steps = 12;
    for (let i = 0; i < d.length; i += 4) {
      d[i]   = Math.round(d[i]   / (256/steps)) * (256/steps);
      d[i+1] = Math.round(d[i+1] / (256/steps)) * (256/steps);
      d[i+2] = Math.round(d[i+2] / (256/steps)) * (256/steps);
    }
  }

  function filterOilPaint(d, w, h) {
    // Edge-preserving smooth for paint look — smaller radius keeps detail
    edgePreservingSmooth(d, w, h, 3, 25);
    // Rich saturation + contrast for bold oil paint colors
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
      d[i]   = clamp(gray + (d[i]   - gray) * 1.7);
      d[i+1] = clamp(gray + (d[i+1] - gray) * 1.7);
      d[i+2] = clamp(gray + (d[i+2] - gray) * 1.7);
      d[i]   = clamp((d[i]   - 128) * 1.25 + 128);
      d[i+1] = clamp((d[i+1] - 128) * 1.25 + 128);
      d[i+2] = clamp((d[i+2] - 128) * 1.25 + 128);
    }
  }

  function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }

  // Oil Paint 2: intensity-binning algorithm
  // Groups neighboring pixels by intensity level, then assigns each pixel
  // the average color of the most common intensity bin in its neighborhood.
  // Based on the algorithm described at:
  // https://stackoverflow.com/questions/24222556
  // Content was rephrased for compliance with licensing restrictions.
  function filterOilPaint2(d, w, h) {
    const radius = 2;
    const intensityLevels = 60;
    const src = new Uint8ClampedArray(d);

    // Pre-compute intensity LUT
    const intensityLUT = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const pi = i * 4;
      const avg = (src[pi] + src[pi+1] + src[pi+2]) / 3;
      intensityLUT[i] = Math.round((avg * intensityLevels) / 255);
    }

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // Count intensity bins in neighborhood
        const binCount = new Int32Array(intensityLevels + 1);
        const binR = new Float64Array(intensityLevels + 1);
        const binG = new Float64Array(intensityLevels + 1);
        const binB = new Float64Array(intensityLevels + 1);

        for (let yy = -radius; yy <= radius; yy++) {
          const ny = y + yy;
          if (ny < 0 || ny >= h) continue;
          for (let xx = -radius; xx <= radius; xx++) {
            const nx = x + xx;
            if (nx < 0 || nx >= w) continue;
            const ni = ny * w + nx;
            const il = intensityLUT[ni];
            const npi = ni * 4;
            binCount[il]++;
            binR[il] += src[npi];
            binG[il] += src[npi+1];
            binB[il] += src[npi+2];
          }
        }

        // Find most common intensity bin
        let maxBin = 0, maxCount = 0;
        for (let b = 0; b <= intensityLevels; b++) {
          if (binCount[b] > maxCount) { maxCount = binCount[b]; maxBin = b; }
        }

        const pi = (y * w + x) * 4;
        d[pi]   = Math.round(binR[maxBin] / maxCount);
        d[pi+1] = Math.round(binG[maxBin] / maxCount);
        d[pi+2] = Math.round(binB[maxBin] / maxCount);
      }
    }
  }

  // Edge-preserving smooth: averages only neighbors within a color threshold.
  // Flattens smooth areas into uniform regions while keeping edges sharp.
  function edgePreservingSmooth(d, w, h, radius, threshold) {
    const copy = new Uint8ClampedArray(d);
    const tSq = threshold * threshold * 3; // threshold in squared RGB distance
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const pi = (y * w + x) * 4;
      const cr = copy[pi], cg = copy[pi+1], cb = copy[pi+2];
      let sr = 0, sg = 0, sb = 0, cnt = 0;
      for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
        const ny = y + dy, nx = x + dx;
        if (ny < 0 || ny >= h || nx < 0 || nx >= w) continue;
        const ni = (ny * w + nx) * 4;
        const dr = copy[ni] - cr, dg = copy[ni+1] - cg, db = copy[ni+2] - cb;
        if (dr*dr + dg*dg + db*db <= tSq) {
          sr += copy[ni]; sg += copy[ni+1]; sb += copy[ni+2]; cnt++;
        }
      }
      d[pi] = sr / cnt; d[pi+1] = sg / cnt; d[pi+2] = sb / cnt;
    }
  }

  function boxBlur(d, w, h, radius) {
    const copy = new Uint8ClampedArray(d);
    const size = (radius * 2 + 1) ** 2;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, cnt = 0;
      for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
        const ny = y + dy, nx = x + dx;
        if (ny < 0 || ny >= h || nx < 0 || nx >= w) continue;
        const pi = (ny * w + nx) * 4;
        r += copy[pi]; g += copy[pi+1]; b += copy[pi+2]; cnt++;
      }
      const pi = (y * w + x) * 4;
      d[pi] = r / cnt; d[pi+1] = g / cnt; d[pi+2] = b / cnt;
    }
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

    let palette;
    let paletteLabels = null;
    if (useCustomPalette.checked && customPaints.length >= 2) {
      const paintColors = customPaints.map(p => [p.r, p.g, p.b]);
      const paintNames = customPaints.map(p => p.name || p.hex);

      // Build palette: base paints + optional mixes
      let extColors = paintColors.map((c, i) => ({ rgb: c, label: paintNames[i] }));

      if (allowMixing.checked) {
        // Find what colors the image needs
        const targetCount = Math.min(colors.length, Math.max(paintColors.length * 3, 20));
        const imageClusters = medianCut(colors, targetCount);
        const mixSet = new Set();
        const MIX_RATIOS = [0.25, 0.5, 0.75];

        for (const target of imageClusters) {
          let bestBaseDist = Infinity;
          for (const pc of paintColors) {
            const d = colorDistSq(target, pc);
            if (d < bestBaseDist) bestBaseDist = d;
          }
          let bestMixDist = Infinity, bestMix = null, bestLabel = '', bestKey = '';
          for (let i = 0; i < paintColors.length; i++) {
            for (let j = i + 1; j < paintColors.length; j++) {
              for (const r of MIX_RATIOS) {
                const mix = [
                  Math.round(paintColors[i][0]*r + paintColors[j][0]*(1-r)),
                  Math.round(paintColors[i][1]*r + paintColors[j][1]*(1-r)),
                  Math.round(paintColors[i][2]*r + paintColors[j][2]*(1-r)),
                ];
                const d = colorDistSq(target, mix);
                if (d < bestMixDist) {
                  bestMixDist = d;
                  bestMix = mix;
                  const pct = Math.round(r * 100);
                  bestLabel = pct === 50 ? `${paintNames[i]} + ${paintNames[j]}` : `${pct}% ${paintNames[i]} + ${100-pct}% ${paintNames[j]}`;
                  bestKey = `${i}-${j}-${r}`;
                }
              }
            }
          }
          if (bestMix && bestMixDist < bestBaseDist * 0.7 && !mixSet.has(bestKey)) {
            mixSet.add(bestKey);
            extColors.push({ rgb: bestMix, label: bestLabel });
          }
        }
      }

      palette = extColors.map(e => e.rgb);
      paletteLabels = extColors.map(e => ({ name: e.label, hex: rgbToHex(e.rgb) }));
    } else {
      palette = medianCut(colors, Math.min(colors.length, numColors * 2));
      palette.unshift([255, 255, 255]);
      palette = mergeToCount(palette, numColors);
    }

    // Direct mapping: every pixel to nearest palette color
    let mapped = new Uint8Array(w * h);
    for (let i = 0; i < colors.length; i++) mapped[i] = nearestColor(colors[i], palette);
    mapped = modeFilter(mapped, w, h);
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

    // Merge small regions based on user setting
    const minReg = parseInt(minRegionSize.value);
    mergeSmallRegions(regionMap, regionColors, mapped, w, h, regionId, minReg);

    // Smooth jagged boundaries: pixels on region edges adopt the majority
    // region of their 5x5 neighborhood. This rounds off staircase edges
    // without removing small regions entirely.
    smoothBoundaries(regionMap, mapped, regionColors, w, h);

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
    let minFs = Infinity;
    for (let r = 0; r < regionId; r++) {
      const pxList = regionPixels[r];
      if (pxList.length < MIN_REGION) continue;
      const pt = findInteriorPoint(regionMap, w, h, r, pxList);
      const maxByDist = pt.dist * 1.2;
      const maxByArea = Math.sqrt(pxList.length) / 4;
      const fs = Math.max(4, Math.min(12, maxByDist, maxByArea));
      if (fs < minFs) minFs = fs;
      labels.push({
        x: pt.x, y: pt.y,
        text: String(paletteNumbers.get(regionColors[r])),
        fs,
      });
    }

    // Compute upscale factor so smallest number is at least 10px
    const MIN_READABLE = 10;
    const upscale = (minFs < MIN_READABLE && minFs > 0) ? Math.ceil(MIN_READABLE / minFs) : 1;

    // Store for re-render
    renderData = { w, h, mapped, palette, regionMap, labels, paletteNumbers, regionColors, regionPixels, regionId, paletteLabels, upscale };

    renderCanvas(outlineOnly.checked);

    // Legend
    legend.innerHTML = '';
    for (const [ci, n] of paletteNumbers) {
      const c = palette[ci], hex = rgbToHex(c);
      let label = hex;
      if (paletteLabels && paletteLabels[ci]) {
        label = paletteLabels[ci].name;
      }
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `<span class="legend-swatch" style="background:${hex}">${n}</span><span>${label}</span>`;
      legend.appendChild(item);
    }
    output.hidden = false;
    requestAnimationFrame(resetView);

    // --- Compute coverage data ---
    const totalPixels = w * h;
    const colorCoverage = {};
    for (let i = 0; i < totalPixels; i++) {
      const ci = mapped[i];
      colorCoverage[ci] = (colorCoverage[ci] || 0) + 1;
    }
    // Count active regions (non-zero size after merge)
    const activeRegionSizes = [];
    const regionSizeMap = new Int32Array(regionId);
    for (let i = 0; i < totalPixels; i++) regionSizeMap[regionMap[i]]++;
    for (let r = 0; r < regionId; r++) if (regionSizeMap[r] > 0) activeRegionSizes.push(regionSizeMap[r]);
    const totalRegions = activeRegionSizes.length;
    const avgRegionSize = totalRegions > 0 ? totalPixels / totalRegions : 0;

    // Difficulty rating
    let difficulty, diffClass;
    if (totalRegions < 50 && paletteNumbers.size <= 8) { difficulty = 'Easy'; diffClass = 'difficulty-easy'; }
    else if (totalRegions < 150 || paletteNumbers.size <= 16) { difficulty = 'Medium'; diffClass = 'difficulty-medium'; }
    else { difficulty = 'Hard'; diffClass = 'difficulty-hard'; }
    const estMinutes = Math.round(totalRegions * 0.8 + paletteNumbers.size * 3);
    const estTime = estMinutes < 60 ? `${estMinutes} min` : `${Math.floor(estMinutes/60)}h ${estMinutes%60}m`;

    difficultyBar.innerHTML = `<span class="difficulty-badge ${diffClass}">${difficulty}</span>` +
      `<span class="difficulty-stats">${totalRegions} regions · ${paletteNumbers.size} colors · Est. ${estTime}</span>`;

    // Coverage table
    const coverageRows = [];
    for (const [ci, n] of paletteNumbers) {
      const c = palette[ci], hex = rgbToHex(c);
      const count = colorCoverage[ci] || 0;
      const pct = ((count / totalPixels) * 100).toFixed(1);
      let label = hex;
      if (paletteLabels && paletteLabels[ci]) label = paletteLabels[ci].name;
      const size = pct > 15 ? 'Large' : pct > 5 ? 'Medium' : 'Small';
      coverageRows.push({ n, hex, label, pct, size, c });
    }
    coverageRows.sort((a, b) => parseFloat(b.pct) - parseFloat(a.pct));

    coverageTable.innerHTML = '<table><thead><tr><th>#</th><th>Color</th><th>Coverage</th><th>Amount</th></tr></thead><tbody>' +
      coverageRows.map(r => `<tr>
        <td>${r.n}</td>
        <td><span class="coverage-swatch" style="background:${r.hex}"></span> ${r.label}</td>
        <td><div class="coverage-bar"><div class="coverage-fill" style="width:${r.pct}%;background:${r.hex}"></div></div> ${r.pct}%</td>
        <td>${r.size}</td>
      </tr>`).join('') + '</tbody></table>';

    // Store extra data for exports
    renderData.coverageRows = coverageRows;
    renderData.difficulty = difficulty;
    renderData.estTime = estTime;
    renderData.totalRegions = totalRegions;
    renderData.pageSize = pageSizeEl.value;

    // Show order summary
    buildOrderSummary();

    output.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderCanvas(outlineMode) {
    if (!renderData) return;
    const { w, h, mapped, palette, regionMap, labels, upscale } = renderData;
    const s = upscale || 1;
    const ow = w * s, oh = h * s;

    resultCanvas.width = ow; resultCanvas.height = oh;
    const ctx = resultCanvas.getContext('2d');

    // Fill at upscaled resolution
    const outData = ctx.createImageData(ow, oh);
    for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) {
      const sx = Math.floor(x / s), sy = Math.floor(y / s);
      const si = sy * w + sx;
      const pi = (y * ow + x) * 4;
      if (outlineMode) {
        outData.data[pi] = 255; outData.data[pi+1] = 255; outData.data[pi+2] = 255;
      } else {
        const c = palette[mapped[si]];
        outData.data[pi]   = Math.round(c[0] * 0.25 + 255 * 0.75);
        outData.data[pi+1] = Math.round(c[1] * 0.25 + 255 * 0.75);
        outData.data[pi+2] = Math.round(c[2] * 0.25 + 255 * 0.75);
      }
      outData.data[pi+3] = 255;
    }
    ctx.putImageData(outData, 0, 0);

    // Outlines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = outlineMode ? Math.max(0.8, s * 0.5) : Math.max(0.7, s * 0.4);
    ctx.beginPath();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const idx = y * w + x, rid = regionMap[idx];
      if (x < w - 1 && regionMap[idx + 1] !== rid) { ctx.moveTo((x+1)*s, y*s); ctx.lineTo((x+1)*s, (y+1)*s); }
      if (y < h - 1 && regionMap[idx + w] !== rid) { ctx.moveTo(x*s, (y+1)*s); ctx.lineTo((x+1)*s, (y+1)*s); }
    }
    ctx.stroke();

    // Numbers
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const lb of labels) {
      const fs = lb.fs * s;
      ctx.font = `500 ${fs}px Inter,system-ui`;
      if (outlineMode) {
        ctx.fillStyle = '#000';
        ctx.fillText(lb.text, lb.x * s + s/2, lb.y * s + s/2);
      } else {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.5, s * 0.8);
        ctx.strokeText(lb.text, lb.x * s + s/2, lb.y * s + s/2);
        ctx.fillStyle = '#222';
        ctx.fillText(lb.text, lb.x * s + s/2, lb.y * s + s/2);
      }
    }
    // Add watermark to tinted preview (not outline mode)
    if (!outlineMode) addWatermark(ctx, ow, oh);
  }

  // Render with full colors and outlines but no numbers (for after animation)
  function renderCanvasNoNumbers() {
    if (!renderData) return;
    const { w, h, mapped, palette, regionMap, upscale } = renderData;
    const s = upscale || 1;
    const ow = w * s, oh = h * s;

    resultCanvas.width = ow; resultCanvas.height = oh;
    const ctx = resultCanvas.getContext('2d');

    const outData = ctx.createImageData(ow, oh);
    for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) {
      const sx = Math.floor(x / s), sy = Math.floor(y / s);
      const c = palette[mapped[sy * w + sx]];
      const pi = (y * ow + x) * 4;
      outData.data[pi] = c[0]; outData.data[pi+1] = c[1]; outData.data[pi+2] = c[2]; outData.data[pi+3] = 255;
    }
    ctx.putImageData(outData, 0, 0);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = Math.max(0.7, s * 0.4);
    ctx.beginPath();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const idx = y * w + x, rid = regionMap[idx];
      if (x < w - 1 && regionMap[idx + 1] !== rid) { ctx.moveTo((x+1)*s, y*s); ctx.lineTo((x+1)*s, (y+1)*s); }
      if (y < h - 1 && regionMap[idx + w] !== rid) { ctx.moveTo(x*s, (y+1)*s); ctx.lineTo((x+1)*s, (y+1)*s); }
    }
    ctx.stroke();
  }

  outlineOnly.addEventListener('change', () => {
    stopAnim();
    renderCanvas(outlineOnly.checked);
  });

  outlineOnly.addEventListener('change', () => {
    stopAnim();
    renderCanvas(outlineOnly.checked);
  });

  // --- Paint List Export ---
  downloadPaintListBtn.addEventListener('click', () => {
    if (!renderData || !renderData.coverageRows) return;
    const rows = renderData.coverageRows;
    const page = renderData.pageSize || 'custom';
    let text = 'PAINT LIST - Paint by Number\n';
    text += '================================\n';
    text += 'Page Size: ' + page.toUpperCase() + '\n';
    text += 'Difficulty: ' + renderData.difficulty + '\n';
    text += 'Est. Time: ' + renderData.estTime + '\n';
    text += '================================\n\n';
    text += '#   Color                          Hex       Coverage  Amount\n';
    text += '--- ------------------------------ --------- --------- ------\n';
    for (const r of rows) {
      text += String(r.n).padEnd(4) + r.label.padEnd(31) + r.hex.padEnd(10) + (r.pct + '%').padEnd(10) + r.size + '\n';
    }
    text += '\nTotal colors: ' + rows.length + '\n';
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.download = 'paint-list.txt';
    a.href = URL.createObjectURL(blob);
    a.click();
  });

  // --- Legend Card Export ---
  downloadLegendBtn.addEventListener('click', () => {
    if (!renderData || !renderData.coverageRows) return;
    const rows = renderData.coverageRows;
    const cardW = 600, rowH = 32, pad = 20, headerH = 50;
    const cardH = headerH + rows.length * rowH + pad * 2;
    const c = document.createElement('canvas');
    c.width = cardW; c.height = cardH;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cardW, cardH);
    ctx.fillStyle = '#222'; ctx.font = 'bold 18px Inter,system-ui';
    ctx.fillText('Color Legend', pad, pad + 20);
    ctx.font = '12px Inter,system-ui'; ctx.fillStyle = '#888';
    ctx.fillText(renderData.difficulty + ' · ' + rows.length + ' colors', pad, pad + 38);
    let y = headerH + pad;
    for (const r of rows) {
      ctx.fillStyle = r.hex;
      ctx.fillRect(pad, y + 2, 24, 24);
      ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; ctx.strokeRect(pad, y + 2, 24, 24);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Inter,system-ui';
      ctx.textAlign = 'center'; ctx.fillText(String(r.n), pad + 12, y + 18);
      ctx.textAlign = 'left'; ctx.fillStyle = '#222'; ctx.font = '13px Inter,system-ui';
      ctx.fillText(r.label, pad + 34, y + 18);
      ctx.fillStyle = '#888'; ctx.font = '12px Inter,system-ui';
      ctx.fillText(r.pct + '% · ' + r.size, pad + 340, y + 18);
      y += rowH;
    }
    const a = document.createElement('a');
    a.download = 'legend-card.png';
    a.href = c.toDataURL('image/png');
    a.click();
  });

  // --- PDF Export with crop marks ---
  downloadPdfBtn.addEventListener('click', () => {
    if (!renderData) return;
    // Render outline-only for print
    renderCanvas(true);
    const imgDataUrl = resultCanvas.toDataURL('image/png');
    const cw = resultCanvas.width, ch = resultCanvas.height;
    // Build a simple PDF manually (no library needed for basic structure)
    // We'll open a print-friendly window instead for reliable PDF
    const win = window.open('', '_blank');
    if (!win) return;
    const pageLabel = pageSizeEl.options[pageSizeEl.selectedIndex].text;
    win.document.write('<!DOCTYPE html><html><head><title>Paint by Number - Print</title>');
    win.document.write('<style>@page{margin:0.5in}body{margin:0;font-family:Inter,system-ui,sans-serif}');
    win.document.write('.crop-mark{position:absolute;width:20px;height:1px;background:#000}');
    win.document.write('.crop-mark-v{width:1px;height:20px}');
    win.document.write('img{max-width:100%;height:auto;display:block;margin:0 auto}');
    win.document.write('.legend{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;justify-content:center}');
    win.document.write('.li{display:flex;align-items:center;gap:4px;font-size:10px}');
    win.document.write('.sw{width:16px;height:16px;border-radius:3px;border:1px solid #999;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#fff;text-shadow:0 0 2px #000}');
    win.document.write('.info{text-align:center;font-size:11px;color:#666;margin-top:8px}');
    win.document.write('</style></head><body>');
    win.document.write('<img src="' + imgDataUrl + '">');
    win.document.write('<div class="legend">');
    for (const r of renderData.coverageRows) {
      win.document.write('<div class="li"><span class="sw" style="background:' + r.hex + '">' + r.n + '</span>' + r.label + '</div>');
    }
    win.document.write('</div>');
    win.document.write('<div class="info">' + pageLabel + ' · ' + renderData.difficulty + ' · ' + renderData.coverageRows.length + ' colors · Est. ' + renderData.estTime + '</div>');
    win.document.write('</body></html>');
    win.document.close();
    setTimeout(() => win.print(), 500);
    // Restore current view
    renderCanvas(outlineOnly.checked);
  });

  // --- Before/After Comparison ---
  toggleCompare.addEventListener('click', () => {
    if (!renderData || !styledImage) return;
    const showing = !compareWrap.hidden;
    compareWrap.hidden = showing;
    if (showing) return;
    const { w, h, upscale } = renderData;
    const s = upscale || 1;
    const ow = w * s, oh = h * s;
    compareCanvas.width = ow; compareCanvas.height = oh;
    drawComparison(0.5);
  });

  function drawComparison(splitPct) {
    if (!renderData || !styledImage) return;
    const { w, h, mapped, palette, regionMap, upscale } = renderData;
    const s = upscale || 1;
    const ow = w * s, oh = h * s;
    const ctx = compareCanvas.getContext('2d');
    const splitX = Math.round(ow * splitPct);
    // Left side: styled original
    ctx.drawImage(styledImage, 0, 0, ow, oh);
    // Right side: paint-by-number result
    // Render PBN to offscreen canvas
    const offscreen = document.createElement('canvas');
    offscreen.width = ow; offscreen.height = oh;
    const oCtx = offscreen.getContext('2d');
    const outData = oCtx.createImageData(ow, oh);
    for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) {
      const sx = Math.floor(x / s), sy = Math.floor(y / s);
      const c = palette[mapped[sy * w + sx]];
      const pi = (y * ow + x) * 4;
      outData.data[pi] = c[0]; outData.data[pi+1] = c[1]; outData.data[pi+2] = c[2]; outData.data[pi+3] = 255;
    }
    oCtx.putImageData(outData, 0, 0);
    // Draw right portion
    ctx.drawImage(offscreen, splitX, 0, ow - splitX, oh, splitX, 0, ow - splitX, oh);
    // Slider line
    compareSlider.style.left = splitX + 'px';
  }

  let compareDragging = false;
  compareWrap.addEventListener('mousedown', () => { compareDragging = true; });
  window.addEventListener('mousemove', (e) => {
    if (!compareDragging) return;
    const r = compareWrap.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    drawComparison(pct);
  });
  window.addEventListener('mouseup', () => { compareDragging = false; });
  compareWrap.addEventListener('touchstart', () => { compareDragging = true; }, { passive: true });
  compareWrap.addEventListener('touchmove', (e) => {
    if (!compareDragging) return;
    const r = compareWrap.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.touches[0].clientX - r.left) / r.width));
    drawComparison(pct);
  }, { passive: true });
  compareWrap.addEventListener('touchend', () => { compareDragging = false; });

  // --- Watermark on preview canvas ---
  function addWatermark(ctx, w, h) {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#000';
    ctx.font = 'bold ' + Math.max(20, Math.round(Math.min(w, h) / 8)) + 'px Inter,system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.fillText('PREVIEW', 0, 0);
    ctx.restore();
  }

  // --- Order Summary ---
  function buildOrderSummary() {
    if (!renderData) return;
    const rd = renderData;
    const pageLabel = pageSizeEl.options[pageSizeEl.selectedIndex].text;
    orderContent.innerHTML = `
      <div class="order-grid">
        <span class="order-label">Canvas Size</span><span>${pageLabel}</span>
        <span class="order-label">Difficulty</span><span>${rd.difficulty}</span>
        <span class="order-label">Colors</span><span>${rd.coverageRows.length}</span>
        <span class="order-label">Regions</span><span>${rd.totalRegions}</span>
        <span class="order-label">Est. Painting Time</span><span>${rd.estTime}</span>
        <span class="order-label">Style</span><span>${currentStyle}</span>
      </div>
      <h3 style="margin:0.75rem 0 0.4rem;font-size:0.9rem">Paint Kit Contents</h3>
      <table style="width:100%;border-collapse:collapse;font-size:0.8rem">
        <tr><th style="text-align:left;padding:0.3rem 0.5rem;border-bottom:1px solid #e2e4e9">#</th><th style="text-align:left;padding:0.3rem 0.5rem;border-bottom:1px solid #e2e4e9">Color</th><th style="text-align:left;padding:0.3rem 0.5rem;border-bottom:1px solid #e2e4e9">Pot Size</th></tr>
        ${rd.coverageRows.map(r => `<tr><td style="padding:0.3rem 0.5rem">${r.n}</td><td style="padding:0.3rem 0.5rem"><span class="coverage-swatch" style="background:${r.hex}"></span> ${r.label}</td><td style="padding:0.3rem 0.5rem">${r.size}</td></tr>`).join('')}
      </table>
    `;
    orderSummary.hidden = false;
  }

  // --- Animated Preview ---
  function stopAnim() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    previewAnimBtn.textContent = '▶ Preview Paint';
    previewAnimBtn.disabled = false;
  }

  previewAnimBtn.addEventListener('click', () => {
    if (!renderData) return;

    if (animId) {
      stopAnim();
      renderCanvas(outlineOnly.checked);
      return;
    }

    const { w, h, palette, regionMap, regionColors, regionPixels, regionId, upscale } = renderData;
    const s = upscale || 1;
    const ow = w * s, oh = h * s;

    // 1. Render the outline-only base and snapshot its pixels
    renderCanvas(true);
    const ctx = resultCanvas.getContext('2d');
    const baseSnapshot = ctx.getImageData(0, 0, ow, oh).data;

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

      for (let ri = painted; ri < target; ri++) {
        const r = order[ri];
        const pxList = regionPixels[r];
        if (!pxList) continue;
        const c = palette[regionColors[r]];
        if (!c) continue;
        // Fill upscaled pixels for this region
        for (let p = 0; p < pxList.length; p++) {
          const px = pxList[p] & 0xFFFF, py = pxList[p] >> 16;
          for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) {
            const ox = px * s + dx, oy = py * s + dy;
            if (ox >= ow || oy >= oh) continue;
            const pi = (oy * ow + ox) * 4;
            if (baseSnapshot[pi] > 180) {
              workBuf[pi] = c[0]; workBuf[pi+1] = c[1]; workBuf[pi+2] = c[2];
            }
          }
        }
      }
      painted = target;

      const imgData = new ImageData(new Uint8ClampedArray(workBuf), ow, oh);
      ctx.putImageData(imgData, 0, 0);

      if (progress < 1) {
        animId = requestAnimationFrame(tick);
      } else {
        animId = null;
        previewAnimBtn.textContent = '▶ Preview Paint';
        // Final clean render: full color, outlines, no numbers
        renderCanvasNoNumbers();
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
    return { x: bestX, y: bestY, dist: bestDist };
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

  function colorDistSq(a, b) {
    const dr = a[0]-b[0], dg = a[1]-b[1], db = a[2]-b[2];
    return dr*dr + dg*dg + db*db;
  }

  function nearestColor(pixel, palette) {
    let minDist = Infinity, best = 0;
    for (let i = 0; i < palette.length; i++) {
      const d = colorDistSq(pixel, palette[i]);
      if (d < minDist) { minDist = d; best = i; }
    }
    return best;
  }

  // Smooth jagged region boundaries by reassigning edge pixels to the
  // majority region in a small neighborhood. Preserves region shapes
  // but rounds off staircase/zigzag edges.
  function smoothBoundaries(regionMap, mapped, regionColors, w, h) {
    const size = w * h;
    for (let pass = 0; pass < 2; pass++) {
      const newMap = new Int32Array(regionMap);
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        const cur = regionMap[idx];
        // Only process boundary pixels
        if (regionMap[idx-1] === cur && regionMap[idx+1] === cur &&
            regionMap[idx-w] === cur && regionMap[idx+w] === cur) continue;
        // Count regions in 5x5 neighborhood
        const counts = {};
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
          const ny = y+dy, nx = x+dx;
          if (ny < 0 || ny >= h || nx < 0 || nx >= w) continue;
          const r = regionMap[ny * w + nx];
          counts[r] = (counts[r] || 0) + 1;
        }
        // Find majority
        let best = cur, bestCnt = 0;
        for (const [r, cnt] of Object.entries(counts)) {
          if (cnt > bestCnt) { bestCnt = cnt; best = parseInt(r); }
        }
        if (best !== cur) {
          newMap[idx] = best;
        }
      }
      // Apply
      for (let i = 0; i < size; i++) {
        if (newMap[i] !== regionMap[i]) {
          regionMap[i] = newMap[i];
          mapped[i] = regionColors[regionMap[i]];
        }
      }
    }
  }

  // Iteratively merge regions smaller than threshold into their largest neighbor
  function mergeSmallRegions(regionMap, regionColors, mapped, w, h, regionId, threshold) {
    const size = w * h;
    let changed = true;
    while (changed) {
      changed = false;
      // Compute sizes
      const regionSizes = new Int32Array(regionId);
      for (let i = 0; i < size; i++) regionSizes[regionMap[i]]++;

      // Build neighbor map for small regions
      for (let r = 0; r < regionId; r++) {
        if (regionSizes[r] === 0 || regionSizes[r] >= threshold) continue;
        const neighborCounts = {};
        for (let i = 0; i < size; i++) {
          if (regionMap[i] !== r) continue;
          const x = i % w, y = (i - x) / w;
          if (x > 0 && regionMap[i-1] !== r) neighborCounts[regionMap[i-1]] = (neighborCounts[regionMap[i-1]]||0) + 1;
          if (x < w-1 && regionMap[i+1] !== r) neighborCounts[regionMap[i+1]] = (neighborCounts[regionMap[i+1]]||0) + 1;
          if (y > 0 && regionMap[i-w] !== r) neighborCounts[regionMap[i-w]] = (neighborCounts[regionMap[i-w]]||0) + 1;
          if (y < h-1 && regionMap[i+w] !== r) neighborCounts[regionMap[i+w]] = (neighborCounts[regionMap[i+w]]||0) + 1;
        }
        // Find largest neighbor
        let best = -1, bestCnt = 0;
        for (const [nr, cnt] of Object.entries(neighborCounts)) {
          if (cnt > bestCnt) { bestCnt = cnt; best = parseInt(nr); }
        }
        if (best === -1) continue;
        // Absorb
        for (let i = 0; i < size; i++) {
          if (regionMap[i] === r) { regionMap[i] = best; mapped[i] = regionColors[best]; }
        }
        regionSizes[best] += regionSizes[r];
        regionSizes[r] = 0;
        changed = true;
      }
    }
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
