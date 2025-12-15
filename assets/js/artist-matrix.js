(() => {
  const canvas = document.getElementById('artist-matrix-canvas');
  if (!canvas) return;

  const wrapper = document.getElementById('artist-matrix-wrapper');
  const statsEl = document.getElementById('artist-matrix-stats');
  const infoEl = document.getElementById('artist-matrix-info');
  const tooltipEl = document.getElementById('artist-matrix-tooltip');
  const topNEl = document.getElementById('artist-matrix-topn');
  const topNValueEl = document.getElementById('artist-matrix-topn-value');
  const resetEl = document.getElementById('artist-matrix-reset');

  const ctx = canvas.getContext('2d', { alpha: false });
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  const csvUrl = canvas.dataset.csv;
  if (!csvUrl) {
    console.error('Missing data-csv attribute on #artist-matrix-canvas');
    return;
  }

  const state = {
    nodes: [],
    nodeById: new Map(),
    edges: new Set(),
    order: [],
    width: 0,
    height: 0,
    topN: Number(topNEl?.value || 60),
    hover: null
  };

  function key(a, b) {
    return `${a}→${b}`;
  }

  function normalizeName(s) {
    return String(s || '').trim();
  }

  function parseCsvRows(text) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length <= 1) return [];

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 4) continue;
      rows.push({
        fromId: parts[0],
        fromName: parts[1],
        toId: parts[2],
        toName: parts[3]
      });
    }
    return rows;
  }

  function ensureNode(id, name) {
    if (state.nodeById.has(id)) {
      const n = state.nodeById.get(id);
      if (!n.name && name) n.name = name;
      return n;
    }
    const n = { id, name: name || id, in: 0, out: 0, degree: 0 };
    state.nodeById.set(id, n);
    state.nodes.push(n);
    return n;
  }

  function buildGraph(rows) {
    state.nodes = [];
    state.nodeById = new Map();
    state.edges = new Set();

    for (const r of rows) {
      const from = ensureNode(r.fromId, r.fromName);
      const to = ensureNode(r.toId, r.toName);

      state.edges.add(key(from.id, to.id));
      from.out += 1;
      to.in += 1;
    }

    for (const n of state.nodes) {
      n.degree = n.in + n.out;
    }

    // Default ordering: degree desc, name asc
    state.order = state.nodes
      .slice()
      .sort((a, b) => (b.degree - a.degree) || (a.name.localeCompare(b.name)));
  }

  function setStats() {
    if (!statsEl) return;
    statsEl.textContent = `${state.nodes.length} artists · ${state.edges.size} directed links`;
  }

  function resize() {
    const rect = wrapper ? wrapper.getBoundingClientRect() : canvas.getBoundingClientRect();
    state.width = Math.max(320, Math.floor(rect.width));
    state.height = Math.max(420, Math.floor(rect.height));

    canvas.width = Math.floor(state.width * dpr);
    canvas.height = Math.floor(state.height * dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;

    render();
  }

  function clear() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function render() {
    clear();

    const N = Math.min(state.topN, state.order.length);
    const nodes = state.order.slice(0, N);
    if (!nodes.length) return;

    // Margins for subtle axes
    const margin = 18;
    const w = state.width - margin;
    const h = state.height - margin;
    const cell = Math.max(2, Math.floor(Math.min(w, h) / N));

    const gridW = cell * N;
    const gridH = cell * N;
    const ox = margin;
    const oy = margin;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Background grid
    ctx.fillStyle = 'rgba(17, 24, 39, 0.02)';
    ctx.fillRect(ox, oy, gridW, gridH);

    // Cells
    for (let i = 0; i < N; i++) {
      const from = nodes[i];
      for (let j = 0; j < N; j++) {
        const to = nodes[j];
        const hasEdge = state.edges.has(key(from.id, to.id));
        if (!hasEdge) continue;

        const x = ox + j * cell;
        const y = oy + i * cell;
        ctx.fillStyle = 'rgba(37, 99, 235, 0.55)';
        ctx.fillRect(x, y, cell, cell);
      }
    }

    // Hover highlight
    if (state.hover) {
      const { i, j } = state.hover;
      ctx.strokeStyle = 'rgba(17, 24, 39, 0.45)';
      ctx.lineWidth = 1;
      ctx.strokeRect(ox + j * cell + 0.5, oy + i * cell + 0.5, cell - 1, cell - 1);

      // Subtle row/col highlight
      ctx.fillStyle = 'rgba(37, 99, 235, 0.06)';
      ctx.fillRect(ox, oy + i * cell, gridW, cell);
      ctx.fillRect(ox + j * cell, oy, cell, gridH);
    }

    ctx.restore();
  }

  function setHover(i, j, nodes) {
    state.hover = (i === null || j === null) ? null : { i, j };

    if (!infoEl) return;

    if (i === null || j === null) {
      infoEl.innerHTML = '<div class="net-info-empty">Hover over a filled cell to see the directed link.</div>';
      if (tooltipEl) {
        tooltipEl.classList.remove('is-visible');
        tooltipEl.setAttribute('aria-hidden', 'true');
      }
      render();
      return;
    }

    const from = nodes[i];
    const to = nodes[j];
    const has = state.edges.has(key(from.id, to.id));

    if (!has) {
      infoEl.innerHTML = `<div class="net-info-empty">No edge: <strong>${from.name}</strong> → <strong>${to.name}</strong></div>`;
    } else {
      infoEl.innerHTML = `
        <div class="net-info-title">${from.name} → ${to.name}</div>
        <div class="net-info-meta">Directed link present in dataset</div>
      `;
    }

    render();
  }

  function positionTooltip(text, x, y) {
    if (!tooltipEl) return;
    tooltipEl.textContent = text;
    tooltipEl.style.left = `${x + 14}px`;
    tooltipEl.style.top = `${y + 14}px`;
    tooltipEl.classList.add('is-visible');
    tooltipEl.setAttribute('aria-hidden', 'false');
  }

  function onMouseMove(e) {
    const N = Math.min(state.topN, state.order.length);
    const nodes = state.order.slice(0, N);
    if (!nodes.length) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const margin = 18;
    const w = state.width - margin;
    const h = state.height - margin;
    const cell = Math.max(2, Math.floor(Math.min(w, h) / N));

    const ox = margin;
    const oy = margin;

    const j = Math.floor((mx - ox) / cell);
    const i = Math.floor((my - oy) / cell);

    const inside = i >= 0 && j >= 0 && i < N && j < N;
    if (!inside) {
      setHover(null, null, nodes);
      if (tooltipEl) {
        tooltipEl.classList.remove('is-visible');
        tooltipEl.setAttribute('aria-hidden', 'true');
      }
      return;
    }

    const from = nodes[i];
    const to = nodes[j];
    const has = state.edges.has(key(from.id, to.id));

    setHover(i, j, nodes);
    canvas.style.cursor = 'default';

    if (has) {
      positionTooltip(`${from.name} → ${to.name}`, mx, my);
    } else if (tooltipEl) {
      tooltipEl.classList.remove('is-visible');
      tooltipEl.setAttribute('aria-hidden', 'true');
    }
  }

  function reset() {
    state.hover = null;
    if (topNEl) {
      topNEl.value = String(60);
      state.topN = 60;
    }
    if (topNValueEl) topNValueEl.textContent = String(state.topN);
    if (infoEl) infoEl.innerHTML = '<div class="net-info-empty">Hover over a filled cell to see the directed link.</div>';
    if (tooltipEl) {
      tooltipEl.classList.remove('is-visible');
      tooltipEl.setAttribute('aria-hidden', 'true');
    }
    render();
  }

  async function init() {
    const res = await fetch(csvUrl);
    const text = await res.text();

    const rows = parseCsvRows(text);
    buildGraph(rows);
    setStats();

    resize();

    topNEl?.addEventListener('input', () => {
      state.topN = Number(topNEl.value);
      if (topNValueEl) topNValueEl.textContent = String(state.topN);
      render();
    });

    resetEl?.addEventListener('click', reset);

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', () => {
      if (tooltipEl) {
        tooltipEl.classList.remove('is-visible');
        tooltipEl.setAttribute('aria-hidden', 'true');
      }
      state.hover = null;
      render();
      if (infoEl) infoEl.innerHTML = '<div class="net-info-empty">Hover over a filled cell to see the directed link.</div>';
    });

    window.addEventListener('resize', () => {
      window.clearTimeout(window.__matrixResizeT);
      window.__matrixResizeT = window.setTimeout(resize, 120);
    });
  }

  init().catch((err) => {
    console.error(err);
    if (infoEl) infoEl.textContent = 'Failed to load matrix.';
  });
})();
