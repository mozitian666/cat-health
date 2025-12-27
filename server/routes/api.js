const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { User, DietRecord, CatState } = require('../models');

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
  try {
    const user = await getDefaultUser();
    const cat = await CatState.findOne({ where: { UserId: user.id } });
    
    // Get today's records
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    
    const todayRecords = await DietRecord.findAll({
      where: {
        UserId: user.id,
        date: {
          [require('sequelize').Op.gte]: startOfDay
        }
      }
    });

    const stats = {
      totalCalories: todayRecords.reduce((sum, r) => sum + r.calories, 0),
      totalProtein: todayRecords.reduce((sum, r) => sum + r.protein, 0),
      totalCarbs: todayRecords.reduce((sum, r) => sum + r.carbs, 0),
      totalFat: todayRecords.reduce((sum, r) => sum + r.fat, 0),
    };

    res.json({ cat, stats, recentRecords: todayRecords });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching dashboard' });
  }
});

module.exports = router;
