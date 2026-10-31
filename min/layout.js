(function () {
  'use strict';
  var root = document.getElementById('vnRoot');
  var dock = document.querySelector('.story-dock');
  var hud = document.querySelector('.hud');
  var stage = document.querySelector('.character-stage');
  var sprite = document.getElementById('characterSprite');
  var choice = document.getElementById('choiceBox');
  var dialogue = document.getElementById('dialogueBox');
  var ending = document.getElementById('endingCard');
  var pending = false;

  function layout() {
    pending = false;
    var isEnding = root.classList.contains('is-ending');
    var isChoice = choice.classList.contains('is-visible');
    choice.inert = !isChoice || isEnding;
    ending.inert = !isEnding;
    dialogue.inert = isChoice || isEnding;
    var rootRect = root.getBoundingClientRect();
    var logoRect = document.querySelector('.hud-unity-logo').getBoundingClientRect();
    var hudBottom = Math.max(hud.getBoundingClientRect().bottom, logoRect.bottom) - rootRect.top + 10;
    root.style.setProperty('--min-hud-floor', hudBottom + 'px');
    if (isEnding) return;
    var floor = rootRect.bottom - dock.getBoundingClientRect().top;
    root.style.setProperty('--min-floor', floor + 'px');

    var file = sprite.getAttribute('src');
    var bounds = window.VN_ASSETS.spriteBounds[file];
    if (!bounds || !sprite.complete || !sprite.naturalWidth) {
      sprite.removeAttribute('data-fitted');
      return;
    }
    var area = stage.getBoundingClientRect();
    var margin = rootRect.width <= 900 ? 12 : Math.min(64, rootRect.width * 0.04);
    var wantedHeight = rootRect.height * (rootRect.width <= 900 ? 0.52 : 0.68);
    var visibleWidth = bounds.right - bounds.x;
    var visibleHeight = bounds.bottom - bounds.y;
    var scale = Math.min(wantedHeight / visibleHeight, area.height / visibleHeight,
      Math.max(1, area.width - 2 * margin) / visibleWidth);
    // Place the visible bottom, not the transparent canvas edge, against the text.
    sprite.style.width = bounds.width * scale + 'px';
    sprite.style.height = bounds.height * scale + 'px';
    sprite.style.left = margin - bounds.x * scale + 'px';
    sprite.style.top = area.height - bounds.bottom * scale + 'px';
    sprite.style.clipPath = 'inset(' + bounds.y / bounds.height * 100 + '% ' +
      (bounds.width - bounds.right) / bounds.width * 100 + '% ' +
      (bounds.height - bounds.bottom) / bounds.height * 100 + '% ' + bounds.x / bounds.width * 100 + '%)';
    sprite.dataset.fitted = 'true';
  }

  function schedule() {
    if (!pending) {
      pending = true;
      requestAnimationFrame(layout);
    }
  }
  new ResizeObserver(schedule).observe(root);
  new ResizeObserver(schedule).observe(dock);
  new ResizeObserver(schedule).observe(hud);
  new MutationObserver(schedule).observe(choice, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(schedule).observe(root, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(function () { sprite.removeAttribute('data-fitted'); schedule(); })
    .observe(sprite, { attributes: true, attributeFilter: ['src'] });
  sprite.addEventListener('load', schedule);
  window.addEventListener('resize', schedule);
  document.querySelectorAll('.hud img').forEach(function (img) { img.addEventListener('load', schedule); });
  document.addEventListener('DOMContentLoaded', schedule);
})();
