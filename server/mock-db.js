class MockModel {
  constructor(name, schema) {
    this.name = name;
    this.schema = schema;
    this.data = [];
    this.idCounter = 1;
  }

  // Helper to match where clause
  _match(item, where) {
    if (!where) return true;
    for (const key in where) {
      const val = where[key];
      // Handle simple operators if needed, currently supporting direct equality
      if (val && typeof val === 'object') {
        // Mock Op.gte, Op.between etc.
        // Simplified: just ignore complex ops or return true for now
        // Or implement simple logic
        return true; 
      }
      if (item[key] !== val) return false;
    }
    return true;
  }

  async findOne(options) {
    const where = options?.where || {};
    const item = this.data.find(d => this._match(d, where));
    return item ? this._wrap(item) : null;
  }

  async findAll(options) {
    const where = options?.where || {};
    let items = this.data.filter(d => this._match(d, where));
    
    // Sort
    if (options?.order) {
        // Simplified sort
        items.sort((a, b) => b.id - a.id);
    }
    
    // Limit
    if (options?.limit) {
        items = items.slice(0, options.limit);
    }

    return items.map(i => this._wrap(i));
  }

  async findByPk(id) {
    const item = this.data.find(d => d.id == id);
    return item ? this._wrap(item) : null;
  }

  async create(data) {
    const newItem = { id: this.idCounter++, ...data, createdAt: new Date(), updatedAt: new Date() };
    // Handle defaults
    for(const key in this.schema) {
        if(newItem[key] === undefined && this.schema[key].defaultValue !== undefined) {
            let def = this.schema[key].defaultValue;
            if(key === 'date' || key === 'lastActiveDate') def = new Date(); // Simplify DataTypes.NOW
            newItem[key] = def;
        }
    }
    this.data.push(newItem);
    return this._wrap(newItem);
  }

  async count(options) {
    const items = await this.findAll(options);
    return items.length;
  }
  
  async bulkCreate(items) {
      for(const item of items) {
          await this.create(item);
      }
      return items;
  }

  _wrap(item) {
    // Return an object with save() method
    const wrapper = { ...item };
    
    // Add associations mock
    // User has CatState
    if(this.name === 'User') {
        // Try to find cat
        // This is tricky without reference to other models. 
        // For simple include support in leaderboard:
        // wrapper.username is already there.
    }
    
    // Inventory include Item
    if(this.name === 'Inventory') {
        // We need to inject Item data. 
        // Since we don't have easy access to Item model here, we might need a global registry.
        // For now, hack it in api.js or let frontend handle it?
        // Actually api.js calls include: [Item]. 
        // We can just mock the Item property if we can access the Item model.
        if(global.MockDB && global.MockDB.Item) {
            const itemData = global.MockDB.Item.data.find(i => i.id === item.ItemId);
            if(itemData) wrapper.Item = itemData;
        }
    }

    // CatState include User
    if(this.name === 'CatState') {
         if(global.MockDB && global.MockDB.User) {
            const userData = global.MockDB.User.data.find(u => u.id === item.UserId);
            if(userData) wrapper.User = userData;
        }
    }

    wrapper.save = async () => {
      // Update the original data
      const idx = this.data.findIndex(d => d.id === item.id);
      if (idx !== -1) {
        this.data[idx] = { ...this.data[idx], ...wrapper };
        delete this.data[idx].save; // Don't save the function
      }
      return wrapper;
    };
    
    wrapper.destroy = async () => {
        const idx = this.data.findIndex(d => d.id === item.id);
        if (idx !== -1) {
            this.data.splice(idx, 1);
        }
    };

    return wrapper;
  }
}

const db = {
    User: new MockModel('User', {}),
    CatState: new MockModel('CatState', {
        name: { defaultValue: '小白' },
        level: { defaultValue: 1 },
        weight: { defaultValue: 1.0 },
        furQuality: { defaultValue: 80 },
        energy: { defaultValue: 60 },
        exp: { defaultValue: 0 },
        waterCount: { defaultValue: 0 },
        coins: { defaultValue: 0 },
        dailyWaterCount: { defaultValue: 0 },
        lastActiveDate: { defaultValue: new Date() }
    }),
    DietRecord: new MockModel('DietRecord', {
        calories: { defaultValue: 0 },
        protein: { defaultValue: 0 },
        carbs: { defaultValue: 0 },
        fat: { defaultValue: 0 },
        date: { defaultValue: new Date() }
    }),
    Item: new MockModel('Item', {
        icon: { defaultValue: '📦' }
    }),
    Inventory: new MockModel('Inventory', {
        quantity: { defaultValue: 1 },
        isEquipped: { defaultValue: false }
    }),
    QuestLog: new MockModel('QuestLog', {
        date: { defaultValue: new Date() }
    })
};

// Global registry for associations
global.MockDB = db;

// Mock Sequelize object
const sequelize = {
    sync: async () => console.log('Mock DB Synced'),
    define: (name, schema) => {
        // Update schema definitions
        if(db[name]) db[name].schema = schema;
        return db[name];
    },
    Op: {
        gte: 'gte',
        between: 'between'
    }
};

module.exports = {
    sequelize,
    User: db.User,
    CatState: db.CatState,
    DietRecord: db.DietRecord,
    Item: db.Item,
    Inventory: db.Inventory,
    QuestLog: db.QuestLog
};