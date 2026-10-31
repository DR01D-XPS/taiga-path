(function () {
  "use strict";

  var scenario = window.VN_SCENARIO;
  var assets = window.VN_ASSETS;

  if (!scenario || !assets) {
    console.error("Не удалось загрузить данные сценария или ассетов.");
    return;
  }

  var root = document.getElementById("vnRoot");
  var bgLayerA = document.getElementById("bgLayerA");
  var bgLayerB = document.getElementById("bgLayerB");
  var characterSprite = document.getElementById("characterSprite");
  var dialogueBox = document.getElementById("dialogueBox");
  var dialogueText = document.getElementById("dialogueText");
  var nameplate = document.getElementById("nameplate");
  var choiceBox = document.getElementById("choiceBox");
  var choiceQuestion = document.getElementById("choiceQuestion");
  var choiceList = document.getElementById("choiceList");
  var endingCard = document.getElementById("endingCard");
  var endingKicker = document.getElementById("endingKicker");
  var endingTitle = document.getElementById("endingTitle");
  var endingBody = document.getElementById("endingBody");
  var endingLinks = document.getElementById("endingLinks");
  var scoreBadge = document.getElementById("scoreBadge");
  var backButton = document.getElementById("backButton");

  var state = {
    nodeId: scenario.start,
    stepIndex: 0,
    score: 0,
    activeBgLayer: 0,
    currentBackground: null,
    currentCharacter: null,
    characterAppearedOnce: false,
    isTyping: false,
    typingTimer: null,
    typingIndex: 0,
    fullLine: "",
    waitingChoice: false,
    ended: false,
    spriteToken: 0,
    history: [],
    isRestoring: false
  };

  var maxScore = Number(scenario.maxScore) || 80;

  function toAssetUrl(fileName) {
    return encodeURI(fileName).replace(/#/g, "%23");
  }

  function isPortraitLayout() {
    return window.matchMedia("(orientation: portrait)").matches || window.innerHeight > window.innerWidth;
  }

  function isMobileViewport() {
    return window.matchMedia("(max-width: 900px), (pointer: coarse) and (max-width: 1200px)").matches;
  }

  function resolveCharacterExtraX(characterId) {
    if (!characterId) {
      return "0vw";
    }

    var mobile = isMobileViewport();

    if (characterId === "yanseli6") {
      return mobile ? "0vw" : "1.5vw";
    }

    if (
      characterId === "yanseli3" ||
      characterId === "yanseli5" ||
      characterId === "yanseli7" ||
      characterId === "yanseli14" ||
      characterId === "yanseli15" ||
      characterId === "yanseli17" ||
      characterId === "yanseli18" ||
      characterId === "s2_yanseli_intro" ||
      characterId === "s2_yanseli_neutral" ||
      characterId === "s2_yanseli_kind" ||
      characterId === "s2_yanseli_angry"
    ) {
      return mobile ? "0vw" : "1.5vw";
    }

    if (characterId === "yanseli8" || characterId === "yanseli10") {
      return mobile ? "-1vw" : "7vw";
    }

    if (characterId === "yanseli11") {
      return mobile ? "0vw" : "11vw";
    }

    if (characterId === "yanseli13") {
      return mobile ? "0vw" : "10vw";
    }

    if (characterId === "yanseli9") {
      return mobile ? "-0.5vw" : "5.5vw";
    }

    if (characterId === "s5_elder_neutral") {
      return mobile ? "2vw" : "9vw";
    }

    if (characterId === "s5_elder_pleased") {
      return mobile ? "2vw" : "9vw";
    }

    if (characterId === "s5_elder_displeased") {
      return mobile ? "-0.4vw" : "9vw";
    }

    return "0vw";
  }

  function resolveCharacterScale(characterId) {
    if (!characterId) {
      return 1;
    }

    var mobile = isMobileViewport();

    if (characterId === "yanseli6") {
      return mobile ? 1.08 : 1;
    }

    if (
      characterId === "yanseli3" ||
      characterId === "yanseli5" ||
      characterId === "yanseli7" ||
      characterId === "yanseli8" ||
      characterId === "yanseli10" ||
      characterId === "yanseli14" ||
      characterId === "yanseli15" ||
      characterId === "yanseli17" ||
      characterId === "yanseli18" ||
      characterId === "s2_yanseli_intro" ||
      characterId === "s2_yanseli_neutral" ||
      characterId === "s2_yanseli_kind" ||
      characterId === "s2_yanseli_angry"
    ) {
      return mobile ? 0.96 : 1;
    }

    if (characterId === "yanseli11") {
      return mobile ? 0.98 : 1;
    }

    if (characterId === "yanseli13") {
      return mobile ? 1.08 : 1;
    }

    if (characterId === "yanseli9") {
      return mobile ? 1.06 : 1;
    }

    if (characterId === "s5_elder_neutral") {
      return mobile ? 1.08 : 0.74;
    }

    if (characterId === "s5_elder_displeased" || characterId === "s5_elder_pleased") {
      return mobile ? 1.16 : 0.74;
    }

    return 1;
  }

  function resolveCharacterExtraY(characterId) {
    if (!characterId) {
      return "0vh";
    }

    var mobile = isMobileViewport();

    if (characterId === "yanseli8") {
      return mobile ? "3vh" : "0vh";
    }

    if (
      characterId === "yanseli3" ||
      characterId === "yanseli5" ||
      characterId === "yanseli6" ||
      characterId === "yanseli7" ||
      characterId === "yanseli10" ||
      characterId === "yanseli14" ||
      characterId === "yanseli15" ||
      characterId === "yanseli17" ||
      characterId === "yanseli18" ||
      characterId === "s2_yanseli_intro" ||
      characterId === "s2_yanseli_neutral" ||
      characterId === "s2_yanseli_kind" ||
      characterId === "s2_yanseli_angry"
    ) {
      return mobile ? "0vh" : "0vh";
    }

    if (characterId === "yanseli11") {
      return mobile ? "1.5vh" : "0vh";
    }

    if (characterId === "yanseli13") {
      return mobile ? "0vh" : "0vh";
    }

    if (characterId === "yanseli9") {
      return mobile ? "0vh" : "0vh";
    }

    if (characterId === "s5_elder_neutral") {
      return mobile ? "0vh" : "10.5vh";
    }

    if (characterId === "s5_elder_displeased" || characterId === "s5_elder_pleased") {
      return mobile ? "0vh" : "10.5vh";
    }

    return "0vh";
  }

  function applyCharacterOffset(characterId) {
    var extraX = resolveCharacterExtraX(characterId);
    var extraY = resolveCharacterExtraY(characterId);
    var scale = resolveCharacterScale(characterId);
    characterSprite.style.setProperty("--char-extra-stop-x", extraX);
    characterSprite.style.setProperty("--char-extra-enter-x", extraX);
    characterSprite.style.setProperty("--char-extra-stop-y", extraY);
    characterSprite.style.setProperty("--char-extra-enter-y", extraY);
    characterSprite.style.setProperty("--char-scale-stop", String(scale));
    characterSprite.style.setProperty("--char-scale-enter", String(scale + 0.03));
  }

  function syncBackgroundGap() {
    if (!root || !dialogueBox) {
      return;
    }

    var rootRect = root.getBoundingClientRect();
    var dialogueRect = dialogueBox.getBoundingClientRect();
    var hudRect = document.querySelector(".hud")
      ? document.querySelector(".hud").getBoundingClientRect()
      : null;
    var dialogueTopInRoot = dialogueRect.top - rootRect.top;
    var clampedTop = Math.max(0, Math.min(dialogueTopInRoot, rootRect.height));
    var exactGap = Math.round(rootRect.height - clampedTop);
    var hudBottomInRoot = hudRect ? Math.max(0, hudRect.bottom - rootRect.top) : 0;
    var safeHeight = Math.max(220, Math.round(clampedTop - hudBottomInRoot - 6));
    var characterGap = exactGap;

    root.style.setProperty("--bg-bottom-gap", exactGap + "px");
    root.style.setProperty("--character-floor-gap", characterGap + "px");
    root.style.setProperty("--character-safe-height", safeHeight + "px");
  }

  function resolveCharacterAssetPath(characterId) {
    if (!characterId) {
      return null;
    }

    var characterAsset = assets.characters[characterId];
    if (!characterAsset) {
      return null;
    }

    if (typeof characterAsset === "string") {
      return characterAsset;
    }

    if (isMobileViewport()) {
      return characterAsset.mobile || characterAsset.desktop || characterAsset.default || null;
    }

    return characterAsset.desktop || characterAsset.mobile || characterAsset.default || null;
  }

  function resolveBackground(id) {
    var bg = assets.backgrounds[id];
    if (!bg) {
      console.warn("Неизвестный фон:", id);
      return null;
    }

    if (bg.color) {
      return { kind: "color", value: bg.color };
    }

    var usePortraitAsset = isMobileViewport() && isPortraitLayout();
    var fileName = usePortraitAsset ? (bg.portrait || bg.landscape) : (bg.landscape || bg.portrait);
    if (!fileName) {
      console.warn("Для фона нет подходящего файла:", id);
      return null;
    }

    return { kind: "image", value: toAssetUrl(fileName) };
  }

  function applyBackgroundToLayer(layer, resolvedBackground) {
    if (!resolvedBackground) {
      layer.style.backgroundImage = "";
      layer.style.backgroundColor = "#000";
      return;
    }

    if (resolvedBackground.kind === "color") {
      layer.style.backgroundImage = "none";
      layer.style.backgroundColor = resolvedBackground.value;
      return;
    }

    layer.style.backgroundColor = "#000";
    layer.style.backgroundImage = "url(\"" + resolvedBackground.value + "\")";
  }

  function setBackground(id, animated) {
    if (animated === void 0) {
      animated = true;
    }

    var resolvedBackground = resolveBackground(id);
    if (!resolvedBackground) {
      return;
    }

    state.currentBackground = id;

    var activeLayer = state.activeBgLayer === 0 ? bgLayerA : bgLayerB;
    var nextLayer = state.activeBgLayer === 0 ? bgLayerB : bgLayerA;
    applyBackgroundToLayer(nextLayer, resolvedBackground);

    if (!animated) {
      activeLayer.style.transitionDuration = "0ms";
      nextLayer.style.transitionDuration = "0ms";
    }

    nextLayer.classList.add("is-active");
    activeLayer.classList.remove("is-active");
    state.activeBgLayer = state.activeBgLayer === 0 ? 1 : 0;

    if (!animated) {
      requestAnimationFrame(function () {
        activeLayer.style.transitionDuration = "";
        nextLayer.style.transitionDuration = "";
      });
    }
  }

  function setCharacter(id, options) {
    options = options || {};

    var previousCharacter = state.currentCharacter;
    var token = ++state.spriteToken;

    if (!id) {
      state.currentCharacter = null;
      applyCharacterOffset(null);
      characterSprite.classList.remove("is-visible", "is-entering", "is-switching");
      characterSprite.removeAttribute("src");
      return;
    }

    applyCharacterOffset(id);

    var spritePath = resolveCharacterAssetPath(id);
    if (!spritePath) {
      console.warn("Неизвестный персонаж:", id);
      characterSprite.classList.remove("is-visible", "is-entering", "is-switching");
      return;
    }

    var nextSrc = toAssetUrl(spritePath);

    if (options.instant) {
      state.currentCharacter = id;
      characterSprite.classList.remove("is-entering", "is-switching");
      characterSprite.src = nextSrc;
      characterSprite.classList.add("is-visible");
      return;
    }

    var currentSpriteSrc = characterSprite.getAttribute("src") || "";
    var sameSprite =
      currentSpriteSrc === nextSrc ||
      currentSpriteSrc.endsWith("/" + nextSrc) ||
      currentSpriteSrc.endsWith(nextSrc);

    if (
      previousCharacter === id &&
      characterSprite.classList.contains("is-visible") &&
      sameSprite
    ) {
      state.currentCharacter = id;
      characterSprite.classList.remove("is-entering", "is-switching");
      return;
    }

    state.currentCharacter = id;

    if (!state.characterAppearedOnce) {
      state.characterAppearedOnce = true;

      if (isMobileViewport()) {
        characterSprite.classList.remove("is-entering", "is-visible");
        characterSprite.classList.add("is-switching");
        characterSprite.src = nextSrc;

        requestAnimationFrame(function () {
          if (token !== state.spriteToken) {
            return;
          }

          characterSprite.classList.add("is-visible");
          window.setTimeout(function () {
            if (token === state.spriteToken) {
              characterSprite.classList.remove("is-switching");
            }
          }, 260);
        });
        return;
      }

      characterSprite.classList.remove("is-switching", "is-visible");
      characterSprite.classList.add("is-entering");
      characterSprite.src = nextSrc;

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (token !== state.spriteToken) {
            return;
          }

          characterSprite.classList.add("is-visible");
          window.setTimeout(function () {
            if (token === state.spriteToken) {
              characterSprite.classList.remove("is-entering");
            }
          }, 620);
        });
      });
      return;
    }

    var alreadyVisible = characterSprite.classList.contains("is-visible") && !!characterSprite.getAttribute("src");
    characterSprite.classList.remove("is-entering");
    characterSprite.classList.add("is-switching");

    if (!alreadyVisible) {
      characterSprite.classList.remove("is-switching", "is-visible");
      characterSprite.classList.add("is-entering");
      characterSprite.src = nextSrc;
      requestAnimationFrame(function () {
        if (token === state.spriteToken) {
          characterSprite.classList.add("is-visible");
          window.setTimeout(function () {
            if (token === state.spriteToken) {
              characterSprite.classList.remove("is-entering");
            }
          }, 520);
        }
      });
      return;
    }

    characterSprite.classList.remove("is-visible");

    window.setTimeout(function () {
      if (token !== state.spriteToken) {
        return;
      }

      characterSprite.src = nextSrc;
      characterSprite.classList.add("is-visible");
      window.setTimeout(function () {
        if (token === state.spriteToken) {
          characterSprite.classList.remove("is-switching");
        }
      }, 280);
    }, 170);
  }

  function setSpeaker(name) {
    if (name) {
      nameplate.textContent = name;
      nameplate.classList.add("is-visible");
    } else {
      nameplate.textContent = "";
      nameplate.classList.remove("is-visible");
    }
  }

  function clearTypingTimer() {
    if (state.typingTimer) {
      window.clearInterval(state.typingTimer);
      state.typingTimer = null;
    }
  }

  function interpolateText(text) {
    return String(text || "")
      .replace(/\{score\}/g, String(state.score))
      .replace(/\{scorePercent\}/g, String(getScorePercent()))
      .replace(/\{scoreTitle\}/g, getScoreTitle())
      .replace(/\{scoreResult\}/g, getScoreResult());
  }

  function getScorePercent() {
    if (!maxScore) {
      return 0;
    }

    return Math.max(0, Math.min(100, Math.round((state.score / maxScore) * 100)));
  }

  function getScoreTitle() {
    return "Итог путешествия";
  }

  function getScoreResult() {
    var fullScaleScore = state.score * 80 / maxScore;
    if (fullScaleScore >= 65) {
      return "вы едины с природой";
    }

    if (fullScaleScore >= 50) {
      return "вы чувствуете связь с тайгой";
    }

    if (fullScaleScore >= 45) {
      return "вам многому можно поучиться у коренных народов";
    }

    return "вы в начале своего познания";
  }

  function normalizeChoiceText(text) {
    return String(text || "")
      .replace(/^\s*(?:\d+|[A-Za-zА-Яа-яЁё])\s*[\)\].:-]+\s*/u, "")
      .trim();
  }

  function finishTyping() {
    if (!state.isTyping) {
      return;
    }

    clearTypingTimer();
    state.isTyping = false;
    dialogueText.textContent = state.fullLine;
    syncBackgroundGap();
  }

  function startTyping(text) {
    clearTypingTimer();

    state.fullLine = interpolateText(text);
    state.typingIndex = 0;
    state.isTyping = true;
    dialogueText.textContent = "";

    if (!state.fullLine.length) {
      finishTyping();
      return;
    }

    var speed = Math.max(12, 22 - Math.floor(state.fullLine.length / 90));

    state.typingTimer = window.setInterval(function () {
      state.typingIndex += 1;
      dialogueText.textContent = state.fullLine.slice(0, state.typingIndex);
      syncBackgroundGap();

      if (state.typingIndex >= state.fullLine.length) {
        finishTyping();
      }
    }, speed);
  }

  function showLine(step, instant) {
    hideEndingCard();
    setSpeaker(step.speaker || "");

    if (instant || scenario.instantText) {
      clearTypingTimer();
      state.isTyping = false;
      state.fullLine = interpolateText(step.text || "");
      dialogueText.textContent = state.fullLine;
      syncBackgroundGap();
      return;
    }

    startTyping(step.text || "");
  }

  function updateScoreBadge() {
    scoreBadge.textContent = "Гармония: " + state.score + "/" + maxScore;
  }

  function applyScore(value) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return;
    }

    state.score += value;
    updateScoreBadge();
  }

  function updateBackButtonState() {
    backButton.disabled = state.history.length <= 1;
  }

  function hideEndingCard() {
    root.classList.remove("is-ending");
    endingCard.classList.remove("is-visible");
    endingKicker.textContent = "";
    endingTitle.textContent = "";
    endingBody.textContent = "";
    endingLinks.innerHTML = "";
  }

  function showEndingCard(step) {
    hideChoices();
    clearTypingTimer();
    state.isTyping = false;
    state.waitingChoice = false;
    setSpeaker("");
    dialogueText.textContent = "";
    endingKicker.textContent = interpolateText(step.kicker || "");
    endingTitle.textContent = interpolateText(step.title || "");
    endingBody.textContent = interpolateText(step.body || "");
    endingLinks.innerHTML = "";

    (step.links || []).forEach(function (link) {
      var item = document.createElement("div");
      item.className = "ending-link";

      var label = document.createElement("div");
      label.className = "ending-link__label";
      label.textContent = link.label || "";
      item.appendChild(label);

      var button = document.createElement("a");
      button.className = "ending-link__button";
      button.href = link.href || "#";
      button.target = "_blank";
      button.rel = "noopener noreferrer";
      button.setAttribute("aria-label", link.label || "Перейти");

      var buttonImage = document.createElement("img");
      buttonImage.className = "ending-link__button-img";
      buttonImage.src = toAssetUrl(link.buttonAsset || "optimized/ui/cta-button.png");
      buttonImage.alt = "";
      button.appendChild(buttonImage);

      var buttonText = document.createElement("span");
      buttonText.className = "ending-link__button-text";
      buttonText.textContent = "Перейти";
      button.appendChild(buttonText);
      item.appendChild(button);

      endingLinks.appendChild(item);
    });

    root.classList.add("is-ending");
    endingCard.classList.add("is-visible");
    syncBackgroundGap();
  }

  function hideChoices() {
    state.waitingChoice = false;
    choiceBox.classList.remove("is-visible");
    choiceQuestion.textContent = "";
    choiceList.innerHTML = "";
    syncBackgroundGap();
  }

  function goToNode(nodeId) {
    if (!scenario.nodes[nodeId]) {
      console.error("Не найден узел сценария:", nodeId);
      state.ended = true;
      return;
    }

    hideEndingCard();
    state.nodeId = nodeId;
    state.stepIndex = 0;
  }

  function snapshotPauseFromChoice(step) {
    return {
      type: "choice",
      question: step.question || "",
      options: (step.options || []).map(function (option) {
        return {
          text: option.text,
          next: option.next,
          score: option.score
        };
      })
    };
  }

  function snapshotPauseFromSay(step) {
    return {
      type: "say",
      speaker: step.speaker || "",
      text: step.text || ""
    };
  }

  function snapshotPauseFromEndcard(step) {
    return {
      type: "endcard",
      kicker: step.kicker || "",
      title: step.title || "",
      body: step.body || "",
      links: (step.links || []).map(function (link) {
        return {
          label: link.label || "",
          href: link.href || "",
          buttonAsset: link.buttonAsset || ""
        };
      })
    };
  }

  function pushHistorySnapshot(pauseData) {
    if (state.isRestoring) {
      return;
    }

    var snapshot = {
      nodeId: state.nodeId,
      stepIndex: state.stepIndex,
      score: state.score,
      currentBackground: state.currentBackground,
      currentCharacter: state.currentCharacter,
      characterAppearedOnce: state.characterAppearedOnce,
      pause: pauseData,
      ended: state.ended
    };

    var last = state.history[state.history.length - 1];
    if (
      last &&
      last.nodeId === snapshot.nodeId &&
      last.stepIndex === snapshot.stepIndex &&
      last.score === snapshot.score &&
      JSON.stringify(last.pause) === JSON.stringify(snapshot.pause)
    ) {
      return;
    }

    state.history.push(snapshot);
    updateBackButtonState();
  }

  function showChoice(step) {
    hideEndingCard();
    state.waitingChoice = true;
    choiceQuestion.textContent = step.question || "";
    choiceList.innerHTML = "";

    (step.options || []).forEach(function (option) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "choice-btn";
      button.textContent = normalizeChoiceText(option.text);
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        handleChoiceSelected(option);
      });
      choiceList.appendChild(button);
    });

    choiceBox.classList.add("is-visible");
    syncBackgroundGap();
  }

  function restoreSnapshot(snapshot) {
    state.isRestoring = true;
    clearTypingTimer();
    hideChoices();
    hideEndingCard();

    state.nodeId = snapshot.nodeId;
    state.stepIndex = snapshot.stepIndex;
    state.score = snapshot.score;
    state.currentBackground = snapshot.currentBackground;
    state.currentCharacter = snapshot.currentCharacter;
    state.characterAppearedOnce = snapshot.characterAppearedOnce;
    state.ended = snapshot.ended;

    updateScoreBadge();

    if (state.currentBackground) {
      setBackground(state.currentBackground, false);
    }

    setCharacter(state.currentCharacter, { instant: true });

    if (snapshot.pause && snapshot.pause.type === "choice") {
      setSpeaker("");
      dialogueText.textContent = "";
      showChoice(snapshot.pause);
    } else if (snapshot.pause && snapshot.pause.type === "endcard") {
      showEndingCard(snapshot.pause);
    } else if (snapshot.pause && snapshot.pause.type === "say") {
      showLine(snapshot.pause, true);
    }

    syncBackgroundGap();
    state.isRestoring = false;
    updateBackButtonState();
  }

  function goBack() {
    if (state.history.length <= 1) {
      return;
    }

    state.history.pop();
    var target = state.history[state.history.length - 1];
    restoreSnapshot(target);
  }

  function handleChoiceSelected(option) {
    hideChoices();
    applyScore(option.score);
    goToNode(option.next);
    runUntilPause();
  }

  function endStory() {
    state.ended = true;
  }

  function getCurrentNode() {
    return scenario.nodes[state.nodeId];
  }

  function runUntilPause() {
    if (state.ended || state.waitingChoice) {
      return;
    }

    while (true) {
      var node = getCurrentNode();
      if (!node) {
        endStory();
        return;
      }

      if (state.stepIndex >= node.steps.length) {
        if (node.next) {
          goToNode(node.next);
          continue;
        }

        endStory();
        return;
      }

      var step = node.steps[state.stepIndex++];
      if (!step || !step.type) {
        continue;
      }

      if (step.type === "bg") {
        setBackground(step.id, step.animate !== false);
        continue;
      }

      if (step.type === "char") {
        setCharacter(step.id);
        continue;
      }

      if (step.type === "say") {
        showLine(step, false);
        pushHistorySnapshot(snapshotPauseFromSay(step));
        syncBackgroundGap();
        return;
      }

      if (step.type === "choice") {
        showChoice(step);
        pushHistorySnapshot(snapshotPauseFromChoice(step));
        syncBackgroundGap();
        return;
      }

      if (step.type === "endcard") {
        state.ended = true;
        showEndingCard(step);
        pushHistorySnapshot(snapshotPauseFromEndcard(step));
        syncBackgroundGap();
        return;
      }

      if (step.type === "jump") {
        goToNode(step.to);
      }
    }
  }

  function handleAdvance() {
    if (state.waitingChoice || state.ended) {
      return;
    }

    if (state.isTyping) {
      finishTyping();
      return;
    }

    runUntilPause();
  }

  function collectPreloadFiles() {
    var unique = new Set();
    var usePortraitAsset = isMobileViewport() && isPortraitLayout();

    Object.keys(assets.backgrounds || {}).forEach(function (key) {
      var bg = assets.backgrounds[key];
      if (!bg || bg.color) {
        return;
      }

      var backgroundFile = usePortraitAsset ? (bg.portrait || bg.landscape) : (bg.landscape || bg.portrait);
      if (backgroundFile) {
        unique.add(backgroundFile);
      }
    });

    Object.keys(assets.characters || {}).forEach(function (key) {
      var characterFile = resolveCharacterAssetPath(key);
      if (characterFile) {
        unique.add(characterFile);
      }
    });

    return Array.from(unique);
  }

  function preloadAssets(priorityFiles) {
    var queue = [];
    var seen = new Set();
    var preloadPool = [];

    function pushUnique(fileName) {
      if (!fileName || seen.has(fileName)) {
        return;
      }

      seen.add(fileName);
      queue.push(fileName);
    }

    (priorityFiles || []).forEach(pushUnique);
    collectPreloadFiles().forEach(pushUnique);

    if (!queue.length) {
      return;
    }

    var index = 0;
    var batchSize = isMobileViewport() ? 1 : 2;
    var nextDelay = isMobileViewport() ? 180 : 90;

    function pump() {
      for (var i = 0; i < batchSize && index < queue.length; i += 1) {
        var img = new Image();
        img.decoding = "async";
        img.src = toAssetUrl(queue[index]);
        preloadPool.push(img);
        index += 1;
      }

      if (index < queue.length) {
        window.setTimeout(pump, nextDelay);
      }
    }

    pump();
  }

  function boot() {
    hideChoices();
    updateScoreBadge();

    goToNode(scenario.start);
    runUntilPause();
    updateBackButtonState();
    syncBackgroundGap();

    var initialBackground = resolveBackground(state.currentBackground);
    var initialCharacter = resolveCharacterAssetPath(state.currentCharacter);
    var priority = [];

    if (initialBackground && initialBackground.kind === "image" && initialBackground.value) {
      priority.push(decodeURI(initialBackground.value));
    }

    if (initialCharacter) {
      priority.push(initialCharacter);
    }

    function beginPreload() {
      window.setTimeout(function () {
        preloadAssets(priority);
      }, 60);
    }

    if (document.readyState === "complete") {
      beginPreload();
    } else {
      window.addEventListener("load", beginPreload, { once: true });
    }
  }

  root.addEventListener("click", function (event) {
    if (event.target.closest(".choice-box") || event.target.closest(".back-button")) {
      return;
    }

    handleAdvance();
  });

  backButton.addEventListener("click", function (event) {
    event.stopPropagation();
    goBack();
  });

  window.addEventListener("keydown", function (event) {
    if (event.target.closest("button, a, input, textarea, select")) {
      return;
    }
    if (event.key === "Enter" || event.key === " " || event.code === "Space") {
      event.preventDefault();
      handleAdvance();
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      goBack();
    }
  });

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    if (resizeTimer) {
      window.clearTimeout(resizeTimer);
    }

    resizeTimer = window.setTimeout(function () {
      if (state.currentBackground) {
        setBackground(state.currentBackground, false);
      }

      if (state.currentCharacter) {
        setCharacter(state.currentCharacter, { instant: true });
      }

      syncBackgroundGap();
      window.setTimeout(syncBackgroundGap, 120);
    }, 150);
  });

  document.addEventListener("DOMContentLoaded", boot);
})();
