document.addEventListener("DOMContentLoaded", () => {

  /* ==================================================
     FUNÇÕES AUXILIARES
  ================================================== */

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];


  /* ==================================================
     VARIÁVEIS
  ================================================== */

  const screens = $$(".screen");

  let workoutSeconds = 0;
  let workoutInterval = null;

  let restSeconds = 90;
  let restInterval = null;

  let currentExercise = 1;


  /* ==================================================
     EXERCÍCIOS DO TREINO
  ================================================== */

  const exercises = [

    {
      name: "Supino Reto com Barra",
      subtitle: "Peito · Tríceps · Ombros"
    },

    {
      name: "Crucifixo Inclinado",
      subtitle: "Peito · Ombros"
    },

    {
      name: "Desenvolvimento com Halteres",
      subtitle: "Ombros · Tríceps"
    },

    {
      name: "Elevação Lateral",
      subtitle: "Ombros"
    },

    {
      name: "Tríceps Corda",
      subtitle: "Tríceps"
    },

    {
      name: "Supino Inclinado",
      subtitle: "Peito superior"
    },

    {
      name: "Tríceps Francês",
      subtitle: "Tríceps"
    },

    {
      name: "Flexão",
      subtitle: "Peito · Tríceps · Core"
    }

  ];


  /* ==================================================
     CONFIGURAÇÕES
  ================================================== */

  const defaultSettings = {

    notifications: true,

    autoRest: true,

    compactMode: false,

    darkMode: true,

    sounds: true

  };


  let settings = {
    ...defaultSettings
  };


  /* ==================================================
     NAVEGAÇÃO
  ================================================== */

  function showScreen(screenName) {

    const target =
      document.getElementById(screenName);

    if (!target) {

      console.warn(
        `Tela "${screenName}" não encontrada.`
      );

      return;
    }


    screens.forEach(screen => {

      screen.classList.remove("active");

    });


    target.classList.add("active");


    $$(".menu-item").forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.screen === screenName
      );

    });


    $$(".mobile-nav-item").forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.screen === screenName
      );

    });


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }


  document.addEventListener("click", event => {

    const button =
      event.target.closest("[data-screen]");

    if (!button) return;


    event.preventDefault();


    const screenName =
      button.dataset.screen;


    if (screenName) {

      showScreen(screenName);

    }

  });


  /* ==================================================
     TUTORIAIS
  ================================================== */

  function showTutorialCategory(category) {

    $$(".tutorial-tab").forEach(tab => {

      tab.classList.toggle(
        "active",
        tab.dataset.tutorial === category
      );

    });


    $$(".tutorial-content").forEach(content => {

      content.classList.toggle(
        "active",
        content.dataset.tutorialContent === category
      );

    });


    /*
      Volta para o topo da área principal
      quando o usuário troca de categoria.
    */

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }


  $$(".tutorial-tab").forEach(tab => {

    tab.addEventListener("click", () => {

      showTutorialCategory(
        tab.dataset.tutorial
      );

      playClickSound();

    });

  });


  /* ==================================================
     ZOOM DAS IMAGENS DOS TUTORIAIS
  ================================================== */

  const imgLightbox = document.createElement("div");
  imgLightbox.className = "img-lightbox";
  imgLightbox.innerHTML = `
    <button type="button" aria-label="Fechar">✕</button>
    <img alt="">
  `;
  document.body.appendChild(imgLightbox);

  const lightboxImg = imgLightbox.querySelector("img");

  function closeImgLightbox() {
    imgLightbox.classList.remove("open");
  }

  $$(".tutorial-gif.has-img").forEach(box => {
    box.addEventListener("click", () => {
      const image = box.querySelector("img");
      if (!image) return;
      lightboxImg.src = image.src;
      lightboxImg.alt = image.alt;
      imgLightbox.classList.add("open");
    });
  });

  imgLightbox.addEventListener("click", closeImgLightbox);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeImgLightbox();
  });


  /* ==================================================
     FALLBACK PARA GIFS
  ================================================== */

  $$(".tutorial-gif img").forEach(image => {

    image.addEventListener("error", () => {

      const container =
        image.closest(".tutorial-gif");

      if (!container) return;


      image.style.display = "none";


      const fallback =
        document.createElement("div");

      fallback.className =
        "gif-fallback";


      fallback.innerHTML = `
        <span>▶</span>
        <strong>Mídia não encontrada</strong>
        <small>
          Verifique o arquivo na pasta do projeto
        </small>
      `;


      container.appendChild(fallback);

    });

  });


  /* ==================================================
     TEMPO
  ================================================== */

  function formatTime(seconds) {

    const minutes =
      Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");


    const secs =
      (seconds % 60)
        .toString()
        .padStart(2, "0");


    return `${minutes}:${secs}`;

  }


  /* ==================================================
     TIMER DO TREINO
  ================================================== */

  function updateWorkoutTimer() {

    const timer =
      $("#workoutTimer");


    if (timer) {

      timer.textContent =
        formatTime(workoutSeconds);

    }

  }


  function startWorkoutTimer() {

    if (workoutInterval) return;


    workoutInterval =
      setInterval(() => {

        workoutSeconds++;

        updateWorkoutTimer();

      }, 1000);

  }


  function stopWorkoutTimer() {

    clearInterval(workoutInterval);

    workoutInterval = null;

  }


  /* ==================================================
     TIMER DE DESCANSO
  ================================================== */

  function updateRestTimer() {

    const timer =
      $("#restTimer");


    if (!timer) return;


    timer.textContent =
      formatTime(restSeconds);

  }


  function startRestTimer() {

    clearInterval(restInterval);


    restSeconds = 90;


    updateRestTimer();


    restInterval =
      setInterval(() => {

        restSeconds--;


        updateRestTimer();


        if (restSeconds <= 0) {

          clearInterval(restInterval);

          restInterval = null;


          if (settings.notifications) {

            playNotificationSound();

          }

        }

      }, 1000);

  }


  function stopRestTimer() {

    clearInterval(restInterval);

    restInterval = null;

  }


  /* ==================================================
     EXERCÍCIOS
  ================================================== */

  function updateExercise() {

    const exercise =
      exercises[currentExercise - 1];


    if (!exercise) return;


    const title =
      $("#exerciseName");


    const subtitle =
      $("#exerciseSubtitle");


    const number =
      $("#exerciseNumber");


    if (title) {

      title.textContent =
        exercise.name;

    }


    if (subtitle) {

      subtitle.textContent =
        exercise.subtitle;

    }


    if (number) {

      number.textContent =
        currentExercise;

    }


    updateProgress();


    stopRestTimer();


    restSeconds = 90;


    updateRestTimer();

  }


  function updateProgress() {

    const progress =
      (currentExercise / exercises.length) * 100;


    const bar =
      $("#workoutProgress");


    const text =
      $("#workoutProgressText");


    if (bar) {

      bar.style.width =
        `${progress}%`;

    }


    if (text) {

      text.textContent =
        `${Math.round(progress)}%`;

    }

  }


  /* ==================================================
     CONCLUIR SÉRIE
  ================================================== */

  function completeCurrentSet() {

    const weight =
      $("#weightInput");


    const reps =
      $("#repsInput");


    if (!weight || !reps) {

      return;

    }


    if (!weight.value || !reps.value) {

      alert(
        "Informe o peso e o número de repetições."
      );

      return;

    }


    const activeSet =
      $("#activeSet");


    if (!activeSet) return;


    activeSet.classList.remove("active");

    activeSet.classList.add("completed");


    activeSet.innerHTML = `

      <span>03</span>

      <strong>
        ${weight.value} kg
      </strong>

      <span>
        ${reps.value} reps
      </span>

      <b>✓</b>

    `;


    if (settings.autoRest) {

      startRestTimer();

    }


    playClickSound();

  }


  function bindCompleteSetButton() {

    const button =
      $("#completeSetButton");


    if (!button) return;


    button.onclick =
      completeCurrentSet;

  }


  /* ==================================================
     RESETAR SÉRIE
  ================================================== */

  function resetActiveSet() {

    const sets =
      $(".sets");


    if (!sets) return;


    sets.innerHTML = `

      <div class="set completed">

        <span>01</span>

        <strong>
          80 kg
        </strong>

        <span>
          10 reps
        </span>

        <b>✓</b>

      </div>


      <div class="set completed">

        <span>02</span>

        <strong>
          80 kg
        </strong>

        <span>
          10 reps
        </span>

        <b>✓</b>

      </div>


      <div
        class="set active"
        id="activeSet"
      >

        <span>03</span>

        <input
          id="weightInput"
          type="number"
          value="80"
          min="0"
          placeholder="kg"
        >

        <input
          id="repsInput"
          type="number"
          value="10"
          min="1"
          placeholder="reps"
        >

        <button
          id="completeSetButton"
          class="set-button"
          type="button"
        >
          CONCLUIR
        </button>

      </div>


      <div class="set next-set">

        <span>04</span>

        <span>
          Próxima série
        </span>

        <span>—</span>

        <span>—</span>

      </div>

    `;


    bindCompleteSetButton();

  }


  /* ==================================================
     INICIAR TREINO
  ================================================== */

  function startWorkout() {

    workoutSeconds = 0;

    currentExercise = 1;


    updateWorkoutTimer();

    resetActiveSet();

    updateExercise();


    startWorkoutTimer();


    showScreen("workout");


    playClickSound();

  }


  const startWorkoutButton =
    $("#startWorkoutButton");


  if (startWorkoutButton) {

    startWorkoutButton.addEventListener(
      "click",
      startWorkout
    );

  }


  /* ==================================================
     BOTÃO NOVO TREINO
  ================================================== */

  const newWorkoutButton =
    $("#newWorkoutButton");


  if (newWorkoutButton) {

    newWorkoutButton.addEventListener(
      "click",
      startWorkout
    );

  }


  /* ==================================================
     ADICIONAR DESCANSO
  ================================================== */

  const addRestButton =
    $("#addRestButton");


  if (addRestButton) {

    addRestButton.addEventListener(
      "click",
      () => {

        restSeconds += 30;

        updateRestTimer();

        playClickSound();

      }
    );

  }


  /* ==================================================
     PULAR DESCANSO
  ================================================== */

  const skipRestButton =
    $("#skipRestButton");


  if (skipRestButton) {

    skipRestButton.addEventListener(
      "click",
      () => {

        stopRestTimer();

        restSeconds = 0;

        updateRestTimer();

        playClickSound();

      }
    );

  }


  /* ==================================================
     PRÓXIMO EXERCÍCIO
  ================================================== */

  const nextExerciseButton =
    $("#nextExerciseButton");


  if (nextExerciseButton) {

    nextExerciseButton.addEventListener(
      "click",
      () => {

        if (
          currentExercise <
          exercises.length
        ) {

          currentExercise++;

          resetActiveSet();

          updateExercise();


          if (settings.autoRest) {

            startRestTimer();

          }


          playClickSound();

        } else {

          alert(
            "Treino concluído! Parabéns! 💪"
          );


          stopWorkoutTimer();


          workoutSeconds = 0;

          currentExercise = 1;


          resetActiveSet();

          updateWorkoutTimer();

          updateExercise();


          showScreen("dashboard");

        }

      }
    );

  }


  /* ==================================================
     FILTROS DE TREINO
  ================================================== */

  $$(".filter").forEach(filter => {

    filter.addEventListener(
      "click",
      () => {

        $$(".filter").forEach(item => {

          item.classList.remove("active");

        });


        filter.classList.add("active");


        const category =
          filter.dataset.filter;


        $$(".training-card").forEach(card => {

          const cardCategory =
            card.dataset.category || "";


          if (
            category === "all" ||
            cardCategory.includes(category)
          ) {

            card.style.display = "";

          } else {

            card.style.display = "none";

          }

        });


        playClickSound();

      }
    );

  });


  /* ==================================================
     PERFIL
  ================================================== */

  function getInitials(name) {

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word[0])
      .join("")
      .toUpperCase();

  }


  function updateProfileName(name) {

    const cleanName =
      name.trim();


    $$("[data-profile-name]")
      .forEach(element => {

        element.textContent =
          cleanName;

      });


    const initials =
      getInitials(cleanName);


    $$("[data-profile-avatar]")
      .forEach(element => {

        element.textContent =
          initials;

      });

  }


  function editProfile() {

    const currentName =
      localStorage.getItem(
        "trainx-profile-name"
      ) ||
      "Lucas Silva";


    const newName =
      prompt(
        "Digite seu nome:",
        currentName
      );


    if (
      !newName ||
      !newName.trim()
    ) {

      return;

    }


    const cleanName =
      newName.trim();


    localStorage.setItem(
      "trainx-profile-name",
      cleanName
    );


    updateProfileName(cleanName);


    playClickSound();

  }


  const editProfileButton =
    $("#editProfileButton");


  if (editProfileButton) {

    editProfileButton.addEventListener(
      "click",
      editProfile
    );

  }


  const settingsEditProfile =
    $("#settingsEditProfile");


  if (settingsEditProfile) {

    settingsEditProfile.addEventListener(
      "click",
      editProfile
    );

  }


  /* ==================================================
     NOTIFICAÇÕES
  ================================================== */

  const notificationButton =
    $("#notificationButton");


  const notificationPanel =
    $("#notificationPanel");


  const closeNotifications =
    $("#closeNotifications");


  function toggleNotifications() {

    if (!notificationPanel) return;


    const isOpen =
      notificationPanel.classList.toggle("open");


    notificationPanel.setAttribute(
      "aria-hidden",
      String(!isOpen)
    );

  }


  if (
    notificationButton &&
    notificationPanel
  ) {

    notificationButton.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        toggleNotifications();

      }
    );

  }


  if (closeNotifications) {

    closeNotifications.addEventListener(
      "click",
      () => {

        if (!notificationPanel) return;


        notificationPanel.classList.remove(
          "open"
        );


        notificationPanel.setAttribute(
          "aria-hidden",
          "true"
        );

      }
    );

  }


  document.addEventListener(
    "click",
    event => {

      if (
        notificationPanel &&
        !event.target.closest(
          "#notificationPanel"
        ) &&
        !event.target.closest(
          "#notificationButton"
        )
      ) {

        notificationPanel.classList.remove(
          "open"
        );


        notificationPanel.setAttribute(
          "aria-hidden",
          "true"
        );

      }

    }
  );


  /* ==================================================
     CONFIGURAÇÕES
  ================================================== */

  function loadSettings() {

    const saved =
      localStorage.getItem(
        "trainx-settings"
      );


    if (!saved) return;


    try {

      settings = {

        ...defaultSettings,

        ...JSON.parse(saved)

      };

    } catch (error) {

      console.warn(
        "Erro ao carregar configurações.",
        error
      );

    }

  }


  function saveSettings() {

    localStorage.setItem(
      "trainx-settings",
      JSON.stringify(settings)
    );

  }


  function applySettings() {

    document.body.classList.toggle(
      "compact-mode",
      settings.compactMode
    );

    // O tema é aplicado no body e persiste nas preferências locais.
    document.body.classList.toggle(
      "light-theme",
      !settings.darkMode
    );

    const themePreview = $(".theme-preview");
    if (themePreview) themePreview.textContent = settings.darkMode ? "DARK" : "LIGHT";


    $$(".switch-input[data-setting]")
      .forEach(toggle => {

        const settingName =
          toggle.dataset.setting;


        toggle.checked =
          Boolean(
            settings[settingName]
          );

      });

  }


  /* ==================================================
     SWITCHES
  ================================================== */

  $$(".switch-input[data-setting]")
    .forEach(toggle => {

      toggle.addEventListener(
        "change",
        () => {

          const settingName =
            toggle.dataset.setting;


          settings[settingName] =
            toggle.checked;


          saveSettings();

          applySettings();

          playClickSound();

        }
      );

    });


  /* ==================================================
     ABAS DE CONFIGURAÇÕES
  ================================================== */

  $$(".settings-tab")
    .forEach(tab => {

      tab.addEventListener(
        "click",
        () => {

          const target =
            tab.dataset.settingsTab;


          $$(".settings-tab")
            .forEach(item => {

              item.classList.remove(
                "active"
              );

            });


          $$(".settings-tab-content")
            .forEach(content => {

              content.classList.remove(
                "active"
              );

            });


          tab.classList.add("active");


          const content =
            document.querySelector(
              `[data-settings-content="${target}"]`
            );


          if (content) {

            content.classList.add(
              "active"
            );

          }


          playClickSound();

        }
      );

    });


  /* ==================================================
     RESTAURAR CONFIGURAÇÕES
  ================================================== */

  const resetSettingsButton =
    $("#resetSettingsButton");


  if (resetSettingsButton) {

    resetSettingsButton.addEventListener(
      "click",
      () => {

        const confirmed =
          confirm(
            "Deseja restaurar todas as configurações?"
          );


        if (!confirmed) return;


        settings = {
          ...defaultSettings
        };


        saveSettings();

        applySettings();


        alert(
          "Configurações restauradas com sucesso!"
        );


        playClickSound();

      }
    );

  }


  /* ==================================================
     FAQ
  ================================================== */

  $$(".faq-item")
    .forEach(item => {

      item.addEventListener(
        "click",
        () => {

          const wasOpen =
            item.classList.contains(
              "open"
            );


          $$(".faq-item")
            .forEach(other => {

              other.classList.remove(
                "open"
              );

            });


          if (!wasOpen) {

            item.classList.add(
              "open"
            );

          }


          playClickSound();

        }
      );

    });


  /* ==================================================
     ABAS DE AJUDA
  ================================================== */

  function showHelpTab(tabName) {

    $$(".help-tab")
      .forEach(tab => {

        tab.classList.toggle(
          "active",
          tab.dataset.helpTab === tabName
        );

      });


    $$(".help-tab-content")
      .forEach(content => {

        content.classList.toggle(
          "active",
          content.dataset.helpContent === tabName
        );

      });

  }


  $$(".help-tab")
    .forEach(tab => {

      tab.addEventListener(
        "click",
        () => {

          showHelpTab(
            tab.dataset.helpTab
          );

          playClickSound();

        }
      );

    });


  /* ==================================================
     BOTÕES VOLTAR PARA FAQ
  ================================================== */

  $$("[data-help-tab]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const tab =
            button.dataset.helpTab;


          if (tab) {

            showHelpTab(tab);

          }

        }
      );

    });


  /* ==================================================
     FORMULÁRIO DE SUPORTE
  ================================================== */

  const supportForm =
    $("#supportForm");


  if (supportForm) {

    supportForm.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        const name =
          $("#supportName")?.value.trim() ||
          "";


        const email =
          $("#supportEmail")?.value.trim() ||
          "";


        const subject =
          $("#supportSubject")?.value ||
          "Suporte";


        const message =
          $("#supportMessage")?.value.trim() ||
          "";


        if (
          !name ||
          !email ||
          !message
        ) {

          alert(
            "Preencha todos os campos obrigatórios."
          );

          return;

        }


        const mailSubject =
          encodeURIComponent(
            `[TRAINX] ${subject}`
          );


        const mailBody =
          encodeURIComponent(
            `Nome: ${name}\n\nE-mail: ${email}\n\nMensagem:\n${message}`
          );


        window.location.href =
          `mailto:suporte@trainx.app?subject=${mailSubject}&body=${mailBody}`;


        playClickSound();

      }
    );

  }


  /* ==================================================
     SOM
  ================================================== */

  function createAudioContext() {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;


    if (!AudioContext) {

      return null;

    }


    return new AudioContext();

  }


  function playClickSound() {

    if (!settings.sounds) return;


    try {

      const context =
        createAudioContext();


      if (!context) return;


      const oscillator =
        context.createOscillator();


      const gain =
        context.createGain();


      oscillator.type =
        "sine";


      oscillator.frequency.value =
        600;


      gain.gain.setValueAtTime(
        0.04,
        context.currentTime
      );


      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + 0.08
      );


      oscillator.connect(gain);

      gain.connect(
        context.destination
      );


      oscillator.start();


      oscillator.stop(
        context.currentTime + 0.08
      );

    } catch (error) {

      console.warn(
        "Áudio indisponível."
      );

    }

  }


  function playNotificationSound() {

    if (!settings.sounds) return;


    try {

      const context =
        createAudioContext();


      if (!context) return;


      const oscillator =
        context.createOscillator();


      const gain =
        context.createGain();


      oscillator.type =
        "sine";


      oscillator.frequency.value =
        900;


      gain.gain.setValueAtTime(
        0.08,
        context.currentTime
      );


      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + 0.25
      );


      oscillator.connect(gain);

      gain.connect(
        context.destination
      );


      oscillator.start();


      oscillator.stop(
        context.currentTime + 0.25
      );

    } catch (error) {

      console.warn(
        "Som de notificação indisponível."
      );

    }

  }


  /* ==================================================
     INICIALIZAÇÃO
  ================================================== */

  loadSettings();

  applySettings();

  updateWorkoutTimer();

  updateExercise();

  resetActiveSet();


  const savedName =
    localStorage.getItem(
      "trainx-profile-name"
    );


  if (savedName) {

    updateProfileName(savedName);

  }


  /*
    Categoria inicial dos tutoriais.
  */

  showTutorialCategory("legs");


  console.log(
    "TRAINX 2.2 carregado com sucesso."
  );

});