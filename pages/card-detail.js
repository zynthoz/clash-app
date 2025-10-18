async function fetchCardDetail(cardId) {
  const res = await fetch('/api/cards');
  const data = await res.json();
  const card = data.items.find(c => c.id == cardId);

  // Fetch additional details from cardJson.json
  const jsonRes = await fetch('./cardJson.json');
  const jsonData = await jsonRes.json();
  const jsonCard = jsonData.cards.find(c => c.name === card.name);

  if (jsonCard) {
    card.description = jsonCard.description;
    card.maxLevel = jsonCard.maxLevel;
    card.related_cards = jsonCard.related_cards;
  }

  // Get full cards list for related cards
  card.allCards = data.items;

  return card;
}

function displayCardDetail(card) {
  const mainContent = document.getElementById('mainContent');

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

  // Breadcrumb navigation
  const breadcrumb = `
    <div class="mb-6 text-left md:absolute md:left-4 lg:left-16">
      <a href="card.html" class="text-blue-400 hover:text-amber-400 transition-colors text-lg md:text-base">← Back to Cards</a>
    </div>
  `;

  // Hero Section
  const heroSection = `
    <div class="text-center mb-12">
      <h1 class="text-6xl font-bold text-white mb-4 drop-shadow-2xl bg-gradient-to-r from-blue-400 via-amber-400 to-blue-400 bg-clip-text text-transparent">
        ${card.name}
      </h1>
      <p class="text-cyan-300 text-xl font-light mb-4">Card Profile & In-Depth Insights</p>
      <div class="flex justify-center items-center space-x-4 mb-6">
        <span class="px-4 py-2 bg-slate-800 rounded-full text-sm font-semibold ${getRarityTextClass(card.rarity)}">${card.rarity}</span>
        ${card.elixirCost ? `<span class="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-700 text-white rounded-full text-sm font-semibold">Elixir: ${card.elixirCost}</span>` : ''}
      </div>
      <div class="mt-4 w-24 h-1 bg-gradient-to-r from-amber-400 to-blue-400 mx-auto rounded-full"></div>
    </div>
  `;

  // Card Image Section
  const cardImageSection = `
    <div class="flex justify-center mb-12">
      <div class="bg-gradient-to-br from-slate-700 to-slate-800 w-80 h-96 p-8 rounded-3xl shadow-2xl border border-blue-500/30 hover:scale-105 hover:border-amber-400/50 hover:shadow-amber-500/50 transition-all duration-300 ease-in-out flex flex-col justify-center items-center">
        <img src="${card.iconUrls.medium}" alt="${card.name}" class="h-40 w-32 rounded-lg mb-6 drop-shadow-lg" />
        <div class="text-center text-xl font-bold text-white mb-4">${card.name}</div>
        <div class="text-lg text-slate-300 ${getRarityTextClass(card.rarity)}">${card.rarity}</div>
      </div>
    </div>
  `;

  // Stats Row (placeholder for now, as API may not have all stats)
  const statsRow = `
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto">
      <div class="stat-card p-4 rounded-lg text-center">
        <div class="text-2xl font-bold text-purple-600">${card.elixirCost || 'N/A'}</div>
        <div class="text-sm text-slate-300">Elixir Cost</div>
      </div>
      <div class="stat-card p-4 rounded-lg text-center">
        <div class="text-2xl font-bold ${getRarityTextClass(card.rarity)}">${card.rarity}</div>
        <div class="text-sm text-slate-300">Rarity</div>
      </div>
      <div class="stat-card p-4 rounded-lg text-center">
        <div class="text-2xl font-bold text-cyan-400">Troop</div>
        <div class="text-sm text-slate-300">Type</div>
      </div>
    </div>
  `;

  // Tabbed Description Panel
  const tabsSection = `
    <div class="max-w-4xl mx-auto mb-12">
      <div class="flex justify-center mb-6">
        <button class="tab-button px-6 py-3 mx-2 rounded-lg bg-slate-800 text-white active" data-tab="overview">Overview</button>
        <button class="tab-button px-6 py-3 mx-2 rounded-lg bg-slate-800 text-white" data-tab="strengths">Strengths & Weaknesses</button>
        <button class="tab-button px-6 py-3 mx-2 rounded-lg bg-slate-800 text-white" data-tab="popularity">Popularity & Meta</button>
      </div>
      <div class="tab-content active p-6 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-600" id="overview">
        <h3 class="text-2xl font-bold text-white mb-4">Overview</h3>
        <p class="text-slate-300">${card.description ? card.description.strength : 'No overview available.'}</p>
      </div>
      <div class="tab-content p-6 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-600" id="strengths">
        <h3 class="text-2xl font-bold text-white mb-4">Strengths & Weaknesses</h3>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h4 class="text-xl font-semibold text-green-400 mb-2">Strengths</h4>
            <p class="text-slate-300">${card.description ? card.description.strength : 'No strengths available.'}</p>
          </div>
          <div>
            <h4 class="text-xl font-semibold text-red-400 mb-2">Weaknesses</h4>
            <p class="text-slate-300">${card.description ? card.description.weakness : 'No weaknesses available.'}</p>
          </div>
        </div>
      </div>
      <div class="tab-content p-6 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-600" id="popularity">
        <h3 class="text-2xl font-bold text-white mb-4">Popularity & Meta Usage</h3>
        <p class="text-slate-300">${card.description ? card.description.popularity : 'No popularity data available.'}</p>
      </div>
    </div>
  `;

  // Related Cards Section
  const relatedCards = card.related_cards || [];
  const relatedSection = `
    <div class="max-w-4xl mx-auto mb-12">
      <h3 class="text-2xl font-bold text-white mb-6 text-center">Related Cards</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${relatedCards.map(related => {
          // Normalize names for matching: lowercase and remove spaces/punctuation
          const normalizeName = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
          const relatedCard = card.allCards.find(c => normalizeName(c.name) === normalizeName(related.name));
          if (!relatedCard) return '';
          return `
            <div class="related-card bg-gradient-to-br from-slate-700 to-slate-800 p-4 rounded-xl shadow-lg border border-slate-600 hover:scale-105 hover:border-amber-400/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='card-detail.html?id=${relatedCard.id}'">
              <img src="${relatedCard.iconUrls.medium}" alt="${relatedCard.name}" class="w-16 h-20 mx-auto mb-3 rounded-lg drop-shadow-md" />
              <h4 class="text-lg font-bold text-white text-center mb-2">${relatedCard.name}</h4>
              <p class="text-sm text-slate-300 text-center mb-2">${related.relation}</p>
              <p class="text-xs text-slate-400 text-center">${related.reason}</p>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  mainContent.innerHTML = `
    <div class="py-14 px-4 md:px-8 lg:px-48 w-full text-white">
      ${breadcrumb}
      ${heroSection}
      ${cardImageSection}
      ${statsRow}
      ${tabsSection}
      ${relatedSection}
    </div>
  `;

  // Tab functionality
  const tabButtons = mainContent.querySelectorAll('.tab-button');
  const tabContents = mainContent.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
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

  const urlParams = new URLSearchParams(window.location.search);
  const cardId = urlParams.get('id');

  if (cardId) {
    const card = await fetchCardDetail(cardId);
    displayCardDetail(card);
  } else {
    document.getElementById('mainContent').innerHTML = '<p class="text-white text-center">Card not found.</p>';
  }

  // Hide loading
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('mainContent').style.display = 'block';
})();
