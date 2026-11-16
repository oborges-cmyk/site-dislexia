/* ========================================================================
       SCRIPT DE INTERATIVIDADE (CONFORTO DE LEITURA, RÉGUA E FORMULÁRIO)
       ======================================================================== */

(function () {
    'use strict';

    const rootEl = document.documentElement;
    const themeButtons = document.querySelectorAll('[data-theme-btn]');
    const fontButtons = document.querySelectorAll('[data-font-btn]');
    const rulerToggleBtn = document.getElementById('toggle-ruler-btn');
    const rulerBtnLabel = document.getElementById('ruler-btn-label');
    const readingRuler = document.getElementById('reading-ruler');

    let isRulerActive = false;
    let latestPointerY = window.innerHeight / 2;
    let ticking = false;

    // ----------------------------------------------------------------------
    // 1. PERSISTÊNCIA SEGURA DE PREFERÊNCIAS
    // ----------------------------------------------------------------------
    function savePreference(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (err) {
        // Ignora caso o armazenamento local esteja restrito no navegador
      }
    }

    function loadPreference(key) {
      try {
        return localStorage.getItem(key);
      } catch (err) {
        return null;
      }
    }

    // ----------------------------------------------------------------------
    // 2. SELETOR DE COR DE FUNDO SUAVE (CREME, AZUL PASTEL, VERDE SÁLVIA)
    // ----------------------------------------------------------------------
    function applyTheme(themeName) {
      if (themeName === 'creme') {
        rootEl.removeAttribute('data-theme');
      } else {
        rootEl.setAttribute('data-theme', themeName);
      }

      themeButtons.forEach((btn) => {
        const isSelected = btn.getAttribute('data-theme-btn') === themeName;
        btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      });

      savePreference('lumeapps_theme', themeName);
    }

    themeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const selectedTheme = btn.getAttribute('data-theme-btn');
        applyTheme(selectedTheme);
      });
    });

    // ----------------------------------------------------------------------
    // 3. SELETOR DE FONTE (LEXEND / ATKINSON HYPERLEGIBLE EM 16PX FIXOS)
    // ----------------------------------------------------------------------
    function applyFont(fontName) {
      if (fontName === 'lexend') {
        rootEl.removeAttribute('data-font');
      } else {
        rootEl.setAttribute('data-font', fontName);
      }

      fontButtons.forEach((btn) => {
        const isSelected = btn.getAttribute('data-font-btn') === fontName;
        btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      });

      savePreference('lumeapps_font', fontName);
    }

    fontButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const selectedFont = btn.getAttribute('data-font-btn');
        applyFont(selectedFont);
      });
    });

    // ----------------------------------------------------------------------
    // 4. RÉGUA DE LEITURA HORIZONTAL (MOUSE E TOQUE)
    // ----------------------------------------------------------------------
    function updateRulerPosition() {
      readingRuler.style.top = `${latestPointerY}px`;
      ticking = false;
    }

    function handlePointerMove(clientY) {
      if (!isRulerActive) return;
      latestPointerY = clientY;
      if (!ticking) {
        window.requestAnimationFrame(updateRulerPosition);
        ticking = true;
      }
    }

    window.addEventListener('mousemove', (event) => {
      handlePointerMove(event.clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (event) => {
      if (event.touches && event.touches.length > 0) {
        handlePointerMove(event.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchstart', (event) => {
      if (event.touches && event.touches.length > 0) {
        handlePointerMove(event.touches[0].clientY);
      }
    }, { passive: true });

    function setRulerState(active) {
      isRulerActive = active;
      rulerToggleBtn.setAttribute('aria-pressed', active ? 'true' : 'false');

      if (active) {
        readingRuler.classList.add('active');
        rulerBtnLabel.textContent = 'Régua ativada';
        updateRulerPosition();
      } else {
        readingRuler.classList.remove('active');
        rulerBtnLabel.textContent = 'Régua de leitura';
      }
    }

    rulerToggleBtn.addEventListener('click', () => {
      setRulerState(!isRulerActive);
    });

    // ----------------------------------------------------------------------
    // 5. ATALHO DOS BOTÕES DE PLANOS PARA O FORMULÁRIO DE CONTATO
    // ----------------------------------------------------------------------
    const planSelectButtons = document.querySelectorAll('[data-select-plan]');
    const campoPlano = document.getElementById('campo-plano');
    const campoNome = document.getElementById('campo-nome');
    const secaoContato = document.getElementById('contato');

    planSelectButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const chosenPlan = btn.getAttribute('data-select-plan');
        if (campoPlano) {
          campoPlano.value = chosenPlan;
        }
        if (secaoContato) {
          secaoContato.scrollIntoView({ behavior: 'smooth' });
        }
        setTimeout(() => {
          if (campoNome) {
            campoNome.focus({ preventScroll: true });
          }
        }, 450);
      });
    });

    // ----------------------------------------------------------------------
    // 6. VALIDAÇÃO GENTIL E FEEDBACK AMIGÁVEL NO FORMULÁRIO DE CONTATO
    // ----------------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    function showFormMessage(type, titleText, bodyText) {
      formFeedback.classList.remove('hidden');
      formFeedback.innerHTML = '';

      if (type === 'error') {
        formFeedback.style.backgroundColor = 'rgba(184, 84, 48, 0.12)';
        formFeedback.style.borderColor = '#B85430';
      } else {
        formFeedback.style.backgroundColor = 'rgba(31, 94, 115, 0.12)';
        formFeedback.style.borderColor = '#1F5E73';
      }

      const titleEl = document.createElement('p');
      titleEl.className = 'font-semibold mb-1';
      titleEl.textContent = titleText;

      const descEl = document.createElement('p');
      descEl.className = 'text-muted-theme';
      descEl.textContent = bodyText;

      formFeedback.appendChild(titleEl);
      formFeedback.appendChild(descEl);
    }

    if (contactForm) {
      contactForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const nome = document.getElementById('campo-nome').value.trim();
        const email = document.getElementById('campo-email').value.trim();
        const mensagem = document.getElementById('campo-mensagem').value.trim();

        if (!nome) {
          showFormMessage(
            'error',
            'Falta preencher o seu nome',
            'Por favor, escreva seu nome no primeiro campo para sabermos como chamar você.'
          );
          document.getElementById('campo-nome').focus();
          return;
        }

        if (!email || !email.includes('@') || !email.includes('.')) {
          showFormMessage(
            'error',
            'Verifique o endereço de e-mail',
            'Por favor, informe um e-mail válido para enviarmos nossa resposta.'
          );
          document.getElementById('campo-email').focus();
          return;
        }

        if (!mensagem) {
          showFormMessage(
            'error',
            'Escreva uma mensagem curta',
            'Conte em poucas palavras como podemos ajudar sua empresa.'
          );
          document.getElementById('campo-mensagem').focus();
          return;
        }

        const primeiroNome = nome.split(' ')[0];
        showFormMessage(
          'success',
          `Mensagem enviada com sucesso, ${primeiroNome}.`,
          'Recebemos seu contato e responderemos no seu e-mail em até 1 dia útil.'
        );

        contactForm.reset();
      });
    }

    // Restaura preferências salvas ao carregar a página
    const savedTheme = loadPreference('lumeapps_theme');
    if (savedTheme && ['creme', 'azul', 'verde'].includes(savedTheme)) {
      applyTheme(savedTheme);
    }

    const savedFont = loadPreference('lumeapps_font');
    if (savedFont && ['lexend', 'atkinson'].includes(savedFont)) {
      applyFont(savedFont);
    }
  })();