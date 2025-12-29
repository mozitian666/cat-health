const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { User, DietRecord, CatState, QuestLog, Item, Inventory, sequelize } = require('../models');
const Op = sequelize.Op;

// Seed Items if empty
async function seedItems() {
  const count = await Item.count();
  if (count === 0) {
    await Item.bulkCreate([
      { name: '高级猫粮', type: 'food', price: 50, description: '美味的罐头，恢复大量活力', effectType: 'energy', effectValue: '50', icon: '🥫' },
      { name: '逗猫棒', type: 'toy', price: 100, description: '好玩的玩具，增加大量经验', effectType: 'exp', effectValue: '30', icon: '🎣' },
      { name: '墨镜', type: 'decoration', price: 200, description: '酷酷的墨镜', effectType: 'appearance', effectValue: 'sunglasses', icon: '🕶️' },
      { name: '蝴蝶结', type: 'decoration', price: 150, description: '可爱的红色蝴蝶结', effectType: 'appearance', effectValue: 'bow', icon: '🎀' },
      { name: '皇冠', type: 'decoration', price: 500, description: '尊贵的皇冠', effectType: 'appearance', effectValue: 'crown', icon: '👑' }
    ]);
    console.log('Items seeded');
  }
}
seedItems();

// Seed Mock Users for Leaderboard
async function seedMockUsers() {
  const count = await User.count();
  if (count < 5) {
    const mocks = [
      { username: 'HealthGuru', catName: '大橘', level: 3, exp: 600, fur: 90 },
      { username: 'KittyLover', catName: '咪咪', level: 2, exp: 300, fur: 75 },
      { username: 'Newbie', catName: '小黑', level: 1, exp: 50, fur: 60 },
      { username: 'GymRat', catName: '壮壮', level: 2, exp: 450, fur: 85 }
    ];

    for (const m of mocks) {
      const user = await User.create({ username: m.username });
      await CatState.create({
        UserId: user.id,
        name: m.catName,
        level: m.level,
        exp: m.exp,
        furQuality: m.fur,
        energy: 80,
        weight: 4.5
      });
    }
    console.log('Mock users seeded');
  }
}
seedMockUsers();

// Configure Multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // Append extension
  }
});
const upload = multer({ storage: storage });

// Mock AI Food Database
const MOCK_FOOD_DB = [
  { name: '米饭', calories: 200, protein: 4, carbs: 40, fat: 0.5 },
  { name: '红烧肉', calories: 500, protein: 15, carbs: 5, fat: 40 },
  { name: '沙拉', calories: 150, protein: 2, carbs: 10, fat: 5 },
  { name: '鸡蛋', calories: 80, protein: 7, carbs: 0.5, fat: 6 },
  { name: '汉堡', calories: 600, protein: 20, carbs: 50, fat: 30 },
];

// Helper to get or create default user
async function getDefaultUser() {
  let user = await User.findOne({ where: { username: 'default_user' } });
  if (!user) {
    user = await User.create({ username: 'default_user' });
  }
  
  // Ensure CatState always exists
  const cat = await CatState.findOne({ where: { UserId: user.id } });
  if (!cat) {
     await CatState.create({ UserId: user.id });
  } else {
    // Check for daily reset
    const today = new Date().toISOString().split('T')[0];
    if (cat.lastActiveDate !== today) {
      cat.dailyWaterCount = 0;
      cat.lastActiveDate = today;
      await cat.save();
    }
  }

  return user;
}

// API: Upload Image
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  // Return file path for frontend to display
  res.json({ imagePath: `/uploads/${req.file.filename}` });
});

// API: Recognize Food (Mock)
router.post('/recognize', (req, res) => {
  // Simulate AI delay
  setTimeout(() => {
    const randomFood = MOCK_FOOD_DB[Math.floor(Math.random() * MOCK_FOOD_DB.length)];
    res.json(randomFood);
  }, 1000);
});

// API: Submit Diet Record & Update Cat
router.post('/diet', async (req, res) => {
  try {
    const { foodName, calories, protein, carbs, fat, imagePath } = req.body;
    const user = await getDefaultUser();

    // 1. Create Diet Record
    const record = await DietRecord.create({
      UserId: user.id,
      foodName, calories, protein, carbs, fat, imagePath
    });

    // 2. Update Cat State
    const cat = await CatState.findOne({ where: { UserId: user.id } });
    
    // Logic:
    // - Exp increases by 10 per upload
    // - Energy restored to 100
    // - Weight: If calories > 400, weight += 0.1. If < 200, weight -= 0.05
    // - Fur: If protein > 10, fur += 2
    
    cat.exp += 10;
    // cat.energy = 100; // Old: Full restore
    cat.energy = Math.min(100, cat.energy + 30); // New: Increase by 30
    
    if (calories > 400) cat.weight += 0.1;
    else if (calories < 200) cat.weight = Math.max(0.5, cat.weight - 0.05);

    if (protein > 10) cat.furQuality = Math.min(100, cat.furQuality + 2);

    // Level up logic (simple)
    if (cat.exp >= 100 && cat.level === 1) cat.level = 2; // Adult
    if (cat.exp >= 500 && cat.level === 2) cat.level = 3; // Senior

    await cat.save();

    res.json({ success: true, record, cat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save record' });
  }
});

// API: Drink Water (Update Cat)
router.post('/water', async (req, res) => {
  try {
    const user = await getDefaultUser();
    const cat = await CatState.findOne({ where: { UserId: user.id } });
    
    // Logic: Drink water increases energy slightly and exp
    cat.waterCount += 1;
    cat.dailyWaterCount += 1;
    cat.energy = Math.min(100, cat.energy + 10); // Increase by 10
    cat.exp += 5; // Moderate exp gain

    // Level up check
    if (cat.exp >= 100 && cat.level === 1) cat.level = 2; 
    if (cat.exp >= 500 && cat.level === 2) cat.level = 3; 

    await cat.save();
    res.json({ success: true, cat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update water' });
  }
});

// API: Play with Cat (Decrease Energy, Increase Exp)
router.post('/play', async (req, res) => {
  try {
    const user = await getDefaultUser();
    const cat = await CatState.findOne({ where: { UserId: user.id } });
    
    // Play logic: Cost 20 energy, Gain 15 exp
    if (cat.energy < 20) {
      return res.json({ success: false, message: '小猫累了，需要吃东西或喝水补充体力！', cat });
    }

    cat.energy -= 20;
    cat.exp += 15;

    // Level up check
    if (cat.exp >= 100 && cat.level === 1) cat.level = 2; 
    if (cat.exp >= 500 && cat.level === 2) cat.level = 3; 

    await cat.save();
    res.json({ success: true, message: '小猫玩得很开心！经验 +15，活力 -20', cat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to play' });
  }
});

// API: Get Dashboard Data
router.post('/dashboard', async (req, res) => {
    // Note: Using POST for simplicity to avoid query params for now, or just GET
    // But let's stick to GET
    // Actually, I defined router.post above, let's change to GET and handle user lookup inside
    // For now, assume default user
});

router.get('/dashboard', async (req, res) => {
  console.log('GET /dashboard request received');
  try {
    const user = await getDefaultUser();
    console.log('User found:', user ? user.username : 'null');
    const cat = await CatState.findOne({ where: { UserId: user.id } });
    console.log('Cat found:', cat ? cat.name : 'null');
    
    // Get today's records
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    
    console.log('Querying DietRecord...');
    const todayRecords = await DietRecord.findAll({
      where: {
        UserId: user.id,
        date: {
          [Op.gte]: startOfDay
        }
      }
    });
    console.log('Records found:', todayRecords.length);

    const stats = {
      totalCalories: todayRecords.reduce((sum, r) => sum + r.calories, 0),
      totalProtein: todayRecords.reduce((sum, r) => sum + r.protein, 0),
      totalCarbs: todayRecords.reduce((sum, r) => sum + r.carbs, 0),
      totalFat: todayRecords.reduce((sum, r) => sum + r.fat, 0),
    };
    console.log('Stats calculated');

    res.json({ cat, stats, recentRecords: todayRecords });
    console.log('Response sent');
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Error fetching dashboard' });
  }
});

// --- Quest System ---

const DAILY_QUESTS = [
  { id: 'daily_login', title: '每日登录', desc: '登录游戏', target: 1, rewardCoins: 10, rewardExp: 5 },
  { id: 'drink_water', title: '喝水达人', desc: '喝水 3 次', target: 3, rewardCoins: 20, rewardExp: 10 },
  { id: 'healthy_meal', title: '健康饮食', desc: '记录 1 顿健康餐', target: 1, rewardCoins: 30, rewardExp: 15 }
];

router.get('/quests', async (req, res) => {
  try {
    const user = await getDefaultUser();
    const cat = await CatState.findOne({ where: { UserId: user.id } });
    const today = new Date().toISOString().split('T')[0];

    // Get Quest Logs for today
    const claimedQuests = await QuestLog.findAll({
      where: {
        UserId: user.id,
        date: today
      }
    });
    const claimedIds = new Set(claimedQuests.map(q => q.questId));

    // Calculate progress
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const dietCount = await DietRecord.count({
      where: {
        UserId: user.id,
        date: { [Op.gte]: startOfDay }
      }
    });

    const questsWithStatus = DAILY_QUESTS.map(quest => {
      let progress = 0;
      if (quest.id === 'daily_login') progress = 1;
      if (quest.id === 'drink_water') progress = cat.dailyWaterCount;
      if (quest.id === 'healthy_meal') progress = dietCount;

      const isClaimed = claimedIds.has(quest.id);
      const isCompleted = progress >= quest.target;
      
      let status = 'locked';
      if (isClaimed) status = 'claimed';
      else if (isCompleted) status = 'claimable';

      return { ...quest, progress, status };
    });

    res.json(questsWithStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch quests' });
  }
});

router.post('/quests/claim', async (req, res) => {
  try {
    const { questId } = req.body;
    const user = await getDefaultUser();
    const cat = await CatState.findOne({ where: { UserId: user.id } });
    const today = new Date().toISOString().split('T')[0];

    const quest = DAILY_QUESTS.find(q => q.id === questId);
    if (!quest) return res.status(404).json({ error: 'Quest not found' });

    // Check if already claimed
    const existingLog = await QuestLog.findOne({
      where: { UserId: user.id, questId, date: today }
    });
    if (existingLog) return res.status(400).json({ error: 'Already claimed' });

    // Verify completion
    let progress = 0;
    if (questId === 'daily_login') progress = 1;
    if (questId === 'drink_water') progress = cat.dailyWaterCount;
    if (questId === 'healthy_meal') {
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      progress = await DietRecord.count({
        where: { UserId: user.id, date: { [Op.gte]: startOfDay } }
      });
    }

    if (progress < quest.target) {
      return res.status(400).json({ error: 'Quest not completed yet' });
    }

    // Grant Rewards
    cat.coins += quest.rewardCoins;
    cat.exp += quest.rewardExp;
    await cat.save();

    // Log Claim
    await QuestLog.create({
      UserId: user.id,
      questId,
      date: today
    });

    res.json({ success: true, cat, message: `领取成功！获得 ${quest.rewardCoins} 金币` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to claim quest' });
  }
});

// --- Shop & Inventory System ---

router.get('/shop', async (req, res) => {
  try {
    const items = await Item.findAll();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shop items' });
  }
});

router.post('/shop/buy', async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await getDefaultUser();
    const cat = await CatState.findOne({ where: { UserId: user.id } });
    const item = await Item.findByPk(itemId);

    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (cat.coins < item.price) return res.status(400).json({ error: '金币不足' });

    // Deduct coins
    cat.coins -= item.price;
    await cat.save();

    // Add to inventory
    const inventoryItem = await Inventory.findOne({
      where: { UserId: user.id, ItemId: itemId }
    });

    if (inventoryItem) {
      inventoryItem.quantity += 1;
      await inventoryItem.save();
    } else {
      await Inventory.create({
        UserId: user.id,
        ItemId: itemId,
        quantity: 1
      });
    }

    res.json({ success: true, message: `购买成功！消耗 ${item.price} 金币`, cat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to buy item' });
  }
});

router.get('/inventory', async (req, res) => {
  try {
    const user = await getDefaultUser();
    const inventory = await Inventory.findAll({
      where: { UserId: user.id },
      include: [Item]
    });
    // Filter out items with 0 quantity just in case
    const validInventory = inventory.filter(i => i.quantity > 0);
    res.json(validInventory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

router.post('/inventory/use', async (req, res) => {
  try {
    const { inventoryId } = req.body;
    const user = await getDefaultUser();
    const cat = await CatState.findOne({ where: { UserId: user.id } });
    
    const inventoryItem = await Inventory.findOne({
      where: { id: inventoryId, UserId: user.id },
      include: [Item]
    });

    if (!inventoryItem || inventoryItem.quantity <= 0) {
      return res.status(400).json({ error: '物品不存在或数量不足' });
    }

    const item = inventoryItem.Item;
    let message = `使用了 ${item.name}`;

    // Apply Effects
    if (item.type === 'food') {
      if (item.effectType === 'energy') {
        const val = parseInt(item.effectValue);
        cat.energy = Math.min(100, cat.energy + val);
        message += `，活力恢复了 ${val}`;
      }
      // Consume item
      inventoryItem.quantity -= 1;
    } else if (item.type === 'toy') {
      if (item.effectType === 'exp') {
        const val = parseInt(item.effectValue);
        cat.exp += val;
        message += `，经验增加了 ${val}`;
      }
      // Consume item
      inventoryItem.quantity -= 1;
    } else if (item.type === 'decoration') {
      // Toggle equipment
      if (cat.equippedItem === item.effectValue) {
        cat.equippedItem = null; // Unequip
        message = `取下了 ${item.name}`;
      } else {
        cat.equippedItem = item.effectValue; // Equip
        message = `佩戴了 ${item.name}`;
      }
      // Decorations are not consumed
    }

    // Level check logic (duplicated, could be refactored)
    if (cat.exp >= 100 && cat.level === 1) cat.level = 2; 
    if (cat.exp >= 500 && cat.level === 2) cat.level = 3; 

    await cat.save();
    if (inventoryItem.quantity <= 0 && item.type !== 'decoration') {
        await inventoryItem.destroy(); // Remove empty stack
    } else {
        await inventoryItem.save();
    }

    res.json({ success: true, message, cat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to use item' });
  }
});

// --- Social Leaderboard ---

router.get('/leaderboard', async (req, res) => {
  try {
    const cats = await CatState.findAll({
      include: [{
        model: User,
        attributes: ['username']
      }],
      order: [
        ['level', 'DESC'],
        ['exp', 'DESC'],
        ['furQuality', 'DESC']
      ],
      limit: 10
    });
    
    // Transform data for frontend
    const leaderboard = cats.map((cat, index) => ({
      rank: index + 1,
      id: cat.id,
      catName: cat.name,
      owner: cat.User ? cat.User.username : 'Unknown',
      level: cat.level,
      exp: cat.exp,
      fur: cat.furQuality,
      equippedItem: cat.equippedItem
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// --- AI Weekly Report ---

router.get('/report/weekly', async (req, res) => {
  try {
    const user = await getDefaultUser();
    
    // Get records from last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const records = await DietRecord.findAll({
      where: {
        UserId: user.id,
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // 1. Data Aggregation
    const totalCalories = records.reduce((sum, r) => sum + r.calories, 0);
    const totalProtein = records.reduce((sum, r) => sum + r.protein, 0);
    const totalCarbs = records.reduce((sum, r) => sum + r.carbs, 0);
    const totalFat = records.reduce((sum, r) => sum + r.fat, 0);
    const avgCalories = records.length > 0 ? Math.round(totalCalories / 7) : 0;

    // 2. Mock AI Analysis Logic
    let score = 0;
    let summary = '';
    let suggestion = '';

    if (records.length === 0) {
      score = 0;
      summary = '本周没有任何记录。';
      suggestion = '新的一周，从记录第一顿早餐开始吧！';
    } else {
      // Simple logic based on averages
      if (avgCalories > 1800 && avgCalories < 2500) {
        score += 80;
        summary = '本周热量摄入非常标准，继续保持！';
      } else if (avgCalories <= 1800) {
        score += 60;
        summary = '本周热量摄入偏低，注意不要节食过度哦。';
      } else {
        score += 60;
        summary = '本周热量摄入略高，可能是周末聚餐太多啦？';
      }

      // Macro check
      const proteinRatio = totalProtein * 4 / totalCalories;
      if (proteinRatio > 0.2) {
        score += 10;
        suggestion += '蛋白质摄入充足，肌肉正在生长！';
      } else {
        suggestion += '蛋白质摄入不足，建议多吃鸡胸肉、鸡蛋或鱼类。';
      }

      score = Math.min(100, score);
    }

    const report = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      recordCount: records.length,
      avgCalories,
      score,
      summary,
      suggestion,
      macros: {
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat)
      }
    };

    // Simulate AI Generation Delay
    setTimeout(() => {
      res.json(report);
    }, 1500);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
