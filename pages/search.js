document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('default-search');
  const searchModal = document.getElementById('searchModal');
  const modalInput = document.getElementById('modalSearchInput');
  const searchResults = document.getElementById('searchResults');

  if (searchInput) {
    searchInput.addEventListener('click', function(e) {
        searchModal.classList.remove('hidden');
        modalInput.focus();
    });
  }

  if (searchModal) {
    // Close modal on outside click
    searchModal.addEventListener('click', function(e) {
      if (e.target === searchModal) {
        searchModal.classList.add('hidden');
        searchResults.innerHTML = '';
        modalInput.value = '';
      }
    });

    // Search on Enter in modal input
    modalInput.addEventListener('keydown', async function(e) {
      if (e.key === 'Enter') {
        const tag = modalInput.value.trim();
        if (!tag) return;

        try {
          const res = await fetch(`/api/player?tag=${encodeURIComponent(tag)}`);
          const data = await res.json();
          if (data.error) {
            searchResults.innerHTML = `<p class="text-red-500">Error: User does not exist</p>`;
          } else {
            // Navigate to player page
            window.location.href = `player.html?tag=${encodeURIComponent(tag)}`;
          }
        } catch (error) {
          searchResults.innerHTML = `<p class="text-red-500">Search failed: ${error.message}</p>`;
        }
      }
    });
  }
});
