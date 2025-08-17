"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/ui/list.ts
var require_list = __commonJS({
  "src/ui/list.ts"() {
    "use strict";
    function onClickSidebarBtn() {
      const btn = document.getElementById("ctSidebarToggle");
      if (!btn) {
        console.error("Sidebar toggle button not found");
        return;
      }
      btn.addEventListener("click", () => {
        const wrapper = document.querySelector(".js-ctGridWrapper");
        if (!wrapper) {
          return;
        }
        wrapper.classList.toggle("is-open");
      });
    }
    function changeCssFixedToAbsolute() {
      const targets = document.querySelectorAll(".ctCatalogMain *");
      targets.forEach((el) => {
        if (getComputedStyle(el).position === "fixed") {
          el.style.position = "absolute";
        }
      });
    }
    function onClickArrow() {
      const prevBtn = document.querySelector(".js-arrowPrev");
      const nextBtn = document.querySelector(".js-arrowNext");
      if (!prevBtn || !nextBtn) {
        console.error("Arrow buttons not found");
        return;
      }
      const list = document.querySelector(".js-ctSidebarNavi");
      const active = list?.querySelector(".active");
      const activeLi = active?.parentElement;
      prevBtn.addEventListener("click", () => {
        if (active && activeLi.previousElementSibling) {
          const prev = activeLi.previousElementSibling;
          const href = prev.querySelector("a")?.getAttribute("href");
          console.log(prev);
          if (href) {
            window.location.href = href;
          }
        }
      });
      nextBtn.addEventListener("click", () => {
        if (active && activeLi.nextElementSibling) {
          const next = activeLi.nextElementSibling;
          const href = next.querySelector("a")?.getAttribute("href");
          if (href) {
            window.location.href = href;
          }
        }
      });
    }
    function init() {
      changeCssFixedToAbsolute();
      onClickSidebarBtn();
      onClickArrow();
    }
    document.addEventListener("DOMContentLoaded", init);
  }
});

// src/ui/uiEntry.ts
var import_list = __toESM(require_list());
