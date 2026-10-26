/* ==========================================================================
   Print Verse — Interactive Logic & 3D Studio Preview Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Mobile Navbar Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // 3. Hero Section — Interactive 3D Mode Switcher (Imagem ➔ 3D / Wireframe .STL / Slicer .3MF)
  const heroModeBtns = document.querySelectorAll('.hero-mode-btn');
  const heroSlicerOverlay = document.getElementById('hero-slicer-overlay');
  const heroWireframeOverlay = document.getElementById('hero-wireframe-overlay');
  const hero3dLabel = document.getElementById('hero-3d-label');
  const heroTrisCount = document.getElementById('hero-tris-count');
  const heroRenderTime = document.getElementById('hero-render-time');

  heroModeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-hero-mode');

      heroModeBtns.forEach((b) => {
        b.classList.remove('bg-[#ff5500]', 'text-white', 'active');
        b.classList.add('text-slate-400');
      });
      btn.classList.add('bg-[#ff5500]', 'text-white', 'active');
      btn.classList.remove('text-slate-400');

      if (mode === 'split') {
        heroSlicerOverlay.style.opacity = '0';
        heroWireframeOverlay.style.opacity = '0';
        hero3dLabel.className = 'font-display font-extrabold text-3xl sm:text-4xl tracking-tight extruded-text-orange select-none block';
        heroTrisCount.textContent = '38.620 tris';
        heroRenderTime.textContent = 'Conversão: 00m 08s';
      } else if (mode === 'wireframe') {
        heroSlicerOverlay.style.opacity = '0';
        heroWireframeOverlay.style.opacity = '1';
        hero3dLabel.className = 'font-display font-extrabold text-3xl sm:text-4xl tracking-tight extruded-text-cyan select-none block';
        heroTrisCount.textContent = '.STL Binário (1.9 MB)';
        heroRenderTime.textContent = 'Malha: 100% Fechada';
      } else if (mode === 'slicer') {
        heroWireframeOverlay.style.opacity = '0';
        heroSlicerOverlay.style.opacity = '1';
        hero3dLabel.className = 'font-display font-extrabold text-3xl sm:text-4xl tracking-tight extruded-text-orange select-none block';
        heroTrisCount.textContent = '22 Camadas (0.20mm)';
        heroRenderTime.textContent = '.3MF Multicolor (AMS Ready)';
      }
    });
  });

  // Subtle Mouse Parallax on Hero Viewport
  const heroViewport = document.getElementById('hero-viewport');
  const hero3dObject = document.getElementById('hero-3d-object');

  if (heroViewport && hero3dObject) {
    heroViewport.addEventListener('mousemove', (e) => {
      const rect = heroViewport.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      hero3dObject.style.transform = `perspective(700px) rotateY(${x * 16}deg) rotateX(${-y * 14}deg)`;
    });

    heroViewport.addEventListener('mouseleave', () => {
      hero3dObject.style.transform = '';
    });
  }

  // ========================================================================
  // 4. EDITOR ONLINE: CONTROLES DINÂMICOS, MODO DE ESTRUTURA & PRÉVIA 3D
  // ========================================================================

  // --- Elementos do Modo de Estrutura ---
  const btnModeBase = document.getElementById('btn-mode-base');
  const btnModeStandalone = document.getElementById('btn-mode-standalone');
  const structureModeBadge = document.getElementById('structure-mode-badge');
  const previewActiveModeLabel = document.getElementById('preview-active-mode-label');
  const editor3dPiece = document.getElementById('editor-3d-piece');
  const editorBaseBevel = document.getElementById('editor-base-bevel');
  const standaloneBridgeBar = document.getElementById('standalone-bridge-bar');
  const reliefModeToggleGroup = document.getElementById('relief-mode-toggle-group');

  // --- Elementos de Conteúdo & Upload ---
  const liveBrandInput = document.getElementById('live-brand-input');
  const imageDropzone = document.getElementById('image-dropzone');
  const imageUploadInput = document.getElementById('image-upload-input');
  const dropzoneEmptyState = document.getElementById('dropzone-empty-state');
  const dropzoneLoadedState = document.getElementById('dropzone-loaded-state');
  const dropzoneThumbPreview = document.getElementById('dropzone-thumb-preview');
  const dropzoneFileName = document.getElementById('dropzone-file-name');
  const btnRemoveImage = document.getElementById('btn-remove-image');

  // --- Elementos de Tipografia ---
  const fontSelector = document.getElementById('font-selector');

  // --- Elementos de Altura / Espessura ---
  const reliefDepthSlider = document.getElementById('relief-depth-slider');
  const reliefDepthVal = document.getElementById('relief-depth-val');
  const baseThicknessSlider = document.getElementById('base-thickness-slider');
  const baseThicknessVal = document.getElementById('base-thickness-val');
  const totalThicknessBadge = document.getElementById('total-thickness-badge');
  const editorZDimension = document.getElementById('editor-z-dimension');
  const previewDimensions = document.getElementById('preview-dimensions');
  const btnReliefPositive = document.getElementById('btn-relief-positive');
  const btnReliefNegative = document.getElementById('btn-relief-negative');

  // --- Elementos do Gerenciador de Furo ---
  const keychainHoleToggle = document.getElementById('keychain-hole-toggle');
  const holePosBtns = document.querySelectorAll('.hole-pos-btn');
  const editorKeychainRing = document.getElementById('editor-keychain-ring');

  // --- Elementos da Pré-Visualização 3D ---
  const previewReferenceImg = document.getElementById('preview-reference-img');
  const previewMiniText = document.getElementById('preview-mini-text');
  const previewBadgeLabel = document.getElementById('preview-badge-label');
  const editorReliefContainer = document.getElementById('editor-relief-container');
  const editor3dImg = document.getElementById('editor-3d-img');
  const editor3dText = document.getElementById('editor-3d-text');
  const editorStatusTitle = document.getElementById('editor-status-title');
  const editorStatusDesc = document.getElementById('editor-status-desc');
  const editorModeIndicator = document.getElementById('editor-mode-indicator');

  // --- Estados do Editor ---
  let structureMode = 'base'; // 'base' (Opção A) | 'standalone' (Opção B)
  let currentFont = 'font-3d-inter';
  let reliefDepth = 3.0; // mm
  let baseThickness = 4.5; // mm
  let reliefMode = 'positive'; // 'positive' | 'negative'
  let holeEnabled = true;
  let holePosition = 'right'; // 'left' | 'right' | 'top'
  let uploadedImageSrc = null;

  // --- Atualização Completa da Peça 3D em Tempo Real ---
  const update3DScene = () => {
    const textVal = liveBrandInput?.value.trim() || 'PrintVerse';
    const totalZ = structureMode === 'base' ? baseThickness + reliefDepth : baseThickness;

    // 1. Atualiza leitura de milímetros e dimensões
    if (reliefDepthVal) reliefDepthVal.textContent = `${reliefDepth.toFixed(1)} mm`;
    if (baseThicknessVal) baseThicknessVal.textContent = `${baseThickness.toFixed(1)} mm`;
    if (totalThicknessBadge) totalThicknessBadge.textContent = `Total: ${totalZ.toFixed(1)} mm`;
    if (editorZDimension) editorZDimension.textContent = `${totalZ.toFixed(1)}mm`;
    if (previewDimensions) {
      const lengthX = Math.max(68, textVal.length * 11 + (holeEnabled ? 12 : 0));
      previewDimensions.textContent = `${lengthX} × 32 × ${totalZ.toFixed(1)} mm`;
    }

    // 2. Aplica Modo de Estrutura
    if (structureMode === 'base') {
      // OPÇÃO A: Texto/Logo sobre Base Sólida
      if (editor3dPiece) {
        editor3dPiece.classList.add('mode-base-container');
        editor3dPiece.classList.remove('mode-standalone-container');
      }
      if (editorBaseBevel) editorBaseBevel.classList.remove('hidden');
      if (standaloneBridgeBar) {
        standaloneBridgeBar.className = 'w-36 h-1.5 rounded-full bg-[#ff5500] mx-auto mt-1 shadow-[0_2px_0_#993300]';
      }
      if (structureModeBadge) {
        structureModeBadge.textContent = 'Sobre Base';
        structureModeBadge.className = 'text-[10px] font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/25';
      }
      if (previewActiveModeLabel) {
        previewActiveModeLabel.textContent = 'SOBRE BASE';
        previewActiveModeLabel.className = 'text-orange-600 font-bold';
      }
      if (reliefModeToggleGroup) reliefModeToggleGroup.classList.remove('hidden');
      if (editorModeIndicator) {
        editorModeIndicator.textContent = reliefMode === 'positive' ? 'Sobre Base (+)' : 'Sobre Base (-)';
      }
      if (editorStatusTitle) editorStatusTitle.textContent = 'Texto/Logo sobre Base sólida';
      if (editorStatusDesc) {
        editorStatusDesc.textContent = `Base com ${baseThickness.toFixed(1)}mm e relevo de ${reliefDepth.toFixed(1)}mm pronto para .STL e .3MF`;
      }
    } else {
      // OPÇÃO B: Texto/Logo como Peça Inteiriça (Monolítica)
      if (editor3dPiece) {
        editor3dPiece.classList.remove('mode-base-container');
        editor3dPiece.classList.add('mode-standalone-container');
      }
      if (editorBaseBevel) editorBaseBevel.classList.add('hidden');
      if (standaloneBridgeBar) {
        standaloneBridgeBar.className = 'w-48 standalone-bridge-bar mx-auto mt-1 block';
      }
      if (structureModeBadge) {
        structureModeBadge.textContent = 'Peça Inteiriça';
        structureModeBadge.className = 'text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/25';
      }
      if (previewActiveModeLabel) {
        previewActiveModeLabel.textContent = 'PEÇA INTEIRIÇA';
        previewActiveModeLabel.className = 'text-cyan-600 font-bold';
      }
      if (reliefModeToggleGroup) reliefModeToggleGroup.classList.add('hidden');
      if (editorModeIndicator) editorModeIndicator.textContent = 'Peça Monolítica';
      if (editorStatusTitle) editorStatusTitle.textContent = 'Peça inteiriça contínua calculada';
      if (editorStatusDesc) {
        editorStatusDesc.textContent = `Letras interligadas com ponte estrutural contínua de ${baseThickness.toFixed(1)}mm de espessura`;
      }
    }

    // 3. Tipografia Selecionada
    const allFontClasses = ['font-3d-inter', 'font-3d-space', 'font-3d-righteous', 'font-3d-bebas', 'font-3d-fredoka'];
    if (editor3dText) {
      allFontClasses.forEach((cls) => editor3dText.classList.remove(cls));
      editor3dText.classList.add(currentFont);
    }
    if (previewMiniText) {
      allFontClasses.forEach((cls) => previewMiniText.classList.remove(cls));
      previewMiniText.classList.add(currentFont);
    }

    // 4. Sombras 3D e Extrusão baseada no Relevo
    if (structureMode === 'base' && reliefMode === 'negative') {
      // Baixo-Relevo (Sunken)
      if (editorReliefContainer) {
        editorReliefContainer.className = 'relative z-10 text-center flex flex-col items-center justify-center relief-sunken transition-all duration-300 py-4';
      }
      if (editor3dText) {
        editor3dText.style.textShadow = `0 -1px 1px rgba(255, 255, 255, 0.25), 0 ${Math.round(reliefDepth)}px 2px rgba(0,0,0,0.95)`;
      }
      if (editor3dImg) {
        editor3dImg.style.filter = `drop-shadow(0 -1px 1px rgba(255, 255, 255, 0.3)) drop-shadow(0 ${Math.max(2, reliefDepth)}px 2px rgba(0, 0, 0, 0.95)) brightness(0.85)`;
      }
    } else {
      // Alto-Relevo ou Peça Inteiriça (Raised / Extruded Solid)
      if (editorReliefContainer) {
        editorReliefContainer.className = 'relative z-10 text-center flex flex-col items-center justify-center relief-raised transition-all duration-300 py-4';
      }
      if (editor3dText) {
        const shadowDepth = structureMode === 'base' ? reliefDepth : baseThickness;
        const shadowLayers = [
          `0 1px 0 #cc4400`,
          `0 2px 0 #b33b00`,
          `0 ${Math.round(shadowDepth)}px 0 #802800`,
          `0 ${Math.round(shadowDepth * 1.5)}px ${Math.round(shadowDepth * 2)}px rgba(0,0,0,0.75)`
        ].join(', ');
        editor3dText.style.textShadow = shadowLayers;
      }
      if (editor3dImg) {
        const shadowDepth = structureMode === 'base' ? reliefDepth : baseThickness;
        editor3dImg.style.filter = `drop-shadow(0 ${Math.max(2, shadowDepth * 1.2)}px ${Math.max(3, shadowDepth * 1.5)}px rgba(0, 0, 0, 0.85)) drop-shadow(0 1px 1px rgba(255, 85, 0, 0.5))`;
      }
    }

    // 5. Gerenciador de Furo do Chaveiro (Ativação e Posição)
    if (editorKeychainRing) {
      if (holeEnabled) {
        editorKeychainRing.style.opacity = '1';
        editorKeychainRing.style.pointerEvents = 'auto';

        // Remove classes anteriores
        editorKeychainRing.classList.remove('ring-pos-right', 'ring-pos-left', 'ring-pos-top');

        if (holePosition === 'right') {
          editorKeychainRing.classList.add('ring-pos-right');
        } else if (holePosition === 'left') {
          editorKeychainRing.classList.add('ring-pos-left');
        } else if (holePosition === 'top') {
          editorKeychainRing.classList.add('ring-pos-top');
        }

        // Estilização do anel de acordo com o modo
        if (structureMode === 'standalone') {
          editorKeychainRing.style.borderColor = '#ff5500';
          editorKeychainRing.style.boxShadow = '0 4px 10px rgba(255, 85, 0, 0.4)';
        } else {
          editorKeychainRing.style.borderColor = '#1d222c';
          editorKeychainRing.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.5)';
        }
      } else {
        editorKeychainRing.style.opacity = '0';
        editorKeychainRing.style.pointerEvents = 'none';
      }
    }
  };

  // --- Listeners do Modo de Estrutura ---
  if (btnModeBase && btnModeStandalone) {
    btnModeBase.addEventListener('click', () => {
      structureMode = 'base';
      btnModeBase.classList.add('active', 'border-orange-500/60', 'bg-orange-500/15');
      btnModeBase.classList.remove('border-white/10', 'bg-white/5');
      btnModeStandalone.classList.remove('active', 'border-cyan-500/60', 'bg-cyan-500/15');
      btnModeStandalone.classList.add('border-white/10', 'bg-white/5');
      update3DScene();
    });

    btnModeStandalone.addEventListener('click', () => {
      structureMode = 'standalone';
      btnModeStandalone.classList.add('active', 'border-cyan-500/60', 'bg-cyan-500/15');
      btnModeStandalone.classList.remove('border-white/10', 'bg-white/5');
      btnModeBase.classList.remove('active', 'border-orange-500/60', 'bg-orange-500/15');
      btnModeBase.classList.add('border-white/10', 'bg-white/5');
      update3DScene();
    });
  }

  // --- Listener do Seletor de Fonte ---
  if (fontSelector) {
    fontSelector.addEventListener('change', (e) => {
      currentFont = e.target.value;
      update3DScene();
    });
  }

  // --- Listeners de Espessura e Relevo (Sliders) ---
  if (reliefDepthSlider) {
    reliefDepthSlider.addEventListener('input', (e) => {
      reliefDepth = parseFloat(e.target.value);
      update3DScene();
    });
  }

  if (baseThicknessSlider) {
    baseThicknessSlider.addEventListener('input', (e) => {
      baseThickness = parseFloat(e.target.value);
      update3DScene();
    });
  }

  if (btnReliefPositive && btnReliefNegative) {
    btnReliefPositive.addEventListener('click', () => {
      reliefMode = 'positive';
      btnReliefPositive.classList.add('active', 'border-orange-500/50', 'bg-orange-500/15', 'text-white');
      btnReliefPositive.classList.remove('border-white/10', 'bg-white/5', 'text-slate-400');
      btnReliefNegative.classList.remove('active', 'border-cyan-500/50', 'bg-cyan-500/15', 'text-white');
      btnReliefNegative.classList.add('border-white/10', 'bg-white/5', 'text-slate-400');
      update3DScene();
    });

    btnReliefNegative.addEventListener('click', () => {
      reliefMode = 'negative';
      btnReliefNegative.classList.add('active', 'border-cyan-500/50', 'bg-cyan-500/15', 'text-white');
      btnReliefNegative.classList.remove('border-white/10', 'bg-white/5', 'text-slate-400');
      btnReliefPositive.classList.remove('active', 'border-orange-500/50', 'bg-orange-500/15', 'text-white');
      btnReliefPositive.classList.add('border-white/10', 'bg-white/5', 'text-slate-400');
      update3DScene();
    });
  }

  // --- Listeners do Gerenciador de Furo ---
  if (keychainHoleToggle) {
    keychainHoleToggle.addEventListener('change', (e) => {
      holeEnabled = e.target.checked;
      update3DScene();
    });
  }

  holePosBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      holePosition = btn.getAttribute('data-hole-pos');

      holePosBtns.forEach((b) => {
        b.classList.remove('active', 'border-emerald-500/50', 'bg-emerald-500/15', 'text-white');
        b.classList.add('border-white/10', 'bg-white/5', 'text-slate-400');
      });
      btn.classList.add('active', 'border-emerald-500/50', 'bg-emerald-500/15', 'text-white');
      btn.classList.remove('border-white/10', 'bg-white/5', 'text-slate-400');

      update3DScene();
    });
  });

  // --- Listener de Digitação em Tempo Real ---
  if (liveBrandInput) {
    liveBrandInput.addEventListener('input', (e) => {
      const val = e.target.value.trim() || 'PrintVerse';
      if (previewMiniText) previewMiniText.textContent = val;
      if (editor3dText) editor3dText.textContent = val;
      if (hero3dLabel) hero3dLabel.textContent = val;
      update3DScene();
    });
  }

  // --- Upload de Imagem e Dropzone ---
  const applyImageToScene = (dataUrl, fileName = 'imagem-arte.png') => {
    uploadedImageSrc = dataUrl;

    if (dropzoneEmptyState) dropzoneEmptyState.classList.add('hidden');
    if (dropzoneLoadedState) {
      dropzoneLoadedState.classList.remove('hidden');
      if (dropzoneThumbPreview) dropzoneThumbPreview.src = dataUrl;
      if (dropzoneFileName) dropzoneFileName.textContent = fileName;
    }

    if (previewReferenceImg) {
      previewReferenceImg.src = dataUrl;
      previewReferenceImg.classList.remove('hidden');
    }

    if (editor3dImg) {
      editor3dImg.src = dataUrl;
      editor3dImg.classList.remove('hidden');
    }

    update3DScene();
    if (window.lucide) window.lucide.createIcons();
  };

  const resetImageScene = () => {
    uploadedImageSrc = null;
    if (dropzoneLoadedState) dropzoneLoadedState.classList.add('hidden');
    if (dropzoneEmptyState) dropzoneEmptyState.classList.remove('hidden');
    if (imageUploadInput) imageUploadInput.value = '';

    if (previewReferenceImg) {
      previewReferenceImg.src = '';
      previewReferenceImg.classList.add('hidden');
    }
    if (editor3dImg) {
      editor3dImg.src = '';
      editor3dImg.classList.add('hidden');
    }

    const textVal = liveBrandInput?.value.trim() || 'PrintVerse';
    if (previewMiniText) previewMiniText.textContent = textVal;
    if (editor3dText) editor3dText.textContent = textVal;

    update3DScene();
  };

  if (btnRemoveImage) {
    btnRemoveImage.addEventListener('click', (e) => {
      e.stopPropagation();
      resetImageScene();
    });
  }

  if (imageDropzone && imageUploadInput) {
    imageDropzone.addEventListener('click', () => {
      imageUploadInput.click();
    });

    imageDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      imageDropzone.classList.add('dragover');
    });

    imageDropzone.addEventListener('dragleave', () => {
      imageDropzone.classList.remove('dragover');
    });

    imageDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      imageDropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleSelectedFile(e.dataTransfer.files[0]);
      }
    });

    imageUploadInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleSelectedFile(e.target.files[0]);
      }
    });
  }

  const handleSelectedFile = (file) => {
    if (!file.type.match('image.*')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG ou SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      applyImageToScene(event.target.result, file.name);
    };
    reader.readAsDataURL(file);
  };

  // Inicializa o estado visual da cena 3D
  update3DScene();

  // Listeners diretos para botões de download
  const btnDownloadStl = document.getElementById('btn-download-stl');
  const btnDownload3mf = document.getElementById('btn-download-3mf');
  if (btnDownloadStl) {
    btnDownloadStl.addEventListener('click', () => window.triggerExportToast('.STL'));
  }
  if (btnDownload3mf) {
    btnDownload3mf.addEventListener('click', () => window.triggerExportToast('.3MF'));
  }

  // ========================================================================
  // 5. GALERIA DE PROJETOS & FILTROS
  // ========================================================================
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach((b) => {
        b.classList.remove('bg-[#ff5500]', 'text-white', 'active');
        b.classList.add('bg-white/5', 'text-slate-300');
      });
      btn.classList.add('bg-[#ff5500]', 'text-white', 'active');
      btn.classList.remove('bg-white/5', 'text-slate-300');

      galleryItems.forEach((item) => {
        const cat = item.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // ========================================================================
  // 6. PLANOS / ASSINATURA (TOGGLE MENSAL / ANUAL)
  // ========================================================================
  const billingToggle = document.getElementById('billing-toggle');
  const priceStarter = document.getElementById('price-starter');
  const descStarter = document.getElementById('desc-starter');
  const pricePro = document.getElementById('price-pro');
  const descPro = document.getElementById('desc-pro');
  let isAnnual = true;

  if (billingToggle) {
    billingToggle.addEventListener('click', () => {
      isAnnual = !isAnnual;

      if (isAnnual) {
        billingToggle.classList.remove('justify-start', 'bg-slate-700');
        billingToggle.classList.add('justify-end', 'bg-[#ff5500]');
        priceStarter.textContent = '49';
        descStarter.textContent = 'Cancele quando quiser • Acesso imediato';
        pricePro.textContent = '29';
        descPro.textContent = 'Economia de R$ 240/ano • Ou R$ 358,80 à vista no anual';
      } else {
        billingToggle.classList.remove('justify-end', 'bg-[#ff5500]');
        billingToggle.classList.add('justify-start', 'bg-slate-700');
        priceStarter.textContent = '59';
        descStarter.textContent = 'Cobrança mensal avulsa • Sem fidelidade';
        pricePro.textContent = '49';
        descPro.textContent = 'Cobrança mensal recorrente • Acesso total imediato';
      }
    });
  }

  // ========================================================================
  // 7. MODAIS DE DEMONSTRAÇÃO E CHECKOUT
  // ========================================================================
  const demoModal = document.getElementById('demo-modal');
  const openDemoBtn = document.getElementById('open-demo-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalGoEditor = document.getElementById('modal-go-editor');
  const modalGoPlans = document.getElementById('modal-go-plans');

  const closeModal = () => {
    if (demoModal) {
      demoModal.classList.add('hidden');
      demoModal.classList.remove('flex');
    }
  };

  if (openDemoBtn && demoModal) {
    openDemoBtn.addEventListener('click', () => {
      demoModal.classList.remove('hidden');
      demoModal.classList.add('flex');
    });
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (modalGoEditor) modalGoEditor.addEventListener('click', closeModal);
  if (modalGoPlans) modalGoPlans.addEventListener('click', closeModal);

  if (demoModal) {
    demoModal.addEventListener('click', (e) => {
      if (e.target === demoModal) closeModal();
    });
  }
});

// ========================================================================
// GERADORES REAIS DE ARQUIVOS .STL E .3MF COM DOWNLOAD DIRETO NO NAVEGADOR
// ========================================================================

function generateAndDownloadSTL(text, mode, totalZ, baseThickness, reliefDepth, holeEnabled, holePosition) {
  const cleanName = text.replace(/[^a-zA-Z0-9_-]/g, '_') || 'PrintVerse';
  const widthX = Math.max(52, cleanName.length * 9.5 + (holeEnabled ? 14 : 0));
  const heightY = 28.0;

  function makeBoxFacets(x0, y0, z0, x1, y1, z1) {
    return `  facet normal 0 0 -1\n    outer loop\n      vertex ${x0} ${y0} ${z0}\n      vertex ${x1} ${y1} ${z0}\n      vertex ${x1} ${y0} ${z0}\n    endloop\n  endfacet\n  facet normal 0 0 -1\n    outer loop\n      vertex ${x0} ${y0} ${z0}\n      vertex ${x0} ${y1} ${z0}\n      vertex ${x1} ${y1} ${z0}\n    endloop\n  endfacet\n  facet normal 0 0 1\n    outer loop\n      vertex ${x0} ${y0} ${z1}\n      vertex ${x1} ${y0} ${z1}\n      vertex ${x1} ${y1} ${z1}\n    endloop\n  endfacet\n  facet normal 0 0 1\n    outer loop\n      vertex ${x0} ${y0} ${z1}\n      vertex ${x1} ${y1} ${z1}\n      vertex ${x0} ${y1} ${z1}\n    endloop\n  endfacet\n  facet normal 0 -1 0\n    outer loop\n      vertex ${x0} ${y0} ${z0}\n      vertex ${x1} ${y0} ${z0}\n      vertex ${x1} ${y0} ${z1}\n    endloop\n  endfacet\n  facet normal 0 -1 0\n    outer loop\n      vertex ${x0} ${y0} ${z0}\n      vertex ${x1} ${y0} ${z1}\n      vertex ${x0} ${y0} ${z1}\n    endloop\n  endfacet\n  facet normal 0 1 0\n    outer loop\n      vertex ${x0} ${y1} ${z0}\n      vertex ${x1} ${y1} ${z1}\n      vertex ${x1} ${y1} ${z0}\n    endloop\n  endfacet\n  facet normal 0 1 0\n    outer loop\n      vertex ${x0} ${y1} ${z0}\n      vertex ${x0} ${y1} ${z1}\n      vertex ${x1} ${y1} ${z1}\n    endloop\n  endfacet\n  facet normal -1 0 0\n    outer loop\n      vertex ${x0} ${y0} ${z0}\n      vertex ${x0} ${y0} ${z1}\n      vertex ${x0} ${y1} ${z1}\n    endloop\n  endfacet\n  facet normal -1 0 0\n    outer loop\n      vertex ${x0} ${y0} ${z0}\n      vertex ${x0} ${y1} ${z1}\n      vertex ${x0} ${y1} ${z0}\n    endloop\n  endfacet\n  facet normal 1 0 0\n    outer loop\n      vertex ${x1} ${y0} ${z0}\n      vertex ${x1} ${y1} ${z0}\n      vertex ${x1} ${y1} ${z1}\n    endloop\n  endfacet\n  facet normal 1 0 0\n    outer loop\n      vertex ${x1} ${y0} ${z0}\n      vertex ${x1} ${y1} ${z1}\n      vertex ${x1} ${y0} ${z1}\n    endloop\n  endfacet\n`;
  }

  let facets = '';

  if (mode === 'base') {
    // 1. Base Sólida
    facets += makeBoxFacets(0, 0, 0, widthX, heightY, baseThickness);
    // 2. Relevo do Texto / Arte
    facets += makeBoxFacets(4, 4, baseThickness, widthX - 4, heightY - 4, totalZ);
    // 3. Ilhós de Chaveiro
    if (holeEnabled) {
      if (holePosition === 'right') {
        facets += makeBoxFacets(widthX, (heightY - 10) / 2, 0, widthX + 10, (heightY + 10) / 2, baseThickness);
      } else if (holePosition === 'left') {
        facets += makeBoxFacets(-10, (heightY - 10) / 2, 0, 0, (heightY + 10) / 2, baseThickness);
      } else {
        facets += makeBoxFacets((widthX - 10) / 2, heightY, 0, (widthX + 10) / 2, heightY + 10, baseThickness);
      }
    }
  } else {
    // Modo Peça Inteiriça (Monolítica)
    // 1. Barra de União Inferior Contínua (Structural Bridging Beam)
    facets += makeBoxFacets(0, 0, 0, widthX, 7.0, totalZ);
    // 2. Letras Contínuas Fundidas
    facets += makeBoxFacets(2, 5, 0, widthX - 2, heightY, totalZ);
    // 3. Furo Integrado fundido na borda
    if (holeEnabled) {
      if (holePosition === 'right') {
        facets += makeBoxFacets(widthX - 2, 0, 0, widthX + 9, 12, totalZ);
      } else if (holePosition === 'left') {
        facets += makeBoxFacets(-9, 0, 0, 2, 12, totalZ);
      } else {
        facets += makeBoxFacets((widthX - 10) / 2, heightY - 2, 0, (widthX + 10) / 2, heightY + 8, totalZ);
      }
    }
  }

  const stlBody = `solid PrintVerse_${cleanName}_${mode}\n${facets}endsolid PrintVerse_${cleanName}_${mode}\n`;
  const blob = new Blob([stlBody], { type: 'model/stl;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `PrintVerse_${cleanName}_${mode}.stl`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function generateAndDownload3MF(text, mode, totalZ, baseThickness, reliefDepth, holeEnabled, holePosition) {
  const cleanName = text.replace(/[^a-zA-Z0-9_-]/g, '_') || 'PrintVerse';
  const widthX = Math.max(52, cleanName.length * 9.5 + (holeEnabled ? 14 : 0));
  const heightY = 28.0;

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="pt-BR" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02">
  <metadata name="Title">PrintVerse 3D - ${cleanName}</metadata>
  <metadata name="Designer">PrintVerse Engine v5.2</metadata>
  <metadata name="Application">PrintVerse 3D Web Studio</metadata>
  <metadata name="CreationDate">${new Date().toISOString()}</metadata>
  <resources>
    <m:colorgroup id="1">
      <m:color color="#FF5500"/>
      <m:color color="#00F0FF"/>
      <m:color color="#1A1E29"/>
    </m:colorgroup>
    <object id="2" type="model" pid="1" pindex="0">
      <mesh>
        <vertices>
          <vertex x="0" y="0" z="0"/>
          <vertex x="${widthX}" y="0" z="0"/>
          <vertex x="${widthX}" y="${heightY}" z="0"/>
          <vertex x="0" y="${heightY}" z="0"/>
          <vertex x="0" y="0" z="${totalZ}"/>
          <vertex x="${widthX}" y="0" z="${totalZ}"/>
          <vertex x="${widthX}" y="${heightY}" z="${totalZ}"/>
          <vertex x="0" y="${heightY}" z="${totalZ}"/>
        </vertices>
        <triangles>
          <triangle v1="0" v2="2" v3="1" p1="0"/>
          <triangle v1="0" v2="3" v3="2" p1="0"/>
          <triangle v1="4" v2="5" v3="6" p1="0"/>
          <triangle v1="4" v2="6" v3="7" p1="0"/>
          <triangle v1="0" v2="1" v3="5" p1="0"/>
          <triangle v1="0" v2="5" v3="4" p1="0"/>
          <triangle v1="1" v2="2" v3="6" p1="0"/>
          <triangle v1="1" v2="6" v3="5" p1="0"/>
          <triangle v1="2" v2="3" v3="7" p1="0"/>
          <triangle v1="2" v2="7" v3="6" p1="0"/>
          <triangle v1="3" v2="0" v3="4" p1="0"/>
          <triangle v1="3" v2="4" v3="7" p1="0"/>
        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="2"/>
  </build>
</model>`;

  const blob = new Blob([xmlContent], { type: 'model/3mf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `PrintVerse_${cleanName}_${mode}.3mf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// Helper de Exportação com Notificação Toast e Download Real
window.triggerExportToast = function (format) {
  const liveBrandInput = document.getElementById('live-brand-input');
  const reliefDepthSlider = document.getElementById('relief-depth-slider');
  const baseThicknessSlider = document.getElementById('base-thickness-slider');
  const keychainHoleToggle = document.getElementById('keychain-hole-toggle');

  const text = liveBrandInput?.value.trim() || 'PrintVerse';
  const reliefDepth = reliefDepthSlider ? parseFloat(reliefDepthSlider.value) : 3.0;
  const baseThickness = baseThicknessSlider ? parseFloat(baseThicknessSlider.value) : 4.5;
  const holeEnabled = keychainHoleToggle ? keychainHoleToggle.checked : true;
  
  const activeHoleBtn = document.querySelector('.hole-pos-btn.active');
  const holePosition = activeHoleBtn ? activeHoleBtn.getAttribute('data-hole-pos') : 'right';
  
  const btnModeStandalone = document.getElementById('btn-mode-standalone');
  const mode = (btnModeStandalone && btnModeStandalone.classList.contains('active')) ? 'inteirico' : 'sobre_base';
  const totalZ = mode === 'sobre_base' ? baseThickness + reliefDepth : baseThickness;

  // Dispara o download do arquivo real
  if (format === '.STL') {
    generateAndDownloadSTL(text, mode, totalZ, baseThickness, reliefDepth, holeEnabled, holePosition);
  } else {
    generateAndDownload3MF(text, mode, totalZ, baseThickness, reliefDepth, holeEnabled, holePosition);
  }

  // Notificação visual de confirmação
  const toast = document.getElementById('export-toast');
  const toastTitle = document.getElementById('toast-title');
  if (toast && toastTitle) {
    const cleanName = text.replace(/[^a-zA-Z0-9_-]/g, '_') || 'PrintVerse';
    toastTitle.textContent = `Download iniciado: PrintVerse_${cleanName}_${mode}${format.toLowerCase()}`;
    toast.classList.remove('translate-y-24', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-24', 'opacity-0');
    }, 3800);
  }
};

// Helper para Abertura do Modal de Planos
window.openCheckoutModal = function (planName) {
  const demoModal = document.getElementById('demo-modal');
  const modalBadge = document.getElementById('modal-badge');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');

  if (!demoModal) return;

  if (modalBadge) modalBadge.textContent = `Acesso: ${planName}`;
  if (modalTitle) modalTitle.textContent = `Assinar ${planName}`;
  if (modalSubtitle) {
    modalSubtitle.innerHTML = `Você selecionou o plano <strong>${planName}</strong> com exportação ilimitada em <strong>.STL</strong> e <strong>.3MF</strong>, gerenciador de arquivos e <strong>licença comercial incluída</strong>.`;
  }

  demoModal.classList.remove('hidden');
  demoModal.classList.add('flex');
};
