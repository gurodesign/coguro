const container2 = document.querySelector('.slide-reveal-container2');
document.querySelector('.slider2').addEventListener('input', (e) => {
  container2.style.setProperty('--position', `${e.target.value}%`);
})