async function fetchPlayer(tag) {
  const res = await fetch(`/api/player?tag=${encodeURIComponent(tag)}`);
  const data = await res.json();
  console.log(data);
  return data;
}

async function fetchBattleLog(tag) {
  const res = await fetch(`/api/player/battlelog?tag=${encodeURIComponent(tag)}`);
  const data = await res.json();
  return data;
}

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function displayPlayer(data) {
  if (data.error) {
    document.getElementById('playerInfo').textContent = `Error: ${data.error}`;
  } else {
    // Use optional chaining and fallback values for nested data
    console.log("hello");

    const clanName = data.clan?.name || 'No Clan';
    const clanRole = data.clan?.role || '';

    // Extract arena name safely
    const arenaName = data.arena?.name || 'Arena 15';

    const formatted = {
      name: data.name,
      tag: data.tag,
      expLevel: data.expLevel,
      clanName: clanName,
      clanRole: clanRole,
      wins: data.wins,
      battleCount: data.battleCount,
      trophies: data.trophies,
      bestTrophies: data.bestTrophies,
      losses: data.losses,
      threeCrownWins: data.threeCrownWins,
      currentDeck: data.currentDeck,
      currentFavouriteCard: data.currentFavouriteCard
    };

    // Set static elements
    document.getElementById('playerName').textContent = formatted.name;
    document.getElementById('playerTag').textContent = formatted.tag;
    document.getElementById('playerLevel').textContent = formatted.expLevel;
    document.getElementById('clanName').textContent = formatted.clanName;
    document.getElementById('clanRole').textContent = formatted.clanRole;

    // Insert Key Stats section
    const aside = document.querySelector('aside');
    const clanSection = document.getElementById('clanHeading').parentElement;
    const keyStatsSection = document.createElement('section');
    keyStatsSection.id = 'keyStatsSection';
    keyStatsSection.className = 'bg-gradient-to-br from-slate-700 to-slate-800 p-4 rounded-2xl shadow-2xl border border-gray-500/30 backdrop-blur';
    keyStatsSection.innerHTML = `
      <h3 id="statsHeading" class="text-lg font-semibold text-blue-300 mb-4">Key Stats</h3>
      <div class="grid grid-cols-1 gap-3">
        <div class="bg-gradient-to-br from-slate-700 to-slate-800 p-3 rounded-lg shadow-md border border-amber-400/30 hover:scale-102 hover:border-amber-400/50 transition-all duration-300 ease-in-out">
          <div class="text-amber-400 text-sm">Trophies</div>
          <div class="text-2xl font-bold text-white" id="trophies">${formatted.trophies}</div>
        </div>
        <div class="bg-gradient-to-br from-slate-700 to-slate-800 p-3 rounded-lg shadow-md border border-amber-400/30 hover:scale-102 hover:border-amber-400/50 transition-all duration-300 ease-in-out">
          <div class="text-amber-400 text-sm">Best Trophies</div>
          <div class="text-2xl font-bold text-white" id="bestTrophies">${formatted.bestTrophies}</div>
        </div>
        <div class="bg-gradient-to-br from-slate-700 to-slate-800 p-3 rounded-lg shadow-md border border-blue-500/30 hover:scale-102 hover:border-amber-400/50 transition-all duration-300 ease-in-out">
          <div class="text-blue-300 text-sm">Battles Won</div>
          <div class="text-2xl font-bold text-white" id="battlesWon">${formatted.wins}</div>
        </div>
        <div class="bg-gradient-to-br from-slate-700 to-slate-800 p-3 rounded-lg shadow-md border border-blue-500/30 hover:scale-102 hover:border-amber-400/50 transition-all duration-300 ease-in-out">
          <div class="text-blue-300 text-sm">Total Battles</div>
          <div class="text-2xl font-bold text-white" id="totalBattles">${formatted.battleCount}</div>
        </div>
        <div class="bg-gradient-to-br from-slate-700 to-slate-800 p-3 rounded-lg shadow-md border border-blue-500/30 hover:scale-102 hover:border-amber-400/50 transition-all duration-300 ease-in-out">
          <div class="text-blue-300 text-sm">Favorite Card</div>
          <div id="favoriteCard" class="flex flex-col items-center mt-2">
            <img src="${formatted.currentFavouriteCard.iconUrls.medium}" alt="${formatted.currentFavouriteCard.name}" class="h-24 w-16 rounded-md" />
            <div class="text-sm">${formatted.currentFavouriteCard.name}</div>
          </div>
        </div>
      </div>
    `;
    aside.insertBefore(keyStatsSection, clanSection.nextSibling);

    // Populate detailed stats
    document.getElementById('win-rate').textContent = formatted.wins && formatted.battleCount ? ((formatted.wins / formatted.battleCount) * 100).toFixed(2) + '%' : 'N/A';
    document.getElementById('losses').textContent = formatted.losses;
    document.getElementById('threeCrownWins').textContent = formatted.threeCrownWins;

    // Populate battle deck
    const deckContainer = document.getElementById('battleDeck');
    deckContainer.innerHTML = '';
    let totalElixirCost = 0;
    formatted.currentDeck.forEach(card => {
      const cardDiv = document.createElement('div');
      cardDiv.className = 'flex flex-col items-center text-xs min-h-20 bg-gray-800 rounded-lg p-2';
      cardDiv.innerHTML = `
        <img src="${card.iconUrls.medium}" alt="${card.name}" class="h-28 w-20 rounded-md" />
        <div class="text-center">${card.name}</div>
        <div class="text-xs text-purple-500">${card.elixirCost}</div>
      `;
      totalElixirCost += card.elixirCost;
      deckContainer.appendChild(cardDiv);
    });
    const battleDeckSection = document.getElementById('battleDeckSection');
    battleDeckSection.innerHTML += `
      <div class="flex items-center text-xs min-h-20 p-2">
        <div class="text-sm font-bold text-center mt-2">Avg Elixir: </div>
        <div class="text-lg font-bold text-purple-500 ml-2 mt-2">${(totalElixirCost / formatted.currentDeck.length).toFixed(1)}</div>
      </div>`;

    // Populate badges
    const badgesContainer = document.getElementById('badgesContainer');
    badgesContainer.innerHTML = '';
    if (data.badges && data.badges.length > 0) {
      const validBadges = data.badges.filter(badge => badge && badge.iconUrls && badge.iconUrls.large && badge.iconUrls.large.trim() !== '');
      if (validBadges.length > 0) {
        validBadges.forEach(badge => {
          const badgeDiv = document.createElement('div');
          badgeDiv.className = 'aspect-square flex items-center justify-center cursor-pointer';
          badgeDiv.onclick = toggleBadges;
          badgeDiv.innerHTML = `
            <img src="${badge.iconUrls.large}" alt="${badge.name}" class="w-full h-full object-cover" />
          `;
          badgesContainer.appendChild(badgeDiv);
        });
      } else {
        badgesContainer.innerHTML = '<p class="text-gray-400 text-xs col-span-full text-center">No badges available.</p>';
      }
    } else {
      badgesContainer.innerHTML = '<p class="text-gray-400 text-xs col-span-full text-center">No badges available.</p>';
    }
  }
}

function toggleBadges() {
  const badgesContainer = document.getElementById('badgesContainer');
  const toggleIcon = document.getElementById('badgesToggleIcon');
  if (badgesContainer.classList.contains('hidden')) {
    badgesContainer.classList.remove('hidden');
    toggleIcon.textContent = '▲';
  } else {
    badgesContainer.classList.add('hidden');
    toggleIcon.textContent = '▼';
  }
}

function displayBattleLog(battles) {
  const battleLogContainer = document.getElementById('battleLog');
  if (battles.error) {
    battleLogContainer.innerHTML = `<p class="text-red-300 text-center">Error loading battle log: ${battles.error}</p>`;
    return;
  }

  if (!battles || battles.length === 0) {
    battleLogContainer.innerHTML = `<p class="text-gray-400 text-center">No battle log available.</p>`;
    return;
  }

  // Limit to last 10 battles for performance
  const recentBattles = battles.slice(0, 10);

  battleLogContainer.innerHTML = recentBattles.map(battle => {
    const battleTime = new Date(battle.battleTime.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\.(\d{3})Z/, '$1-$2-$3T$4:$5:$6.$7Z')).toLocaleString();
    const player = battle.team[0];
    const opponent = battle.opponent[0];
    const trophyChange = player.trophyChange;
    const crowns = player.crowns;
    const outcomeClass = trophyChange >= 0 ? 'text-green-400' : 'text-red-400';
    const outcomeIcon = trophyChange >= 0 ? '🏆' : '💀';
    const arenaName = battle.arena?.name || 'Unknown Arena';
    const gameMode = battle.gameMode?.name || 'Unknown Mode';

    return `
      <div class="bg-gradient-to-br from-slate-700 to-slate-800 p-4 rounded-2xl shadow-2xl border border-gray-500/30 backdrop-blur hover:scale-102 hover:border-amber-400/50 hover:shadow-amber-500/20 transition-all duration-300 ease-in-out">
        <div class="flex flex-col sm:flex-row justify-between items-center sm:items-center mb-3">
          <div class="flex flex-col sm:flex-row items-center gap-2">
            <span class="text-sm text-blue-300">${outcomeIcon}</span>
            <span class="text-sm font-medium text-white">${battle.type} - ${gameMode}</span>
            <span class="text-xs text-slate-300">in ${arenaName}</span>
          </div>
          <div class="text-xs text-gray-400 mt-1 sm:mt-0">${battleTime}</div>
        </div>
        <div class="flex flex-col lg:flex-row gap-4 items-start">
          <div class="flex-1 bg-gradient-to-br from-slate-700 to-blue-800 rounded-lg p-3 border border-blue-500/30">
            <div class="text-center mb-2">
              <div class="text-xs text-white font-bold truncate">${player.name}</div>
              <div class="text-xs text-blue-300">#${player.tag.slice(1)}</div>
              <div class="text-sm ${outcomeClass} font-bold">${trophyChange > 0 ? '+' : ''}${trophyChange} Trophies</div>
              <div class="text-xs text-amber-400">👑 ${crowns}</div>
            </div>
            <div class="grid grid-cols-4 gap-1">
              ${player.cards.map(card => `
                <div class="flex flex-col items-center text-xs bg-gradient-to-br from-slate-800 to-blue-900 rounded p-1 border-2 border-blue-600/50 hover:scale-102 hover:border-blue-500/70 transition-all duration-300 ease-in-out">
                  <img src="${card.iconUrls.medium}" alt="${card.name}" class="h-12 w-10 rounded" />
                  <div class="text-center text-white truncate w-full text-xs">${card.name}</div>
                  <div class="text-blue-200 text-xs">${card.elixirCost}</div>
                </div>
              `).join('')}
            </div>
            <div class="text-center text-xs text-blue-300 mt-2">Avg Elixir: ${(player.cards.reduce((sum, card) => sum + card.elixirCost, 0) / player.cards.length).toFixed(1)}</div>
          </div>
          <div class="text-center text-xs text-slate-300 self-center">VS</div>
          <div class="flex-1 bg-gradient-to-br from-slate-700 to-amber-800 rounded-lg p-3 border border-amber-500/30">
            <div class="text-center mb-2">
              <div class="text-xs text-white font-bold truncate">${opponent.name}</div>
              <div class="text-xs text-amber-300">#${opponent.tag.slice(1)}</div>
              <div class="text-sm ${outcomeClass === 'text-green-400' ? 'text-red-400' : 'text-green-400'} font-bold">${-trophyChange} Trophies</div>
              <div class="text-xs text-amber-400">👑 ${opponent.crowns}</div>
            </div>
            <div class="grid grid-cols-4 gap-1">
              ${opponent.cards.map(card => `
                <div class="flex flex-col items-center text-xs bg-gradient-to-br from-slate-800 to-amber-900 rounded p-1 border-2 border-amber-600/50 hover:scale-102 hover:border-amber-500/70 transition-all duration-300 ease-in-out">
                  <img src="${card.iconUrls.medium}" alt="${card.name}" class="h-12 w-10 rounded" />
                  <div class="text-center text-white truncate w-full text-xs">${card.name}</div>
                  <div class="text-amber-200 text-xs">${card.elixirCost}</div>
                </div>
              `).join('')}
            </div>
            <div class="text-center text-xs text-amber-300 mt-2">Avg Elixir: ${(opponent.cards.reduce((sum, card) => sum + card.elixirCost, 0) / opponent.cards.length).toFixed(1)}</div>
          </div>
        </div>
        <div class="mt-3 text-xs text-slate-300 text-center">
          Elixir Leaked: ${player.elixirLeaked.toFixed(2)}
        </div>
      </div>
    `;
  }).join('');
}

(async () => {
  const tag = getQueryParam('tag');
  if (!tag) {
    document.getElementById('playerInfo').textContent = 'No player tag provided.';
    return;
  }
  // Show loading
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('mainContent').style.visibility = 'hidden';
  document.getElementById('detailedStatsSection').style.display = 'none';
  const [playerData, battleData] = await Promise.all([fetchPlayer(tag), fetchBattleLog(tag)]);
  displayPlayer(playerData);
  displayBattleLog(battleData);
  // Hide loading
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('mainContent').style.visibility = 'visible';
  document.getElementById('keyStatsSection').style.display = 'block';
  document.getElementById('detailedStatsSection').style.display = 'block';
  document.getElementById('battleDeckSection').style.display = 'block';
  document.getElementById('badgesSection').style.display = 'block';
  document.getElementById('battleLogSection').style.display = 'block';
})();

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
