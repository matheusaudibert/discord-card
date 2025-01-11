function applyMouseEffect(card) {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / card.clientWidth - 0.5) * 45;
    const y = ((e.clientY - rect.top) / card.clientHeight - 0.5) * 45;

    card.style.transform = `perspective(500px) rotateX(${y}deg) rotateY(${x}deg)`;
    card.style.transition = "transform 0.2s ease-out";

    const xPercent = ((e.clientX - rect.left) / card.clientWidth) * 100;
    const yPercent = ((e.clientY - rect.top) / card.clientHeight) * 100;
    card.style.setProperty("--x", `${xPercent}%`);
    card.style.setProperty("--y", `${yPercent}%`);
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(500px) rotateX(0deg) rotateY(0deg)";
    card.style.setProperty("--x", "50%");
    card.style.setProperty("--y", "50%");
    card.style.transition = "transform 1s ease-out";
  });
}

function initializeMouseEffect() {
  const cards = document.querySelectorAll(".mouse-effect");

  cards.forEach((card) => {
    applyMouseEffect(card);
  });
}

document.addEventListener("profileLoaded", () => {
  initializeMouseEffect();
});

document.addEventListener("DOMContentLoaded", () => {
  initializeMouseEffect();
});
