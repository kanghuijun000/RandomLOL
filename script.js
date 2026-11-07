const LANES = ["탑", "정글", "미드", "바텀", "서포터"];
const STYLES = ["극딜", "브루저", "탱", "공속"];

const laneResult = document.getElementById("laneResult");
const styleResult = document.getElementById("styleResult");
const championResult = document.getElementById("championResult");
const championCount = document.getElementById("championCount");
const championStatus = document.getElementById("championStatus");
const drawButton = document.getElementById("drawButton");
const errorMessage = document.getElementById("errorMessage");

let champions = [];

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

async function loadChampions() {
  try {
    const versionsResponse = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    if (!versionsResponse.ok) throw new Error("버전 정보를 가져오지 못했어.");
    const versions = await versionsResponse.json();
    const version = versions[0];
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/champion.json`);
    if (!response.ok) throw new Error("챔피언 목록을 가져오지 못했어.");
    const data = await response.json();
    champions = Object.values(data.data).map(champion => champion.name).sort((a,b) => a.localeCompare(b,"ko"));
    if (!champions.length) throw new Error("챔피언 목록이 비어 있어.");
    championStatus.textContent = `챔피언 ${champions.length}명 준비 완료`;
    championCount.textContent = `전체 챔피언 ${champions.length}명 중 추첨`;
    drawButton.disabled = false;
  } catch (error) {
    championStatus.textContent = "목록 불러오기 실패";
    errorMessage.textContent = "챔피언 목록을 불러오지 못했어. 인터넷 연결을 확인하고 새로고침해 줘.";
    console.error(error);
  }
}

drawButton.addEventListener("click", () => {
  if (!champions.length) return;
  // 각 항목을 서로 독립적으로 한 번씩 추첨한다.
  laneResult.textContent = pickRandom(LANES);
  styleResult.textContent = pickRandom(STYLES);
  championResult.textContent = pickRandom(champions);
  errorMessage.textContent = "";
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(error => console.error("Service worker:", error));
  });
}

loadChampions();