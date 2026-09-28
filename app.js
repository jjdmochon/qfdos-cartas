/* ==========================================================================
   QFDOS Structural Affinity Identity System (v3.0)
   Baraja Coleccionable de Fármacos — Lógica de Aplicación Multi-Tema
   ========================================================================== */

const ORDEN_INDICES = ['AFI', 'SEL', 'EST', 'ORA', 'SNC', 'DUR'];

const DEFAULT_LABELS_INDICES = {
  AFI: 'Afinidad y potencia (0-99)',
  SEL: 'Selectividad de receptor',
  EST: 'Estabilidad metabólica',
  ORA: 'Biodisponibilidad oral',
  SNC: 'Paso barrera hematoencefálica',
  DUR: 'Duración de acción'
};

const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

class CartasApp {
  constructor() {
    this.temas = [];
    this.activeTopic = null;
    this.activeTopicData = null;
    this.farmacos = [];
    this.activeGroup = 'todos';
    this.searchTerm = '';
    this.flippedCards = new Set();
    this.currentTheme = localStorage.getItem('qfdos_cartas_theme') || 'clean';
    this.toastTimer = null;

    // Elementos del DOM
    this.gridEl = document.getElementById('cards-grid');
    this.topicPillsScrollEl = document.getElementById('topic-pills-scroll');
    this.filterButtonsEl = document.getElementById('group-filters');
    this.searchInputEl = document.getElementById('search-input');
    this.flipAllBtnEl = document.getElementById('btn-flip-all');
    this.themeToggleBtnEl = document.getElementById('btn-theme-toggle');
    this.printBtnEl = document.getElementById('btn-print');
    this.toastEl = document.getElementById('toast-notice');
    this.countTotalEl = document.getElementById('stat-total-count');
    this.statTopicLabelEl = document.getElementById('stat-topic-label');
    this.heroTopicTitleEl = document.getElementById('hero-topic-title');
    this.heroTopicSubtitleEl = document.getElementById('hero-topic-subtitle');
    this.topicNoticeBarEl = document.getElementById('topic-notice-bar');
    this.topicNoticeTextEl = document.getElementById('topic-notice-text');

    this.init();
  }

  async init() {
    this.applyTheme(this.currentTheme);
    this.setupEventListeners();
    await this.loadCatalog();
    this.handleRouting();
    window.addEventListener('hashchange', () => this.handleRouting());
  }

  async loadCatalog() {
    try {
      const resp = await fetch('./data/temas.json');
      if (!resp.ok) throw new Error('No se pudo cargar el catálogo de temas');
      this.temas = await resp.json();
      this.renderTopicPills();
    } catch (err) {
      console.warn('Fallback a tema 1 por defecto:', err);
      this.temas = [
        {
          id: 'tema-01',
          codigo: 'Tema 01',
          nombre: 'Transmisión Colinérgica',
          archivo: './data/farmacos-tema01.json',
          disponible: true,
          totalFarmacos: 15
        }
      ];
      this.renderTopicPills();
    }
  }

  renderTopicPills() {
    if (!this.topicPillsScrollEl) return;
    this.topicPillsScrollEl.innerHTML = '';

    this.temas.forEach(tema => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isActive = this.activeTopic && this.activeTopic.id === tema.id;
      btn.className = `topic-pill ${isActive ? 'is-active' : ''} ${!tema.disponible ? 'is-disabled' : ''}`;
      btn.dataset.topic = tema.id;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');

      const countBadge = tema.disponible 
        ? `<span style="font-family: var(--font-mono); font-size: 0.7rem; opacity: 0.9;">(${tema.totalFarmacos ?? 15})</span>`
        : `<span class="pill-badge-proximamente">Próximamente</span>`;

      btn.innerHTML = `
        <span>${esc(tema.codigo)} · ${esc(tema.nombre)}</span>
        ${countBadge}
      `;

      btn.addEventListener('click', () => {
        if (!tema.disponible) {
          this.showToast(`El ${tema.codigo} (${tema.nombre}) se incorporará en las próximas sesiones docentes.`);
          return;
        }
        if (window.location.hash !== `#${tema.id}`) {
          window.location.hash = `#${tema.id}`;
        } else {
          this.switchTopic(tema.id);
        }
      });

      this.topicPillsScrollEl.appendChild(btn);
    });
  }

  handleRouting() {
    const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
    let target = this.temas.find(t => t.id === rawHash || t.codigo?.toLowerCase().replace(/\s+/g, '-') === rawHash);

    if (!target || !target.disponible) {
      target = this.temas.find(t => t.disponible) || this.temas[0];
    }

    if (target) {
      this.switchTopic(target.id);
    }
  }

  async switchTopic(topicId) {
    if (this.activeTopic && this.activeTopic.id === topicId && this.farmacos.length > 0) {
      return;
    }

    const topic = this.temas.find(t => t.id === topicId);
    if (!topic) return;

    this.activeTopic = topic;
    this.searchTerm = '';
    if (this.searchInputEl) this.searchInputEl.value = '';
    this.flippedCards.clear();
    if (this.flipAllBtnEl) {
      const span = this.flipAllBtnEl.querySelector('span');
      if (span) span.textContent = 'Voltear Todas';
    }

    // Actualizar píldoras activas
    if (this.topicPillsScrollEl) {
      const pills = this.topicPillsScrollEl.querySelectorAll('.topic-pill');
      pills.forEach(p => {
        const isCurrent = p.dataset.topic === topic.id;
        p.classList.toggle('is-active', isCurrent);
        p.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      });
    }

    const dataUrl = topic.archivo || `./data/farmacos-${topic.id}.json`;
    await this.loadTopicData(dataUrl);
  }

  async loadTopicData(url) {
    try {
      if (this.gridEl) {
        this.gridEl.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 48px 16px; color: var(--app-text-muted);">
            <p>Cargando monografías moleculares...</p>
          </div>
        `;
      }

      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Error al cargar datos del tema');
      const data = await resp.json();
      this.activeTopicData = data;
      this.farmacos = data.farmacos || [];

      // Actualizar contadores y cabecera del Hero
      if (this.countTotalEl) this.countTotalEl.textContent = this.farmacos.length;
      if (this.statTopicLabelEl && this.activeTopic) {
        this.statTopicLabelEl.textContent = this.activeTopic.codigo;
      }
      if (this.heroTopicTitleEl) {
        this.heroTopicTitleEl.textContent = `Baraja Coleccionable · ${data.titulo || this.activeTopic?.nombre || 'Fármacos'}`;
      }
      if (this.heroTopicSubtitleEl) {
        this.heroTopicSubtitleEl.textContent = this.activeTopic?.subtitulo || this.activeTopic?.descripcion || 'Monografías moleculares 2D con parámetros SAR comparativos.';
      }

      // Nota docente y metodológica del tema
      if (this.topicNoticeBarEl && this.topicNoticeTextEl) {
        if (data.nota) {
          this.topicNoticeTextEl.textContent = data.nota;
          this.topicNoticeBarEl.style.display = 'block';
        } else {
          this.topicNoticeBarEl.style.display = 'none';
        }
      }

      this.renderGroupFilters();
      this.render();
    } catch (err) {
      console.error(err);
      if (this.gridEl) {
        this.gridEl.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 48px 16px; color: var(--app-text-muted); background: var(--app-surface); border: 1px dashed var(--app-border); border-radius: 12px;">
            <p style="font-weight: 600; color: var(--app-text); margin-bottom: 6px;">Contenido en preparación</p>
            <p style="font-size: 0.88rem;">Las cartas de este tema se publicarán próximamente.</p>
          </div>
        `;
      }
      if (this.filterButtonsEl) {
        this.filterButtonsEl.innerHTML = '';
      }
    }
  }

  renderGroupFilters() {
    if (!this.filterButtonsEl) return;
    this.filterButtonsEl.innerHTML = '';
    this.activeGroup = 'todos';

    const groupCounts = { todos: this.farmacos.length };
    this.farmacos.forEach(f => {
      const g = f.grupo || 'otros';
      groupCounts[g] = (groupCounts[g] || 0) + 1;
    });

    // Mapeo de etiquetas
    const etiquetas = this.activeTopicData?.grupos || {};

    // Botón Todos
    const todosBtn = document.createElement('button');
    todosBtn.type = 'button';
    todosBtn.className = 'filter-btn active';
    todosBtn.dataset.group = 'todos';
    todosBtn.innerHTML = `Todos <span class="filter-count" data-group-count="todos">${groupCounts.todos}</span>`;
    this.filterButtonsEl.appendChild(todosBtn);

    // Si el tema tiene un diccionario de grupos especificado
    if (Object.keys(etiquetas).length > 0) {
      Object.entries(etiquetas).forEach(([clave, etiqueta]) => {
        const count = groupCounts[clave] || 0;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'filter-btn';
        btn.dataset.group = clave;
        btn.innerHTML = `${esc(etiqueta)} <span class="filter-count" data-group-count="${esc(clave)}">${count}</span>`;
        this.filterButtonsEl.appendChild(btn);
      });
    } else {
      // Extracción automática a partir de los datos
      const uniqueGroups = Array.from(new Set(this.farmacos.map(f => f.grupo).filter(Boolean)));
      uniqueGroups.forEach(g => {
        const count = groupCounts[g] || 0;
        const nombreGrupo = g.charAt(0).toUpperCase() + g.slice(1);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'filter-btn';
        btn.dataset.group = g;
        btn.innerHTML = `${esc(nombreGrupo)} <span class="filter-count" data-group-count="${esc(g)}">${count}</span>`;
        this.filterButtonsEl.appendChild(btn);
      });
    }

    // Delegación de eventos en los botones de filtro
    this.filterButtonsEl.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeGroup = btn.dataset.group;
        this.filterButtonsEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.render();
      });
    });
  }

  setupEventListeners() {
    // Buscador
    if (this.searchInputEl) {
      this.searchInputEl.addEventListener('input', (e) => {
        this.searchTerm = e.target.value;
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
        if (
          e.target.closest('.btn-card-action') || 
          e.target.closest('.smiles-copy-btn') ||
          e.target.closest('.dorso-scroll')
        ) {
          return;
        }

        const carta = e.target.closest('.carta-item');
        if (carta) {
          const id = carta.dataset.id;
          this.toggleCardFlip(id, e);
        }
      });

      // Teclado accesible (Enter o Espacio para girar)
      this.gridEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const carta = e.target.closest('.carta-item');
          if (carta && !e.target.closest('button, a, input')) {
            e.preventDefault();
            const id = carta.dataset.id;
            this.toggleCardFlip(id, e);
          }
        }
      });
    }
  }

  toggleCardFlip(id, e) {
    if (e) {
      e.stopPropagation();
    }
    const cardEl = this.gridEl?.querySelector(`.carta-item[data-id="${id}"]`);
    if (this.flippedCards.has(id)) {
      this.flippedCards.delete(id);
      if (cardEl) {
        cardEl.classList.remove('is-flipped');
        cardEl.setAttribute('aria-pressed', 'false');
      }
    } else {
      this.flippedCards.add(id);
      if (cardEl) {
        cardEl.classList.add('is-flipped');
        cardEl.setAttribute('aria-pressed', 'true');
      }
    }
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
    // Re-render para actualizar el patrón vectorial SVG
    if (this.farmacos.length > 0) {
      this.render();
    }
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

    const indicesLabels = this.activeTopicData?.indices || DEFAULT_LABELS_INDICES;

    const indicesHtml = ORDEN_INDICES.map(key => {
      const val = f.indices ? f.indices[key] : null;
      const txt = val === null || val === undefined ? '—' : String(val).padStart(2, '0');
      const w = val === null || val === undefined ? 0 : val;
      const label = indicesLabels[key] || DEFAULT_LABELS_INDICES[key] || key;
      return `
        <div class="card-indice" title="${esc(label)}: ${txt}/99">
          <b>${key}</b>
          <i><span style="width: ${w}%"></span></i>
          <em>${txt}</em>
        </div>
      `;
    }).join('');

    const estructuraSrc = f.estructura || `./estructuras/${esc(f.id)}.svg`;

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
                <div class="card-rel">${f.relevancia ?? 90}</div>
                <div class="card-rol">${esc(f.rol)}</div>
              </div>
              <div class="card-header-right">
                <span class="card-badge">${esc(f.badge)}</span>
                <div class="card-brand-stamp" title="Química Farmacéutica II (Grupo E)">
                  <img src="./assets/Marca/qfdos-isotipo.png" alt="QFDOS" onerror="if(!this.src.includes('i.ibb.co'))this.src='https://i.ibb.co/HLCYDc3c/Logo-primario-QFDOS.png'">
                  <span>QFDOS</span>
                </div>
              </div>
            </div>

            <div class="card-structure">
              <img src="${esc(estructuraSrc)}" alt="Estructura 2D de ${esc(f.nombre)}" loading="lazy" onerror="this.style.opacity=0.3">
            </div>

            <div class="card-name">${esc(f.nombre)}</div>
            <div class="card-class">${esc(f.clase)}</div>
            <div class="card-rule"></div>

            <div class="card-indices">
              ${indicesHtml}
            </div>

            <div class="card-foot">
              <span>${esc(f.formula)} · ${Number(f.masa).toFixed(2)} Da</span>
              <span class="flip-hint">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Girar
              </span>
            </div>
          </div>

          <!-- DORSO -->
          <div class="cara cara--dorso">
            <svg class="trama-mesh" viewBox="0 0 240 340" aria-hidden="true">
              <rect width="240" height="340" fill="url(#qf-hex-${esc(f.id)})" />
            </svg>

            <!-- Cabecera Dorso con botón voltear -->
            <div class="dorso-header" onclick="window.app.toggleCardFlip('${esc(f.id)}', event)" title="Pulsar para voltear al anverso">
              <div class="card-name">${esc(f.nombre)}</div>
              <div class="dorso-header-right">
                <span class="card-badge" style="font-size: 9px; padding: 2px 6px;">${esc(f.badge)}</span>
                <div class="card-brand-stamp" title="Química Farmacéutica II (Grupo E)">
                  <img src="./assets/Marca/qfdos-isotipo.png" alt="QFDOS" onerror="if(!this.src.includes('i.ibb.co'))this.src='https://i.ibb.co/HLCYDc3c/Logo-primario-QFDOS.png'">
                  <span>QFDOS</span>
                </div>
              </div>
            </div>

            <!-- Contenido scrollable del dorso -->
            <div class="dorso-scroll" onclick="event.stopPropagation()">
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
                <strong>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 3px;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                  Tip Examen QFDOS
                </strong>
                ${esc(f.examen)}
              </div>
            </div>

            <!-- Botón Voltear en Dorso (anula botones rotos 3D y ADMET) -->
            <div class="dorso-actions" onclick="event.stopPropagation()">
              <button 
                type="button" 
                class="btn-card-action btn-card-action--flip"
                onclick="window.app.toggleCardFlip('${esc(f.id)}', event)"
                title="Voltear carta al anverso"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Voltear al anverso
              </button>
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
    }, 2500);
  }
}

// Inicialización global
window.addEventListener('DOMContentLoaded', () => {
  window.app = new CartasApp();
});
