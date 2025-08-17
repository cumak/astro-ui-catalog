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
  const targets = document.querySelectorAll(".ctCatalogMain *") as NodeListOf<HTMLElement>;
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
  const activeLi = active?.parentElement as HTMLElement;
  prevBtn.addEventListener("click", () => {
    if (active && activeLi.previousElementSibling) {
      const prev = activeLi.previousElementSibling as HTMLElement;
      const href = prev.querySelector("a")?.getAttribute("href");
      console.log(prev);
      if (href) {
        window.location.href = href;
      }
    }
  });
  nextBtn.addEventListener("click", () => {
    if (active && activeLi.nextElementSibling) {
      const next = activeLi.nextElementSibling as HTMLElement;
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
