let exp = Number(localStorage.getItem("exp")) || 0;
let level = Number(localStorage.getItem("level")) || 1;
let levelExp = Number(localStorage.getItem("levelExp")) || 0;

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
let completedNodes = JSON.parse(localStorage.getItem("completedNodes")) || [];

let worldMapNodes = [];
let currentMapNodes = [];
let currentRegion = null;
let currentNode = null;
let currentQuestions = [];

let playerPosition = { x: 25, y: 250 };

const chestRewards = [
  { name: "Mảnh đồng", min: 1, max: 3 },
  { name: "Bụi hỏa khí", min: 1, max: 3 },
  { name: "Gỗ cứng", min: 1, max: 3 },
  { name: "Đá thô", min: 1, max: 3 },

  { name: "Tinh thạch nhỏ", min: 1, max: 2 },
  { name: "Lông chim lửa", min: 1, max: 2 },
  { name: "Tinh hoa băng", min: 1, max: 2 },
  { name: "Mảnh điện tích", min: 1, max: 2 },

  { name: "Tinh thạch lôi điện", min: 1, max: 1 },
  { name: "Lõi năng lượng", min: 1, max: 1 },
  { name: "Hạch băng", min: 1, max: 1 },
  { name: "Hỏa ngọc", min: 1, max: 1 },

  { name: "Mảnh thái dương", min: 1, max: 1 },
  { name: "Lõi hư không", min: 1, max: 1 },
  { name: "Tinh tú cổ đại", min: 1, max: 1 },
  { name: "Huyết tinh long tộc", min: 1, max: 1 },

  { name: "Tinh hạch thần vực", min: 1, max: 1 },
  { name: "Mảnh linh hồn cổ", min: 1, max: 1 },
  { name: "Tinh thể lượng tử", min: 1, max: 1 },
  { name: "Trái tim nguyên tố", min: 1, max: 1 }
];

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

async function loadWorldMap() {
  const response = await fetch("data/map.json");
  worldMapNodes = await response.json();

  currentMapNodes = worldMapNodes;
  currentRegion = null;
  currentNode = null;
  currentQuestions = [];
  playerPosition = { x: 25, y: 250 };

  renderMap("Bản đồ thế giới");
  updateInventory();
}

async function loadSubMap(regionNode) {
  const response = await fetch(`data/submaps/${regionNode.subMap}`);
  currentMapNodes = await response.json();

  currentRegion = regionNode;
  currentNode = null;
  currentQuestions = [];
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
    nodeDiv.innerText = node.name;

    nodeDiv.onclick = async function () {
      if (!isUnlocked(node)) {
        document.getElementById("result").innerText = "Khu vực này chưa mở khóa.";
        return;
      }

      movePlayerTo(node);

      setTimeout(async function () {
        if (node.type === "region") {
          await loadSubMap(node);
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
}

function showMainButtons() {
  const answersDiv = document.getElementById("answers");

  if (currentRegion) {
    const worldButton = document.createElement("button");
    worldButton.innerText = "🌍 Quay lại bản đồ thế giới";
    worldButton.onclick = loadWorldMap;
    answersDiv.appendChild(worldButton);
  }

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
}async function startQuestionNode(node) {
  currentNode = node;

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

  const question = currentQuestions[currentQuestionIndex];

  document.getElementById("progress").innerText =
    `Câu ${currentQuestionIndex + 1}/${currentQuestions.length} - ${currentNode.name}`;

  document.getElementById("question").innerText = question.text;
  document.getElementById("result").innerText = "";
  document.getElementById("nextBtn").style.display = "none";

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.innerText = answer;

    button.onclick = function () {
      answerQuestion(index);
    };

    answersDiv.appendChild(button);
  });

  updateUI();
}

function answerQuestion(index) {
  if (attemptsLeft <= 0) {
    document.getElementById("result").innerText = "Bạn đã hết lượt trả lời.";
    showBuyRetryButton();
    return;
  }

  const question = currentQuestions[currentQuestionIndex];

  attemptsLeft--;

  if (index === question.correct) {
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
  }
}

function getLevelRequired(level) {
  return 100 + (level - 1) * 50;
}

function updateUI() {
  const levelRequired = getLevelRequired(level);

  document.getElementById("exp").innerText =
    `Lv ${level} | EXP: ${exp} | Cấp: ${levelExp}/${levelRequired} | Lượt trả lời: ${attemptsLeft}`;
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

  checkRegionComplete();
  saveGame();

  document.getElementById("progress").innerText = "Hoàn thành";
  document.getElementById("question").innerText =
    `${currentNode.name} đã hoàn thành!`;

  document.getElementById("answers").innerHTML = "";
  document.getElementById("nextBtn").style.display = "none";
  document.getElementById("result").innerText =
    "Bạn nhận được một rương thưởng!";

  showChestButton();
}

function checkRegionComplete() {
  if (!currentRegion) return;

  const allSubNodesCompleted = currentMapNodes.every(node =>
    completedNodes.includes(node.id)
  );

  if (allSubNodesCompleted && !completedNodes.includes(currentRegion.id)) {
    completedNodes.push(currentRegion.id);
  }
}

function showChestButton() {
  const answersDiv = document.getElementById("answers");

  const openChestButton = document.createElement("button");
  openChestButton.innerText = "🎁 Mở rương thưởng";

  openChestButton.onclick = function () {
    openChestButton.remove();
    openChest();
  };

  answersDiv.appendChild(openChestButton);
}

function openChest() {
  const rewards = generateChestRewards();

  rewards.forEach(reward => {
    addItemToInventory(reward.name, reward.quantity);
  });

  saveGame();
  updateInventory();

  const rewardText = rewards
    .map(reward => `${reward.name} x${reward.quantity}`)
    .join("\n");

  document.getElementById("result").innerText =
    `✨ Bạn nhận được:\n${rewardText}`;

  const backButton = document.createElement("button");
  backButton.innerText = currentRegion ? "Quay lại map khu vực" : "Quay lại bản đồ";

  backButton.onclick = function () {
    removeBuyRetryButton();
    renderMap(currentRegion ? `Khu vực: ${currentRegion.name}` : "Bản đồ thế giới");
  };

  document.getElementById("answers").appendChild(backButton);
}

function generateChestRewards() {
  const rewardCount = randomNumber(1, 3);
  const rewards = [];

  for (let i = 0; i < rewardCount; i++) {
    const item = chestRewards[Math.floor(Math.random() * chestRewards.length)];
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
    }
  }
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
  localStorage.setItem("inventory", JSON.stringify(inventory));
  localStorage.setItem("weapons", JSON.stringify(weapons));
  localStorage.setItem("completedNodes", JSON.stringify(completedNodes));
}

loadWorldMap();