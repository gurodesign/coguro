
  window.addEventListener("DOMContentLoaded", (e) => {

    document.querySelectorAll(".fading-slideshow > li").forEach((current) => {
      current.addEventListener("animationend", (e) => {
        e.target.parentNode.appendChild(e.target);
      });
    });

  });
