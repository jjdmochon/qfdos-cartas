/* ==========================================================================
   QFDOS Structural Affinity Identity System (v3.0)
   Baraja Coleccionable de Fármacos — Lógica de Aplicación
   ========================================================================== */

const ORDEN_INDICES = ['AFI', 'SEL', 'EST', 'ORA', 'SNC', 'DUR'];

const LABELS_INDICES = {
  AFI: 'Afinidad diana (0-99)',
  SEL: 'Selectividad de receptor',
  EST: 'Estabilidad metabólica',
  ORA: 'Biodisponibilidad oral',
  SNC: 'Paso barrera hematoencefálica',
  DUR: 'Duración de acción'
};

const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

class CartasApp {
  constructor() {
    this.farmacos = [];
    this.activeGroup = 'todos';
    this.searchTerm = '';
    this.flippedCards = new Set();
    this.currentTheme = localStorage.getItem('qfdos_cartas_theme') || 'clean';

    this.gridEl = document.getElementById('cards-grid');
    this.filterButtonsEl = document.getElementById('group-filters');
    this.searchInputEl = document.getElementById('search-input');
    this.flipAllBtnEl = document.getElementById('btn-flip-all');
    this.themeToggleBtnEl = document.getElementById('btn-theme-toggle');
    this.printBtnEl = document.getElementById('btn-print');
    this.toastEl = document.getElementById('toast-notice');
    this.countTotalEl = document.getElementById('stat-total-count');

    this.init();
  }

  async init() {
    this.applyTheme(this.currentTheme);
    this.setupEventListeners();
    await this.loadTopicData('./data/farmacos-tema01.json');
  }

  async loadTopicData(url) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Error al cargar datos del tema');
      const data = await resp.json();
      this.farmacos = data.farmacos || [];
      if (this.countTotalEl) this.countTotalEl.textContent = this.farmacos.length;
      this.updateGroupCounts();
      this.render();
    } catch (err) {
      console.error(err);
      if (this.gridEl) {
        this.gridEl.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 48px 16px; color: var(--app-text-muted);">
          <p>No se pudieron cargar las cartas de este tema.</p>
        </div>`;
      }
    }
  }

  setupEventListeners() {
    // Buscador
    if (this.searchInputEl) {
      this.searchInputEl.addEventListener('input', (e) => {
        this.searchTerm = e.target.value;
        this.render();
      });
    }

    // Filtros de Grupo
    if (this.filterButtonsEl) {
      this.filterButtonsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        this.activeGroup = btn.dataset.group;
        this.filterButtonsEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.render();
      });
    }

    // Botón Voltear Todas
    if (this.flipAllBtnEl) {
      this.flipAllBtnEl.addEventListener('click', () => {
        const allFlipped = this.flippedCards.size === this.farmacos.length;
        if (allFlipped) {
          this.flippedCards.clear();
          this.flipAllBtnEl.querySelector('span').textContent = 'Voltear Todas';
        } else {
          this.farmacos.forEach(f => this.flippedCards.add(f.id));
          this.flipAllBtnEl.querySelector('span').textContent = 'Ver Anverso';
        }
        this.updateCardFlipStates();
      });
    }

    // Alternar Tema Limpio / Marino
    if (this.themeToggleBtnEl) {
      this.themeToggleBtnEl.addEventListener('click', () => {
        const nextTheme = this.currentTheme === 'clean' ? 'dark' : 'clean';
        this.applyTheme(nextTheme);
      });
    }

    // Botón Imprimir
    if (this.printBtnEl) {
      this.printBtnEl.addEventListener('click', () => {
        window.print();
      });
    }

    // Delegación de eventos en las cartas
    if (this.gridEl) {
      this.gridEl.addEventListener('click', (e) => {
        // Evitar giro si se hace clic en botones de acción del dorso o copia
        if (e.target.closest('.btn-card-action') || e.target.closest('.smiles-copy-btn')) {
          return;
        }

        const carta = e.target.closest('.carta-item');
        if (carta) {
          const id = carta.dataset.id;
          if (this.flippedCards.has(id)) {
            this.flippedCards.delete(id);
            carta.classList.remove('is-flipped');
            carta.setAttribute('aria-pressed', 'false');
          } else {
            this.flippedCards.add(id);
            carta.classList.add('is-flipped');
            carta.setAttribute('aria-pressed', 'true');
          }
        }
      });

      // Teclado accesible
      this.gridEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const carta = e.target.closest('.carta-item');
          if (carta && !e.target.closest('button, a')) {
            e.preventDefault();
            carta.click();
          }
        }
      });
    }

    // Selector de Temas Superior
    const topicPills = document.querySelectorAll('.topic-pill');
    topicPills.forEach(pill => {
      pill.addEventListener('click', () => {
        if (pill.dataset.topic === 'tema-01') return;
        this.showToast(`El ${pill.textContent.trim()} se incorporará en las próximas sesiones docentes.`);
      });
    });
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('qfdos_cartas_theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('theme-dark');
      if (this.themeToggleBtnEl) {
        this.themeToggleBtnEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> <span>Modo Limpio</span>`;
      }
    } else {
      document.body.classList.remove('theme-dark');
      if (this.themeToggleBtnEl) {
        this.themeToggleBtnEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> <span>Modo Marino</span>`;
      }
    }
  }

  updateGroupCounts() {
    const counts = { todos: this.farmacos.length, agonista: 0, ache: 0, antidoto: 0, antagonista: 0 };
    this.farmacos.forEach(f => {
      if (counts[f.grupo] !== undefined) counts[f.grupo]++;
    });

    document.querySelectorAll('[data-group-count]').forEach(el => {
      const g = el.dataset.groupCount;
      if (counts[g] !== undefined) el.textContent = counts[g];
    });
  }

  getFilteredFarmacos() {
    const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const term = norm(this.searchTerm.trim());

    return this.farmacos.filter(f => {
      const matchGrupo = this.activeGroup === 'todos' || f.grupo === this.activeGroup;
      if (!matchGrupo) return false;
      if (!term) return true;

      return (
        norm(f.nombre).includes(term) ||
        norm(f.rol).includes(term) ||
        norm(f.clase).includes(term) ||
        norm(f.formula).includes(term) ||
        norm(f.smiles).includes(term) ||
        norm(f.accion).includes(term) ||
        norm(f.indicacion).includes(term) ||
        norm(f.diseno).includes(term)
      );
    });
  }

  updateCardFlipStates() {
    if (!this.gridEl) return;
    const cards = this.gridEl.querySelectorAll('.carta-item');
    cards.forEach(card => {
      const id = card.dataset.id;
      const isFlipped = this.flippedCards.has(id);
      card.classList.toggle('is-flipped', isFlipped);
      card.setAttribute('aria-pressed', isFlipped ? 'true' : 'false');
    });
  }

  render() {
    if (!this.gridEl) return;
    const items = this.getFilteredFarmacos();

    if (items.length === 0) {
      this.gridEl.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: var(--app-surface); border: 1px dashed var(--app-border); border-radius: 12px;">
          <h3 style="color: var(--app-text); font-size: 1.1rem; margin-bottom: 6px;">No se encontraron moléculas</h3>
          <p style="color: var(--app-text-muted); font-size: 0.88rem;">No hay cartas que coincidan con la búsqueda "${esc(this.searchTerm)}".</p>
        </div>
      `;
      return;
    }

    this.gridEl.innerHTML = items.map(f => this.renderCard(f)).join('');
  }

  renderCard(f) {
    const isFlipped = this.flippedCards.has(f.id);
    const strokeMesh = this.currentTheme === 'dark' ? '#ffffff' : '#1e3a8a';
    const meshOpacity = this.currentTheme === 'dark' ? '0.14' : '0.05';

    const indicesHtml = ORDEN_INDICES.map(key => {
      const val = f.indices[key];
      const txt = val === null || val === undefined ? '—' : String(val).padStart(2, '0');
      const w = val === null || val === undefined ? 0 : val;
      const label = LABELS_INDICES[key] || key;
      return `
        <div class="card-indice" title="${label}: ${txt}/99">
          <b>${key}</b>
          <i><span style="width: ${w}%"></span></i>
          <em>${txt}</em>
        </div>
      `;
    }).join('');

    return `
      <div 
        class="carta-item ${isFlipped ? 'is-flipped' : ''}" 
        data-id="${esc(f.id)}" 
        data-grupo="${esc(f.grupo)}" 
        role="button" 
        tabindex="0" 
        aria-pressed="${isFlipped}"
        aria-label="Carta de ${esc(f.nombre)}, pulsar para voltear"
      >
        <div class="carta-inner">
          <!-- ANVERSO -->
          <div class="cara cara--frente">
            <svg class="trama-mesh" viewBox="0 0 240 340" aria-hidden="true">
              <defs>
                <pattern id="qf-hex-${esc(f.id)}" width="52" height="45" patternUnits="userSpaceOnUse">
                  <polygon points="13,0 39,0 52,22.5 39,45 13,45 0,22.5" fill="none" stroke="${strokeMesh}" stroke-opacity="${meshOpacity}" stroke-width="1.2"/>
                </pattern>
              </defs>
              <rect width="240" height="340" fill="url(#qf-hex-${esc(f.id)})" />
            </svg>

            <div class="card-header">
              <div>
                <div class="card-rel">${f.relevancia}</div>
                <div class="card-rol">${esc(f.rol)}</div>
              </div>
              <span class="card-badge">${esc(f.badge)}</span>
            </div>

            <div class="card-structure">
              <img src="./estructuras/${esc(f.id)}.svg" alt="Estructura 2D de ${esc(f.nombre)}" loading="lazy">
            </div>

            <div class="card-name">${esc(f.nombre)}</div>
            <div class="card-class">${esc(f.clase)}</div>
            <div class="card-rule"></div>

            <div class="card-indices">
              ${indicesHtml}
            </div>

            <div class="card-foot">
              <span>${esc(f.formula)} · ${Number(f.masa).toFixed(2)} Da</span>
              <span class="flip-hint">↺ Voltear</span>
            </div>
          </div>

          <!-- DORSO -->
          <div class="cara cara--dorso">
            <div class="card-name">${esc(f.nombre)}</div>

            <div class="smiles-box" title="Fórmula SMILES">
              <span class="smiles-text">${esc(f.smiles)}</span>
              <button 
                type="button" 
                class="smiles-copy-btn" 
                onclick="window.app.copySmiles('${esc(f.smiles)}', event)" 
                title="Copiar código SMILES"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>

            <h3>Acción Farmacológica</h3>
            <p>${esc(f.accion)}</p>

            <h3>Indicación Clínica</h3>
            <p>${esc(f.indicacion)}</p>

            <h3>Clave de Diseño SAR</h3>
            <p>${esc(f.diseno)}</p>

            <div class="exam-tip">
              <strong>Tip Examen QFDOS</strong>
              ${esc(f.examen)}
            </div>

            <div class="dorso-actions">
              <a 
                href="https://molview.org/?smiles=${encodeURIComponent(f.smiles)}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn-card-action btn-card-action--secondary"
                title="Abrir visualizador 3D en MolView"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                MolView 3D
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  copySmiles(smiles, e) {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(smiles).then(() => {
      this.showToast('SMILES copiado al portapapeles');
    }).catch(() => {
      this.showToast('No se pudo copiar el SMILES');
    });
  }

  showToast(message) {
    if (!this.toastEl) return;
    this.toastEl.textContent = message;
    this.toastEl.classList.add('is-visible');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastEl.classList.remove('is-visible');
    }, 2400);
  }
}

// Inicialización global
window.addEventListener('DOMContentLoaded', () => {
  window.app = new CartasApp();
});
