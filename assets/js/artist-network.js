/* global d3 */

(() => {
  const canvas = document.getElementById('artist-network-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  const wrapper = document.getElementById('artist-network-wrapper');
  const infoEl = document.getElementById('artist-network-info');
  const searchEl = document.getElementById('artist-network-search');
  const resetEl = document.getElementById('artist-network-reset');
  const statsEl = document.getElementById('artist-network-stats');

  const csvUrl = canvas.dataset.csv;
  if (!csvUrl) {
    console.error('Missing data-csv attribute on #artist-network-canvas');
    return;
  }

  const state = {
    nodes: [],
    links: [],
    nodeById: new Map(),
    outNeighbors: new Map(),
    inNeighbors: new Map(),
    selected: null,
    hovered: null,
    dragging: null,
    quadtree: null,
    width: 0,
    height: 0,
    dpr: Math.max(1, window.devicePixelRatio || 1),
    transform: d3.zoomIdentity,
    simulation: null
  };

  function escapeHtml(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function normalizeName(s) {
    return String(s || '').trim().toLowerCase();
  }

  function parseCsvRows(text) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length <= 1) return [];

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 4) continue;

      const fromArtistId = parts[0];
      const fromArtistName = parts[1];
      const toArtistId = parts[2];
      const toArtistName = parts[3];

      if (!fromArtistId || !toArtistId) continue;

      rows.push({
        fromArtistId,
        fromArtistName,
        toArtistId,
        toArtistName
      });
    }
    return rows;
  }

  function ensureNode(id, name) {
    if (state.nodeById.has(id)) {
      const n = state.nodeById.get(id);
      // Prefer a non-empty name if we already have one.
      if (!n.name && name) n.name = name;
      return n;
    }

    const node = {
      id,
      name: name || id,
      inDegree: 0,
      outDegree: 0,
      degree: 0,
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      vx: 0,
      vy: 0
    };

    state.nodeById.set(id, node);
    state.nodes.push(node);
    return node;
  }

  function addNeighbor(map, a, b) {
    if (!map.has(a)) map.set(a, new Set());
    map.get(a).add(b);
  }

  function buildGraph(rows) {
    state.nodes = [];
    state.links = [];
    state.nodeById = new Map();
    state.outNeighbors = new Map();
    state.inNeighbors = new Map();

    for (const r of rows) {
      const from = ensureNode(r.fromArtistId, r.fromArtistName);
      const to = ensureNode(r.toArtistId, r.toArtistName);

      state.links.push({ source: from.id, target: to.id });

      from.outDegree += 1;
      to.inDegree += 1;

      addNeighbor(state.outNeighbors, from.id, to.id);
      addNeighbor(state.inNeighbors, to.id, from.id);
    }

    for (const n of state.nodes) {
      n.degree = n.inDegree + n.outDegree;
    }
  }

  function setInfo(node) {
    if (!infoEl) return;

    if (!node) {
      infoEl.innerHTML = '<div class="net-info-empty">Select an artist to see details.</div>';
      return;
    }

    const out = Array.from(state.outNeighbors.get(node.id) || []).slice(0, 8);
    const inn = Array.from(state.inNeighbors.get(node.id) || []).slice(0, 8);

    const outNames = out.map(id => state.nodeById.get(id)?.name || id);
    const inNames = inn.map(id => state.nodeById.get(id)?.name || id);

    infoEl.innerHTML = `
      <div class="net-info-title">${escapeHtml(node.name)}</div>
      <div class="net-info-meta">in: <strong>${node.inDegree}</strong> · out: <strong>${node.outDegree}</strong> · total: <strong>${node.degree}</strong></div>
      <div class="net-info-section">
        <div class="net-info-label">Outgoing links</div>
        <div class="net-info-chips">${outNames.length ? outNames.map(n => `<span class="net-chip">${escapeHtml(n)}</span>`).join('') : '<span class="net-muted">None</span>'}</div>
      </div>
      <div class="net-info-section">
        <div class="net-info-label">Incoming links</div>
        <div class="net-info-chips">${inNames.length ? inNames.map(n => `<span class="net-chip">${escapeHtml(n)}</span>`).join('') : '<span class="net-muted">None</span>'}</div>
      </div>
    `;
  }

  function setStats() {
    if (!statsEl) return;
    const n = state.nodes.length;
    const m = state.links.length;
    statsEl.textContent = `${n} artists · ${m} directed links`;
  }

  function nodeRadius(n) {
    // Subtle size encoding: sqrt degree (clamped)
    return Math.max(4, Math.min(10, 4 + Math.sqrt(n.degree || 0)));
  }

  function isNeighbor(a, b) {
    if (!a || !b) return false;
    const out = state.outNeighbors.get(a.id);
    const inn = state.inNeighbors.get(a.id);
    return Boolean(out?.has(b.id) || inn?.has(b.id));
  }

  function rebuildQuadtree() {
    state.quadtree = d3.quadtree()
      .x(d => d.x)
      .y(d => d.y)
      .addAll(state.nodes);
  }

  function resize() {
    const rect = wrapper ? wrapper.getBoundingClientRect() : canvas.getBoundingClientRect();
    state.width = Math.max(320, Math.floor(rect.width));
    state.height = Math.max(320, Math.floor(rect.height));

    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;

    // Reset zoom center on first load
    if (state.transform === d3.zoomIdentity) {
      state.transform = d3.zoomIdentity.translate(state.width / 2, state.height / 2).scale(1);
      d3.select(canvas).call(zoom.transform, state.transform);
    }

    render();
  }

  function clear() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function drawArrow(x1, y1, x2, y2, r) {
    // Draw a small arrowhead near the target.
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 0.001) return;

    const ux = dx / len;
    const uy = dy / len;

    const tipX = x2 - ux * (r + 2);
    const tipY = y2 - uy * (r + 2);

    const size = 6;
    const leftX = tipX - ux * size - uy * (size * 0.55);
    const leftY = tipY - uy * size + ux * (size * 0.55);
    const rightX = tipX - ux * size + uy * (size * 0.55);
    const rightY = tipY - uy * size - ux * (size * 0.55);

    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    ctx.fill();
  }

  function render() {
    clear();

    ctx.save();
    ctx.scale(state.dpr, state.dpr);

    // Apply zoom/pan transform (in CSS pixels)
    ctx.translate(state.transform.x, state.transform.y);
    ctx.scale(state.transform.k, state.transform.k);

    const selected = state.selected;
    const hovered = state.hovered;

    // Links
    ctx.lineWidth = 1 / state.transform.k;
    for (const l of state.links) {
      const s = typeof l.source === 'object' ? l.source : state.nodeById.get(String(l.source));
      const t = typeof l.target === 'object' ? l.target : state.nodeById.get(String(l.target));
      if (!s || !t) continue;

      const sIsFocus = selected && (s.id === selected.id || isNeighbor(selected, s));
      const tIsFocus = selected && (t.id === selected.id || isNeighbor(selected, t));
      const isFocusLink = selected && (sIsFocus || tIsFocus);

      ctx.strokeStyle = isFocusLink ? 'rgba(37, 99, 235, 0.20)' : 'rgba(17, 24, 39, 0.08)';
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.stroke();

      // Arrowhead (subtle)
      ctx.fillStyle = isFocusLink ? 'rgba(37, 99, 235, 0.20)' : 'rgba(17, 24, 39, 0.08)';
      drawArrow(s.x, s.y, t.x, t.y, nodeRadius(t));
    }

    // Nodes
    for (const n of state.nodes) {
      const r = nodeRadius(n);
      const isSelected = selected && n.id === selected.id;
      const isHovered = hovered && n.id === hovered.id;
      const isNeighborOfSelected = selected && isNeighbor(selected, n);

      let fill = 'rgba(17, 24, 39, 0.65)';
      if (selected) fill = isSelected ? 'rgba(37, 99, 235, 0.95)' : (isNeighborOfSelected ? 'rgba(37, 99, 235, 0.55)' : 'rgba(17, 24, 39, 0.25)');
      if (!selected && isHovered) fill = 'rgba(37, 99, 235, 0.85)';

      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();

      if (isSelected || isHovered) {
        ctx.lineWidth = 2 / state.transform.k;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.stroke();
      }
    }

    // Labels (only hovered or selected)
    const labelTargets = [];
    if (selected) labelTargets.push(selected);
    if (hovered && (!selected || hovered.id !== selected.id)) labelTargets.push(hovered);

    for (const n of labelTargets) {
      const r = nodeRadius(n);
      const pad = 8 / state.transform.k;
      const fontSize = 13 / state.transform.k;

      ctx.font = `${fontSize}px Inter, system-ui, -apple-system, Segoe UI, sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      const text = n.name;
      const w = ctx.measureText(text).width;
      const x = n.x + r + pad;
      const y = n.y;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1 / state.transform.k;

      // Rounded rect background
      const h = (fontSize + 10 / state.transform.k);
      const rx = 8 / state.transform.k;
      const bw = w + (18 / state.transform.k);

      ctx.beginPath();
      const y0 = y - h / 2;
      ctx.moveTo(x + rx, y0);
      ctx.arcTo(x + bw, y0, x + bw, y0 + h, rx);
      ctx.arcTo(x + bw, y0 + h, x, y0 + h, rx);
      ctx.arcTo(x, y0 + h, x, y0, rx);
      ctx.arcTo(x, y0, x + bw, y0, rx);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(17, 24, 39, 0.92)';
      ctx.fillText(text, x + (10 / state.transform.k), y);
    }

    ctx.restore();
  }

  function findNearestNode(screenX, screenY) {
    if (!state.quadtree) return null;
    const [x, y] = state.transform.invert([screenX, screenY]);

    // Search radius in simulation space
    const r = 14 / state.transform.k;
    const n = state.quadtree.find(x, y, r);
    if (!n) return null;

    const d = Math.hypot(n.x - x, n.y - y);
    return d <= (nodeRadius(n) + 6 / state.transform.k) ? n : null;
  }

  function setSelected(node) {
    state.selected = node;
    setInfo(node);
    render();
  }

  function setHovered(node) {
    state.hovered = node;
    render();
  }

  function centerOn(node) {
    if (!node) return;
    const k = Math.max(0.5, Math.min(2.5, state.transform.k));
    const tx = state.width / 2 - node.x * k;
    const ty = state.height / 2 - node.y * k;
    const t = d3.zoomIdentity.translate(tx, ty).scale(k);
    d3.select(canvas).transition().duration(500).call(zoom.transform, t);
  }

  function handleSearch() {
    const q = normalizeName(searchEl?.value);
    if (!q) {
      setSelected(null);
      return;
    }

    const matches = state.nodes
      .map(n => ({ n, k: normalizeName(n.name) }))
      .filter(x => x.k.includes(q))
      .map(x => x.n);

    // Prefer exact match if possible
    const exact = matches.find(n => normalizeName(n.name) === q);
    const pick = exact || matches[0] || null;

    setSelected(pick);
    centerOn(pick);
  }

  function resetView() {
    setSelected(null);
    setHovered(null);
    if (searchEl) searchEl.value = '';

    const t = d3.zoomIdentity.translate(state.width / 2, state.height / 2).scale(1);
    d3.select(canvas).transition().duration(400).call(zoom.transform, t);
  }

  const zoom = d3.zoom()
    .scaleExtent([0.2, 6])
    .on('zoom', (event) => {
      state.transform = event.transform;
      render();
    });

  function wireInteraction() {
    d3.select(canvas).call(zoom);

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (state.dragging) {
        const [x, y] = state.transform.invert([mx, my]);
        state.dragging.fx = x;
        state.dragging.fy = y;
        return;
      }

      const nearest = findNearestNode(mx, my);
      canvas.style.cursor = nearest ? 'pointer' : 'grab';
      if ((nearest && !state.hovered) || (!nearest && state.hovered) || (nearest && state.hovered && nearest.id !== state.hovered.id)) {
        setHovered(nearest);
      }
    });

    canvas.addEventListener('mouseleave', () => {
      if (!state.dragging) setHovered(null);
    });

    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const nearest = findNearestNode(mx, my);
      if (!nearest) return;

      state.dragging = nearest;
      state.simulation.alphaTarget(0.15).restart();

      const [x, y] = state.transform.invert([mx, my]);
      nearest.fx = x;
      nearest.fy = y;
    });

    window.addEventListener('mouseup', () => {
      if (!state.dragging) return;
      state.dragging.fx = null;
      state.dragging.fy = null;
      state.dragging = null;
      state.simulation.alphaTarget(0);
    });

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const nearest = findNearestNode(mx, my);
      setSelected(nearest);
    });

    searchEl?.addEventListener('input', () => {
      // Debounce lightly
      window.clearTimeout(searchEl._t);
      searchEl._t = window.setTimeout(handleSearch, 150);
    });

    resetEl?.addEventListener('click', resetView);
  }

  async function init() {
    const res = await fetch(csvUrl);
    const text = await res.text();

    const rows = parseCsvRows(text);
    buildGraph(rows);

    state.simulation = d3.forceSimulation(state.nodes)
      .force('link', d3.forceLink(state.links)
        .id(d => d.id)
        .distance(85)
        .strength(0.35)
      )
      .force('charge', d3.forceManyBody().strength(-220))
      .force('collide', d3.forceCollide().radius(d => nodeRadius(d) + 2).iterations(2))
      .force('center', d3.forceCenter(0, 0))
      .on('tick', () => {
        rebuildQuadtree();
        render();
      });

    rebuildQuadtree();
    setInfo(null);
    setStats();

    wireInteraction();
    resize();

    window.addEventListener('resize', () => {
      window.clearTimeout(window.__netResizeT);
      window.__netResizeT = window.setTimeout(resize, 120);
    });
  }

  init().catch((err) => {
    console.error(err);
    if (infoEl) infoEl.textContent = 'Failed to load network data.';
  });
})();
