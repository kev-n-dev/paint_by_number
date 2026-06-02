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
  const detailAuto = $('detailAuto');
  const pageSizeEl = $('pageSize');
  const printDpiEl = $('printDpi');
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
  const simplifyEl = $('simplify');
  const simplifyVal = $('simplifyVal');
  const useCustomPalette = $('useCustomPalette');
  const styleGrid = $('styleGrid');
  const stylePreviewCanvas = $('stylePreviewCanvas');
  const stylePreviewCard = $('stylePreviewCard');
  const posterizeLevelsWrap = $('posterizeLevelsWrap');
  const posterizeLevelsEl = $('posterizeLevels');
  const posterizeLevelsVal = $('posterizeLevelsVal');
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
  const colorStrengthEl = $('colorStrength');
  const colorStrengthVal = $('colorStrengthVal');
  const minFontSizeEl = $('minFontSize');
  const minFontSizeVal = $('minFontSizeVal');
  const clusterPrecisionEl = $('clusterPrecision');
  const clusterPrecisionVal = $('clusterPrecisionVal');
  const colorSpaceEl = $('colorSpace');
  const narrowStripRunsEl = $('narrowStripRuns');
  const narrowStripRunsVal = $('narrowStripRunsVal');
  const maxFacetsEl = $('maxFacets');
  const maxFacetsVal = $('maxFacetsVal');
  const facetRemovalOrderEl = $('facetRemovalOrder');
  const renderEngineEl = $('renderEngine');
  const smoothnessEl = $('smoothness');
  const smoothnessVal = $('smoothnessVal');
  const canvasWEl = $('canvasW');
  const canvasHEl = $('canvasH');
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
  const infoAside = $('infoAside');

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

  allowMixing.addEventListener('change', () => { });

  addPaintBtn.addEventListener('click', () => {
    const hex = paintColorPicker.value;
    const [r, g, b] = hexToRgb(hex);
    const name = paintNameInput.value.trim();
    customPaints.push({ r, g, b, hex, name });
    savePaletteStore();
    renderChips();
    renderPaletteSelect(); // update count in dropdown
    paintNameInput.value = '';

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

  // --- Set defaults: auto palette (best colors from image) ---
  (function setDefaults() {
    const basicIdx = paletteStore.palettes.findIndex(p => p.name.includes('Basic Acrylics'));
    if (basicIdx !== -1) {
      paletteStore.active = basicIdx;
      savePaletteStore();
      refreshPaletteUI();
    }
    // Default to auto palette — algorithm picks best colors from the image
    useCustomPalette.checked = false;
    customPaletteUI.hidden = true;
    allowMixing.checked = false;
  })();

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

  // Page size → canvas dimensions (cm)
  const PAGE_DIMS_CM = {
    '4x6': [10.2, 15.2], '5x7': [12.7, 17.8], a5: [14.8, 21],
    letter: [21.6, 27.9], a4: [21, 29.7], a3: [29.7, 42], a2: [42, 59.4],
  };

  function updateDpiInfo() {
    const dpi = parseInt(printDpiEl.value) || 150;
    const cw = parseFloat(canvasWEl.value) || 21;
    const ch = parseFloat(canvasHEl.value) || 29.7;
    const pxW = Math.round(cw / 2.54 * dpi);
    const pxH = Math.round(ch / 2.54 * dpi);
    if (detailAuto) {
      detailAuto.textContent = `${pxW}×${pxH}px`;
      detailAuto.hidden = false;
    }
  }

  pageSizeEl.addEventListener('change', () => {
    const dims = PAGE_DIMS_CM[pageSizeEl.value];
    if (dims) { canvasWEl.value = dims[0]; canvasHEl.value = dims[1]; }
    updateDpiInfo();
  });

  printDpiEl.addEventListener('change', updateDpiInfo);
  canvasWEl.addEventListener('input', updateDpiInfo);
  canvasHEl.addEventListener('input', updateDpiInfo);

  updateDpiInfo(); // show initial size

  // --- Upload / drag-drop ---
  colorCount.addEventListener('input', () => { colorCountVal.textContent = colorCount.value; });
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
  simplifyEl.addEventListener('input', () => {
    const v = parseInt(simplifyEl.value);
    simplifyVal.textContent = v === 0 ? 'Off' : v <= 3 ? 'Light' : v <= 6 ? 'Medium' : 'Strong';
    updateStylePreview();
  });
  minRegionSize.addEventListener('input', () => { minRegionVal.textContent = minRegionSize.value + 'px'; });
  colorStrengthEl.addEventListener('input', () => { colorStrengthVal.textContent = colorStrengthEl.value + '%'; });
  minFontSizeEl.addEventListener('input', () => { minFontSizeVal.textContent = minFontSizeEl.value; });
  clusterPrecisionEl.addEventListener('input', () => { clusterPrecisionVal.textContent = parseFloat(clusterPrecisionEl.value).toFixed(1); });
  narrowStripRunsEl.addEventListener('input', () => { narrowStripRunsVal.textContent = narrowStripRunsEl.value; });
  maxFacetsEl.addEventListener('input', () => { maxFacetsVal.textContent = maxFacetsEl.value; });
  smoothnessEl.addEventListener('input', () => { smoothnessVal.textContent = smoothnessEl.value; });

  function updateStylePreview() {
    if (!loadedImage) return;
    applyStylePreview();
  }

  function setImage(file) {
    const img = new Image();
    img.onload = () => {
      loadedImage = img;
      output.hidden = true;
      previewImg.src = img.src;
      uploadPlaceholder.hidden = true;
      uploadPreview.hidden = false;
      stylePreviewCard.hidden = false;
      pixelGenerateBtn.disabled = false;
      applyStylePreview();
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
    stylePreviewCard.hidden = true;
    imageInput.value = '';
    output.hidden = true;
  });

  const generateText = $('generateText');
  const generateSpinner = $('generateSpinner');

  // --- Mode switching ---
  const modePbn = $('modePbn');
  const modePixel = $('modePixel');
  const pbnSettings = $('pbnSettings');
  const pixelSettings = $('pixelSettings');
  const pixelOutput = $('pixelOutput');
  const pixelGenerateBtn = $('pixelGenerateBtn');
  const pixelGenerateText = $('pixelGenerateText');
  const pixelGenerateSpinner = $('pixelGenerateSpinner');
  const pixelCanvas = $('pixelCanvas');
  const pixelViewport = $('pixelViewport');
  const pixelLegend = $('pixelLegend');
  const pixelCoverageTable = $('pixelCoverageTable');
  const pixelInfo = $('pixelInfo');
  const pbnInfo = $('pbnInfo');
  const pixelDownloadBtn = $('pixelDownloadBtn');
  const pixelDownloadPdfBtn = $('pixelDownloadPdfBtn');
  const pixelPreviewBtn = $('pixelPreviewBtn');
  const pixelZoomInBtn = $('pixelZoomInBtn');
  const pixelZoomOutBtn = $('pixelZoomOutBtn');
  const pixelZoomResetBtn = $('pixelZoomResetBtn');
  const pixelOutlineOnly = $('pixelOutlineOnly');
  const pixelGridSizeEl = $('pixelGridSize');
  const pixelGridSizeVal = $('pixelGridSizeVal');
  const pixelColorsEl = $('pixelColors');
  const pixelColorsVal = $('pixelColorsVal');
  const pixelColorSpaceEl = $('pixelColorSpace');
  const pixelColorStrengthEl = $('pixelColorStrength');
  const pixelColorStrengthVal = $('pixelColorStrengthVal');
  const pixelPageSizeEl = $('pixelPageSize');

  let appMode = 'pbn';
  let pixelRenderData = null;

  function switchMode(mode) {
    appMode = mode;
    modePbn.classList.toggle('active', mode === 'pbn');
    modePixel.classList.toggle('active', mode === 'pixel');
    pbnSettings.hidden = mode !== 'pbn';
    pixelSettings.hidden = mode !== 'pixel';
    // Show/hide results
    if (mode === 'pbn') {
      pixelOutput.hidden = true;
      pixelInfo.hidden = true;
      pbnInfo.hidden = false;
    } else {
      $('output').hidden = true;
      pbnInfo.hidden = true;
      pixelInfo.hidden = false;
      if (!pixelRenderData) $('infoAside').hidden = true;
    }
    if (loadedImage) {
      generateBtn.disabled = mode !== 'pbn';
      pixelGenerateBtn.disabled = false; // always enable if image loaded
    }
  }

  modePbn.addEventListener('click', () => switchMode('pbn'));
  modePixel.addEventListener('click', () => switchMode('pixel'));

  // --- Quick presets ---
  document.querySelector('.preset-btns').addEventListener('click', (e) => {
    const btn = e.target.closest('.preset-btn');
    if (!btn) return;
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const preset = btn.dataset.preset;
    if (preset === 'easy') {
      colorCount.value = 8; colorCountVal.textContent = '8';
      minRegionSize.value = 50; minRegionVal.textContent = '50px';
      smoothnessEl.value = 3; smoothnessVal.textContent = '3';
      maxFacetsEl.value = 500; maxFacetsVal.textContent = '500';
    } else if (preset === 'medium') {
      colorCount.value = 16; colorCountVal.textContent = '16';
      minRegionSize.value = 20; minRegionVal.textContent = '20px';
      smoothnessEl.value = 2; smoothnessVal.textContent = '2';
      maxFacetsEl.value = 10000; maxFacetsVal.textContent = '10000';
    } else if (preset === 'hard') {
      colorCount.value = 32; colorCountVal.textContent = '32';
      minRegionSize.value = 5; minRegionVal.textContent = '5px';
      smoothnessEl.value = 0; smoothnessVal.textContent = '0';
      maxFacetsEl.value = 50000; maxFacetsVal.textContent = '50000';
    }
  });

  pixelGridSizeEl.addEventListener('input', () => { pixelGridSizeVal.textContent = pixelGridSizeEl.value + 'px'; });
  pixelColorsEl.addEventListener('input', () => { pixelColorsVal.textContent = pixelColorsEl.value; });
  pixelColorStrengthEl.addEventListener('input', () => { pixelColorStrengthVal.textContent = pixelColorStrengthEl.value + '%'; });

  generateBtn.addEventListener('click', async () => {
    if (!loadedImage) return;
    output.hidden = true;
    generateBtn.disabled = true;
    generateText.textContent = 'Applying style…';
    generateSpinner.hidden = false;
    // Compute full-res styled image now (only on generate, not on every slider change)
    styledImage = await computeStyledImage();
    generateText.textContent = 'Painting…';
    requestAnimationFrame(() => setTimeout(() => {
      generate(styledImage, parseInt(colorCount.value), null);
      generateBtn.disabled = false;
      generateText.textContent = '🎨 Apply';
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
    posterizeLevelsWrap.hidden = currentStyle !== 'posterize2';
    // Auto-select dithered render engine when dithered style is chosen
    if (currentStyle === 'dithered' && renderEngineEl) renderEngineEl.value = 'dither';
    // Auto-select vector render engine for vector portrait
    if (currentStyle === 'vectorportrait' && renderEngineEl) renderEngineEl.value = 'vector';
    applyStylePreview();
  });

  posterizeLevelsEl.addEventListener('input', () => {
    posterizeLevelsVal.textContent = posterizeLevelsEl.value;
    applyStylePreview();
  });

  // Preview only — fast, small canvas, no full-res computation
  function applyStylePreview() {
    const MAX = 400; // larger preview so dithering and other effects are visible
    let w = loadedImage.width, h = loadedImage.height;
    if (w > MAX || h > MAX) { const s = MAX / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); }
    stylePreviewCanvas.width = w;
    stylePreviewCanvas.height = h;
    const ctx = stylePreviewCanvas.getContext('2d');
    ctx.drawImage(loadedImage, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h);
    applyStyleFilter(imgData, currentStyle, w, h);
    ctx.putImageData(imgData, 0, 0);
    // Mark that the styled image needs recomputing before generate
    styledImage = null;
    generateBtn.disabled = false; // still allow generate — it will compute on click
  }

  // Full-res styled image — only called when Generate is clicked
  function computeStyledImage() {
    return new Promise(resolve => {
      const MAX_STYLE = 1200;
      let fullW = loadedImage.width, fullH = loadedImage.height;
      if (fullW > MAX_STYLE || fullH > MAX_STYLE) {
        const s = MAX_STYLE / Math.max(fullW, fullH);
        fullW = Math.round(fullW * s); fullH = Math.round(fullH * s);
      }
      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = fullW; fullCanvas.height = fullH;
      const fCtx = fullCanvas.getContext('2d');
      fCtx.drawImage(loadedImage, 0, 0, fullW, fullH);
      // Skip dithered filter for palette computation — dither is applied at render time
      if (currentStyle !== 'dithered') {
        const fullData = fCtx.getImageData(0, 0, fullW, fullH);
        applyStyleFilter(fullData, currentStyle, fullW, fullH);
        fCtx.putImageData(fullData, 0, 0);
      }
      const sImg = new Image();
      sImg.onload = () => resolve(sImg);
      sImg.src = fullCanvas.toDataURL();
    });
  }

  function applyStyleFilter(imgData, style, w, h) {
    const d = imgData.data;

    // Simplify: posterize to fewer tonal levels before style processing
    const simplifyLevel = parseInt(simplifyEl.value);
    if (simplifyLevel > 0) {
      // Map 1–10 to 32–4 tonal levels (more simplify = fewer levels = bigger regions)
      const levels = Math.max(4, Math.round(32 - simplifyLevel * 2.8));
      const step = 256 / levels;
      for (let i = 0; i < d.length; i += 4) {
        d[i]   = Math.round(Math.round(d[i]   / step) * step);
        d[i+1] = Math.round(Math.round(d[i+1] / step) * step);
        d[i+2] = Math.round(Math.round(d[i+2] / step) * step);
      }
      // Blur slightly to merge near-identical regions
      if (simplifyLevel >= 4) boxBlur(d, w, h, Math.floor(simplifyLevel / 3));
    }

    switch (style) {
      case 'none': break; // raw image, no style filter
      case 'realistic': break; // sharpness/structure sliders handle it
      case 'watercolor': filterWatercolor(d, w, h); break;
      case 'cartoon': filterCartoon(d, w, h); break;
      case 'posterize': filterPosterize(d, w, h); break;
      case 'softpastel': filterSoftPastel(d, w, h); break;
      case 'oilpaint': filterOilPaint(d, w, h); break;
      case 'oilpaint2': filterOilPaint2(d, w, h); break;
      case 'posterize2': filterPosterize2(d, w, h); break;
      case 'dithered': filterDithered(d, w, h); break;
      case 'vectorportrait': filterVectorPortrait(d, w, h); break;
      case 'pixelate': filterPixelate(d, w, h); break;
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

  // Posterize with slider-controlled levels
  function filterPosterize2(d, w, h) {
    const levels = parseInt(posterizeLevelsEl.value) || 6;
    const step = 255 / (levels - 1);
    for (let i = 0; i < d.length; i += 4) {
      d[i]   = Math.round(Math.round(d[i]   / step) * step);
      d[i+1] = Math.round(Math.round(d[i+1] / step) * step);
      d[i+2] = Math.round(Math.round(d[i+2] / step) * step);
    }
  }

  // Floyd-Steinberg dithering as a style filter — reduces colors with error diffusion
  // giving a textured, painterly look with apparent gradient depth
  function filterDithered(d, w, h) {
    // Use fewer levels for a clearly visible dithered texture
    const levels = 4;
    const step = 255 / (levels - 1);
    const pixels = new Float32Array(w * h * 3);
    for (let i = 0; i < w * h; i++) {
      pixels[i*3]   = d[i*4];
      pixels[i*3+1] = d[i*4+1];
      pixels[i*3+2] = d[i*4+2];
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        const r = pixels[idx*3], g = pixels[idx*3+1], b = pixels[idx*3+2];
        // Quantize to nearest level
        const nr = Math.round(Math.round(r / step) * step);
        const ng = Math.round(Math.round(g / step) * step);
        const nb = Math.round(Math.round(b / step) * step);
        d[idx*4] = Math.max(0, Math.min(255, nr));
        d[idx*4+1] = Math.max(0, Math.min(255, ng));
        d[idx*4+2] = Math.max(0, Math.min(255, nb));
        // Error
        const er = r - nr, eg = g - ng, eb = b - nb;
        const distribute = (dx, dy, factor) => {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) return;
          const ni = ny * w + nx;
          pixels[ni*3]   += er * factor;
          pixels[ni*3+1] += eg * factor;
          pixels[ni*3+2] += eb * factor;
        };
        distribute(1, 0, 7/16);
        distribute(-1, 1, 3/16);
        distribute(0, 1, 5/16);
        distribute(1, 1, 1/16);
      }
    }
  }

  // --- Vector Portrait Filter ---
  // Direct luminance posterization with minimal smoothing.
  // Less aggressive than before — preserves facial detail while creating flat planes.
  function filterVectorPortrait(d, w, h) {
    // Step 1: Light smooth — just remove noise, preserve ALL edges
    edgePreservingSmooth(d, w, h, 2, 20);

    // Step 2: Posterize luminance to create flat value planes
    // More levels = more detail preserved
    const levels = 8;
    const step = 255 / (levels - 1);
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i+1], b = d[i+2];
      const lum = 0.299*r + 0.587*g + 0.114*b;
      const newLum = Math.round(Math.round(lum / step) * step);
      const ratio = lum > 1 ? newLum / lum : 1;
      d[i]   = clamp(r * ratio);
      d[i+1] = clamp(g * ratio);
      d[i+2] = clamp(b * ratio);
    }

    // Step 3: Strong saturation boost for vivid vector look
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
      d[i]   = clamp(gray + (d[i]   - gray) * 1.7);
      d[i+1] = clamp(gray + (d[i+1] - gray) * 1.7);
      d[i+2] = clamp(gray + (d[i+2] - gray) * 1.7);
    }

    // Step 4: Contrast boost
    for (let i = 0; i < d.length; i += 4) {
      d[i]   = clamp((d[i]   - 128) * 1.25 + 128);
      d[i+1] = clamp((d[i+1] - 128) * 1.25 + 128);
      d[i+2] = clamp((d[i+2] - 128) * 1.25 + 128);
    }
  }

  // Pixel art / mosaic mode — averages each block into a single flat color
  function filterPixelate(d, w, h) {
    const bs = 16; // default block size (pixelate style removed from PBN mode)
    for (let by = 0; by < h; by += bs) {
      for (let bx = 0; bx < w; bx += bs) {
        // Compute average color of this block
        let r = 0, g = 0, b = 0, count = 0;
        for (let y = by; y < Math.min(by + bs, h); y++) {
          for (let x = bx; x < Math.min(bx + bs, w); x++) {
            const pi = (y * w + x) * 4;
            r += d[pi]; g += d[pi+1]; b += d[pi+2];
            count++;
          }
        }
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        // Fill entire block with average color
        for (let y = by; y < Math.min(by + bs, h); y++) {
          for (let x = bx; x < Math.min(bx + bs, w); x++) {
            const pi = (y * w + x) * 4;
            d[pi] = r; d[pi+1] = g; d[pi+2] = b;
          }
        }
      }
    }
  }

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

  // --- Pixel Canvas Mode ---
  pixelGenerateBtn.addEventListener('click', async () => {
    if (!loadedImage) { alert('Please upload an image first.'); return; }
    pixelGenerateBtn.disabled = true;
    pixelGenerateText.textContent = 'Building grid…';
    pixelGenerateSpinner.hidden = false;
    await new Promise(r => requestAnimationFrame(() => setTimeout(r, 100)));
    try {
      generatePixelCanvas();
    } catch(e) {
      console.error('Pixel canvas error:', e);
      alert('Error: ' + e.message);
    } finally {
      pixelGenerateBtn.disabled = false;
      pixelGenerateText.textContent = '🔲 Generate Grid';
      pixelGenerateSpinner.hidden = true;
    }
  });

  // Global handler for inline onclick fallback
  window.handlePixelGenerate = async () => {
    if (!loadedImage) { alert('Please upload an image first.'); return; }
    pixelGenerateBtn.disabled = true;
    pixelGenerateText.textContent = 'Building grid…';
    pixelGenerateSpinner.hidden = false;
    await new Promise(r => requestAnimationFrame(() => setTimeout(r, 100)));
    try {
      generatePixelCanvas();
    } catch(e) {
      console.error('Pixel canvas error:', e);
      alert('Error: ' + e.message);
    } finally {
      pixelGenerateBtn.disabled = false;
      pixelGenerateText.textContent = '🔲 Generate Grid';
      pixelGenerateSpinner.hidden = true;
    }
  };

  function generatePixelCanvas() {
    const cellSize = parseInt(pixelGridSizeEl ? pixelGridSizeEl.value : '20') || 20;
    const numColors = parseInt(pixelColorsEl ? pixelColorsEl.value : '16') || 16;
    const colorSpace = pixelColorSpaceEl ? pixelColorSpaceEl.value : 'rgb';

    // Draw source image to offscreen canvas
    const MAX = 800;
    let sw = loadedImage.width, sh = loadedImage.height;
    if (sw > MAX || sh > MAX) { const s = MAX / Math.max(sw, sh); sw = Math.round(sw * s); sh = Math.round(sh * s); }
    const offscreen = document.createElement('canvas');
    offscreen.width = sw; offscreen.height = sh;
    const oCtx = offscreen.getContext('2d');
    oCtx.drawImage(loadedImage, 0, 0, sw, sh);
    const imgData = oCtx.getImageData(0, 0, sw, sh).data;

    // Build grid cells
    const cols = Math.ceil(sw / cellSize);
    const rows = Math.ceil(sh / cellSize);
    const cellColors = []; // [r,g,b] average for each cell

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let r = 0, g = 0, b = 0, count = 0;
        const x0 = col * cellSize, y0 = row * cellSize;
        const x1 = Math.min(x0 + cellSize, sw), y1 = Math.min(y0 + cellSize, sh);
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
          const pi = (y * sw + x) * 4;
          r += imgData[pi]; g += imgData[pi+1]; b += imgData[pi+2]; count++;
        }
        cellColors.push([Math.round(r/count), Math.round(g/count), Math.round(b/count)]);
      }
    }

    // Quantize cell colors using k-means
    const palette = kMeansWeighted(cellColors, numColors, colorSpace, 1);
    const hasWhite = palette.some(c => c[0] > 240 && c[1] > 240 && c[2] > 240);
    if (!hasWhite) palette.unshift([255, 255, 255]);

    // Map each cell to nearest palette color
    const cellPaletteIdx = cellColors.map(c => nearestColor(c, palette));

    // Assign numbers to palette colors
    const paletteNums = new Map();
    let num = 1;
    for (const idx of cellPaletteIdx) {
      if (!paletteNums.has(idx)) paletteNums.set(idx, num++);
    }

    // Store for re-render — scale up cells for readability but cap total canvas size
    const MIN_CELL_RENDER = 20;
    const MAX_CANVAS_DIM = 3000;
    let renderScale = cellSize < MIN_CELL_RENDER ? Math.ceil(MIN_CELL_RENDER / cellSize) : 1;
    // Cap so canvas doesn't exceed max dimension
    const maxDim = Math.max(cols, rows) * cellSize * renderScale;
    if (maxDim > MAX_CANVAS_DIM) renderScale = Math.max(1, Math.floor(MAX_CANVAS_DIM / (Math.max(cols, rows) * cellSize)));
    const rCell = cellSize * renderScale;
    pixelRenderData = { cols, rows, cellSize, rCell, cellPaletteIdx, palette, paletteNums, sw, sh };

    renderPixelCanvas(pixelOutlineOnly.checked);

    // Legend in info sidebar
    pixelLegend.innerHTML = '';
    for (const [ci, n] of paletteNums) {
      const c = palette[ci], hex = rgbToHex(c);
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `<span class="legend-swatch" style="background:${hex}">${n}</span><span>${hex}</span>`;
      pixelLegend.appendChild(item);
    }

    // Coverage table
    const totalCells = cols * rows;
    const cellCounts = {};
    for (const ci of cellPaletteIdx) cellCounts[ci] = (cellCounts[ci] || 0) + 1;
    const coverageRows = [];
    for (const [ci, n] of paletteNums) {
      const c = palette[ci], hex = rgbToHex(c);
      const pct = (((cellCounts[ci] || 0) / totalCells) * 100).toFixed(1);
      coverageRows.push({ n, hex, pct });
    }
    coverageRows.sort((a, b) => parseFloat(b.pct) - parseFloat(a.pct));
    pixelCoverageTable.innerHTML = '<table><thead><tr><th>#</th><th>Color</th><th>Coverage</th></tr></thead><tbody>' +
      coverageRows.map((r, i) => `<tr style="background:${i%2===0?'#fafafa':'#fff'}">
        <td>${r.n}</td>
        <td><span class="coverage-swatch" style="background:${r.hex}"></span> ${r.hex}</td>
        <td><div class="coverage-bar"><div class="coverage-fill" style="width:${r.pct}%;background:${r.hex}"></div></div> ${r.pct}%</td>
      </tr>`).join('') + '</tbody></table>';

    pixelInfo.hidden = false;
    $('infoAside').hidden = false;
    pixelOutput.hidden = false;
    requestAnimationFrame(() => resetPixelView());
    pixelOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderPixelCanvas(outlineOnly) {
    if (!pixelRenderData) return;
    const { cols, rows, cellSize, rCell, cellPaletteIdx, palette, paletteNums } = pixelRenderData;
    const scale = rCell / cellSize;
    const cw = cols * rCell, ch = rows * rCell;

    pixelCanvas.width = cw; pixelCanvas.height = ch;
    const ctx = pixelCanvas.getContext('2d');
    const tint = (parseInt(pixelColorStrengthEl ? pixelColorStrengthEl.value : '40') || 40) / 100;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const ci = cellPaletteIdx[row * cols + col];
        const c = palette[ci];
        const x = col * rCell, y = row * rCell;
        if (outlineOnly) {
          ctx.fillStyle = '#fff';
        } else {
          const r = Math.round(c[0] * tint + 255 * (1 - tint));
          const g = Math.round(c[1] * tint + 255 * (1 - tint));
          const b = Math.round(c[2] * tint + 255 * (1 - tint));
          ctx.fillStyle = `rgb(${r},${g},${b})`;
        }
        ctx.fillRect(x, y, rCell, rCell);
      }
    }

    // Grid lines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = Math.max(0.5, scale * 0.5);
    ctx.beginPath();
    for (let col = 0; col <= cols; col++) { ctx.moveTo(col * rCell, 0); ctx.lineTo(col * rCell, ch); }
    for (let row = 0; row <= rows; row++) { ctx.moveTo(0, row * rCell); ctx.lineTo(cw, row * rCell); }
    ctx.stroke();

    // Numbers in each cell — sized to fit the rendered cell
    const fs = Math.max(8, Math.min(rCell * 0.5, 20));
    ctx.font = `500 ${fs}px Inter,system-ui`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const ci = cellPaletteIdx[row * cols + col];
        const n = String(paletteNums.get(ci));
        const cx = col * rCell + rCell / 2;
        const cy = row * rCell + rCell / 2;
        if (outlineOnly) {
          ctx.fillStyle = '#000';
          ctx.fillText(n, cx, cy);
        } else {
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.strokeText(n, cx, cy);
          ctx.fillStyle = '#222'; ctx.fillText(n, cx, cy);
        }
      }
    }
  }

  pixelOutlineOnly.addEventListener('change', () => { renderPixelCanvas(pixelOutlineOnly.checked); });

  // --- Pixel Canvas Paint Preview ---
  let pixelAnimId = null;

  function stopPixelAnim() {
    if (pixelAnimId) { cancelAnimationFrame(pixelAnimId); pixelAnimId = null; }
    pixelPreviewBtn.textContent = '▶ Preview Paint';
  }

  pixelPreviewBtn.addEventListener('click', () => {
    if (!pixelRenderData) return;
    if (pixelAnimId) { stopPixelAnim(); renderPixelCanvas(pixelOutlineOnly.checked); return; }

    const { cols, rows, cellSize, rCell, cellPaletteIdx, palette, paletteNums } = pixelRenderData;
    const cw = cols * rCell, ch = rows * rCell;
    const tint = (parseInt(pixelColorStrengthEl ? pixelColorStrengthEl.value : '40') || 40) / 100;

    // Start from outline-only base — render it first so canvas is sized correctly
    renderPixelCanvas(true);
    const ctx = pixelCanvas.getContext('2d');
    // Canvas is now cw×ch from renderPixelCanvas
    const actualCw = pixelCanvas.width, actualCh = pixelCanvas.height;
    const baseSnap = ctx.getImageData(0, 0, actualCw, actualCh).data;
    const workBuf = new Uint8ClampedArray(baseSnap);

    // Sort cells by palette color group, shuffle within groups for a natural painting feel
    const totalCells = cols * rows;
    const order = Array.from({ length: totalCells }, (_, i) => i);
    // Sort by palette index so same-color cells fill together, with slight shuffle
    order.sort((a, b) => {
      const diff = cellPaletteIdx[a] - cellPaletteIdx[b];
      return diff !== 0 ? diff : Math.random() - 0.5;
    });

    const DURATION = 10000;
    let painted = 0;
    pixelPreviewBtn.textContent = '⏹ Stop';
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / DURATION, 1);
      const target = Math.floor(progress * totalCells);

      for (let i = painted; i < target; i++) {
        const cellIdx = order[i];
        const col = cellIdx % cols, row = Math.floor(cellIdx / cols);
        const ci = cellPaletteIdx[cellIdx];
        const c = palette[ci];
        const x0 = col * rCell, y0 = row * rCell;
        const x1 = Math.min(x0 + rCell, actualCw), y1 = Math.min(y0 + rCell, actualCh);
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
          const pi = (y * actualCw + x) * 4;
          if (baseSnap[pi] > 180) { // only paint white areas, keep grid lines
            workBuf[pi] = c[0]; workBuf[pi+1] = c[1]; workBuf[pi+2] = c[2];
          }
        }
      }
      painted = target;

      ctx.putImageData(new ImageData(new Uint8ClampedArray(workBuf), actualCw, actualCh), 0, 0);

      if (progress < 1) {
        pixelAnimId = requestAnimationFrame(tick);
      } else {
        pixelAnimId = null;
        pixelPreviewBtn.textContent = '▶ Preview Paint';
        // Final clean render — full color, no numbers
        renderPixelCanvasNoNumbers();
      }
    }

    pixelAnimId = requestAnimationFrame(tick);
  });

  function renderPixelCanvasNoNumbers() {
    if (!pixelRenderData) return;
    const { cols, rows, rCell, cellPaletteIdx, palette } = pixelRenderData;
    const cw = cols * rCell, ch = rows * rCell;
    const ctx = pixelCanvas.getContext('2d');
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const ci = cellPaletteIdx[row * cols + col];
        const c = palette[ci];
        ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
        ctx.fillRect(col * rCell, row * rCell, rCell, rCell);
      }
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let col = 0; col <= cols; col++) { ctx.moveTo(col*rCell,0); ctx.lineTo(col*rCell,ch); }
    for (let row = 0; row <= rows; row++) { ctx.moveTo(0,row*rCell); ctx.lineTo(cw,row*rCell); }
    ctx.stroke();
  }

  pixelDownloadBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.download = 'pixel-canvas.png';
    a.href = pixelCanvas.toDataURL('image/png');
    a.click();
  });

  pixelDownloadPdfBtn.addEventListener('click', () => {
    if (!pixelRenderData) return;
    const { palette, paletteNums, cols, rows, cellSize, cellPaletteIdx } = pixelRenderData;
    const pageLabel = pixelPageSizeEl ? pixelPageSizeEl.options[pixelPageSizeEl.selectedIndex].text : 'Letter';

    // Page 1: outline grid
    renderPixelCanvas(true);
    const outlineUrl = pixelCanvas.toDataURL('image/png');
    // Page 2: coloured preview
    renderPixelCanvas(false);
    const colourUrl = pixelCanvas.toDataURL('image/png');
    // Restore
    renderPixelCanvas(pixelOutlineOnly.checked);

    const totalCells = cols * rows;
    const cellCounts = {};
    for (const ci of cellPaletteIdx) cellCounts[ci] = (cellCounts[ci] || 0) + 1;

    const legendRows = [];
    for (const [ci, n] of paletteNums) {
      const c = palette[ci], hex = rgbToHex(c);
      const pct = (((cellCounts[ci] || 0) / totalCells) * 100).toFixed(1);
      legendRows.push({ n, hex, pct });
    }
    legendRows.sort((a, b) => parseFloat(b.pct) - parseFloat(a.pct));

    const win = window.open('', '_blank');
    if (!win) { alert('Please allow pop-ups.'); return; }

    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Pixel Canvas</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Inter,system-ui,sans-serif;background:#fff;color:#1a1d23}
      .page{width:100%;padding:0.4in;page-break-after:always}
      .page:last-child{page-break-after:auto}
      img{max-width:100%;height:auto;display:block;border:1px solid #ddd;border-radius:4px}
      h1{font-size:16px;font-weight:700;margin-bottom:8px}
      .legend-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:12px}
      .legend-item{display:flex;align-items:center;gap:5px;font-size:11px}
      .swatch{width:24px;height:24px;border-radius:4px;flex-shrink:0;border:1px solid rgba(0,0,0,.12);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:10px;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.5);-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .page2{display:flex;gap:16px;align-items:flex-start}
      .page2-left{flex:1}
      .page2-right{width:180px;flex-shrink:0}
      .page2-right img{width:100%;border-radius:4px;border:1px solid #ddd}
      .page2-right p{font-size:8px;color:#999;text-align:center;margin-top:3px}
      @media print{@page{margin:0.5in}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}
    </style></head><body>
    <div class="page"><h1>Pixel Canvas</h1><img src="${outlineUrl}"></div>
    <div class="page">
      <h1>Color Guide</h1>
      <div class="page2">
        <div class="page2-left">
          <div class="legend-grid">
            ${legendRows.map(r => `<div class="legend-item"><div class="swatch" style="background:${r.hex}">${r.n}</div><span>${r.hex} (${r.pct}%)</span></div>`).join('')}
          </div>
        </div>
        <div class="page2-right">
          <img src="${colourUrl}">
          <p>Finished preview</p>
        </div>
      </div>
    </div>
    </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 600);
  });

  // Zoom/pan for pixel viewport
  let pzoom = 1, ppanX = 0, ppanY = 0, ppanning = false, ppanSX = 0, ppanSY = 0, ppanOX = 0, ppanOY = 0;
  function applyPixelTransform() { pixelCanvas.style.transform = `translate(${ppanX}px,${ppanY}px) scale(${pzoom})`; }
  function resetPixelView() {
    const vw = pixelViewport.clientWidth, vh = pixelViewport.clientHeight;
    pzoom = Math.min(vw / pixelCanvas.width, vh / pixelCanvas.height, 1);
    ppanX = (vw - pixelCanvas.width * pzoom) / 2;
    ppanY = (vh - pixelCanvas.height * pzoom) / 2;
    applyPixelTransform();
  }
  function pzoomAt(cx, cy, f) {
    const nz = Math.min(8, Math.max(0.1, pzoom * f));
    const r = nz / pzoom;
    ppanX = cx - (cx - ppanX) * r; ppanY = cy - (cy - ppanY) * r; pzoom = nz;
    applyPixelTransform();
  }
  pixelZoomInBtn.addEventListener('click', () => { const r = pixelViewport.getBoundingClientRect(); pzoomAt(r.width/2, r.height/2, 1.3); });
  pixelZoomOutBtn.addEventListener('click', () => { const r = pixelViewport.getBoundingClientRect(); pzoomAt(r.width/2, r.height/2, 1/1.3); });
  pixelZoomResetBtn.addEventListener('click', resetPixelView);
  pixelViewport.addEventListener('wheel', (e) => { e.preventDefault(); const r = pixelViewport.getBoundingClientRect(); pzoomAt(e.clientX-r.left, e.clientY-r.top, e.deltaY<0?1.3:1/1.3); }, { passive: false });
  pixelViewport.addEventListener('mousedown', (e) => { ppanning=true; ppanSX=e.clientX; ppanSY=e.clientY; ppanOX=ppanX; ppanOY=ppanY; pixelViewport.classList.add('grabbing'); });
  window.addEventListener('mousemove', (e) => { if (!ppanning) return; ppanX=ppanOX+(e.clientX-ppanSX); ppanY=ppanOY+(e.clientY-ppanSY); applyPixelTransform(); });
  window.addEventListener('mouseup', () => { ppanning=false; pixelViewport.classList.remove('grabbing'); });

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
    // Compute target print resolution from page dimensions × DPI
    const dpi = parseInt(printDpiEl.value) || 150;
    const cw = parseFloat(canvasWEl.value) || 21;
    const ch = parseFloat(canvasHEl.value) || 29.7;
    const printW = Math.round(cw / 2.54 * dpi);
    const printH = Math.round(ch / 2.54 * dpi);

    // PROCESSING resolution — higher = more detail but slower
    const PROC_MAX = 1200;
    let sw = img.width, sh = img.height, sx = 0, sy = 0;
    if (crop) { sx = crop.x; sy = crop.y; sw = crop.w; sh = crop.h; }
    let w = sw, h = sh;
    if (w > PROC_MAX || h > PROC_MAX) { const s = PROC_MAX / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); }

    // Scale factor from processing → print resolution
    const scaleX = printW / w;
    const scaleY = printH / h;
    // Use the smaller scale to maintain aspect ratio
    const printScale = Math.min(scaleX, scaleY);
    const outW = Math.round(w * printScale);
    const outH = Math.round(h * printScale);

    srcCanvas.width = w; srcCanvas.height = h;
    const sCtx = srcCanvas.getContext('2d');
    sCtx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    // No pre-smooth — preserve maximum detail, let k-means handle color grouping

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
      // K-means clustering — color space from settings, weighted by frequency
      const colorSpace = colorSpaceEl ? colorSpaceEl.value : 'rgb';
      const precision = parseFloat(clusterPrecisionEl ? clusterPrecisionEl.value : '1');
      // K-means returns exactly numColors — add white separately, don't merge down
      palette = kMeansWeighted(colors, numColors, colorSpace, precision);
      // Only add white if it's not already close to an existing palette color
      const hasWhite = palette.some(c => c[0] > 240 && c[1] > 240 && c[2] > 240);
      if (!hasWhite) palette.unshift([255, 255, 255]);
    }

    // Direct mapping: every pixel to nearest palette color
    // Pre-compute palette in Lab for fast nearest-color matching
    const paletteLab = palette.map(c => rgbToLab(c[0], c[1], c[2]));
    let mapped = new Uint8Array(w * h);
    for (let i = 0; i < colors.length; i++) {
      const pLab = rgbToLab(colors[i][0], colors[i][1], colors[i][2]);
      let minDist = Infinity, best = 0;
      for (let j = 0; j < paletteLab.length; j++) {
        const d = labDistSq(pLab, paletteLab[j]);
        if (d < minDist) { minDist = d; best = j; }
      }
      mapped[i] = best;
    }

    // Build edge strength map from original image (Sobel on luminance)
    // Pixels with strong edges are protected from smoothing/merging
    const edgeStrength = new Float32Array(w * h);
    const pixels2 = srcCanvas.getContext('2d').getImageData(0, 0, w, h).data;
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const lum = (r, g, b) => 0.299*r + 0.587*g + 0.114*b;
      const idx = (yy, xx) => { const i = (yy*w+xx)*4; return lum(pixels2[i], pixels2[i+1], pixels2[i+2]); };
      const gx = -idx(y-1,x-1) - 2*idx(y,x-1) - idx(y+1,x-1) + idx(y-1,x+1) + 2*idx(y,x+1) + idx(y+1,x+1);
      const gy = -idx(y-1,x-1) - 2*idx(y-1,x) - idx(y-1,x+1) + idx(y+1,x-1) + 2*idx(y+1,x) + idx(y+1,x+1);
      edgeStrength[y*w+x] = Math.sqrt(gx*gx + gy*gy);
    }
    // Normalize
    let maxEdge = 0;
    for (let i = 0; i < edgeStrength.length; i++) if (edgeStrength[i] > maxEdge) maxEdge = edgeStrength[i];
    if (maxEdge > 0) for (let i = 0; i < edgeStrength.length; i++) edgeStrength[i] /= maxEdge;
    // Edge threshold: only protect the strongest 10% of edges (actual feature boundaries)
    const EDGE_PROTECT = 0.6;

    // Mode filter removed — weighted k-means + pre-smooth already handles noise
    // Narrow strip cleanup — runs configurable times (drake7707 default: 3)
    const stripRuns = parseInt(narrowStripRunsEl ? narrowStripRunsEl.value : '3');
    for (let run = 0; run < stripRuns; run++) {
      mapped = narrowPixelStripCleanup(mapped, palette, w, h);
    }
    // If dithered style with dithered render engine, the render function handles it
    // For other styles, no extra mode filter needed
    if (currentStyle === 'dithered') {
      // No mode filter needed — source is clean, dithering applied at render time
    }

    const regionMap = new Int32Array(w * h).fill(-1);
    const regionColors = [];
    let regionId = 0;
    for (let i = 0; i < w * h; i++) {
      if (regionMap[i] !== -1) continue;
      floodFill(mapped, regionMap, w, h, i % w, Math.floor(i / w), mapped[i], regionId);
      regionColors.push(mapped[i]);
      regionId++;
    }

    // Merge small regions — configurable order and max facets (matching drake7707)
    const minReg = parseInt(minRegionSize.value);
    const maxFacets = parseInt(maxFacetsEl ? maxFacetsEl.value : '10000');
    const largeToSmall = !facetRemovalOrderEl || facetRemovalOrderEl.value === 'largeToSmall';
    mergeSmallRegionsEdgeAware(regionMap, regionColors, mapped, w, h, regionId, minReg, edgeStrength, EDGE_PROTECT, maxFacets, largeToSmall);

    // Merge adjacent regions with visually similar colors
    mergeSimilarAdjacentRegions(regionMap, regionColors, mapped, palette, w, h, regionId);

    // Smooth boundaries — skip edge pixels
    const smoothPasses = parseInt(smoothnessEl.value);
    smoothBoundariesEdgeAware(regionMap, mapped, regionColors, w, h, smoothPasses, edgeStrength, EDGE_PROTECT);

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

    // Identify background palette colors (near-white: R>220, G>220, B>220)
    const bgColorIndices = new Set();
    for (let ci = 0; ci < palette.length; ci++) {
      const c = palette[ci];
      if (c[0] > 220 && c[1] > 220 && c[2] > 220) bgColorIndices.add(ci);
    }

    // Find the largest region touching the image border — that's the background
    const borderRegions = new Set();
    for (let x = 0; x < w; x++) { borderRegions.add(regionMap[x]); borderRegions.add(regionMap[(h-1)*w+x]); }
    for (let y = 0; y < h; y++) { borderRegions.add(regionMap[y*w]); borderRegions.add(regionMap[y*w+w-1]); }

    for (let r = 0; r < regionId; r++) {
      const pxList = regionPixels[r];
      if (pxList.length < MIN_REGION) continue;
      // Skip background regions (border-touching + near-white color)
      if (borderRegions.has(r) && bgColorIndices.has(regionColors[r])) continue;
      const pt = findInteriorPoint(regionMap, w, h, r, pxList);
      const maxByDist = pt.dist * 1.2;
      const maxByArea = Math.sqrt(pxList.length) / 4;
      const fs = Math.max(4, Math.min(14, maxByDist, maxByArea));
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
    const pixelMode = currentStyle === 'pixelate';
    const blockSize = pixelMode ? 16 : 0;
    renderData = { w, h, outW, outH, mapped, palette, regionMap, labels, paletteNumbers, regionColors, regionPixels, regionId, paletteLabels, upscale: 1, pixelMode, blockSize };

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
    infoAside.hidden = false;
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
    renderData.customPaintsSnapshot = useCustomPalette.checked ? customPaints.map(p => ({...p})) : null;

    // Show order summary
    buildOrderSummary();

    output.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderCanvas(outlineMode) {
    if (!renderData) return;
    const engine = renderEngineEl ? renderEngineEl.value : 'standard';
    if (engine === 'vector') return renderCanvasVector(outlineMode);
    if (engine === 'slic') return renderCanvasSLIC(outlineMode);
    if (engine === 'dither') return renderCanvasDither(outlineMode);
    // Standard pixel-based rendering
    const { w, h, outW, outH, mapped, palette, regionMap, labels, pixelMode, blockSize } = renderData;
    const ow = outW || w, oh = outH || h;
    const sx = ow / w, sy = oh / h;

    resultCanvas.width = ow; resultCanvas.height = oh;
    const ctx = resultCanvas.getContext('2d');

    // Fill at output resolution by nearest-neighbour scaling of region map
    const outData = ctx.createImageData(ow, oh);
    for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) {
      const px = Math.min(w - 1, Math.floor(x / sx));
      const py = Math.min(h - 1, Math.floor(y / sy));
      const si = py * w + px;
      const pi = (y * ow + x) * 4;
      if (outlineMode) {
        outData.data[pi] = 255; outData.data[pi+1] = 255; outData.data[pi+2] = 255;
      } else {
        const c = palette[mapped[si]];
        const tint = (parseInt(colorStrengthEl.value) || 25) / 100;
        const white = 1 - tint;
        outData.data[pi]   = Math.round(c[0] * tint + 255 * white);
        outData.data[pi+1] = Math.round(c[1] * tint + 255 * white);
        outData.data[pi+2] = Math.round(c[2] * tint + 255 * white);
      }
      outData.data[pi+3] = 255;
    }
    ctx.putImageData(outData, 0, 0);

    // Outlines — drawn at output scale
    ctx.strokeStyle = '#000';
    ctx.lineWidth = outlineMode ? Math.max(1, sx * 0.6) : Math.max(0.8, sx * 0.5);
    ctx.beginPath();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const idx = y * w + x, rid = regionMap[idx];
      if (x < w - 1 && regionMap[idx + 1] !== rid) { ctx.moveTo((x+1)*sx, y*sy); ctx.lineTo((x+1)*sx, (y+1)*sy); }
      if (y < h - 1 && regionMap[idx + w] !== rid) { ctx.moveTo(x*sx, (y+1)*sy); ctx.lineTo((x+1)*sx, (y+1)*sy); }
    }
    ctx.stroke();

    // In pixel mode, draw grid lines over the blocks
    if (pixelMode && blockSize > 0) {
      ctx.strokeStyle = outlineMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)';
      ctx.lineWidth = Math.max(0.5, sx * 0.3);
      ctx.beginPath();
      for (let x = 0; x <= w; x += blockSize) { ctx.moveTo(x * sx, 0); ctx.lineTo(x * sx, oh); }
      for (let y = 0; y <= h; y += blockSize) { ctx.moveTo(0, y * sy); ctx.lineTo(ow, y * sy); }
      ctx.stroke();
    }

    // Numbers — font size scales with output resolution
    const minFs = parseInt(minFontSizeEl.value) || 10;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const lb of labels) {
      const fs = Math.max(minFs, lb.fs * sx);
      ctx.font = `500 ${fs}px Inter,system-ui`;
      if (outlineMode) {
        ctx.fillStyle = '#000';
        ctx.fillText(lb.text, lb.x * sx + sx/2, lb.y * sy + sy/2);
      } else {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.5, sx * 0.8);
        ctx.strokeText(lb.text, lb.x * sx + sx/2, lb.y * sy + sy/2);
        ctx.fillStyle = '#222';
        ctx.fillText(lb.text, lb.x * sx + sx/2, lb.y * sy + sy/2);
      }
    }
    // Watermark removed — not needed for production use
  }

  // --- Vector rendering using imagetracerjs ---
  function renderCanvasVector(outlineMode) {
    if (!renderData) return;
    const { w, h, outW, outH, mapped, palette, regionMap, labels } = renderData;
    const ow = outW || w, oh = outH || h;

    // Build a quantized ImageData from mapped + palette
    const quantCanvas = document.createElement('canvas');
    quantCanvas.width = w; quantCanvas.height = h;
    const qCtx = quantCanvas.getContext('2d');
    const qData = qCtx.createImageData(w, h);
    for (let i = 0; i < w * h; i++) {
      const c = outlineMode ? [255, 255, 255] : palette[mapped[i]];
      const pi = i * 4;
      qData.data[pi] = c[0]; qData.data[pi+1] = c[1]; qData.data[pi+2] = c[2]; qData.data[pi+3] = 255;
    }
    qCtx.putImageData(qData, 0, 0);

    // Use imagetracerjs to trace
    const imgd = qCtx.getImageData(0, 0, w, h);
    const options = {
      numberofcolors: palette.length,
      colorquantcycles: 1, // already quantized — don't re-quantize
      pathomit: 8, // skip tiny paths for cleaner output
      ltres: 0.5, // line tracing tolerance — lower = more detail
      qtres: 0.5, // quadratic spline tracing tolerance
      strokewidth: outlineMode ? 2 : 1,
      blurradius: 0, // no blur — image already processed
      blurdelta: 0,
    };

    // imagetracerjs operates synchronously
    if (typeof ImageTracer === 'undefined') {
      console.warn('imagetracerjs not loaded, falling back to standard');
      return renderCanvasStandard(outlineMode);
    }

    const svgStr = ImageTracer.imagedataToSVG(imgd, options);

    // Render SVG to canvas
    resultCanvas.width = ow; resultCanvas.height = oh;
    const ctx = resultCanvas.getContext('2d');
    const img = new Image();
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, ow, oh);
      URL.revokeObjectURL(url);

      // Draw numbers on top
      if (labels && labels.length > 0) {
        const sx = ow / w, sy = oh / h;
        const minFs = parseInt(minFontSizeEl ? minFontSizeEl.value : '12') || 12;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (const lb of labels) {
          const fs = Math.max(minFs, lb.fs * sx);
          ctx.font = `500 ${fs}px Inter,system-ui`;
          if (outlineMode) {
            ctx.fillStyle = '#000';
            ctx.fillText(lb.text, lb.x * sx + sx/2, lb.y * sy + sy/2);
          } else {
            ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.5, sx * 0.8);
            ctx.strokeText(lb.text, lb.x * sx + sx/2, lb.y * sy + sy/2);
            ctx.fillStyle = '#222';
            ctx.fillText(lb.text, lb.x * sx + sx/2, lb.y * sy + sy/2);
          }
        }
      }
    };
    img.src = url;
  }

  // --- SLIC + Potrace rendering (placeholder — falls back to standard with enhanced smoothing) ---
  function renderCanvasSLIC(outlineMode) {
    if (!renderData) return;
    // SLIC superpixels + Potrace is complex to implement from scratch in JS
    // For now, this uses the standard renderer with extra boundary smoothing
    // to approximate the smoother results SLIC would give
    const { w, h, outW, outH, mapped, palette, regionMap, labels, pixelMode, blockSize } = renderData;
    const ow = outW || w, oh = outH || h;
    const sx = ow / w, sy = oh / h;

    resultCanvas.width = ow; resultCanvas.height = oh;
    const ctx = resultCanvas.getContext('2d');
    const tint = (parseInt(colorStrengthEl ? colorStrengthEl.value : '40') || 40) / 100;

    // Fill
    const outData = ctx.createImageData(ow, oh);
    for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) {
      const px = Math.min(w - 1, Math.floor(x / sx));
      const py = Math.min(h - 1, Math.floor(y / sy));
      const si = py * w + px;
      const pi = (y * ow + x) * 4;
      if (outlineMode) {
        outData.data[pi] = 255; outData.data[pi+1] = 255; outData.data[pi+2] = 255;
      } else {
        const c = palette[mapped[si]];
        outData.data[pi]   = Math.round(c[0] * tint + 255 * (1 - tint));
        outData.data[pi+1] = Math.round(c[1] * tint + 255 * (1 - tint));
        outData.data[pi+2] = Math.round(c[2] * tint + 255 * (1 - tint));
      }
      outData.data[pi+3] = 255;
    }
    ctx.putImageData(outData, 0, 0);

    // Draw smooth outlines using quadratic curves instead of pixel lines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = outlineMode ? Math.max(1, sx * 0.6) : Math.max(0.8, sx * 0.5);
    // Collect border points per region boundary and draw as smooth paths
    const borderPts = {};
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const rid = regionMap[idx];
      if (x < w - 1 && regionMap[idx + 1] !== rid) {
        const key = Math.min(rid, regionMap[idx+1]) + '-' + Math.max(rid, regionMap[idx+1]);
        if (!borderPts[key]) borderPts[key] = [];
        borderPts[key].push([(x+1)*sx, (y+0.5)*sy]);
      }
      if (y < h - 1 && regionMap[idx + w] !== rid) {
        const key = Math.min(rid, regionMap[idx+w]) + '-' + Math.max(rid, regionMap[idx+w]);
        if (!borderPts[key]) borderPts[key] = [];
        borderPts[key].push([(x+0.5)*sx, (y+1)*sy]);
      }
    }
    // Draw each boundary segment as a smooth path
    ctx.beginPath();
    for (const pts of Object.values(borderPts)) {
      if (pts.length < 2) continue;
      // Sort points by proximity for connected path
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0], pts[i][1]);
      }
    }
    ctx.stroke();

    // Numbers
    if (labels) {
      const minFs = parseInt(minFontSizeEl ? minFontSizeEl.value : '12') || 12;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const lb of labels) {
        const fs = Math.max(minFs, lb.fs * sx);
        ctx.font = `500 ${fs}px Inter,system-ui`;
        if (outlineMode) {
          ctx.fillStyle = '#000';
          ctx.fillText(lb.text, lb.x * sx + sx/2, lb.y * sy + sy/2);
        } else {
          ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.5, sx * 0.8);
          ctx.strokeText(lb.text, lb.x * sx + sx/2, lb.y * sy + sy/2);
          ctx.fillStyle = '#222';
          ctx.fillText(lb.text, lb.x * sx + sx/2, lb.y * sy + sy/2);
        }
      }
    }
  }

  // --- Dithered rendering (paintmap.studio approach) ---
  // Uses Floyd-Steinberg error diffusion dithering to map pixels to palette colors.
  // This creates the illusion of more colors by distributing quantization error to
  // neighboring pixels, resulting in a painterly/textured look with apparent gradients.
  function renderCanvasDither(outlineMode) {
    if (!renderData) return;
    const { w, h, outW, outH, palette, regionMap, labels } = renderData;
    const ow = outW || w, oh = outH || h;
    const sx = ow / w, sy = oh / h;

    // Get the styled source image pixels at processing resolution
    const srcCtx = srcCanvas.getContext('2d');
    const srcData = srcCtx.getImageData(0, 0, w, h).data;

    // Floyd-Steinberg dithering: map each pixel to nearest palette color
    // and distribute the error to neighbors
    const pixels = new Float32Array(w * h * 3); // working buffer in float for error accumulation
    for (let i = 0; i < w * h; i++) {
      pixels[i*3]   = srcData[i*4];
      pixels[i*3+1] = srcData[i*4+1];
      pixels[i*3+2] = srcData[i*4+2];
    }

    const dithered = new Uint8Array(w * h); // palette index per pixel
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        const r = pixels[idx*3], g = pixels[idx*3+1], b = pixels[idx*3+2];
        // Find nearest palette color
        const ci = nearestColor([Math.round(r), Math.round(g), Math.round(b)], palette);
        dithered[idx] = ci;
        // Compute error
        const er = r - palette[ci][0], eg = g - palette[ci][1], eb = b - palette[ci][2];
        // Distribute error to neighbors (Floyd-Steinberg coefficients)
        const distribute = (dx, dy, factor) => {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) return;
          const ni = ny * w + nx;
          pixels[ni*3]   += er * factor;
          pixels[ni*3+1] += eg * factor;
          pixels[ni*3+2] += eb * factor;
        };
        distribute(1, 0, 7/16);
        distribute(-1, 1, 3/16);
        distribute(0, 1, 5/16);
        distribute(1, 1, 1/16);
      }
    }

    // Render to output canvas
    resultCanvas.width = ow; resultCanvas.height = oh;
    const ctx = resultCanvas.getContext('2d');
    const outData = ctx.createImageData(ow, oh);
    const tint = (parseInt(colorStrengthEl ? colorStrengthEl.value : '40') || 40) / 100;

    for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) {
      const px = Math.min(w - 1, Math.floor(x / sx));
      const py = Math.min(h - 1, Math.floor(y / sy));
      const ci = dithered[py * w + px];
      const c = palette[ci];
      const pi = (y * ow + x) * 4;
      if (outlineMode) {
        outData.data[pi] = 255; outData.data[pi+1] = 255; outData.data[pi+2] = 255;
      } else {
        outData.data[pi]   = Math.round(c[0] * tint + 255 * (1 - tint));
        outData.data[pi+1] = Math.round(c[1] * tint + 255 * (1 - tint));
        outData.data[pi+2] = Math.round(c[2] * tint + 255 * (1 - tint));
      }
      outData.data[pi+3] = 255;
    }
    ctx.putImageData(outData, 0, 0);

    // Draw outlines between different-colored adjacent pixels (using dithered map)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = outlineMode ? Math.max(1, sx * 0.4) : Math.max(0.5, sx * 0.3);
    ctx.beginPath();
    // Only draw outlines between regions (from regionMap), not between individual dithered pixels
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const idx = y * w + x, rid = regionMap[idx];
      if (x < w - 1 && regionMap[idx + 1] !== rid) { ctx.moveTo((x+1)*sx, y*sy); ctx.lineTo((x+1)*sx, (y+1)*sy); }
      if (y < h - 1 && regionMap[idx + w] !== rid) { ctx.moveTo(x*sx, (y+1)*sy); ctx.lineTo((x+1)*sx, (y+1)*sy); }
    }
    ctx.stroke();

    // Numbers
    if (labels) {
      const minFs = parseInt(minFontSizeEl ? minFontSizeEl.value : '12') || 12;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const lb of labels) {
        const fs = Math.max(minFs, lb.fs * sx);
        ctx.font = `500 ${fs}px Inter,system-ui`;
        if (outlineMode) {
          ctx.fillStyle = '#000';
          ctx.fillText(lb.text, lb.x * sx + sx/2, lb.y * sy + sy/2);
        } else {
          ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.5, sx * 0.8);
          ctx.strokeText(lb.text, lb.x * sx + sx/2, lb.y * sy + sy/2);
          ctx.fillStyle = '#222';
          ctx.fillText(lb.text, lb.x * sx + sx/2, lb.y * sy + sy/2);
        }
      }
    }
  }

  // Render with full colors and outlines but no numbers (for after animation)
  function renderCanvasNoNumbers() {
    if (!renderData) return;
    const { w, h, outW, outH, mapped, palette, regionMap } = renderData;
    const ow = outW || w, oh = outH || h;
    const sx = ow / w, sy = oh / h;

    resultCanvas.width = ow; resultCanvas.height = oh;
    const ctx = resultCanvas.getContext('2d');

    const outData = ctx.createImageData(ow, oh);
    for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) {
      const px = Math.min(w - 1, Math.floor(x / sx));
      const py = Math.min(h - 1, Math.floor(y / sy));
      const c = palette[mapped[py * w + px]];
      const pi = (y * ow + x) * 4;
      outData.data[pi] = c[0]; outData.data[pi+1] = c[1]; outData.data[pi+2] = c[2]; outData.data[pi+3] = 255;
    }
    ctx.putImageData(outData, 0, 0);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = Math.max(0.8, sx * 0.5);
    ctx.beginPath();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const idx = y * w + x, rid = regionMap[idx];
      if (x < w - 1 && regionMap[idx + 1] !== rid) { ctx.moveTo((x+1)*sx, y*sy); ctx.lineTo((x+1)*sx, (y+1)*sy); }
      if (y < h - 1 && regionMap[idx + w] !== rid) { ctx.moveTo(x*sx, (y+1)*sy); ctx.lineTo((x+1)*sx, (y+1)*sy); }
    }
    ctx.stroke();
  }

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
    if (!renderData || !renderData.coverageRows) return;

    const rd = renderData;
    const pageLabel = pageSizeEl.options[pageSizeEl.selectedIndex].text;

    // Page 1: outline-only canvas
    renderCanvas(true);
    const outlineUrl = resultCanvas.toDataURL('image/png');

    // Page 3: finished colour canvas (no watermark, no numbers)
    renderCanvasNoNumbers();
    const colourUrl = resultCanvas.toDataURL('image/png');

    // Restore view
    renderCanvas(outlineOnly.checked);

    // --- Paint quantity calculation ---
    // Acrylic paint: ~0.12 ml/cm² per coat, density ~1.2 g/ml → ~0.144 g/cm²
    const canvasW = parseFloat(canvasWEl.value) || 21;
    const canvasH = parseFloat(canvasHEl.value) || 29.7;
    const totalAreaCm2 = canvasW * canvasH;
    const ML_PER_CM2 = 0.12;
    const DENSITY = 1.2;
    const WASTE_FACTOR = 1.25;

    // Helper: parse a mix label into [{name, ratio}]
    function parseMixParts(label) {
      return label.split('+').map(part => {
        part = part.trim();
        const m = part.match(/^(\d+)%\s+(.+)$/);
        if (m) return { name: m[2].trim(), ratio: parseInt(m[1]) / 100 };
        return { name: part, ratio: 0.5 }; // equal split if no %
      });
    }

    // Build base-paint grams map — distribute mixed color grams back to components
    const baseGramsMap = {}; // name → grams
    for (const r of rd.coverageRows) {
      const areaCm2 = totalAreaCm2 * (parseFloat(r.pct) / 100);
      const grams = areaCm2 * ML_PER_CM2 * DENSITY * WASTE_FACTOR;
      if (!r.label.includes('+')) {
        // Base paint — add directly
        baseGramsMap[r.label] = (baseGramsMap[r.label] || 0) + grams;
      } else {
        // Mixed color — split grams proportionally to components
        const parts = parseMixParts(r.label);
        const totalRatio = parts.reduce((s, p) => s + p.ratio, 0);
        for (const p of parts) {
          const share = grams * (p.ratio / totalRatio);
          baseGramsMap[p.name] = (baseGramsMap[p.name] || 0) + share;
        }
      }
    }

    // Build production table rows — ALL base paints including mix-only components
    // baseGramsMap has every base paint name that's needed
    const allBasePaints = Object.keys(baseGramsMap).map(name => {
      // Find hex from customPaintsSnapshot or coverageRows
      const cp = rd.customPaintsSnapshot && rd.customPaintsSnapshot.find(p => (p.name || p.hex) === name);
      const row = rd.coverageRows.find(r => !r.label.includes('+') && r.label === name);
      const hex = cp ? cp.hex : (row ? row.hex : '#ccc');
      const grams = Math.max(1, Math.ceil(baseGramsMap[name]));
      const potSize = grams <= 5 ? '5ml' : grams <= 15 ? '15ml' : grams <= 30 ? '30ml' : '60ml+';
      const n = row ? row.n : '—';
      return { name, hex, grams, potSize, n };
    }).sort((a, b) => b.grams - a.grams);

    const win = window.open('', '_blank');
    if (!win) { alert('Please allow pop-ups to download the PDF.'); return; }

    const css = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: Inter, system-ui, sans-serif; background:#fff; color:#1a1d23; }
      .page { width:100%; padding:0.5in; page-break-after:always; }
      .page:last-child { page-break-after:auto; }
      h1 { font-size:20px; font-weight:700; margin-bottom:3px; }
      .meta { font-size:10px; color:#999; margin-bottom:14px; }

      /* Page 1 */
      img.canvas-img { max-width:100%; height:auto; display:block; border:1px solid #ddd; border-radius:4px; }

      /* Page 2 layout: legend left, preview right */
      .page2-layout { display:flex; gap:20px; align-items:flex-start; }
      .page2-left { flex:1; min-width:0; }
      .page2-right { width:220px; flex-shrink:0; }
      .page2-right img { width:100%; height:auto; border-radius:4px; border:1px solid #ddd; }
      .page2-right p { font-size:9px; color:#999; text-align:center; margin-top:4px; }

      /* Legend — 3 columns to fit more */
      .legend-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:4px; margin-bottom:12px; }
      .legend-item { display:flex; align-items:center; gap:5px; }
      .swatch {
        width:28px; height:28px; border-radius:4px; flex-shrink:0;
        border:1px solid rgba(0,0,0,.12);
        display:flex; align-items:center; justify-content:center;
        font-weight:700; font-size:10px; color:#fff;
        text-shadow:0 1px 2px rgba(0,0,0,.5);
        -webkit-print-color-adjust:exact; print-color-adjust:exact;
      }
      .legend-text { font-size:11px; line-height:1.3; }
      .legend-num { font-weight:700; }
      .legend-hex { font-size:9px; color:#aaa; font-family:monospace; }

      /* Mixing guide */
      .mix-title { font-size:13px; font-weight:600; margin:14px 0 8px; border-top:1px solid #eee; padding-top:10px; }
      .mix-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:5px; }
      .mix-item { display:flex; align-items:center; gap:6px; font-size:10px; }
      .mix-parts { display:flex; align-items:center; gap:3px; }
      .mix-swatch {
        width:16px; height:16px; border-radius:3px; border:1px solid rgba(0,0,0,.1); flex-shrink:0;
        -webkit-print-color-adjust:exact; print-color-adjust:exact;
      }
      .mix-plus { font-size:10px; color:#aaa; }
      .mix-arrow { font-size:12px; color:#bbb; margin:0 2px; }
      .mix-result {
        width:22px; height:22px; border-radius:3px; border:1px solid rgba(0,0,0,.1); flex-shrink:0;
        -webkit-print-color-adjust:exact; print-color-adjust:exact;
      }
      .mix-label { line-height:1.3; }
      .mix-name { font-weight:600; }
      .mix-recipe { font-size:9px; color:#999; }

      @media print {
        @page { margin:0.5in; }
        .page { padding:0; }
        * { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      }
    `;

    // Build legend rows — just number, name, hex
    const legendRows = rd.coverageRows.map(r => `
      <div class="legend-item">
        <div class="swatch" style="background:${r.hex}">${r.n}</div>
        <div class="legend-text">
          <div class="legend-num">${r.label}</div>
          <div class="legend-hex">${r.hex}</div>
        </div>
      </div>`).join('');

    // Build mixing guide — cleaner layout
    // Helper to find hex for a paint name — checks customPaints first, then coverageRows
    function findPaintHex(name) {
      const n = name.toLowerCase().trim();
      if (rd.customPaintsSnapshot) {
        const cp = rd.customPaintsSnapshot.find(p => (p.name || p.hex).toLowerCase() === n);
        if (cp) return cp.hex;
      }
      const row = rd.coverageRows.find(b => !b.label.includes('+') && b.label.toLowerCase() === n);
      return row ? row.hex : '#ccc';
    }

    const mixRows = rd.coverageRows
      .filter(r => r.label.includes('+'))
      .map(r => {
        const parts = parseMixParts(r.label);
        const swatches = parts.map(p => {
          const col = findPaintHex(p.name);
          const pctLabel = Math.round(p.ratio * 100) + '%';
          return `<div style="text-align:center">
            <div class="mix-swatch" style="background:${col}"></div>
            <div style="font-size:8px;color:#888;margin-top:1px">${pctLabel}</div>
          </div>`;
        });
        return `
          <div class="mix-item">
            <div class="mix-parts">${swatches.join('<span class="mix-plus">+</span>')}</div>
            <span class="mix-arrow">→</span>
            <div class="mix-result" style="background:${r.hex}"></div>
            <div class="mix-label">
              <div class="mix-name">${r.n}. ${parts.map(p => p.name).join(' + ')}</div>
              <div class="mix-recipe">${r.label}</div>
            </div>
          </div>`;
      }).join('');

    const hasMixes = mixRows.length > 0;

    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>Paint by Number – ${pageLabel}</title>
      <style>${css}</style>
    </head><body>

    <!-- PAGE 1: Outline -->
    <div class="page">
      <img class="canvas-img" src="${outlineUrl}" alt="Paint by Number outline">
    </div>

    <!-- PAGE 2: Legend + Mixing Guide + Finished Preview -->
    <div class="page">
      <h1>Color Guide</h1>
      <div class="page2-layout">
        <div class="page2-left">
          <div class="legend-grid">${legendRows}</div>
          ${hasMixes ? `<div class="mix-title">Mixing Guide</div><div class="mix-grid">${mixRows}</div>` : ''}
        </div>
        <div class="page2-right">
          <img src="${colourUrl}" alt="Finished preview">
          <p>Finished preview</p>
        </div>
      </div>
    </div>

    <!-- PAGE 3: Production / Order Sheet -->
    <div class="page">
      <h1>Production Sheet</h1>
      <p style="font-size:10px;color:#888;margin-bottom:12px">
        Canvas: ${canvasW} × ${canvasH} cm · ${rd.difficulty} · Est. ${rd.estTime}
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:11px">
        <thead>
          <tr style="border-bottom:2px solid #222">
            <th style="text-align:left;padding:4px 6px">#</th>
            <th style="text-align:left;padding:4px 6px">Color</th>
            <th style="text-align:left;padding:4px 6px">Hex</th>
            <th style="text-align:right;padding:4px 6px">Paint (g)</th>
            <th style="text-align:right;padding:4px 6px">Pot Size</th>
          </tr>
        </thead>
        <tbody>
          ${allBasePaints.map((r, i) => `
          <tr style="border-bottom:1px solid #eee;background:${i%2===0?'#fafafa':'#fff'}">
            <td style="padding:4px 6px;font-weight:700">${r.n}</td>
            <td style="padding:4px 6px">
              <span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${r.hex};border:1px solid rgba(0,0,0,.1);vertical-align:middle;margin-right:5px;-webkit-print-color-adjust:exact;print-color-adjust:exact"></span>
              ${r.name}
            </td>
            <td style="padding:4px 6px;font-family:monospace;color:#888;font-size:10px">${r.hex}</td>
            <td style="padding:4px 6px;text-align:right;font-weight:600">${r.grams}g</td>
            <td style="padding:4px 6px;text-align:right">${r.potSize}</td>
          </tr>`).join('')}
          <tr style="border-top:2px solid #222;font-weight:700">
            <td colspan="3" style="padding:5px 6px;text-align:right">Total:</td>
            <td style="padding:5px 6px;text-align:right">${allBasePaints.reduce((s,r)=>s+r.grams,0)}g</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <p style="font-size:9px;color:#bbb;margin-top:8px">
        Includes paint needed for mixing. Based on 0.12ml/cm² acrylic coverage with 25% waste allowance.
      </p>
    </div>

    </body></html>`);

    win.document.close();
    setTimeout(() => win.print(), 800);
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

    const { w, h, outW, outH, palette, regionMap, regionColors, regionPixels, regionId } = renderData;
    const ow = outW || w, oh = outH || h;
    const sx = ow / w, sy = oh / h;
    const s = sx; // use sx as the scale factor for pixel expansion

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
        // Fill output pixels for this region using the scale factors
        for (let p = 0; p < pxList.length; p++) {
          const px = pxList[p] & 0xFFFF, py = pxList[p] >> 16;
          const x0 = Math.floor(px * sx), x1 = Math.floor((px + 1) * sx);
          const y0 = Math.floor(py * sy), y1 = Math.floor((py + 1) * sy);
          for (let oy = y0; oy < y1; oy++) for (let ox = x0; ox < x1; ox++) {
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
    let entries = palette.map(c => ({ r: c[0], g: c[1], b: c[2], w: 1 }));

    while (entries.length > targetCount) {
      // Find closest pair using Lab distance
      let bestDist = Infinity, bestI = 0, bestJ = 1;
      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const labA = rgbToLab(entries[i].r, entries[i].g, entries[i].b);
          const labB = rgbToLab(entries[j].r, entries[j].g, entries[j].b);
          const d = labDistSq(labA, labB);
          if (d < bestDist) { bestDist = d; bestI = i; bestJ = j; }
        }
      }
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

  // --- Lab color space conversion ---
  // sRGB → linear → XYZ → Lab (D65 illuminant)
  function rgbToLab(r, g, b) {
    // Normalize to 0-1
    let R = r / 255, G = g / 255, B = b / 255;
    // Linearize
    R = R > 0.04045 ? Math.pow((R + 0.055) / 1.055, 2.4) : R / 12.92;
    G = G > 0.04045 ? Math.pow((G + 0.055) / 1.055, 2.4) : G / 12.92;
    B = B > 0.04045 ? Math.pow((B + 0.055) / 1.055, 2.4) : B / 12.92;
    // RGB → XYZ (D65)
    const X = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047;
    const Y = (R * 0.2126729 + G * 0.7151522 + B * 0.0721750) / 1.00000;
    const Z = (R * 0.0193339 + G * 0.1191920 + B * 0.9503041) / 1.08883;
    const f = v => v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16/116;
    return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
  }

  function labToRgb(L, a, b) {
    const fy = (L + 16) / 116, fx = a / 500 + fy, fz = fy - b / 200;
    const inv = v => v > 0.206897 ? v*v*v : (v - 16/116) / 7.787;
    let X = inv(fx) * 0.95047, Y = inv(fy), Z = inv(fz) * 1.08883;
    let R = X *  3.2404542 + Y * -1.5371385 + Z * -0.4985314;
    let G = X * -0.9692660 + Y *  1.8760108 + Z *  0.0415560;
    let B = X *  0.0556434 + Y * -0.2040259 + Z *  1.0572252;
    const lin = v => v > 0.0031308 ? 1.055 * Math.pow(v, 1/2.4) - 0.055 : 12.92 * v;
    return [
      Math.max(0, Math.min(255, Math.round(lin(R) * 255))),
      Math.max(0, Math.min(255, Math.round(lin(G) * 255))),
      Math.max(0, Math.min(255, Math.round(lin(B) * 255))),
    ];
  }

  // Value-weighted Lab distance — L (lightness/value) weighted 2x
  // Ensures highlights never merge with shadows even if same hue
  function labDistSq(a, b) {
    const dL = a[0]-b[0], da = a[1]-b[1], db = a[2]-b[2];
    return dL*dL*2 + da*da + db*db;
  }

  // Unified weighted k-means supporting RGB, HSL, and Lab color spaces
  // Groups pixels by quantized color first, then clusters unique colors weighted by frequency
  function kMeansWeighted(pixels, numColors, colorSpace = 'rgb', minDelta = 1, maxIter = 50) {
    if (pixels.length === 0) return [];

    // Group pixels by quantized color (2-bit chop)
    const colorGroups = {};
    const total = pixels.length;
    for (const p of pixels) {
      const r = p[0] >> 2 << 2, g = p[1] >> 2 << 2, b = p[2] >> 2 << 2;
      const key = r + ',' + g + ',' + b;
      if (!colorGroups[key]) colorGroups[key] = { r, g, b, count: 0 };
      colorGroups[key].count++;
    }

    const uniqueColors = Object.values(colorGroups);
    const n = uniqueColors.length;
    // Can't have more clusters than unique colors
    const k = Math.min(numColors, n);
    if (n <= k) return uniqueColors.map(c => [c.r, c.g, c.b]);

    // Convert to target color space with weights
    const vectors = uniqueColors.map(c => {
      let v;
      if (colorSpace === 'lab') v = rgbToLab(c.r, c.g, c.b);
      else if (colorSpace === 'hsl') v = rgbToHslArr(c.r, c.g, c.b);
      else v = [c.r, c.g, c.b]; // RGB
      return { v, rgb: [c.r, c.g, c.b], weight: c.count / total };
    });

    // k-means++ init weighted by frequency
    const centroids = [vectors[Math.floor(Math.random() * n)].v.slice()];
    while (centroids.length < k) {
      const dists = vectors.map(c => {
        let minD = Infinity;
        for (const cent of centroids) { const d = vecDistSq(c.v, cent); if (d < minD) minD = d; }
        return minD * c.weight;
      });
      const tot = dists.reduce((s, d) => s + d, 0);
      let r = Math.random() * tot;
      for (let i = 0; i < n; i++) { r -= dists[i]; if (r <= 0) { centroids.push(vectors[i].v.slice()); break; } }
      if (centroids.length < numColors) centroids.push(vectors[n - 1].v.slice());
    }

    // Weighted k-means iterations
    let assignments = new Int32Array(n);
    for (let iter = 0; iter < maxIter; iter++) {
      let changed = false;
      for (let i = 0; i < n; i++) {
        let best = 0, bestD = Infinity;
        for (let c = 0; c < centroids.length; c++) {
          const d = vecDistSq(vectors[i].v, centroids[c]);
          if (d < bestD) { bestD = d; best = c; }
        }
        if (assignments[i] !== best) { assignments[i] = best; changed = true; }
      }
      if (!changed) break;
      const sums = Array.from({ length: k }, () => new Array(centroids[0].length).fill(0));
      const weights = new Float64Array(k);
      for (let i = 0; i < n; i++) {
        const c = assignments[i], w = vectors[i].weight;
        for (let d = 0; d < sums[c].length; d++) sums[c][d] += vectors[i].v[d] * w;
        weights[c] += w;
      }
      let totalDelta = 0;
      for (let c = 0; c < k; c++) {
        if (weights[c] > 0) {
          const newCent = sums[c].map(v => v / weights[c]);
          totalDelta += vecDistSq(centroids[c], newCent);
          centroids[c] = newCent;
        } else {
          // Empty cluster — reinitialise to a random point to avoid dead centroids
          centroids[c] = vectors[Math.floor(Math.random() * n)].v.slice();
        }
      }
      if (Math.sqrt(totalDelta) < minDelta) break;
    }

    // Filter out any remaining empty clusters and convert to RGB
    const result = [];
    for (let c = 0; c < k; c++) {
      let rgb;
      if (colorSpace === 'lab') rgb = labToRgb(centroids[c][0], centroids[c][1], centroids[c][2]);
      else if (colorSpace === 'hsl') rgb = hslToRgbArr(centroids[c][0], centroids[c][1], centroids[c][2]);
      else rgb = [Math.round(centroids[c][0]), Math.round(centroids[c][1]), Math.round(centroids[c][2])];
      // Skip invalid colors (all zeros from uninitialised centroids)
      if (rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0 && c > 0) continue;
      result.push(rgb);
    }
    return result;
  }

  // Value-aware vector distance — weights L (lightness) more heavily in Lab space
  // This preserves the value structure (light/dark) which gives form and depth
  function vecDistSq(a, b) {
    let s = 0;
    for (let i = 0; i < a.length; i++) {
      const d = a[i] - b[i];
      // In Lab space: index 0 = L (lightness). Weight it 2x to prioritize value separation
      const weight = (a.length === 3 && i === 0) ? 2.0 : 1.0;
      s += d * d * weight;
    }
    return s;
  }

  function rgbToHslArr(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100]; // scale for better k-means distance
  }

  function hslToRgbArr(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }


  // Narrow pixel strip cleanup — removes 1-pixel-wide strips that create ugly thin lines.
  // For each interior pixel: if its color differs from both top+bottom OR both left+right
  // neighbors, it's part of a narrow strip and gets replaced with the closer neighbor.
  // Inspired by drake7707/paintbynumbersgenerator narrowPixelStripCleanup.
  function narrowPixelStripCleanup(mapped, palette, w, h) {
    const out = new Uint8Array(mapped); // copy so we don't cascade replacements
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        const cur = mapped[idx];
        const top    = mapped[(y - 1) * w + x];
        const bottom = mapped[(y + 1) * w + x];
        const left   = mapped[y * w + (x - 1)];
        const right  = mapped[y * w + (x + 1)];

        if (cur !== top && cur !== bottom) {
          // Narrow horizontal strip — replace with the perceptually closer of top/bottom
          const labCur = rgbToLab(palette[cur][0], palette[cur][1], palette[cur][2]);
          const dTop    = labDistSq(labCur, rgbToLab(palette[top][0],    palette[top][1],    palette[top][2]));
          const dBottom = labDistSq(labCur, rgbToLab(palette[bottom][0], palette[bottom][1], palette[bottom][2]));
          out[idx] = dTop <= dBottom ? top : bottom;
        } else if (cur !== left && cur !== right) {
          // Narrow vertical strip — replace with the perceptually closer of left/right
          const labCur = rgbToLab(palette[cur][0], palette[cur][1], palette[cur][2]);
          const dLeft  = labDistSq(labCur, rgbToLab(palette[left][0],  palette[left][1],  palette[left][2]));
          const dRight = labDistSq(labCur, rgbToLab(palette[right][0], palette[right][1], palette[right][2]));
          out[idx] = dLeft <= dRight ? left : right;
        }
      }
    }
    return out;
  }

  function colorDistSq(a, b) {
    const dr = a[0]-b[0], dg = a[1]-b[1], db = a[2]-b[2];
    return dr*dr + dg*dg + db*db;
  }

  // Nearest color using Lab distance for perceptual accuracy
  function nearestColor(pixel, palette) {
    const labPixel = rgbToLab(pixel[0], pixel[1], pixel[2]);
    let minDist = Infinity, best = 0;
    for (let i = 0; i < palette.length; i++) {
      const labP = rgbToLab(palette[i][0], palette[i][1], palette[i][2]);
      const d = labDistSq(labPixel, labP);
      if (d < minDist) { minDist = d; best = i; }
    }
    return best;
  }

  // Edge-aware mode filter: skip pixels on strong edges
  function modeFilterEdgeAware(mapped, w, h, edgeStrength, threshold) {
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      // Protect edge pixels — keep their original value
      if (edgeStrength[idx] >= threshold) { out[idx] = mapped[idx]; continue; }
      const counts = {};
      let best = mapped[idx], bestCount = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const ny = y + dy, nx = x + dx;
        if (ny < 0 || ny >= h || nx < 0 || nx >= w) continue;
        const v = mapped[ny * w + nx], c = (counts[v] || 0) + 1;
        counts[v] = c;
        if (c > bestCount) { bestCount = c; best = v; }
      }
      out[idx] = best;
    }
    return out;
  }

  // Merge adjacent regions that have very similar colors (Lab distance below threshold).
  // This removes the "extra tiny sections" where two similar colors sit next to each other.
  function mergeSimilarAdjacentRegions(regionMap, regionColors, mapped, palette, w, h, regionId) {
    const size = w * h;
    const MERGE_THRESHOLD = 15; // Lab distance — colors closer than this get merged

    // Pre-compute palette in Lab
    const palLab = palette.map(c => rgbToLab(c[0], c[1], c[2]));

    // Build adjacency: for each region, find its neighbor regions
    const neighbors = Array.from({ length: regionId }, () => new Set());
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const rid = regionMap[idx];
      if (x < w - 1 && regionMap[idx+1] !== rid) { neighbors[rid].add(regionMap[idx+1]); neighbors[regionMap[idx+1]].add(rid); }
      if (y < h - 1 && regionMap[idx+w] !== rid) { neighbors[rid].add(regionMap[idx+w]); neighbors[regionMap[idx+w]].add(rid); }
    }

    // Compute region sizes
    const regionSizes = new Int32Array(regionId);
    for (let i = 0; i < size; i++) regionSizes[regionMap[i]]++;

    // Merge pass: for each region, if its smallest neighbor has a similar color, merge the smaller into the larger
    let merged = true;
    while (merged) {
      merged = false;
      for (let r = 0; r < regionId; r++) {
        if (regionSizes[r] === 0) continue;
        const rLab = palLab[regionColors[r]];
        if (!rLab) continue;

        for (const nr of neighbors[r]) {
          if (regionSizes[nr] === 0) continue;
          const nLab = palLab[regionColors[nr]];
          if (!nLab) continue;

          const dist = Math.sqrt(labDistSq(rLab, nLab));
          if (dist < MERGE_THRESHOLD) {
            // Merge smaller into larger
            const [keep, remove] = regionSizes[r] >= regionSizes[nr] ? [r, nr] : [nr, r];
            for (let i = 0; i < size; i++) {
              if (regionMap[i] === remove) {
                regionMap[i] = keep;
                mapped[i] = regionColors[keep];
              }
            }
            regionSizes[keep] += regionSizes[remove];
            regionSizes[remove] = 0;
            // Transfer neighbors
            for (const n of neighbors[remove]) {
              if (n !== keep) { neighbors[keep].add(n); neighbors[n].add(keep); }
              neighbors[n].delete(remove);
            }
            neighbors[remove].clear();
            merged = true;
            break; // restart since neighbors changed
          }
        }
        if (merged) break;
      }
    }
  }

  // Edge-aware small region merge with max facets cap and configurable removal order
  function mergeSmallRegionsEdgeAware(regionMap, regionColors, mapped, w, h, regionId, threshold, edgeStrength, edgeThreshold, maxFacets = Infinity, largeToSmall = true) {
    const size = w * h;
    const regionHasEdge = new Uint8Array(regionId);
    for (let i = 0; i < size; i++) {
      if (edgeStrength[i] >= edgeThreshold) regionHasEdge[regionMap[i]] = 1;
    }

    // Build sorted processing order — large-to-small (drake7707 default) or small-to-large
    const buildOrder = () => {
      const sizes = new Int32Array(regionId);
      for (let i = 0; i < size; i++) sizes[regionMap[i]]++;
      const order = [];
      for (let r = 0; r < regionId; r++) { if (sizes[r] > 0) order.push(r); }
      order.sort((a, b) => largeToSmall ? sizes[b] - sizes[a] : sizes[a] - sizes[b]);
      return { order, sizes };
    };

    let changed = true;
    while (changed) {
      changed = false;
      const { order, sizes } = buildOrder();

      // Count active facets
      let activeFacets = order.length;

      for (const r of order) {
        if (sizes[r] === 0) continue;
        const shouldMerge = sizes[r] < threshold || activeFacets > maxFacets;
        if (!shouldMerge) continue;
        if (regionHasEdge[r] && sizes[r] >= threshold) continue; // protect edge regions unless over max

        const neighborCounts = {};
        for (let i = 0; i < size; i++) {
          if (regionMap[i] !== r) continue;
          const x = i % w, y = (i - x) / w;
          if (x > 0 && regionMap[i-1] !== r) neighborCounts[regionMap[i-1]] = (neighborCounts[regionMap[i-1]]||0) + 1;
          if (x < w-1 && regionMap[i+1] !== r) neighborCounts[regionMap[i+1]] = (neighborCounts[regionMap[i+1]]||0) + 1;
          if (y > 0 && regionMap[i-w] !== r) neighborCounts[regionMap[i-w]] = (neighborCounts[regionMap[i-w]]||0) + 1;
          if (y < h-1 && regionMap[i+w] !== r) neighborCounts[regionMap[i+w]] = (neighborCounts[regionMap[i+w]]||0) + 1;
        }
        let best = -1, bestCnt = 0;
        for (const [nr, cnt] of Object.entries(neighborCounts)) {
          if (cnt > bestCnt) { bestCnt = cnt; best = parseInt(nr); }
        }
        if (best === -1) continue;
        for (let i = 0; i < size; i++) {
          if (regionMap[i] === r) { regionMap[i] = best; mapped[i] = regionColors[best]; }
        }
        sizes[best] += sizes[r];
        sizes[r] = 0;
        activeFacets--;
        changed = true;
      }
    }
  }

  // Edge-aware boundary smoothing: skip edge pixels
  function smoothBoundariesEdgeAware(regionMap, mapped, regionColors, w, h, passes, edgeStrength, edgeThreshold) {
    if (passes === 0) return;
    const radius = Math.min(passes, 3);
    const size = w * h;
    for (let pass = 0; pass < passes; pass++) {
      const newMap = new Int32Array(regionMap);
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        if (edgeStrength[idx] >= edgeThreshold) continue; // protect edges
        const cur = regionMap[idx];
        if (regionMap[idx-1] === cur && regionMap[idx+1] === cur &&
            regionMap[idx-w] === cur && regionMap[idx+w] === cur) continue;
        const counts = {};
        for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
          const ny = y+dy, nx = x+dx;
          if (ny < 0 || ny >= h || nx < 0 || nx >= w) continue;
          const r = regionMap[ny * w + nx];
          counts[r] = (counts[r] || 0) + 1;
        }
        let best = cur, bestCnt = 0;
        for (const [r, cnt] of Object.entries(counts)) {
          if (cnt > bestCnt) { bestCnt = cnt; best = parseInt(r); }
        }
        if (best !== cur) newMap[idx] = best;
      }
      for (let i = 0; i < size; i++) {
        if (newMap[i] !== regionMap[i]) {
          regionMap[i] = newMap[i];
          mapped[i] = regionColors[regionMap[i]];
        }
      }
    }
  }

  // Smooth jagged region boundaries by reassigning edge pixels to the
  // majority region in a small neighborhood. Preserves region shapes
  // but rounds off staircase/zigzag edges.
  function smoothBoundaries(regionMap, mapped, regionColors, w, h, passes = 2) {
    if (passes === 0) return;
    // Scale neighborhood radius with passes: more passes = wider radius = smoother
    const radius = Math.min(passes, 3);
    const size = w * h;
    for (let pass = 0; pass < passes; pass++) {
      const newMap = new Int32Array(regionMap);
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        const cur = regionMap[idx];
        if (regionMap[idx-1] === cur && regionMap[idx+1] === cur &&
            regionMap[idx-w] === cur && regionMap[idx+w] === cur) continue;
        const counts = {};
        for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
          const ny = y+dy, nx = x+dx;
          if (ny < 0 || ny >= h || nx < 0 || nx >= w) continue;
          const r = regionMap[ny * w + nx];
          counts[r] = (counts[r] || 0) + 1;
        }
        let best = cur, bestCnt = 0;
        for (const [r, cnt] of Object.entries(counts)) {
          if (cnt > bestCnt) { bestCnt = cnt; best = parseInt(r); }
        }
        if (best !== cur) newMap[idx] = best;
      }
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
