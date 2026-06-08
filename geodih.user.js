// ==UserScript==
// @name         GeoDuels -> Geodih
// @namespace    local.geodih
// @version      1.3.2
// @description  Locally changes GeoDuels text to Geodih on GeoDuels pages.
// @author       fketa
// @match        https://geoduels.io/*
// @match        https://www.geoduels.io/*
// @run-at       document-start
// @inject-into  content
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  var FIND = /geoduels/gi;
  var ATTRIBUTES = ["alt", "aria-label", "content", "placeholder", "title", "value"];
  var SKIP = { SCRIPT: true, STYLE: true, NOSCRIPT: true, TEXTAREA: true };
  var replacementCount = 0;
  var runCount = 0;
  window.__geodihUserscriptStatus = { runs: 0, replacements: 0 };

  function replaceCase(match) {
    if (match === match.toUpperCase()) return "GEODIH";
    if (match === match.toLowerCase()) return "geodih";
    return "Geodih";
  }

  function replaceText(value) {
    return value ? String(value).replace(FIND, replaceCase) : value;
  }

  function rewriteTextNode(node) {
    var next = replaceText(node.nodeValue);

    if (next !== node.nodeValue) {
      node.nodeValue = next;
      replacementCount += 1;
    }
  }

  function rewriteAttribute(element, attribute) {
    if (!element.hasAttribute || !element.hasAttribute(attribute)) return;

    var current = element.getAttribute(attribute);
    var next = replaceText(current);

    if (next !== current) {
      element.setAttribute(attribute, next);
      replacementCount += 1;
    }
  }

  function rewriteElement(element) {
    if (!element || !element.tagName || SKIP[element.tagName]) return;

    for (var i = 0; i < ATTRIBUTES.length; i += 1) {
      rewriteAttribute(element, ATTRIBUTES[i]);
    }

    if (element.tagName === "IMG") {
      rewriteLogo(element);
    }

    var children = element.childNodes;

    for (var j = 0; j < children.length; j += 1) {
      if (children[j].nodeType === 3) {
        rewriteTextNode(children[j]);
      }
    }
  }

  function rewriteLogo(image) {
    var src = image.getAttribute("src") || "";
    var alt = image.getAttribute("alt") || "";

    if (src.indexOf("logo") === -1 && !/geoduels/i.test(alt)) return;

    var logo = makeLogoDataURL();

    if (image.getAttribute("src") !== logo) {
      image.setAttribute("src", logo);
      image.removeAttribute("srcset");
      replacementCount += 1;
    }
  }

  function scan() {
    runCount += 1;
    window.__geodihUserscriptStatus.runs = runCount;
    window.__geodihUserscriptStatus.replacements = replacementCount;

    try {
      document.title = replaceText(document.title);

      var elements = document.getElementsByTagName("*");

      for (var i = 0; i < elements.length; i += 1) {
        try {
          rewriteElement(elements[i]);
        } catch (elementError) {
          console.warn("[geodih-userscript] skipped one element", elementError);
        }
      }

      showBadge("Geodih active: " + replacementCount);
      window.__geodihUserscriptStatus.replacements = replacementCount;
    } catch (error) {
      showBadge("Geodih script error");
      console.error("[geodih-userscript] failed", error);
    }
  }

  function showBadge(text) {
    if (!document.body) return;

    var badge = document.getElementById("geodih-userscript-active");

    if (!badge) {
      badge = document.createElement("div");
      badge.id = "geodih-userscript-active";
      badge.style.position = "fixed";
      badge.style.left = "8px";
      badge.style.bottom = "8px";
      badge.style.zIndex = "2147483647";
      badge.style.padding = "5px 8px";
      badge.style.borderRadius = "6px";
      badge.style.background = "#111827";
      badge.style.color = "#fff";
      badge.style.font = "600 11px system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
      badge.style.boxShadow = "0 4px 16px rgba(0,0,0,.3)";
      badge.style.opacity = ".88";
      badge.style.pointerEvents = "none";
      document.body.appendChild(badge);
    }

    badge.textContent = text;
  }

  function makeLogoDataURL() {
    var svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 80">',
      '<rect width="256" height="80" fill="none"/>',
      '<circle cx="39" cy="40" r="31" fill="#1aa8ff"/>',
      '<path d="M14 25c10-11 30-13 45-3 10 7 14 17 13 29C52 52 34 41 14 25Z" fill="#55e040"/>',
      '<path d="M13 43c20 2 38 9 55 22" fill="none" stroke="#062f9a" stroke-width="8" stroke-linecap="round" opacity=".75"/>',
      '<path d="M20 20c21 10 39 22 52 36" fill="none" stroke="#a6ff75" stroke-width="5" stroke-linecap="round" opacity=".8"/>',
      '<circle cx="39" cy="40" r="31" fill="none" stroke="#062bc4" stroke-width="3"/>',
      '<text x="77" y="54" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="800">Geodih</text>',
      "</svg>"
    ].join("");

    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  console.info("[geodih-userscript] installed on", location.href);

  function start() {
    scan();
    setInterval(scan, 300);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
