/**
 * JAMES 3D - Interactive Engine
 * Módulos: Three.js 3D Viewport, Simulador de Orçamento, Carrossel e Filtros
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicialização de todos os módulos
  initNavigation();
  initThreeJsHero();
  initBudgetCalculator();
  initPortfolioFilter();
  initTestimonialsCarousel();
});

/* ==========================================================================
   1. Navegação e Efeitos de Scroll
   ========================================================================== */
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  // Adiciona sombra e fundo ao rolar a página
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Alternar Menu Mobile
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const isOpen = mobileMenu.classList.contains('open');
      mobileBtn.setAttribute('aria-expanded', isOpen);
    });

    // Fecha o menu mobile ao clicar em um link interno
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
      });
    });
  }
}

/* ==========================================================================
   2. Three.js - Viewport 3D Interativo no Hero
   ========================================================================== */
function initThreeJsHero() {
  const container = document.getElementById('threejs-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Cena, Câmera e Renderizador
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 7.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // Iluminação de Estúdio Industrial
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const orangeSpot = new THREE.PointLight(0xf97316, 3.5, 50);
  orangeSpot.position.set(5, 5, 5);
  scene.add(orangeSpot);

  const blueSpot = new THREE.PointLight(0x38bdf8, 3, 50);
  blueSpot.position.set(-5, -3, 4);
  scene.add(blueSpot);

  const topKeyLight = new THREE.DirectionalLight(0xffffff, 1.2);
  topKeyLight.position.set(0, 10, 5);
  scene.add(topKeyLight);

  // Criação do Modelo Mecânico Técnico 3D (Torus Knot com detalhes de alta precisão)
  const group = new THREE.Group();
  scene.add(group);

  const mainGeometry = new THREE.TorusKnotGeometry(1.6, 0.48, 128, 32, 2, 3);
  
  const solidMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.25,
    wireframe: false
  });

  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0xf97316,
    wireframe: true,
    transparent: true,
    opacity: 0.85
  });

  const mesh = new THREE.Mesh(mainGeometry, solidMaterial);
  group.add(mesh);

  // Anel Exterior Estilo Guia de Calibração / Cama de Impressão
  const ringGeo = new THREE.RingGeometry(2.9, 3.0, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.35
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  // Partículas orbitais (Filamentos em suspensão)
  const particlesCount = 70;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 8;
    positions[i + 1] = (Math.random() - 0.5) * 8;
    positions[i + 2] = (Math.random() - 0.5) * 8;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const particleMat = new THREE.PointsMaterial({
    color: 0xf97316,
    size: 0.05,
    transparent: true,
    opacity: 0.7
  });
  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // Estados de Controle do Viewport
  let isAutoRotating = true;
  let isWireframe = false;
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  // Controles de Botões na Barra de Ferramentas da Janela 3D
  const wireframeBtn = document.getElementById('toggleWireframe');
  const rotateBtn = document.getElementById('toggleAutoRotate');

  if (wireframeBtn) {
    wireframeBtn.addEventListener('click', () => {
      isWireframe = !isWireframe;
      mesh.material = isWireframe ? wireframeMaterial : solidMaterial;
      wireframeBtn.classList.toggle('active', isWireframe);
    });
  }

  if (rotateBtn) {
    rotateBtn.addEventListener('click', () => {
      isAutoRotating = !isAutoRotating;
      rotateBtn.classList.toggle('active', isAutoRotating);
    });
  }

  // Interatividade com Mouse / Touch (Drag to Rotate)
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    group.rotation.y += deltaX * 0.008;
    group.rotation.x += deltaY * 0.008;

    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  // Touch para Dispositivos Móveis
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;

    group.rotation.y += deltaX * 0.008;
    group.rotation.x += deltaY * 0.008;

    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Zoom no Scroll
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.position.z += e.deltaY * 0.003;
    camera.position.z = Math.min(Math.max(camera.position.z, 4), 11);
  }, { passive: false });

  // Responsividade do Canvas
  window.addEventListener('resize', () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });

  // Loop de Renderização
  function animate() {
    requestAnimationFrame(animate);

    if (isAutoRotating && !isDragging) {
      group.rotation.y += 0.006;
      group.rotation.x += 0.003;
      ring.rotation.z -= 0.002;
    }

    particleSystem.rotation.y -= 0.001;

    renderer.render(scene, camera);
  }

  animate();
}

/* ==========================================================================
   3. Simulador / Calculadora de Orçamento Interativa
   ========================================================================== */
function initBudgetCalculator() {
  // Estado da Calculadora
  const state = {
    material: 'pla',
    materialName: 'PLA Premium',
    materialPricePerGram: 0.35,
    materialSpeedFactor: 1.0,
    infill: 20,
    layerHeight: 0.20,
    weight: 85,
    quantity: 1,
    uploadedFileName: null,
    uploadedFileSize: null
  };

  // Elementos do DOM
  const materialCards = document.querySelectorAll('.option-card');
  const infillSlider = document.getElementById('infillSlider');
  const infillValue = document.getElementById('infillValue');
  const layerSelect = document.getElementById('layerHeightSelect');
  const weightInput = document.getElementById('weightInput');
  const quantityInput = document.getElementById('quantityInput');
  const qtyMinusBtn = document.getElementById('qtyMinus');
  const qtyPlusBtn = document.getElementById('qtyPlus');

  // Drag and Drop
  const fileDropZone = document.getElementById('fileDropZone');
  const fileInput = document.getElementById('fileInput');
  const dropzoneContent = document.getElementById('dropzoneContent');
  const fileUploadedBox = document.getElementById('fileUploadedBox');
  const fileNameDisplay = document.getElementById('fileName');
  const fileSizeDisplay = document.getElementById('fileSize');
  const removeFileBtn = document.getElementById('removeFileBtn');

  // Elementos de Resumo
  const summaryMaterial = document.getElementById('summaryMaterial');
  const summaryInfill = document.getElementById('summaryInfill');
  const summaryLayer = document.getElementById('summaryLayer');
  const summaryWeight = document.getElementById('summaryWeight');
  const summaryQty = document.getElementById('summaryQty');
  const summaryFile = document.getElementById('summaryFile');
  const totalEstimatePrice = document.getElementById('totalEstimatePrice');
  const totalEstimateTime = document.getElementById('totalEstimateTime');
  const sendToWhatsAppBtn = document.getElementById('sendToWhatsAppBtn');

  // 1. Seleção de Material
  materialCards.forEach(card => {
    card.addEventListener('click', () => {
      materialCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      state.material = card.dataset.material;
      state.materialPricePerGram = parseFloat(card.dataset.price);
      state.materialSpeedFactor = parseFloat(card.dataset.speed);
      state.materialName = card.querySelector('.opt-title').textContent.trim();

      updateCalculation();
    });
  });

  // 2. Preenchimento (Infill Slider)
  if (infillSlider) {
    infillSlider.addEventListener('input', (e) => {
      state.infill = parseInt(e.target.value, 10);
      infillValue.textContent = `${state.infill}%`;
      updateCalculation();
    });
  }

  // 3. Altura de Camada
  if (layerSelect) {
    layerSelect.addEventListener('change', (e) => {
      state.layerHeight = parseFloat(e.target.value);
      updateCalculation();
    });
  }

  // 4. Peso Estimado
  if (weightInput) {
    weightInput.addEventListener('input', (e) => {
      let val = parseInt(e.target.value, 10);
      if (isNaN(val) || val < 5) val = 5;
      state.weight = val;
      updateCalculation();
    });
  }

  // 5. Quantidade (+ e -)
  if (qtyMinusBtn && qtyPlusBtn && quantityInput) {
    qtyMinusBtn.addEventListener('click', () => {
      if (state.quantity > 1) {
        state.quantity--;
        quantityInput.value = state.quantity;
        updateCalculation();
      }
    });

    qtyPlusBtn.addEventListener('click', () => {
      if (state.quantity < 500) {
        state.quantity++;
        quantityInput.value = state.quantity;
        updateCalculation();
      }
    });

    quantityInput.addEventListener('change', (e) => {
      let val = parseInt(e.target.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      state.quantity = val;
      quantityInput.value = val;
      updateCalculation();
    });
  }

  // 6. Manipulação de Arquivo (Drag and Drop / Upload)
  if (fileDropZone && fileInput) {
    ['dragenter', 'dragover'].forEach(eventName => {
      fileDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        fileDropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      fileDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        fileDropZone.classList.remove('dragover');
      });
    });

    fileDropZone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });

    if (removeFileBtn) {
      removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        state.uploadedFileName = null;
        state.uploadedFileSize = null;
        fileUploadedBox.style.display = 'none';
        dropzoneContent.style.display = 'block';
        updateCalculation();
      });
    }
  }

  function handleFileSelection(file) {
    const validExtensions = ['.stl', '.obj', '.step', '.3mf'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      alert('Por favor, selecione um arquivo 3D válido (.STL, .OBJ, .STEP ou .3MF).');
      return;
    }

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    state.uploadedFileName = file.name;
    state.uploadedFileSize = `${sizeInMb} MB`;

    fileNameDisplay.textContent = file.name;
    fileSizeDisplay.textContent = `${sizeInMb} MB`;

    dropzoneContent.style.display = 'none';
    fileUploadedBox.style.display = 'flex';

    updateCalculation();
  }

  // 7. Algoritmo de Cálculo de Preço e Tempo de Engenharia
  function updateCalculation() {
    // Fator de densidade ajustado pelo Infill (10% a 100%)
    const infillFactor = 0.8 + (state.infill / 100) * 0.4;
    const effectiveWeight = state.weight * infillFactor;

    // Fator de altura de camada (camadas menores exigem mais tempo)
    const layerFactor = 0.20 / state.layerHeight;

    // Custo base de setup + material
    const baseSetupFee = 14.00;
    const materialCost = effectiveWeight * state.materialPricePerGram;

    // Cálculo aproximado de horas de impressão
    const rawHours = (effectiveWeight * 0.04 * layerFactor * state.materialSpeedFactor);
    const totalHoursDecimal = Math.max(1.2, rawHours);
    const machineHourRate = 3.50; // Custo hora de máquina

    // Valor unitário
    const unitPrice = baseSetupFee + materialCost + (totalHoursDecimal * machineHourRate);
    const totalPrice = unitPrice * state.quantity;

    // Formatação de Horas e Minutos
    const totalPrintHours = totalHoursDecimal * state.quantity;
    const hours = Math.floor(totalPrintHours);
    const minutes = Math.round((totalPrintHours - hours) * 60);

    // Atualização da Interface
    summaryMaterial.textContent = state.materialName;
    summaryInfill.textContent = `${state.infill}%`;
    summaryLayer.textContent = `${state.layerHeight.toFixed(2)} mm`;
    summaryWeight.textContent = `${Math.round(effectiveWeight)} g`;
    summaryQty.textContent = `${state.quantity} un`;
    summaryFile.textContent = state.uploadedFileName ? `${state.uploadedFileName} (${state.uploadedFileSize})` : 'Nenhum enviado';

    totalEstimatePrice.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
    totalEstimateTime.textContent = `${hours}h ${minutes.toString().padStart(2, '0')}m`;

    // Atualização do Botão de WhatsApp com mensagem personalizada
    updateWhatsAppLink(totalPrice, hours, minutes);
  }

  function updateWhatsAppLink(price, hours, minutes) {
    if (!sendToWhatsAppBtn) return;

    const phoneNumber = '5511999999999'; // Substituir pelo WhatsApp oficial da James 3D
    const fileText = state.uploadedFileName ? `*Arquivo:* ${state.uploadedFileName} (${state.uploadedFileSize})` : '*Arquivo:* Vou enviar o arquivo por aqui';

    const message = 
      `👋 Olá James 3D! Gostaria de uma validação técnica para meu pedido de impressão 3D:\n\n` +
      `🛠 *Material:* ${state.materialName}\n` +
      `🧩 *Preenchimento:* ${state.infill}%\n` +
      `📐 *Altura de Camada:* ${state.layerHeight.toFixed(2)} mm\n` +
      `⚖️ *Massa Estimada:* ~${state.weight}g\n` +
      `🔢 *Quantidade:* ${state.quantity} peça(s)\n` +
      `📁 ${fileText}\n\n` +
      `💰 *Simulação do Site:* R$ ${price.toFixed(2).replace('.', ',')} (~${hours}h ${minutes}m)\n\n` +
      `Poderiam me passar a cotação final com prazo de entrega?`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    sendToWhatsAppBtn.onclick = () => {
      window.open(whatsappUrl, '_blank');
    };
  }

  // Executa o primeiro cálculo
  updateCalculation();
}

/* ==========================================================================
   4. Filtro Interativo do Portfólio
   ========================================================================== */
function initPortfolioFilter() {
  const filterButtons = document.querySelectorAll('.port-filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  if (filterButtons.length === 0 || portfolioCards.length === 0) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      portfolioCards.forEach(card => {
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
   5. Carrossel de Depoimentos
   ========================================================================== */
function initTestimonialsCarousel() {
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.carousel-dots .dot');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');

  if (slides.length === 0) return;

  let currentIndex = 0;
  let autoSlideTimer = null;

  function goToSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    currentIndex = (index + slides.length) % slides.length;

    slides[currentIndex].classList.add('active');
    if (dots[currentIndex]) {
      dots[currentIndex].classList.add('active');
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
      resetAutoSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
      resetAutoSlide();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index, 10);
      goToSlide(idx);
      resetAutoSlide();
    });
  });

  function startAutoSlide() {
    autoSlideTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 6000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    startAutoSlide();
  }

  startAutoSlide();
}

