/**
 * ZAPACH CLUB - Interactive Engine
 * Módulos: Three.js 3D Viewport, Pricing Toggle, Filtros de Galeria, Modais e FAQ
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initThreeJsHero();
  initPricingToggle();
  initGalleryFilter();
  initFaqAccordion();
  initDemoModal();
  initInspectorModal();
  initScrollSpy();
});

/* ==========================================================================
   1. Navegação, Scroll & Menu Mobile
   ========================================================================== */
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileDropdown = document.getElementById('mobileDropdown');
  const mobLinks = document.querySelectorAll('.mob-link');

  // Adiciona fundo escuro na navbar ao rolar
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Alterna o menu mobile
  if (mobileBtn && mobileDropdown) {
    mobileBtn.addEventListener('click', () => {
      mobileDropdown.classList.toggle('open');
      const isOpen = mobileDropdown.classList.contains('open');
      mobileBtn.setAttribute('aria-expanded', isOpen);
    });

    // Fecha o menu ao clicar em qualquer link
    mobLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDropdown.classList.remove('open');
      });
    });
  }

  // Botão chip ".STL / .3MF" na navbar faz scroll até o hero e aciona feedback
  const themeTrigger = document.getElementById('themeModeTrigger');
  if (themeTrigger) {
    themeTrigger.addEventListener('click', () => {
      const hero = document.getElementById('inicio');
      if (hero) hero.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/* ==========================================================================
   2. Three.js - Viewport 3D Interativo no Hero (Modelo Manifold)
   ========================================================================== */
function initThreeJsHero() {
  const container = document.getElementById('hero3dCanvas');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Criação de Cena, Câmera e Renderizador
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 6.8);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  container.appendChild(renderer.domElement);

  // Iluminação Industrial com tons Ciano e Violeta Neon
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambientLight);

  const cyanLight = new THREE.PointLight(0x00f2fe, 3.5, 45);
  cyanLight.position.set(4, 5, 4);
  scene.add(cyanLight);

  const violetLight = new THREE.PointLight(0x8b5cf6, 3.0, 45);
  violetLight.position.set(-4, -3, 3);
  scene.add(violetLight);

  const topKey = new THREE.DirectionalLight(0xffffff, 1.2);
  topKey.position.set(0, 8, 4);
  scene.add(topKey);

  // Grupo Central do Modelo 3D
  const mainGroup = new THREE.Group();
  scene.add(mainGroup);

  // 1. Geometria Principal: Poliedro Multifacetado Robótico (Icosaedro detalhado)
  const geom = new THREE.IcosahedronGeometry(1.65, 2);

  // Material Sólido (Manifold / Resina Fosca)
  const solidMaterial = new THREE.MeshStandardMaterial({
    color: 0x11192b,
    metalness: 0.8,
    roughness: 0.25,
    wireframe: false
  });

  // Material de Malha Técnica (Wireframe Ciano Neon)
  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00f2fe,
    wireframe: true,
    transparent: true,
    opacity: 0.85
  });

  const mesh = new THREE.Mesh(geom, solidMaterial);
  mainGroup.add(mesh);

  // 2. Anéis de Simulação de Camada de Fatiamento (Slicer Horizontal Layers)
  const layersGroup = new THREE.Group();
  const layerCount = 18;
  const layerSpacing = 0.16;

  for (let i = -layerCount / 2; i <= layerCount / 2; i++) {
    const ringRadius = Math.cos((i / (layerCount / 2)) * (Math.PI / 2.5)) * 1.68;
    if (ringRadius > 0.3) {
      const ringGeo = new THREE.RingGeometry(ringRadius - 0.015, ringRadius, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: (i % 2 === 0) ? 0x00f2fe : 0x8b5cf6,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = i * layerSpacing;
      layersGroup.add(ringMesh);
    }
  }
  mainGroup.add(layersGroup);

  // 3. Grid da Cama de Impressão (Base Plate Slicer)
  const gridHelper = new THREE.GridHelper(4.5, 18, 0x00f2fe, 0x1e293b);
  gridHelper.position.y = -2.1;
  mainGroup.add(gridHelper);

  // Estados de Controle do Mockup
  let isWireframe = false;
  let isLayersVisible = true;
  let isAutoRotating = true;
  let isDragging = false;
  let previousMousePos = { x: 0, y: 0 };

  // Botões de Controle no Mockup
  const wireBtn = document.getElementById('toggleMeshWireframe');
  const layerBtn = document.getElementById('toggleSliceLayer');

  if (wireBtn) {
    wireBtn.addEventListener('click', () => {
      isWireframe = !isWireframe;
      mesh.material = isWireframe ? wireframeMaterial : solidMaterial;
      wireBtn.classList.toggle('active', isWireframe);
    });
  }

  if (layerBtn) {
    layerBtn.addEventListener('click', () => {
      isLayersVisible = !isLayersVisible;
      layersGroup.visible = isLayersVisible;
      layerBtn.classList.toggle('active', isLayersVisible);
    });
  }

  // Interação de Rotação por Arrasto (Drag to Rotate)
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePos = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePos.x;
    const deltaY = e.clientY - previousMousePos.y;

    mainGroup.rotation.y += deltaX * 0.008;
    mainGroup.rotation.x += deltaY * 0.008;

    previousMousePos = { x: e.clientX, y: e.clientY };
  });

  // Suporte a Touch para Smartphones
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - previousMousePos.x;
    const deltaY = e.touches[0].clientY - previousMousePos.y;

    mainGroup.rotation.y += deltaX * 0.008;
    mainGroup.rotation.x += deltaY * 0.008;

    previousMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Zoom pelo Scroll
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.position.z += e.deltaY * 0.003;
    camera.position.z = Math.min(Math.max(camera.position.z, 4), 9.5);
  }, { passive: false });

  // Responsividade
  window.addEventListener('resize', () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });

  // Loop de Animação
  function animate() {
    requestAnimationFrame(animate);

    if (isAutoRotating && !isDragging) {
      mainGroup.rotation.y += 0.007;
      mainGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.12;
    }

    renderer.render(scene, camera);
  }

  animate();
}

/* ==========================================================================
   3. Seção de Planos (Pricing Toggle Mensal / Anual)
   ========================================================================== */
function initPricingToggle() {
  const pricingSwitch = document.getElementById('pricingSwitch');
  const optMonthly = document.getElementById('billingMonthly');
  const optAnnual = document.getElementById('billingAnnual');

  const priceStarter = document.getElementById('priceStarter');
  const pricePro = document.getElementById('pricePro');
  const priceStudio = document.getElementById('priceStudio');

  const noteStarter = document.getElementById('noteStarter');
  const notePro = document.getElementById('notePro');
  const noteStudio = document.getElementById('noteStudio');

  if (!pricingSwitch) return;

  function updatePricing(isAnnual) {
    if (isAnnual) {
      optMonthly.classList.remove('active');
      optAnnual.classList.add('active');

      // Valores com 30% de economia anual
      animatePrice(priceStarter, 27);
      animatePrice(pricePro, 47);
      animatePrice(priceStudio, 99);

      noteStarter.textContent = 'Cobrado anualmente (R$ 324/ano) • Economize R$ 144';
      notePro.textContent = 'Cobrado anualmente (R$ 564/ano) • Mais vantajoso';
      noteStudio.textContent = 'Cobrado anualmente (R$ 1.188/ano) • Suporte total';
    } else {
      optMonthly.classList.add('active');
      optAnnual.classList.remove('active');

      animatePrice(priceStarter, 39);
      animatePrice(pricePro, 67);
      animatePrice(priceStudio, 147);

      noteStarter.textContent = 'Cobrado mensalmente • Sem fidelidade';
      notePro.textContent = 'Cobrado mensalmente • Acesso total imediato';
      noteStudio.textContent = 'Até 5 licenças simultâneas de equipe';
    }
  }

  pricingSwitch.addEventListener('change', (e) => {
    updatePricing(e.target.checked);
  });

  if (optMonthly) {
    optMonthly.addEventListener('click', () => {
      pricingSwitch.checked = false;
      updatePricing(false);
    });
  }

  if (optAnnual) {
    optAnnual.addEventListener('click', () => {
      pricingSwitch.checked = true;
      updatePricing(true);
    });
  }

  function animatePrice(element, targetValue) {
    if (!element) return;
    element.style.opacity = '0';
    element.style.transform = 'translateY(-6px)';
    setTimeout(() => {
      element.textContent = targetValue;
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 150);
  }
}

/* ==========================================================================
   4. Filtro de Categorias da Galeria de Projetos
   ========================================================================== */
function initGalleryFilter() {
  const tabs = document.querySelectorAll('.gal-tab');
  const cards = document.querySelectorAll('.gallery-flow-card');

  if (tabs.length === 0 || cards.length === 0) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;

      cards.forEach(card => {
        const category = card.dataset.category;
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* ==========================================================================
   5. Perguntas Frequentes (FAQ Accordion)
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Fecha todos os outros itens para manter o accordion limpo
      faqItems.forEach(f => f.classList.remove('active'));

      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   6. Modal Interativo de Demonstração (Ver Demonstração)
   ========================================================================== */
function initDemoModal() {
  const openBtn = document.getElementById('openDemoModalBtn');
  const triggerFlowBtn = document.getElementById('triggerFlowDemoBtn');
  const modal = document.getElementById('demoModal');
  const closeBtn = document.getElementById('closeDemoModalBtn');

  const sampleButtons = document.querySelectorAll('.sample-btn');
  const sourceImg = document.getElementById('demoSourceImg');
  const resultName = document.getElementById('demoResultName');

  const sampleData = {
    robo: {
      img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=350&q=80',
      fileName: 'robo_futurista_manifold.3mf'
    },
    suporte: {
      img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=350&q=80',
      fileName: 'suporte_ergonomico.stl'
    },
    engrenagem: {
      img: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=350&q=80',
      fileName: 'guia_rolamento_608.3mf'
    }
  };

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (triggerFlowBtn) triggerFlowBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Fecha clicando fora
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Tecla ESC fecha
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Alterna as amostras no modal
  sampleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sampleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const sampleKey = btn.dataset.sample;
      if (sampleData[sampleKey]) {
        sourceImg.src = sampleData[sampleKey].img;
        resultName.innerHTML = `<strong>Arquivo:</strong> ${sampleData[sampleKey].fileName}`;
      }
    });
  });
}

/* ==========================================================================
   7. Modal de Inspeção de Projeto (Galeria)
   ========================================================================== */
const projectInspectionData = {
  'headset-stand': {
    title: 'Suporte Minimalista para Headset',
    desc: 'Projetado com base alargada para centro de gravidade estável e curvatura de apoio que não deforma a almofada do fone de ouvido.',
    specs: [
      { label: 'Formatos Prontos', val: '.STL & .3MF' },
      { label: 'Volume da Peça', val: '86 cm³' },
      { label: 'Tempo de Fatiamento', val: '2h 45m' },
      { label: 'Filamento Indicado', val: 'PLA ou PETG' },
      { label: 'Suportes Necessários', val: '0% (Sem suportes)' },
      { label: 'Malha', val: '100% Manifold (0 erros)' }
    ]
  },
  'twisted-vase': {
    title: 'Vaso Geométrico Torcido (Modo Espiral)',
    desc: 'Otimizado especificamente para impressão em vaso contínuo (Vase Mode), garantindo estanqueidade de água e acabamento de peça de design de luxo.',
    specs: [
      { label: 'Formatos Prontos', val: '.STL & .3MF' },
      { label: 'Volume da Peça', val: '38 cm³' },
      { label: 'Tempo de Fatiamento', val: '1h 15m' },
      { label: 'Filamento Indicado', val: 'PETG Translúcido ou Silk' },
      { label: 'Modo Fatiador', val: 'Spiralize Outer Contour' },
      { label: 'Altura da Camada', val: '0.24mm recomendada' }
    ]
  },
  'bearing-guide': {
    title: 'Guia de Filamento Articulado com Rolamento',
    desc: 'Tolerâncias mecânicas precisas de 0.15mm com alojamento para rolamento padrão 608 skate, aliviando a fricção do extrusor.',
    specs: [
      { label: 'Formatos Prontos', val: '.3MF Multi-peça' },
      { label: 'Volume da Peça', val: '24 cm³' },
      { label: 'Tempo de Fatiamento', val: '55 minutos' },
      { label: 'Filamento Indicado', val: 'ABS ou PETG' },
      { label: 'Tolerância do Encaixe', val: '0.15mm (Prensa manual)' },
      { label: 'Infill Recomendado', val: '40% Gyroid' }
    ]
  }
};

function initInspectorModal() {
  const modal = document.getElementById('inspectorModal');
  const closeBtn = document.getElementById('closeInspectorBtn');

  if (!modal) return;

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

// Função global chamada pelos botões "Inspecionar Modelo" da galeria
window.openModelInspector = function(modelKey) {
  const modal = document.getElementById('inspectorModal');
  const titleEl = document.getElementById('inspectorTitle');
  const descEl = document.getElementById('inspectorDescription');
  const specsGrid = document.getElementById('inspectorSpecsGrid');

  if (!modal || !projectInspectionData[modelKey]) return;

  const data = projectInspectionData[modelKey];
  titleEl.textContent = data.title;
  descEl.textContent = data.desc;

  specsGrid.innerHTML = '';
  data.specs.forEach(spec => {
    const div = document.createElement('div');
    div.className = 'spec-item-box';
    div.innerHTML = `
      <span class="spec-item-title">${spec.label}</span>
      <span class="spec-item-val">${spec.val}</span>
    `;
    specsGrid.appendChild(div);
  });

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

/* ==========================================================================
   8. ScrollSpy (Ativação automática do link do menu ao rolar)
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });
}

