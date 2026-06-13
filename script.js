let exp = Number(localStorage.getItem("exp")) || 0;
let level = Number(localStorage.getItem("level")) || 1;
let levelExp = Number(localStorage.getItem("levelExp")) || 0;

let playerHp = Number(localStorage.getItem("playerHp")) || 100;
let maxPlayerHp = Number(localStorage.getItem("maxPlayerHp")) || 100;

let attemptsLeft = 2;
let currentQuestionIndex = 0;
let answeredCurrentQuestion = false;

const retryCost = 20;
const questionsPerNode = 5;

let savedInventory = JSON.parse(localStorage.getItem("inventory")) || {};
let inventory = Array.isArray(savedInventory)
  ? convertOldInventory(savedInventory)
  : savedInventory;

let weapons = JSON.parse(localStorage.getItem("weapons")) || {};
let equippedWeapon = JSON.parse(localStorage.getItem("equippedWeapon")) || null;
let completedNodes = JSON.parse(localStorage.getItem("completedNodes")) || [];

let worldMapNodes = [];
let currentMapNodes = [];
let currentRegion = null;
let currentNode = null;
let currentQuestions = [];
let currentDisplayedQuestion = null;
let currentBoss = null;
let isEliteBoss = false;
let bossTurnCount = 0;

let knowledgeQuestions = [];
let knowledgeQuestionIndex = 0;
let knowledgeCorrectCount = 0;
let currentKnowledgeBuff = null;

let playerPosition = { x: 25, y: 250 };

const chestTables = {
  wood: [
    { name: "Mảnh đồng", min: 1, max: 3 },
    { name: "Bụi hỏa khí", min: 1, max: 3 },
    { name: "Gỗ cứng", min: 1, max: 2 },
    { name: "Đá thô", min: 1, max: 2 }
  ],
  iron: [
    { name: "Mảnh đồng", min: 2, max: 4 },
    { name: "Tinh thạch nhỏ", min: 1, max: 2 },
    { name: "Mảnh điện tích", min: 1, max: 2 },
    { name: "Lông chim lửa", min: 1, max: 1 }
  ],
  silver: [
    { name: "Tinh thạch nhỏ", min: 2, max: 3 },
    { name: "Tinh thạch lôi điện", min: 1, max: 1 },
    { name: "Lõi năng lượng", min: 1, max: 1 },
    { name: "Hạch băng", min: 1, max: 1 },
    { name: "Hỏa ngọc", min: 1, max: 1 }
  ],
  gold: [
    { name: "Mảnh thái dương", min: 1, max: 1 },
    { name: "Lõi hư không", min: 1, max: 1 },
    { name: "Tinh tú cổ đại", min: 1, max: 1 },
    { name: "Huyết tinh long tộc", min: 1, max: 1 }
  ],
  legend: [
    { name: "Tinh hạch thần vực", min: 1, max: 1 },
    { name: "Mảnh linh hồn cổ", min: 1, max: 1 },
    { name: "Tinh thể lượng tử", min: 1, max: 1 },
    { name: "Trái tim nguyên tố", min: 1, max: 1 }
  ]
};

const shopItems = [
  { name: "Mảnh đồng", rarity: "Thường", buyPrice: 10, sellPrice: 5, unlockLevel: 1 },
  { name: "Bụi hỏa khí", rarity: "Thường", buyPrice: 15, sellPrice: 8, unlockLevel: 1 },
  { name: "Gỗ cứng", rarity: "Thường", buyPrice: 12, sellPrice: 6, unlockLevel: 1 },
  { name: "Đá thô", rarity: "Thường", buyPrice: 12, sellPrice: 6, unlockLevel: 1 },
  { name: "Tinh thạch nhỏ", rarity: "Hiếm", buyPrice: 30, sellPrice: 15, unlockLevel: 2 },
  { name: "Lông chim lửa", rarity: "Hiếm", buyPrice: 50, sellPrice: 25, unlockLevel: 3 },
  { name: "Tinh hoa băng", rarity: "Hiếm", buyPrice: 50, sellPrice: 25, unlockLevel: 3 },
  { name: "Mảnh điện tích", rarity: "Hiếm", buyPrice: 45, sellPrice: 22, unlockLevel: 3 },
  { name: "Tinh thạch lôi điện", rarity: "Quý", buyPrice: 100, sellPrice: 50, unlockLevel: 5 },
  { name: "Lõi năng lượng", rarity: "Quý", buyPrice: 150, sellPrice: 75, unlockLevel: 7 },
  { name: "Hạch băng", rarity: "Quý", buyPrice: 120, sellPrice: 60, unlockLevel: 6 },
  { name: "Hỏa ngọc", rarity: "Quý", buyPrice: 120, sellPrice: 60, unlockLevel: 6 },
  { name: "Mảnh thái dương", rarity: "Sử Thi", buyPrice: 300, sellPrice: 150, unlockLevel: 10 },
  { name: "Lõi hư không", rarity: "Sử Thi", buyPrice: 450, sellPrice: 225, unlockLevel: 12 },
  { name: "Tinh tú cổ đại", rarity: "Sử Thi", buyPrice: 500, sellPrice: 250, unlockLevel: 12 },
  { name: "Huyết tinh long tộc", rarity: "Sử Thi", buyPrice: 550, sellPrice: 275, unlockLevel: 13 },
  { name: "Tinh hạch thần vực", rarity: "Bán Thần", buyPrice: 900, sellPrice: 450, unlockLevel: 18 },
  { name: "Mảnh linh hồn cổ", rarity: "Bán Thần", buyPrice: 1000, sellPrice: 500, unlockLevel: 20 },
  { name: "Tinh thể lượng tử", rarity: "Huyền Thoại", buyPrice: 1100, sellPrice: 550, unlockLevel: 22 },
  { name: "Trái tim nguyên tố", rarity: "Thần Thoại", buyPrice: 1500, sellPrice: 750, unlockLevel: 25 }
];

const craftingRecipes = [
  { name: "Kiếm Đồng", rarity: "Thường", damage: 8, successRate: 100, materials: { "Mảnh đồng": 5 } },
  { name: "Khiên Gỗ", rarity: "Thường", damage: 6, successRate: 100, materials: { "Gỗ cứng": 4, "Mảnh đồng": 2 } },
  { name: "Dao Đá", rarity: "Thường", damage: 7, successRate: 100, materials: { "Đá thô": 5, "Gỗ cứng": 2 } },
  { name: "Kiếm Điện", rarity: "Hiếm", damage: 15, successRate: 100, materials: { "Kiếm Đồng": 1, "Tinh thạch nhỏ": 2, "Mảnh điện tích": 2 } },
  { name: "Trượng Hỏa", rarity: "Hiếm", damage: 18, successRate: 100, materials: { "Gỗ cứng": 5, "Lông chim lửa": 3, "Bụi hỏa khí": 5 } },
  { name: "Cung Băng", rarity: "Hiếm", damage: 17, successRate: 100, materials: { "Gỗ cứng": 6, "Tinh hoa băng": 3, "Tinh thạch nhỏ": 2 } },
  { name: "Búa Chấn Động", rarity: "Quý", damage: 25, successRate: 100, materials: { "Mảnh đồng": 10, "Đá thô": 8, "Lõi năng lượng": 1 } },
  { name: "Song Kiếm Lôi", rarity: "Quý", damage: 28, successRate: 100, materials: { "Kiếm Điện": 1, "Tinh thạch lôi điện": 2, "Mảnh điện tích": 5 } },
  { name: "Pháp Trượng Băng", rarity: "Quý", damage: 27, successRate: 100, materials: { "Cung Băng": 1, "Hạch băng": 2, "Tinh hoa băng": 5 } },
  { name: "Lôi Thần Kiếm", rarity: "Sử Thi", damage: 40, successRate: 75, materials: { "Song Kiếm Lôi": 1, "Tinh thạch lôi điện": 3, "Lõi năng lượng": 2 } },
  { name: "Viêm Long Trượng", rarity: "Sử Thi", damage: 42, successRate: 75, materials: { "Trượng Hỏa": 1, "Hỏa ngọc": 3, "Huyết tinh long tộc": 1 } },
  { name: "Cung Nguyệt Quang", rarity: "Sử Thi", damage: 41, successRate: 75, materials: { "Pháp Trượng Băng": 1, "Tinh tú cổ đại": 1, "Hạch băng": 3 } },
  { name: "Thái Dương Kiếm", rarity: "Bán Thần", damage: 60, successRate: 60, materials: { "Lôi Thần Kiếm": 1, "Mảnh thái dương": 3, "Tinh hạch thần vực": 1 } },
  { name: "Trượng Long Diễm", rarity: "Bán Thần", damage: 62, successRate: 60, materials: { "Viêm Long Trượng": 1, "Huyết tinh long tộc": 2, "Lõi năng lượng": 3 } },
  { name: "Nhật Diệu Thần Kiếm", rarity: "Huyền Thoại", damage: 85, successRate: 35, materials: { "Thái Dương Kiếm": 1, "Mảnh thái dương": 5, "Tinh thể lượng tử": 1 } },
  { name: "Trượng Hư Không", rarity: "Huyền Thoại", damage: 90, successRate: 35, materials: { "Trượng Long Diễm": 1, "Lõi hư không": 3, "Mảnh linh hồn cổ": 1 } },
  { name: "Thần Cung Tinh Tú", rarity: "Huyền Thoại", damage: 88, successRate: 35, materials: { "Cung Nguyệt Quang": 1, "Tinh tú cổ đại": 3, "Tinh thể lượng tử": 1 } },
  { name: "Thần Khí Nguyên Tố", rarity: "Thần Thoại", damage: 120, successRate: 15, materials: { "Nhật Diệu Thần Kiếm": 1, "Trượng Hư Không": 1, "Thần Cung Tinh Tú": 1, "Trái tim nguyên tố": 1 } }
];

loadWorldMap();

async function loadWorldMap() {
  const response = await fetch("data/map.json");
  worldMapNodes = await response.json();

  currentMapNodes = worldMapNodes;
  currentRegion = null;
  currentNode = null;
  currentQuestions = [];
  currentBoss = null;
  currentKnowledgeBuff = null;
  bossTurnCount = 0;
  playerPosition = { x: 25, y: 250 };

  renderMap("Bản đồ thế giới");
  updateInventory();
  updateEquippedWeaponUI();
}

async function loadSubMap(regionNode) {
  const response = await fetch(`data/submaps/${regionNode.subMap}`);
  currentMapNodes = await response.json();

  currentRegion = regionNode;
  currentNode = null;
  currentQuestions = [];
  currentBoss = null;
  currentKnowledgeBuff = null;
  bossTurnCount = 0;
  playerPosition = { x: 25, y: 250 };

  renderMap(`Khu vực: ${regionNode.name}`);
}

function renderMap(titleText) {
  const map = document.getElementById("map");
  const answersDiv = document.getElementById("answers");

  map.style.display = "block";
  map.innerHTML = "";
  answersDiv.innerHTML = "";

  document.getElementById("progress").innerText = titleText;
  document.getElementById("question").innerText = currentRegion
    ? `Khu vực: ${currentRegion.name}`
    : "Chọn khu vực trên bản đồ";

  document.getElementById("result").innerText = "";
  document.getElementById("nextBtn").style.display = "none";

  removeBuyRetryButton();
  drawMapLines(map);

  currentMapNodes.forEach(node => {
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "map-node";

    if (isCompleted(node.id)) {
      nodeDiv.classList.add("completed");
    } else if (isUnlocked(node)) {
      nodeDiv.classList.add("available");
    } else {
      nodeDiv.classList.add("locked");
    }

    nodeDiv.style.left = node.x + "px";
    nodeDiv.style.top = node.y + "px";
    nodeDiv.innerText = node.type === "boss" ? `👾 ${node.name}` : node.name;

    nodeDiv.onclick = async function () {
      if (!isUnlocked(node)) {
        document.getElementById("result").innerText = "Khu vực này chưa mở khóa.";
        return;
      }

      if (node.recommendedLevel && level < node.recommendedLevel) {
        document.getElementById("result").innerText =
          `Khuyến nghị đạt Lv ${node.recommendedLevel} trước khi vào node này.`;
      }

      movePlayerTo(node);

      setTimeout(async function () {
        if (node.type === "region") {
          await loadSubMap(node);
        } else if (node.type === "boss") {
          await startBossNode(node);
        } else {
          await startQuestionNode(node);
        }
      }, 250);
    };

    map.appendChild(nodeDiv);
  });

  const player = document.createElement("div");
  player.className = "player";
  player.id = "player";
  player.style.left = playerPosition.x + "px";
  player.style.top = playerPosition.y + "px";
  map.appendChild(player);

  showMainButtons();
  updateUI();
  updateEquippedWeaponUI();
}

function showMainButtons() {
  const answersDiv = document.getElementById("answers");

  if (currentRegion) {
    const worldButton = document.createElement("button");
    worldButton.innerText = "🌍 Quay lại bản đồ thế giới";
    worldButton.onclick = loadWorldMap;
    answersDiv.appendChild(worldButton);
  }

  const healButton = document.createElement("button");
  healButton.innerText = "❤️ Hồi đầy HP";
  healButton.onclick = healPlayer;
  answersDiv.appendChild(healButton);

  const equipmentButton = document.createElement("button");
  equipmentButton.innerText = "⚔ Trang bị vũ khí";
  equipmentButton.onclick = showEquipmentPanel;
  answersDiv.appendChild(equipmentButton);

  const craftButton = document.createElement("button");
  craftButton.innerText = "⚒ Xưởng chế tạo / Nâng cấp";
  craftButton.onclick = showCraftingPanel;
  answersDiv.appendChild(craftButton);

  const shopButton = document.createElement("button");
  shopButton.innerText = "🛒 Cửa hàng";
  shopButton.onclick = showShopPanel;
  answersDiv.appendChild(shopButton);
}

function drawMapLines(map) {
  currentMapNodes.forEach(node => {
    if (node.unlockAfter === null) return;

    const previousNode = currentMapNodes.find(item => item.id === node.unlockAfter);
    if (!previousNode) return;

    const x1 = previousNode.x + 90;
    const y1 = previousNode.y + 90;
    const x2 = node.x + 90;
    const y2 = node.y + 90;

    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    const line = document.createElement("div");
    line.className = "map-line";

    if (isCompleted(previousNode.id)) {
      line.classList.add("line-unlocked");
    }

    line.style.left = x1 + "px";
    line.style.top = y1 + "px";
    line.style.width = length + "px";
    line.style.transform = `rotate(${angle}deg)`;

    map.appendChild(line);
  });
}

function isCompleted(nodeId) {
  return completedNodes.includes(nodeId);
}

function isUnlocked(node) {
  if (node.unlockAfter === null) return true;
  return completedNodes.includes(node.unlockAfter);
}

function movePlayerTo(node) {
  playerPosition.x = node.x + 55;
  playerPosition.y = node.y + 200;

  const player = document.getElementById("player");

  if (player) {
    player.style.left = playerPosition.x + "px";
    player.style.top = playerPosition.y + "px";
  }
}

async function startQuestionNode(node){
  currentNode = node;
 console.log("QUESTION FILE =", node.questionFile);
  const response = await fetch(`data/questions/${node.questionFile}`);
  const allQuestions = await response.json();

  currentQuestions = getRandomQuestions(allQuestions, questionsPerNode);
  currentQuestionIndex = 0;

  document.getElementById("map").style.display = "none";
  loadQuestion();
}

function loadQuestion() {
  answeredCurrentQuestion = false;
  attemptsLeft = 2;

  removeBuyRetryButton();

  const originalQuestion = currentQuestions[currentQuestionIndex];

  const correctAnswer = originalQuestion.answers[originalQuestion.correct];

  const shuffledAnswers = [...originalQuestion.answers];

  for (let i = shuffledAnswers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
  }

  currentDisplayedQuestion = {
    text: originalQuestion.text,
    answers: shuffledAnswers,
    correctAnswer: correctAnswer
  };

  document.getElementById("progress").innerText =
    `Câu ${currentQuestionIndex + 1}/${currentQuestions.length} - ${currentNode.name}`;

  document.getElementById("question").innerText = currentDisplayedQuestion.text;
  document.getElementById("result").innerText = "";
  document.getElementById("nextBtn").style.display = "none";

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  currentDisplayedQuestion.answers.forEach(answer => {
    const button = document.createElement("button");
    button.innerText = answer;

    button.onclick = function () {
      answerQuestion(answer);
    };

    answersDiv.appendChild(button);
  });

  updateUI();
  updateEquippedWeaponUI();
}

function answerQuestion(selectedAnswer) {
  if (attemptsLeft <= 0) {
    document.getElementById("result").innerText = "Bạn đã hết lượt trả lời.";
    showBuyRetryButton();
    return;
  }

  const question = currentDisplayedQuestion;

  attemptsLeft--;

  if (selectedAnswer === question.correctAnswer) {
    if (!answeredCurrentQuestion) {
      exp += 10;
      levelExp += 10;

      checkLevelUp();
      saveGame();

      answeredCurrentQuestion = true;

      document.getElementById("result").innerText =
        "Đúng rồi! Bạn nhận được 10 EXP.";

      document.getElementById("nextBtn").style.display = "block";
    }
  } else {
    document.getElementById("result").innerText =
      attemptsLeft > 0 ? `Sai rồi. Còn ${attemptsLeft} lượt.` : "Sai rồi. Bạn đã hết lượt.";

    if (attemptsLeft <= 0) {
      showBuyRetryButton();
    }
  }

  updateUI();
}

function checkLevelUp() {
  const levelRequired = getLevelRequired(level);

  if (levelExp >= levelRequired) {
    level++;
    levelExp = 0;
    maxPlayerHp += 10;
    playerHp = maxPlayerHp;
  }
}

function getLevelRequired(level) {
  return 100 + (level - 1) * 50;
}

function updateUI() {
  const levelRequired = getLevelRequired(level);

  document.getElementById("exp").innerText =
    `Lv ${level} | HP: ${playerHp}/${maxPlayerHp} | EXP: ${exp} | Cấp: ${levelExp}/${levelRequired} | Lượt trả lời: ${attemptsLeft}`;
}

function showBuyRetryButton() {
  if (document.getElementById("buyRetryBtn")) return;

  const buyButton = document.createElement("button");
  buyButton.id = "buyRetryBtn";
  buyButton.innerText = `Mua thêm 2 lượt (${retryCost} EXP)`;

  buyButton.onclick = function () {
    if (exp < retryCost) {
      document.getElementById("result").innerText = "Không đủ EXP.";
      return;
    }

    exp -= retryCost;
    attemptsLeft += 2;

    saveGame();

    document.getElementById("result").innerText = "Đã mua thêm 2 lượt.";
    updateUI();
  };

  document.querySelector(".game-box").appendChild(buyButton);
}

function removeBuyRetryButton() {
  const buyButton = document.getElementById("buyRetryBtn");

  if (buyButton) {
    buyButton.remove();
  }
}

document.getElementById("nextBtn").onclick = function () {
  currentQuestionIndex++;

  removeBuyRetryButton();

  if (currentQuestionIndex >= currentQuestions.length) {
    finishQuestionGroup();
  } else {
    loadQuestion();
  }
};

function finishQuestionGroup() {
  if (!completedNodes.includes(currentNode.id)) {
    completedNodes.push(currentNode.id);
  }

  const nodeRewardExp = currentNode.rewardExp || 0;

  if (nodeRewardExp > 0) {
    exp += nodeRewardExp;
    levelExp += nodeRewardExp;
    checkLevelUp();
  }

  checkRegionComplete();
  saveGame();

  document.getElementById("progress").innerText = "Hoàn thành";
  document.getElementById("question").innerText =
    `${currentNode.name} đã hoàn thành!`;

  document.getElementById("answers").innerHTML = "";
  document.getElementById("nextBtn").style.display = "none";

  document.getElementById("result").innerText =
    nodeRewardExp > 0
      ? `Hoàn thành node! Nhận thêm ${nodeRewardExp} EXP và một rương thưởng!`
      : "Bạn nhận được một rương thưởng!";

  showChestButton();
  updateUI();
}

function checkRegionComplete() {
  if (!currentRegion) return;

  const normalNodes = currentMapNodes.filter(node => node.type !== "boss");

  const allSubNodesCompleted = normalNodes.every(node =>
    completedNodes.includes(node.id)
  );

  if (allSubNodesCompleted && !completedNodes.includes(currentRegion.id)) {
    completedNodes.push(currentRegion.id);
  }
}

function showChestButton() {
  const answersDiv = document.getElementById("answers");

  const openChestButton = document.createElement("button");
  openChestButton.innerText = `🎁 Mở ${getChestName(currentNode.chestType || "wood")}`;

  openChestButton.onclick = function () {
    openChestButton.remove();
    openChest(currentNode.chestType || "wood");
  };

  answersDiv.appendChild(openChestButton);
}

function openChest(chestType) {
  const rewards = generateChestRewards(chestType);

  rewards.forEach(reward => {
    addItemToInventory(reward.name, reward.quantity);
  });

  saveGame();
  updateInventory();

  const rewardText = rewards
    .map(reward => `${reward.name} x${reward.quantity}`)
    .join("\n");

  document.getElementById("result").innerText =
    `✨ Bạn mở ${getChestName(chestType)} và nhận được:\n${rewardText}`;

  const backButton = document.createElement("button");
  backButton.innerText = currentRegion ? "Quay lại map khu vực" : "Quay lại bản đồ";

  backButton.onclick = function () {
    removeBuyRetryButton();
    renderMap(currentRegion ? `Khu vực: ${currentRegion.name}` : "Bản đồ thế giới");
  };

  document.getElementById("answers").appendChild(backButton);
}

function generateChestRewards(chestType) {
  const table = chestTables[chestType] || chestTables.wood;
  const rewardCount = randomNumber(1, 3);
  const rewards = [];

  for (let i = 0; i < rewardCount; i++) {
    const item = table[Math.floor(Math.random() * table.length)];
    const quantity = randomNumber(item.min, item.max);

    const existingReward = rewards.find(reward => reward.name === item.name);

    if (existingReward) {
      existingReward.quantity += quantity;
    } else {
      rewards.push({ name: item.name, quantity: quantity });
    }
  }

  return rewards;
}

function getChestName(chestType) {
  if (chestType === "wood") return "Rương Gỗ";
  if (chestType === "iron") return "Rương Sắt";
  if (chestType === "silver") return "Rương Bạc";
  if (chestType === "gold") return "Rương Vàng";
  if (chestType === "legend") return "Rương Huyền Bí";
  return "Rương Gỗ";
}

async function startBossNode(node) {
  currentNode = node;

  if (node.knowledgeQuiz === false) {
    startBossBattle(node);
    return;
  }

  await startKnowledgeQuiz(node);
}

async function startKnowledgeQuiz(node) {
  const questionFile = getKnowledgeQuestionFile(node);

  if (!questionFile) {
    startBossBattle(node);
    return;
  }

  const response = await fetch(`data/questions/${questionFile}`);
  const allQuestions = await response.json();

  const quizCount = node.knowledgeQuestionCount || 3;

  knowledgeQuestions = getRandomQuestions(allQuestions, quizCount);
  knowledgeQuestionIndex = 0;
  knowledgeCorrectCount = 0;

  document.getElementById("map").style.display = "none";

  renderKnowledgeQuestion();
}

function getKnowledgeQuestionFile(node) {
  if (node.knowledgeQuestionFile) {
    return node.knowledgeQuestionFile;
  }

  const lessonNodes = currentMapNodes.filter(item =>
    item.type !== "boss" && item.questionFile
  );

  if (lessonNodes.length === 0) return null;

  const randomLesson = lessonNodes[Math.floor(Math.random() * lessonNodes.length)];

  return randomLesson.questionFile;
}

function renderKnowledgeQuestion() {
  const question = knowledgeQuestions[knowledgeQuestionIndex];

  document.getElementById("progress").innerText =
    `📚 Kiểm tra kiến thức ${knowledgeQuestionIndex + 1}/${knowledgeQuestions.length}`;

  document.getElementById("question").innerText = question.text;
  document.getElementById("result").innerText = "";
  document.getElementById("nextBtn").style.display = "none";

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  question.answers.forEach((answer, index) => {
  const button = document.createElement("button");
  button.innerText = answer;

  button.onclick = function () {
    answerKnowledgeQuestion(index);
  };

  answersDiv.appendChild(button);
});

  updateUI();
  updateEquippedWeaponUI();
}

function answerKnowledgeQuestion(index) {
  const question = knowledgeQuestions[knowledgeQuestionIndex];

  if (index === question.correct) {
    knowledgeCorrectCount++;
    document.getElementById("result").innerText = "Đúng! Nhận điểm kiến thức.";
  } else {
    document.getElementById("result").innerText = "Sai rồi.";
  }

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  const nextButton = document.createElement("button");

  if (knowledgeQuestionIndex >= knowledgeQuestions.length - 1) {
    nextButton.innerText = "Bắt đầu đánh boss";
  } else {
    nextButton.innerText = "Câu tiếp theo";
  }

  nextButton.onclick = function () {
    knowledgeQuestionIndex++;

    if (knowledgeQuestionIndex >= knowledgeQuestions.length) {
      applyKnowledgeBuff();
      startBossBattle(currentNode);
    } else {
      renderKnowledgeQuestion();
    }
  };

  answersDiv.appendChild(nextButton);
}

function applyKnowledgeBuff() {
  const total = knowledgeQuestions.length;
  const correct = knowledgeCorrectCount;

  currentKnowledgeBuff = {
    damageMultiplier: 1,
    shieldReduction: 0,
    shieldTurns: 0,
    stunFirstTurn: false,
    healAmount: 0,
    text: "Không có buff"
  };

  if (correct <= 1) {
    currentKnowledgeBuff.text = `Đúng ${correct}/${total}: Không có buff.`;
    return;
  }

  if (correct < total) {
    currentKnowledgeBuff.damageMultiplier = 1.2;
    currentKnowledgeBuff.shieldReduction = 0.25;
    currentKnowledgeBuff.shieldTurns = 2;
    currentKnowledgeBuff.text =
      `Đúng ${correct}/${total}: +20% sát thương, giảm 25% sát thương boss trong 2 lượt.`;
    return;
  }

  currentKnowledgeBuff.damageMultiplier = 1.5;
  currentKnowledgeBuff.shieldReduction = 0.5;
  currentKnowledgeBuff.shieldTurns = 3;
  currentKnowledgeBuff.stunFirstTurn = true;
  currentKnowledgeBuff.healAmount = 20;
  currentKnowledgeBuff.text =
    `Perfect ${correct}/${total}: +50% sát thương, choáng boss lượt đầu, giảm 50% sát thương boss trong 3 lượt, hồi 20 HP.`;

  playerHp += currentKnowledgeBuff.healAmount;

  if (playerHp > maxPlayerHp) {
    playerHp = maxPlayerHp;
  }

  saveGame();
}

function startBossBattle(node) {
  isEliteBoss = Math.random() < 0.10;
  const bossMaxHp = node.bossHp || 100;

  bossTurnCount = 0;

  currentBoss = {
    id: node.id,
    name: node.bossName || node.name || "Boss",
    type: node.bossType || "normal",
    isElite: isEliteBoss,

    hp: isEliteBoss ? bossMaxHp * 2 : bossMaxHp,
    maxHp: isEliteBoss ? bossMaxHp * 2 : bossMaxHp,
    damage: isEliteBoss
    ? (node.bossDamage || 10) * 2
    : (node.bossDamage || 10),

    rewardChest: node.rewardChest || node.chestType || "gold",
    rewardExp: node.rewardExp || 50,
    rareDrops: node.rareDrops || [],

    stunned: currentKnowledgeBuff ? currentKnowledgeBuff.stunFirstTurn : false
  };

  document.getElementById("map").style.display = "none";
  renderBossBattle();
}

function renderBossBattle() {
  document.getElementById("progress").innerText = "Boss Battle";
  document.getElementById("question").innerText =
   currentBoss.isElite
    ? `👑 ELITE BOSS\n👾 ${currentBoss.name}`
    : `👾 ${currentBoss.name}`;

  document.getElementById("nextBtn").style.display = "none";

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  const bossInfo = document.createElement("div");
  bossInfo.style.border = "2px solid #aa4444";
  bossInfo.style.padding = "16px";
  bossInfo.style.margin = "12px 0";
  bossInfo.style.borderRadius = "10px";
  bossInfo.style.fontSize = "28px";
  bossInfo.style.background = "#fff1f1";

  bossInfo.innerText =
   `${currentBoss.isElite ? "👑 Trạng thái: ELITE\n" : ""}` +
   `Boss hệ: ${getBossTypeName(currentBoss.type)}\n` +
    `Boss HP: ${currentBoss.hp}/${currentBoss.maxHp}\n` +
    `Boss Damage: ${currentBoss.damage}\n` +
    `Lượt boss: ${bossTurnCount}\n` +
    `Kỹ năng boss: ${getBossAbilityText(currentBoss.type)}\n` +
    `Rare Drop: ${getRareDropText(currentBoss.rareDrops)}\n` +
    `Vũ khí đang dùng: ${getEquippedWeaponText()}\n` +
    `Sát thương cơ bản: ${getEquippedDamage()}\n` +
    `Buff kiến thức: ${getKnowledgeBuffText()}\n` +
    `Sát thương hiện tại: ${getBuffedDamage()}`;

  answersDiv.appendChild(bossInfo);

  const attackButton = document.createElement("button");
  attackButton.innerText = "⚔ Tấn công";
  attackButton.onclick = playerAttackBoss;
  answersDiv.appendChild(attackButton);

  const backButton = document.createElement("button");
  backButton.innerText = currentRegion ? "Rút lui về map khu vực" : "Rút lui về bản đồ";
  backButton.onclick = function () {
    currentBoss = null;
    currentKnowledgeBuff = null;
    bossTurnCount = 0;
    renderMap(currentRegion ? `Khu vực: ${currentRegion.name}` : "Bản đồ thế giới");
  };
  answersDiv.appendChild(backButton);

  updateUI();
  updateEquippedWeaponUI();
}

function getBossTypeName(type) {
  if (type === "light") return "Quang học";
  if (type === "electric") return "Điện học";
  if (type === "gravity") return "Lực học";
  if (type === "pressure") return "Áp suất";
  return "Thường";
}

function getBossAbilityText(type) {
  if (type === "light") return "Mỗi 3 lượt hồi 20 HP.";
  if (type === "electric") return "20% phản lại 50% sát thương bạn gây ra.";
  if (type === "gravity") return "Mỗi lượt tăng 2 damage.";
  if (type === "pressure") return "Giảm 30% sát thương nhận vào.";
  return "Không có kỹ năng đặc biệt.";
}

function getRareDropText(rareDrops) {
  if (!rareDrops || rareDrops.length === 0) {
    return "Không có";
  }

  return rareDrops
    .map(drop => `${drop.item} (${drop.chance}%)`)
    .join(", ");
}

function getKnowledgeBuffText() {
  if (!currentKnowledgeBuff) return "Không có buff";
  return currentKnowledgeBuff.text;
}

function getBuffedDamage() {
  const baseDamage = getEquippedDamage();

  if (!currentKnowledgeBuff) return baseDamage;

  return Math.max(1, Math.floor(baseDamage * currentKnowledgeBuff.damageMultiplier));
}

function applyBossDamageReduction(damage) {
  if (!currentBoss) return damage;

  if (currentBoss.type === "pressure") {
    return Math.max(1, Math.floor(damage * 0.7));
  }

  return damage;
}

function getReducedBossDamage() {
  let bossDamage = currentBoss.damage;

  if (currentKnowledgeBuff && currentKnowledgeBuff.shieldTurns > 0) {
    bossDamage = Math.floor(bossDamage * (1 - currentKnowledgeBuff.shieldReduction));
    currentKnowledgeBuff.shieldTurns--;
  }

  return Math.max(0, bossDamage);
}

function runBossSpecialAbilityAfterPlayerAttack(playerDamageDealt) {
  if (!currentBoss) return "";

  let message = "";

  if (currentBoss.type === "light") {
    if (bossTurnCount % 3 === 0) {
      currentBoss.hp += 20;

      if (currentBoss.hp > currentBoss.maxHp) {
        currentBoss.hp = currentBoss.maxHp;
      }

      message += "\n✨ Tinh Linh Quang Học hấp thu ánh sáng và hồi 20 HP!";
    }
  }

  if (currentBoss.type === "electric") {
    const reflected = Math.random() < 0.2;

    if (reflected) {
      const reflectDamage = Math.max(1, Math.floor(playerDamageDealt * 0.5));

      playerHp -= reflectDamage;

      if (playerHp < 0) {
        playerHp = 0;
      }

      message += `\n⚡ Lôi Điện Khổng Lồ phản lại ${reflectDamage} sát thương!`;
    }
  }

  if (currentBoss.type === "gravity") {
    currentBoss.damage += 2;
    message += "\n🌑 Kỵ Sĩ Trọng Lực gia tăng áp lực, boss +2 damage!";
  }

  return message;
}

function playerAttackBoss() {
  if (!currentBoss) return;

  if (playerHp <= 0) {
    document.getElementById("result").innerText =
      "Bạn đã hết HP. Hãy hồi máu trước khi đánh tiếp.";
    return;
  }

  bossTurnCount++;

  let damage = getBuffedDamage();
  damage = applyBossDamageReduction(damage);

  currentBoss.hp -= damage;

  let resultMessage = `Bạn gây ${damage} sát thương.`;

  if (currentBoss.hp <= 0) {
    currentBoss.hp = 0;
    winBossBattle();
    return;
  }

  resultMessage += runBossSpecialAbilityAfterPlayerAttack(damage);

  if (playerHp <= 0) {
    saveGame();

    document.getElementById("result").innerText =
      resultMessage + "\nBạn đã bị đánh bại bởi kỹ năng phản sát thương.";

    renderBossBattle();
    return;
  }

  if (currentBoss.stunned) {
    currentBoss.stunned = false;
    saveGame();

    document.getElementById("result").innerText =
      resultMessage + "\nBoss bị choáng nên không phản đòn.";

    renderBossBattle();
    return;
  }

  const bossDamage = getReducedBossDamage();

  playerHp -= bossDamage;

  if (playerHp <= 0) {
    playerHp = 0;
    saveGame();

    document.getElementById("result").innerText =
      `${resultMessage}\n${currentBoss.name} phản đòn ${bossDamage} sát thương.\nBạn đã thua trận.`;

    renderBossBattle();
    return;
  }

  saveGame();

  document.getElementById("result").innerText =
    `${resultMessage}\n${currentBoss.name} phản đòn ${bossDamage} sát thương.`;

  renderBossBattle();
}

function winBossBattle() {
  if (!completedNodes.includes(currentNode.id)) {
    completedNodes.push(currentNode.id);
  }

  const finalExp = currentBoss.isElite
    ? currentBoss.rewardExp * 3
    : currentBoss.rewardExp;

    exp += finalExp;
    levelExp += finalExp;
  checkLevelUp();

  const rareDropRewards = rollRareDrops(currentBoss.rareDrops);

  rareDropRewards.forEach(drop => {
    addItemToInventory(drop.item, drop.quantity);
  });

  saveGame();
  updateInventory();

  document.getElementById("progress").innerText = "Chiến thắng";
  document.getElementById("question").innerText =
    `🏆 Đã đánh bại ${currentBoss.name}!`;

  document.getElementById("answers").innerHTML = "";
  document.getElementById("nextBtn").style.display = "none";

  let resultText =
    currentBoss.isElite
        ? `👑 ELITE BOSS! Bạn nhận ${finalExp} EXP và một ${getChestName(currentBoss.rewardChest)}!`
        : `Bạn nhận ${finalExp} EXP và một ${getChestName(currentBoss.rewardChest)}!`;

  if (rareDropRewards.length > 0) {
    resultText += "\n\n✨ Rare Drop nhận được:";
    rareDropRewards.forEach(drop => {
      resultText += `\n${drop.item} x${drop.quantity}`;
    });
  } else {
    resultText += "\n\nKhông có Rare Drop lần này.";
  }

  document.getElementById("result").innerText = resultText;

  const bossChest = currentBoss.rewardChest;

  const openBossChestButton = document.createElement("button");
  openBossChestButton.innerText = `🎁 Mở ${getChestName(bossChest)}`;

  openBossChestButton.onclick = function () {
    openBossChestButton.remove();
    openChest(bossChest);
    currentBoss = null;
    currentKnowledgeBuff = null;
    bossTurnCount = 0;
  };

  document.getElementById("answers").appendChild(openBossChestButton);

  updateUI();
}

function rollRareDrops(rareDrops) {
  const rewards = [];

  if (!rareDrops || rareDrops.length === 0) {
    return rewards;
  }

  rareDrops.forEach(drop => {
    const roll = Math.random() * 100;

    if (roll < drop.chance) {
      rewards.push({
        item: drop.item,
        quantity: drop.quantity || 1
      });
    }
  });

  return rewards;
}

function healPlayer() {
  playerHp = maxPlayerHp;
  saveGame();
  updateUI();

  document.getElementById("result").innerText = "HP đã hồi đầy.";
}

function showShopPanel() {
  document.getElementById("map").style.display = "none";
  document.getElementById("progress").innerText = "Cửa hàng";
  document.getElementById("question").innerText = "🛒 Cửa hàng vật phẩm";
  document.getElementById("result").innerText = "";
  document.getElementById("nextBtn").style.display = "none";

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  shopItems.forEach(item => {
    const box = document.createElement("div");
    box.style.border = "1px solid #aaa";
    box.style.padding = "12px";
    box.style.margin = "10px 0";
    box.style.borderRadius = "8px";

    const title = document.createElement("h3");
    title.innerText = `${getRarityIcon(item.rarity)} ${item.name} - ${item.rarity}`;
    box.appendChild(title);

    const info = document.createElement("p");
    info.innerText =
      `Mở khóa: Lv ${item.unlockLevel} | Mua: ${item.buyPrice} EXP | Bán: ${item.sellPrice} EXP | Đang có: ${inventory[item.name] || 0}`;
    box.appendChild(info);

    const buyButton = document.createElement("button");

    if (level < item.unlockLevel) {
      buyButton.innerText = `Chưa mở khóa - cần Lv ${item.unlockLevel}`;
      buyButton.disabled = true;
    } else if (exp < item.buyPrice) {
      buyButton.innerText = "Không đủ EXP để mua";
      buyButton.disabled = true;
    } else {
      buyButton.innerText = `Mua ${item.name}`;
    }

    buyButton.onclick = function () {
      buyItem(item);
      showShopPanel();
    };

    box.appendChild(buyButton);

    const sellButton = document.createElement("button");

    if (!inventory[item.name] || inventory[item.name] <= 0) {
      sellButton.innerText = "Không có để bán";
      sellButton.disabled = true;
    } else {
      sellButton.innerText = `Bán ${item.name}`;
    }

    sellButton.onclick = function () {
      sellItem(item);
      showShopPanel();
    };

    box.appendChild(sellButton);
    answersDiv.appendChild(box);
  });

  const backButton = document.createElement("button");
  backButton.innerText = currentRegion ? "Quay lại map khu vực" : "Quay lại bản đồ";
  backButton.onclick = function () {
    renderMap(currentRegion ? `Khu vực: ${currentRegion.name}` : "Bản đồ thế giới");
  };

  answersDiv.appendChild(backButton);
  updateUI();
}

function buyItem(item) {
  if (level < item.unlockLevel) {
    document.getElementById("result").innerText = "Vật phẩm này chưa mở khóa.";
    return;
  }

  if (exp < item.buyPrice) {
    document.getElementById("result").innerText = "Không đủ EXP.";
    return;
  }

  exp -= item.buyPrice;
  addItemToInventory(item.name, 1);

  saveGame();
  updateInventory();

  document.getElementById("result").innerText = `Đã mua ${item.name} x1.`;
}

function sellItem(item) {
  if (!inventory[item.name] || inventory[item.name] <= 0) {
    document.getElementById("result").innerText = "Không có vật phẩm để bán.";
    return;
  }

  inventory[item.name]--;

  if (inventory[item.name] <= 0) {
    delete inventory[item.name];
  }

  exp += item.sellPrice;

  saveGame();
  updateInventory();

  document.getElementById("result").innerText =
    `Đã bán ${item.name} x1, nhận ${item.sellPrice} EXP.`;
}

function showCraftingPanel() {
  document.getElementById("map").style.display = "none";
  document.getElementById("progress").innerText = "Xưởng chế tạo";
  document.getElementById("question").innerText = "⚒ Chế tạo / Nâng cấp vũ khí";
  document.getElementById("result").innerText = "";
  document.getElementById("nextBtn").style.display = "none";

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  craftingRecipes.forEach(recipe => {
    const recipeBox = document.createElement("div");
    recipeBox.style.border = "1px solid #aaa";
    recipeBox.style.padding = "12px";
    recipeBox.style.margin = "10px 0";
    recipeBox.style.borderRadius = "8px";

    const title = document.createElement("h3");
    title.innerText = `${getRarityIcon(recipe.rarity)} ${recipe.name} - ${recipe.rarity}`;
    recipeBox.appendChild(title);

    const damage = document.createElement("p");
    damage.innerText = `Sát thương: ${recipe.damage} | Tỉ lệ thành công: ${recipe.successRate}%`;
    recipeBox.appendChild(damage);

    const materialText = document.createElement("p");
    materialText.innerText = getMaterialText(recipe.materials);
    recipeBox.appendChild(materialText);

    const craftButton = document.createElement("button");

    if (canCraft(recipe)) {
      craftButton.innerText = "Chế tạo / Nâng cấp";
    } else {
      craftButton.innerText = "Thiếu nguyên liệu";
      craftButton.disabled = true;
    }

    craftButton.onclick = function () {
      craftWeapon(recipe);
      showCraftingPanel();
    };

    recipeBox.appendChild(craftButton);
    answersDiv.appendChild(recipeBox);
  });

  const backButton = document.createElement("button");
  backButton.innerText = currentRegion ? "Quay lại map khu vực" : "Quay lại bản đồ";
  backButton.onclick = function () {
    renderMap(currentRegion ? `Khu vực: ${currentRegion.name}` : "Bản đồ thế giới");
  };

  answersDiv.appendChild(backButton);
}

function getRarityIcon(rarity) {
  if (rarity === "Thường") return "⚪";
  if (rarity === "Hiếm") return "🟢";
  if (rarity === "Quý") return "🔵";
  if (rarity === "Sử Thi") return "🟣";
  if (rarity === "Bán Thần") return "🟥";
  if (rarity === "Huyền Thoại") return "🟠";
  if (rarity === "Thần Thoại") return "🌈";
  return "⚒";
}

function getMaterialText(materials) {
  return Object.keys(materials)
    .map(name => {
      const need = materials[name];
      const have = getItemCount(name);
      const mark = have >= need ? "✔" : "✘";
      return `${mark} ${name}: ${have}/${need}`;
    })
    .join(" | ");
}

function getItemCount(itemName) {
  return (inventory[itemName] || 0) + (weapons[itemName]?.quantity || 0);
}

function canCraft(recipe) {
  return Object.keys(recipe.materials).every(name => {
    return getItemCount(name) >= recipe.materials[name];
  });
}

function craftWeapon(recipe) {
  if (!canCraft(recipe)) {
    document.getElementById("result").innerText = "Không đủ nguyên liệu.";
    return;
  }

  const success = Math.random() * 100 < recipe.successRate;

  if (success) {
    Object.keys(recipe.materials).forEach(name => {
      removeItemOrWeapon(name, recipe.materials[name]);
    });

    if (!weapons[recipe.name]) {
      weapons[recipe.name] = {
        quantity: 0,
        rarity: recipe.rarity,
        damage: recipe.damage
      };
    }

    weapons[recipe.name].quantity++;

    document.getElementById("result").innerText =
      `✨ Thành công! Bạn nhận được ${recipe.name}.`;
  } else {
    consumeMaterialsOnFail(recipe);

    document.getElementById("result").innerText =
      "💥 Thất bại! Bạn mất một phần nguyên liệu, nhưng vũ khí nền được giữ lại.";
  }

  saveGame();
  updateInventory();
  updateEquippedWeaponUI();
}

function consumeMaterialsOnFail(recipe) {
  Object.keys(recipe.materials).forEach(name => {
    if (weapons[name]) return;

    const need = recipe.materials[name];
    const lost = Math.max(1, Math.floor(need / 2));

    removeItemOrWeapon(name, lost);
  });
}

function removeItemOrWeapon(name, quantity) {
  if (inventory[name]) {
    const usedFromInventory = Math.min(inventory[name], quantity);
    inventory[name] -= usedFromInventory;
    quantity -= usedFromInventory;

    if (inventory[name] <= 0) {
      delete inventory[name];
    }
  }

  if (quantity > 0 && weapons[name]) {
    weapons[name].quantity -= quantity;

    if (weapons[name].quantity <= 0) {
      delete weapons[name];

      if (equippedWeapon && equippedWeapon.name === name) {
        equippedWeapon = null;
      }
    }
  }
}

function showEquipmentPanel() {
  document.getElementById("map").style.display = "none";
  document.getElementById("progress").innerText = "Trang bị";
  document.getElementById("question").innerText = "⚔ Chọn vũ khí để trang bị";
  document.getElementById("result").innerText = "";
  document.getElementById("nextBtn").style.display = "none";

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  const weaponNames = Object.keys(weapons);

  if (weaponNames.length === 0) {
    const empty = document.createElement("p");
    empty.innerText = "Bạn chưa có vũ khí nào. Hãy vào Xưởng chế tạo để tạo vũ khí.";
    answersDiv.appendChild(empty);
  }

  weaponNames.forEach(weaponName => {
    const weapon = weapons[weaponName];

    const box = document.createElement("div");
    box.style.border = "1px solid #aaa";
    box.style.padding = "12px";
    box.style.margin = "10px 0";
    box.style.borderRadius = "8px";

    const title = document.createElement("h3");
    title.innerText =
      `${getRarityIcon(weapon.rarity)} ${weaponName} x${weapon.quantity}`;
    box.appendChild(title);

    const info = document.createElement("p");
    info.innerText = `Bậc: ${weapon.rarity} | Sát thương: ${weapon.damage}`;
    box.appendChild(info);

    const equipButton = document.createElement("button");

    if (equippedWeapon && equippedWeapon.name === weaponName) {
      equipButton.innerText = "Đang trang bị";
      equipButton.disabled = true;
    } else {
      equipButton.innerText = "Trang bị";
    }

    equipButton.onclick = function () {
      equipWeapon(weaponName);
      showEquipmentPanel();
    };

    box.appendChild(equipButton);
    answersDiv.appendChild(box);
  });

  if (equippedWeapon) {
    const unequipButton = document.createElement("button");
    unequipButton.innerText = "Tháo vũ khí hiện tại";

    unequipButton.onclick = function () {
      equippedWeapon = null;
      saveGame();
      updateEquippedWeaponUI();
      showEquipmentPanel();
    };

    answersDiv.appendChild(unequipButton);
  }

  const backButton = document.createElement("button");
  backButton.innerText = currentRegion ? "Quay lại map khu vực" : "Quay lại bản đồ";

  backButton.onclick = function () {
    renderMap(currentRegion ? `Khu vực: ${currentRegion.name}` : "Bản đồ thế giới");
  };

  answersDiv.appendChild(backButton);
}

function equipWeapon(weaponName) {
  const weapon = weapons[weaponName];

  if (!weapon || weapon.quantity <= 0) {
    document.getElementById("result").innerText = "Bạn không có vũ khí này.";
    return;
  }

  equippedWeapon = {
    name: weaponName,
    rarity: weapon.rarity,
    damage: weapon.damage
  };

  saveGame();
  updateEquippedWeaponUI();

  document.getElementById("result").innerText =
    `Đã trang bị ${weaponName}.`;
}

function ensureEquippedWeaponBox() {
  let box = document.getElementById("equippedWeaponBox");

  if (box) return box;

  const inventoryTitle = Array.from(document.querySelectorAll("h2"))
    .find(title => title.innerText.includes("Túi đồ"));

  box = document.createElement("div");
  box.id = "equippedWeaponBox";
  box.style.border = "1px solid #aaa";
  box.style.padding = "12px";
  box.style.margin = "16px 0";
  box.style.borderRadius = "8px";
  box.style.fontSize = "24px";
  box.style.background = "#f8f8f8";

  if (inventoryTitle) {
    inventoryTitle.parentNode.insertBefore(box, inventoryTitle);
  } else {
    document.querySelector(".game-box").appendChild(box);
  }

  return box;
}

function updateEquippedWeaponUI() {
  const box = ensureEquippedWeaponBox();

  if (!equippedWeapon) {
    box.innerText = "⚔ Vũ khí đang dùng: Chưa trang bị";
    return;
  }

  if (!weapons[equippedWeapon.name] || weapons[equippedWeapon.name].quantity <= 0) {
    equippedWeapon = null;
    saveGame();
    box.innerText = "⚔ Vũ khí đang dùng: Chưa trang bị";
    return;
  }

  box.innerText =
    `⚔ Vũ khí đang dùng: ${getRarityIcon(equippedWeapon.rarity)} ${equippedWeapon.name} | ST: ${equippedWeapon.damage}`;
}

function getEquippedWeaponText() {
  if (!equippedWeapon) return "Chưa trang bị";
  return `${getRarityIcon(equippedWeapon.rarity)} ${equippedWeapon.name}`;
}

function getEquippedDamage() {
  if (!equippedWeapon) return 1;
  return equippedWeapon.damage || 1;
}

function addItemToInventory(itemName, quantity) {
  if (!inventory[itemName]) {
    inventory[itemName] = 0;
  }

  inventory[itemName] += quantity;
}

function updateInventory() {
  const inventoryList = document.getElementById("inventory");

  inventoryList.innerHTML = "";

  const itemNames = Object.keys(inventory);
  const weaponNames = Object.keys(weapons);

  if (itemNames.length === 0 && weaponNames.length === 0) {
    const li = document.createElement("li");
    li.innerText = "Chưa có vật phẩm";
    inventoryList.appendChild(li);
    updateEquippedWeaponUI();
    return;
  }

  itemNames.forEach(itemName => {
    const li = document.createElement("li");
    li.innerText = `${itemName} x${inventory[itemName]}`;
    inventoryList.appendChild(li);
  });

  weaponNames.forEach(weaponName => {
    const weapon = weapons[weaponName];
    const li = document.createElement("li");
    li.innerText =
      `${getRarityIcon(weapon.rarity)} ${weaponName} x${weapon.quantity} - ST: ${weapon.damage}`;
    inventoryList.appendChild(li);
  });

  updateEquippedWeaponUI();
}

function getRandomQuestions(questionList, count) {
  const shuffled = [...questionList];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[randomIndex];
    shuffled[randomIndex] = temp;
  }

  return shuffled.slice(0, count);
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function convertOldInventory(oldInventory) {
  const newInventory = {};

  oldInventory.forEach(itemName => {
    if (!newInventory[itemName]) {
      newInventory[itemName] = 0;
    }

    newInventory[itemName]++;
  });

  return newInventory;
}

function saveGame() {
  localStorage.setItem("exp", exp);
  localStorage.setItem("level", level);
  localStorage.setItem("levelExp", levelExp);
  localStorage.setItem("playerHp", playerHp);
  localStorage.setItem("maxPlayerHp", maxPlayerHp);
  localStorage.setItem("inventory", JSON.stringify(inventory));
  localStorage.setItem("weapons", JSON.stringify(weapons));
  localStorage.setItem("equippedWeapon", JSON.stringify(equippedWeapon));
  localStorage.setItem("completedNodes", JSON.stringify(completedNodes));
}