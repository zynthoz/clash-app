async function fetchTournaments() {
  const res = await fetch('/api/tournaments');
  const data = await res.json();
  console.log(data);
  return data;
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';

  // Convert from "YYYYMMDDTHHmmss.000Z" to a valid ISO 8601 format
  const isoString = dateString.replace(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2}).*$/,
    '$1-$2-$3T$4:$5:$6Z'
  );

  const date = new Date(isoString);

  // Format for local time (you can switch to 'en-GB' for 24-hour format)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}


function formatReward(reward) {
  const { type, amount, resource, consumableName, chest, rarity } = reward;
  switch (type) {
    case 'consumable':
      return `${amount} ${consumableName}`;
    case 'resource':
      return `${amount} ${resource}`;
    case 'chest':
      return `${chest} Chest`;
    case 'tradeToken':
      return `${amount} ${rarity} Trade Token`;
    case 'cardStackRandom':
      return `${amount} ${rarity} Card Stack`;
    default:
      return `${type}: ${amount}`;
  }
}

function renderTournamentCard(tournament, isActive = true) {
  const card = document.createElement('div');
  const baseClass = 'p-6 rounded-2xl shadow-2xl border backdrop-blur-sm hover:scale-105 transition-all duration-500 relative overflow-hidden';
  const activeClass = 'bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 border-blue-500/30 hover:shadow-amber-500/20 hover:border-amber-400/50';
  const inactiveClass = 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 border-gray-500/30 opacity-75';

  card.className = baseClass + ' ' + (isActive ? activeClass : inactiveClass);

  // Add glassy effect
  card.style.background = 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(30, 58, 138, 0.8) 50%, rgba(15, 23, 42, 0.9) 100%)';
  card.style.backdropFilter = 'blur(10px)';

  const milestoneRewards = tournament.milestoneRewards || [];
  const freeTierRewards = tournament.freeTierRewards || [];
  const topRankReward = tournament.topRankReward || [];

  // Function to render rewards list
  const renderRewardsList = (rewards, title) => {
    if (rewards.length === 0) return `<div class="text-sm text-gray-400">${title}: None</div>`;
    return `
      <div class="text-sm text-blue-200 bg-blue-900/30 p-2 rounded-lg">
        <strong>${title}:</strong>
        <ul class="list-disc list-inside mt-1">
          ${rewards.map(reward => `<li>Win ${reward.wins}: ${formatReward(reward)}</li>`).join('')}
        </ul>
      </div>
    `;
  };

  // Format top rank reward
  const renderTopRankReward = () => {
    if (topRankReward.length === 0) return '';
    const reward = topRankReward[0];
    return `<div class="text-sm text-amber-300 bg-amber-900/30 p-2 rounded-lg font-semibold">Top Rank Reward: ${formatReward(reward)}</div>`;
  };

  card.innerHTML = `
    <div class="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent rounded-2xl"></div>
    <div class="relative z-10">
      <div class="mb-4">
        <h3 class="text-xl font-bold text-white mb-2 drop-shadow-lg">${tournament.title}</h3>
        <p class="text-blue-300 text-sm font-medium">Tag: ${tournament.tag}</p>
      </div>

      <div class="space-y-3 mb-4">
        <div class="flex justify-between items-center">
          <span class="text-blue-300 text-sm font-medium">Start:</span>
          <span class="text-white text-sm bg-blue-600/20 px-2 py-1 rounded-lg">${formatDate(tournament.startTime)}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-blue-300 text-sm font-medium">End:</span>
          <span class="text-white text-sm bg-blue-600/20 px-2 py-1 rounded-lg">${formatDate(tournament.endTime)}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-blue-300 text-sm font-medium">Max Losses:</span>
          <span class="text-white text-sm bg-slate-700/50 px-2 py-1 rounded-lg">${tournament.maxLosses}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-blue-300 text-sm font-medium">Min Level:</span>
          <span class="text-white text-sm bg-slate-700/50 px-2 py-1 rounded-lg">${tournament.minExpLevel}</span>
        </div>
      </div>

      <div class="border-t border-amber-400/30 pt-4">
        <h4 class="text-lg font-semibold text-amber-400 mb-3 flex items-center">
          <span class="mr-2">🏆</span>Rewards
        </h4>
        <div class="space-y-2">
          ${renderRewardsList(milestoneRewards, 'Milestone Rewards')}
          ${renderRewardsList(freeTierRewards, 'Free Tier Rewards')}
          ${renderTopRankReward()}
        </div>
      </div>
    </div>
  `;

  return card;
}

async function loadTournaments() {
  const loading = document.getElementById('loading');
  const container = document.getElementById('tournamentsContainer');

  loading.classList.remove('hidden');

  try {
    const data = await fetchTournaments();
    if (data && data.items) {
      const now = new Date();
      const activeTournaments = [];
      const inactiveTournaments = [];

      data.items.forEach(tournament => {
        const start = new Date(tournament.startTime);
        const end = new Date(tournament.endTime);
        if (now >= start && now <= end) {
          activeTournaments.push(tournament);
        } else {
          inactiveTournaments.push(tournament);
        }
      });

      container.innerHTML = '';

      if (activeTournaments.length > 0) {
        activeTournaments.forEach(tournament => {
          const card = renderTournamentCard(tournament, true);
          container.appendChild(card);
        });
      } else {
        container.innerHTML += '<p class="text-red-400 text-center col-span-full mb-8">No active tournaments at the moment.</p>';
      }

      if (inactiveTournaments.length > 0) {
        const inactiveHeader = document.createElement('h2');
        inactiveHeader.className = 'text-3xl font-bold text-white mb-6 drop-shadow-2xl bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent text-center col-span-full';
        inactiveHeader.textContent = 'Inactive Tournaments';
        container.appendChild(inactiveHeader);

        inactiveTournaments.forEach(tournament => {
          const card = renderTournamentCard(tournament, false);
          container.appendChild(card);
        });
      }
    } else {
      container.innerHTML = '<p class="text-red-400 text-center col-span-full">No tournaments available at the moment.</p>';
    }
  } catch (error) {
    console.error('Error loading tournaments:', error);
    container.innerHTML = '<p class="text-red-400 text-center col-span-full">Failed to load tournaments. Please try again later.</p>';
  } finally {
    loading.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', loadTournaments);
