async function fetchCards() {
  const res = await fetch('/api/cards');
  const data = await res.json();
  console.log(data);
  return data;
}



function displayCards(data) {
  const mainContent = document.getElementById('mainContent');
  let cards = data.items || [];
  if (!cards || cards.length === 0) {
    mainContent.innerHTML = '<p class="text-white text-center">No cards available.</p>';
    return;
  }

  // Default sort by rarity
  const rarityOrder = { 'common': 1, 'rare': 2, 'epic': 3, 'legendary': 4, 'champion': 5 };
  cards.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);

  const getRarityTextClass = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-300';
      case 'rare': return 'text-orange-500';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'bg-gradient-to-r from-pink-300 via-yellow-300 to-green-300 text-transparent bg-clip-text [text-shadow:none]';
      case 'champion': return 'bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 text-transparent bg-clip-text [text-shadow:none]';
      default: return 'text-gray-300';
    }
  };

  let currentItems = cards;
  let currentTitle = "Cards";

  function renderCards() {
    mainContent.innerHTML = `
      <div class="py-14 px-4 md:px-8 lg:px-48 w-full text-white">
        <div class="text-center mb-12">
          <h1 class="text-5xl font-bold text-white mb-4 drop-shadow-2xl bg-gradient-to-r from-blue-400 via-amber-400 to-blue-400 bg-clip-text text-transparent">
            ${currentTitle}
          </h1>
          <p class="text-cyan-300 text-xl font-light">Explore all cards and towers in Clash Royale!</p>
          <div class="mt-4 w-24 h-1 bg-gradient-to-r from-amber-400 to-blue-400 mx-auto rounded-full"></div>
        </div>
        <div class="flex flex-wrap justify-center gap-6 mb-8">
          <button id="sortRarity" class="sort-btn bg-gradient-to-r from-blue-800 to-blue-600 text-slate-200 px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-amber-400 hover:text-white active:scale-95 transition-all duration-300 border border-blue-500/30">Sort by Rarity</button>
          <button id="sortName" class="sort-btn bg-gradient-to-r from-blue-800 to-blue-600 text-slate-200 px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-amber-400 hover:text-white active:scale-95 transition-all duration-300 border border-blue-500/30">Sort by Name</button>
          <button id="sortElixir" class="sort-btn bg-gradient-to-r from-blue-800 to-blue-600 text-slate-200 px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-amber-400 hover:text-white active:scale-95 transition-all duration-300 border border-blue-500/30">Sort by Elixir</button>
          <button id="toggleOrder" class="bg-gradient-to-r from-blue-800 to-blue-600 text-slate-200 px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-amber-400 hover:text-white active:scale-95 transition-all duration-300 border border-blue-500/30 w-[172px]">Ascending</button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 max-w-[1400px] mx-auto place-items-center" id="cardsGrid">
          ${currentItems.map(item => `
            <div class="card-item bg-gradient-to-br from-slate-700 to-slate-800 w-48 h-64 p-4 rounded-2xl shadow-2xl border border-blue-500/30 hover:scale-105 hover:border-amber-400/50 hover:shadow-amber-500/50 transition-all duration-300 ease-in-out flex flex-col justify-center items-center" data-card-id="${item.id}">
              <div class="flex flex-col items-center">
                <img src="${item.iconUrls.medium}" alt="${item.name}" class="h-24 w-20 rounded-md mb-4" />
                <div class="text-center text-lg font-bold text-white mb-2">${item.name}</div>
                ${item.elixirCost ? `<div class="text-sm text-purple-300 mb-1">Elixir: ${item.elixirCost}</div>` : ''}
                <div class="text-sm text-slate-300 ${getRarityTextClass(item.rarity)}">${item.rarity}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Add event listeners
    let currentSort = 'rarity';
    let ascending = true;

    // Set initial selected
    document.getElementById('sortRarity').classList.add('ring-2', 'ring-white');

    document.getElementById('sortRarity').addEventListener('click', () => {
      currentSort = 'rarity';
      updateSelected('sortRarity');
      sortCards();
    });

    document.getElementById('sortName').addEventListener('click', () => {
      currentSort = 'name';
      updateSelected('sortName');
      sortCards();
    });

    document.getElementById('sortElixir').addEventListener('click', () => {
      currentSort = 'elixir';
      updateSelected('sortElixir');
      sortCards();
    });

    document.getElementById('toggleOrder').addEventListener('click', () => {
      ascending = !ascending;
      document.getElementById('toggleOrder').textContent = ascending ? '⬆ Ascending' : '⬇ Descending';
      sortCards();
    });

    // Add card click listeners
    document.querySelectorAll('.card-item').forEach(item => {
      item.addEventListener('click', () => {
        const cardId = item.getAttribute('data-card-id');
        window.location.href = `card-detail.html?id=${cardId}`;
      });
    });

    function updateSelected(selectedId) {
      document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-white');
      });
      const element = document.getElementById(selectedId);
      if (element) {
        element.classList.add('ring-2', 'ring-white');
      }
    }

    function sortCards() {
      if (currentSort === 'rarity') {
        currentItems.sort((a, b) => ascending ? rarityOrder[a.rarity] - rarityOrder[b.rarity] : rarityOrder[b.rarity] - rarityOrder[a.rarity]);
      } else if (currentSort === 'name') {
        currentItems.sort((a, b) => ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
      } else if (currentSort === 'elixir') {
        currentItems.sort((a, b) => ascending ? a.elixirCost - b.elixirCost : b.elixirCost - a.elixirCost);
      }
      document.getElementById('cardsGrid').innerHTML = currentItems.map(item => `
        <div class="card-item bg-gradient-to-br from-slate-700 to-slate-800 w-48 h-64 p-4 rounded-2xl shadow-2xl border border-blue-500/30 hover:scale-105 hover:border-amber-400/50 hover:shadow-amber-500/50 transition-all duration-300 ease-in-out flex flex-col justify-center items-center" data-card-id="${item.id}">
          <div class="flex flex-col items-center">
            <img src="${item.iconUrls.medium}" alt="${item.name}" class="h-24 w-20 rounded-md mb-4" />
            <div class="text-center text-lg font-bold text-white mb-2">${item.name}</div>
            ${item.elixirCost ? `<div class="text-sm text-purple-300 mb-1">Elixir: ${item.elixirCost}</div>` : ''}
            <div class="text-sm text-slate-300 ${getRarityTextClass(item.rarity)}">${item.rarity}</div>
          </div>
        </div>
      `).join('');
    }
  }

  renderCards();
}

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

(async () => {
  // Show loading
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('mainContent').style.display = 'none';
  const cards = await fetchCards();
  displayCards(cards);
  // Hide loading
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('mainContent').style.display = 'block';
})();
