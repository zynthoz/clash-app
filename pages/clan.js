async function fetchClanLeaderboard(location = 'global', cursor = null) {
  try {
    console.log("Starting fetch for clan leaderboard data...");
    const params = new URLSearchParams({ location });
    if (cursor) {
      params.append(cursor.type, cursor.value);
    }
    const res = await fetch(`/api/clan?${params.toString()}`);
    if (!res.ok) {
      console.error(`Fetch failed with status: ${res.status} ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    console.log("Fetched clan leaderboard data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching clan leaderboard data:", error);
    return null;
  }
}

function renderLeaderboard(data) {
  const tableBody = document.getElementById("leaderboardTable");
  tableBody.innerHTML = ""; // Clear existing rows

  if (!data || !data.items) {
    console.error("Invalid data structure:", data);
    return;
  }

  data.items.forEach((clan, index) => {
    const row = document.createElement("tr");
    const isEven = index % 2 === 0;
    row.className = `transition-colors duration-200 hover:bg-slate-700/50 ${isEven ? 'bg-slate-800/30' : 'bg-slate-900/20'}`;

    row.innerHTML = `
      <td class="px-4 py-3 text-center text-slate-200 font-semibold text-lg">${clan.rank}</td>
      <td class="px-4 py-3 text-slate-200 font-medium text-base">${clan.name}</td>
      <td class="px-4 py-3 text-sky-300 font-mono text-sm">${clan.tag}</td>
      <td class="px-4 py-3 text-emerald-300 font-semibold text-lg">${clan.clanScore.toLocaleString()}</td>
      <td class="px-4 py-3 text-amber-200 font-medium text-base">${clan.members}</td>
      <td class="px-4 py-3 text-teal-300 text-sm">${clan.location?.name || "Unknown"}</td>
    `;

    tableBody.appendChild(row);
  });
}

let currentPage = 1;
let currentLocation = 'global';
let currentData = null;

function updatePaginationButtons(data) {
  const paginationDiv = document.getElementById("pagination");
  paginationDiv.innerHTML = "";

  if (!data || !data.paging) return;

  const { cursors } = data.paging;

  // Previous button
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Prev";
  prevBtn.className = "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  prevBtn.disabled = !cursors.before;
  prevBtn.addEventListener("click", () => loadPage(currentPage - 1));
  paginationDiv.appendChild(prevBtn);

  // Page info
  const pageInfo = document.createElement("span");
  pageInfo.textContent = `Page ${currentPage}`;
  pageInfo.className = "text-white mx-4";
  paginationDiv.appendChild(pageInfo);

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.className = "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  nextBtn.disabled = !cursors.after;
  nextBtn.addEventListener("click", () => loadPage(currentPage + 1));
  paginationDiv.appendChild(nextBtn);
}

async function loadPage(page) {
  const oldPage = currentPage;
  currentPage = page;
  console.log(`Loading page ${page} for ${currentLocation}...`);

  // Show loading spinner
  document.getElementById("leaderboardLoading").classList.remove("hidden");

  let cursor = null;
  if (page > oldPage && currentData?.paging?.cursors?.after) {
    cursor = { type: 'after', value: currentData.paging.cursors.after };
  } else if (page < oldPage && currentData?.paging?.cursors?.before) {
    cursor = { type: 'before', value: currentData.paging.cursors.before };
  }

  const data = await fetchClanLeaderboard(currentLocation, cursor);
  if (data) {
    console.log(`Fetched page ${page} data:`, data);
    currentData = data;
    renderLeaderboard(data);
    updatePaginationButtons(data);
  } else {
    console.log(`Failed to fetch page ${page} data.`);
  }

  // Hide loading spinner
  document.getElementById("leaderboardLoading").classList.add("hidden");
}

console.log("Fetching clan leaderboard data...");
// Show loading spinner on initial load
document.getElementById("leaderboardLoading").classList.remove("hidden");

fetchClanLeaderboard().then(data => {
  if (data) {
    console.log("Successfully logged fetched clan data:", data);
    currentData = data;
    renderLeaderboard(data);
    updatePaginationButtons(data);
  } else {
    console.log("Failed to fetch or log clan data.");
  }

  // Hide loading spinner after initial load
  document.getElementById("leaderboardLoading").classList.add("hidden");
});

async function loadLeaderboard() {
  currentLocation = document.getElementById("leaderboardType").value;
  currentPage = 1;
  const locationName = document.getElementById("leaderboardType").options[document.getElementById("leaderboardType").selectedIndex].text;
  console.log(`Loading leaderboard for ${locationName}...`);

  // Show loading spinner
  document.getElementById("leaderboardLoading").classList.remove("hidden");

  const data = await fetchClanLeaderboard(currentLocation, null);
  if (data) {
    console.log(`Fetched ${locationName} leaderboard data:`, data);
    currentData = data;
    renderLeaderboard(data);
    updatePaginationButtons(data);
  } else {
    console.log(`Failed to fetch ${locationName} leaderboard data.`);
  }

  // Hide loading spinner
  document.getElementById("leaderboardLoading").classList.add("hidden");
}

document.getElementById("leaderboardType").addEventListener("change", loadLeaderboard);
