const LANES = ["탑", "정글", "미드", "바텀", "서포터"];
const STYLES = ["극딜", "브루저", "탱", "공속"];

// 라인별로 실제 해당 라인에서 자주 쓰이거나 충분히 기용 가능한 챔피언을 분류.
// 한 챔피언이 여러 라인에 들어갈 수 있어 유연한 픽도 등장한다.
const LANE_CHAMPION_IDS = {
  "탑": [
    "Aatrox","Camille","Darius","Fiora","Garen","Gnar","Gwen","Illaoi",
    "Irelia","Jax","Jayce","Kayle","Kennen","KSante","Malphite","Mordekaiser",
    "Nasus","Olaf","Ornn","Pantheon","Poppy","Quinn","Renekton","Riven",
    "Rumble","Sett","Shen","Singed","Sion","TahmKench","Teemo","Trundle",
    "Tryndamere","Urgot","Volibear","Wukong","Yone","Yorick","Gragas"
  ],
  "정글": [
    "Amumu","Belveth","Brand","Briar","Diana","Ekko","Elise","Evelynn",
    "Fiddlesticks","Gragas","Graves","Hecarim","Ivern","JarvanIV","Karthus",
    "Kayn","KhaZix","Kindred","LeeSin","Lillia","MasterYi","Nidalee","Nocturne",
    "Nunu","Olaf","Pantheon","Poppy","Rammus","RekSai","Rengar","Sejuani",
    "Shaco","Shyvana","Skarner","Taliyah","Talon","Trundle","Udyr","Vi",
    "Viego","Volibear","Warwick","Wukong","XinZhao","Zac"
  ],
  "미드": [
    "Ahri","Akali","Anivia","Annie","AurelionSol","Azir","Cassiopeia","Corki",
    "Ekko","Fizz","Galio","Hwei","Kassadin","Katarina","LeBlanc","Lissandra",
    "Lux","Malzahar","Naafiri","Neeko","Orianna","Qiyana","Ryze","Sylas",
    "Syndra","Taliyah","Talon","TwistedFate","Veigar","Velkoz","Vex","Viktor",
    "Vladimir","Xerath","Yasuo","Yone","Zed","Ziggs","Zoe","AurelionSol",
    "Akshan","Jayce","Gragas","Pantheon"
  ],
  "바텀": [
    "Aphelios","Ashe","Caitlyn","Corki","Draven","Ezreal","Jhin","Jinx",
    "KaiSa","Kalista","KogMaw","Lucian","MissFortune","Nilah","Samira",
    "Senna","Sivir","Smolder","Tristana","Twitch","Varus","Vayne","Xayah",
    "Yasuo","Zeri","Ziggs","Seraphine","Swain"
  ],
  "서포터": [
    "Alistar","Bard","Blitzcrank","Brand","Braum","Janna","Karma","Leona",
    "Lulu","Lux","Maokai","Milio","Morgana","Nami","Nautilus","Neeko",
    "Pyke","Rakan","Rell","Renata","Senna","Seraphine","Sona","Soraka",
    "Swain","TahmKench","Taric","Thresh","Velkoz","Xerath","Yuumi","Zilean",
    "Zyra"
  ]
};

const laneResult = document.getElementById("laneResult");
const styleResult = document.getElementById("styleResult");
const championResult = document.getElementById("championResult");
const championCount = document.getElementById("championCount");
const championStatus = document.getElementById("championStatus");
const drawButton = document.getElementById("drawButton");
const errorMessage = document.getElementById("errorMessage");

let championsById = {};
let lanePools = {};

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

    championsById = Object.fromEntries(
      Object.values(data.data).map(champion => [
        champion.id,
        { id: champion.id, name: champion.name }
      ])
    );

    lanePools = Object.fromEntries(
      LANES.map(lane => [
        lane,
        [...new Set(LANE_CHAMPION_IDS[lane])]
          .filter(id => championsById[id])
          .map(id => championsById[id])
      ])
    );

    const missingLanes = LANES.filter(lane => lanePools[lane].length === 0);
    if (missingLanes.length) throw new Error(`라인 챔피언 목록 오류: ${missingLanes.join(", ")}`);

    const total = Object.keys(championsById).length;
    championStatus.textContent = `챔피언 ${total}명 준비 완료`;
    championCount.textContent = "선택한 라인에 어울리는 챔피언";
    drawButton.disabled = false;
  } catch (error) {
    championStatus.textContent = "목록 불러오기 실패";
    errorMessage.textContent = "챔피언 목록을 불러오지 못했어. 인터넷 연결을 확인하고 새로고침해 줘.";
    console.error(error);
  }
}

drawButton.addEventListener("click", () => {
  if (!Object.keys(championsById).length) return;

  const lane = pickRandom(LANES);
  const champion = pickRandom(lanePools[lane]);

  laneResult.textContent = lane;
  styleResult.textContent = pickRandom(STYLES);
  championResult.textContent = champion.name;
  championCount.textContent = `${lane} 추천 후보 ${lanePools[lane].length}명 중 추첨`;
  errorMessage.textContent = "";
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(error => console.error("Service worker:", error));
  });
}

loadChampions();
