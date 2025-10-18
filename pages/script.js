function getPlayer() {
  const input = document.getElementById('tagInput').value.trim();

  if (!input) {
    alert("Please enter a player tag!");
    return;
  }

  // Redirect to player.html with tag as query param
  window.location.href = `player.html?tag=${encodeURIComponent(input)}`;
}

document.getElementById('getPlayer').addEventListener('click', getPlayer);

// Scroll to Top Functionality
window.addEventListener('scroll', () => {
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (window.scrollY > 300) {
    scrollToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
  } else {
    scrollToTopBtn.classList.add('opacity-0', 'pointer-events-none');
  }
});

document.getElementById('scrollToTop').addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
