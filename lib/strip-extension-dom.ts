/** Inlined in layout — removes AV-extension attrs before React hydrates. */
export const STRIP_EXTENSION_DOM_SCRIPT = `
(function () {
  var KEYS = ["bis_skin_checked", "bis_register"];
  function strip() {
    try {
      for (var i = 0; i < KEYS.length; i++) {
        var key = KEYS[i];
        var nodes = document.querySelectorAll("[" + key + "]");
        for (var j = 0; j < nodes.length; j++) {
          nodes[j].removeAttribute(key);
        }
      }
    } catch (e) {}
  }
  strip();
  if (typeof MutationObserver === "undefined" || !document.documentElement) return;
  var obs = new MutationObserver(function () {
    strip();
  });
  obs.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: KEYS,
  });
  document.addEventListener("DOMContentLoaded", strip);
  setTimeout(function () {
    obs.disconnect();
  }, 4000);
})();
`.trim()
