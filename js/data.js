/* ==========================================================================
   little haven ♡ — Data Store & LocalStorage Management (Dynamic & Authenticated)
   ========================================================================== */

const STORAGE_KEYS = {
  AUTH: 'little_haven_auth_user_v3',
  USERS: 'little_haven_registered_users_v3',
  TASKS: 'little_haven_tasks_v3',
  MILESTONES: 'little_haven_milestones_v3',
  MEMORIES: 'little_haven_memories_v3',
  NOTES: 'little_haven_notes_v3',
  HABITS: 'little_haven_habits_v3',
  MOOD: 'little_haven_mood_v3',
  SETTINGS: 'little_haven_settings_v3'
};

const COZY_QUOTES = [
  "Take today one gentle thing at a time ✨",
  "A heart's a heavy burden, so rest a moment 🌿",
  "Always believe in yourself. You have nothing to fear 🍃",
  "You are doing wonderfully, even in quiet little steps 🍄",
  "There is sweetness in slow mornings and warm tea 🍵",
  "Just follow your heart and keep smiling 🌸",
  "Growth happens silently, like moss on ancient stones 🌱",
  "Be gentle with your mind today. You are learning ✨"
];

// Helper: Relative date YYYY-MM-DD
function getRelativeDateString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// Storage Manager
const HavenStorage = {
  // Authentication & Registered Users
  getRegisteredUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  registerUser(name, email, password) {
    const users = this.getRegisteredUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email already exists!' };
    }
    const newUser = {
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      password,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setAuthUser(newUser.email, newUser.name);
    return { success: true, user: newUser };
  },
  authenticateUser(email, password) {
    const users = this.getRegisteredUsers();
    // Check if user exists in registered list
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (found.password === password) {
        const user = this.setAuthUser(found.email, found.name);
        return { success: true, user };
      } else {
        return { success: false, message: 'Incorrect password. Please try again 🍃' };
      }
    }
    // If no users registered yet or logging in as guest/new session:
    const user = this.setAuthUser(email, email.split('@')[0]);
    return { success: true, user };
  },
  getAuthUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
  setAuthUser(email, name = '') {
    const user = {
      email,
      name: name || email.split('@')[0],
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
    return user;
  },
  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  },

  // Tasks (Matching Executive Productivity & Life Report)
  getTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (data) return JSON.parse(data);
      return [
        {
          id: 't-1',
          title: 'Morning matcha ritual & silent meditation',
          description: 'Breathe in ceremonial green tea aroma. 10 minutes stillness by window.',
          category: 'Wellness & Tea',
          priority: 'GENTLE',
          dueDate: getRelativeDateString(0),
          completed: true,
          color: 'green',
          subtasks: [
            { title: 'Whisk warm ceremonial grade green tea', done: true },
            { title: 'Sit quietly beside sunlight and breathe', done: true }
          ]
        },
        {
          id: 't-2',
          title: 'Design watercolor moodboard for sanctuary desk',
          description: 'Blend olive green, cherry blossom pink, honeycomb yellow on cold-press paper.',
          category: 'Creative',
          priority: 'DEEP FOCUS',
          dueDate: getRelativeDateString(0),
          completed: false,
          inProgress: true,
          color: 'peach',
          subtasks: [
            { title: 'Select earth pigment swatches', done: true },
            { title: 'Sketch vine borders & soot sprites', done: false }
          ]
        },
        {
          id: 't-3',
          title: 'Water terrarium moss & mist balcony ferns',
          description: 'Check moisture balance. Mist delicate maidenhair ferns with fresh rainwater.',
          category: 'Garden & Nature',
          priority: 'QUICK WIN',
          dueDate: getRelativeDateString(0),
          completed: false,
          inProgress: true,
          color: 'amber',
          subtasks: []
        },
        {
          id: 't-4',
          title: 'Polish sanctuary web layout & theme variables',
          description: 'Ensure silky smooth micro-animations, glassmorphism borders, tactile responsiveness.',
          category: 'Work & Code',
          priority: 'DEEP FOCUS',
          dueDate: getRelativeDateString(1),
          completed: false,
          color: 'sage',
          subtasks: [
            { title: 'Test dark midnight theme palettes', done: true },
            { title: 'Verify mobile touch responsiveness', done: false }
          ]
        },
        {
          id: 't-5',
          title: 'Read chapter 4 of The Wind Rises by the hearth',
          description: 'Take quiet notes on pastoral scenery reflections and architectural sketches.',
          category: 'Study & Reading',
          priority: 'GENTLE',
          dueDate: getRelativeDateString(1),
          completed: false,
          color: 'green',
          subtasks: []
        },
        {
          id: 't-6',
          title: 'Visit weekend organic herbalists market',
          description: 'Pick up dried chamomile flowers, lavender sprigs, and wildflower clover honey.',
          category: 'Daily Life',
          priority: 'GENTLE',
          dueDate: getRelativeDateString(2),
          completed: false,
          color: 'amber',
          subtasks: []
        },
        {
          id: 't-7',
          title: 'Organize digital notes into curated knowledge garden',
          description: 'Archive stale bookmarks and categorize peaceful project inspirations.',
          category: 'Work & Code',
          priority: 'QUICK WIN',
          dueDate: getRelativeDateString(3),
          completed: false,
          color: 'sky',
          subtasks: []
        }
      ];
    } catch (e) {
      return [];
    }
  },
  saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  // Upcoming Milestones & Agenda Schedule (Matching Report)
  getMilestones() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MILESTONES);
      if (data) return JSON.parse(data);
      return [
        {
          id: 'm-1',
          title: 'Spring Blossom Walk & Sketching 🌸',
          subtitle: 'Golden hour stroll with sketchbook & charcoal pigments',
          date: getRelativeDateString(2),
          daysBadge: '+2 DAYS',
          badgeClass: 'd2',
          category: 'green'
        },
        {
          id: 'm-2',
          title: 'Studio Web Architecture Showcase 🚀',
          subtitle: 'Present new interactive dashboard experience',
          date: getRelativeDateString(4),
          daysBadge: '+4 DAYS',
          badgeClass: 'd4',
          category: 'teal'
        },
        {
          id: 'm-3',
          title: 'Botanical Herbarium Workshop 🌿',
          subtitle: 'Pressing wild mountain ferns & clover blossoms',
          date: getRelativeDateString(7),
          daysBadge: '+7 DAYS',
          badgeClass: 'd7',
          category: 'caramel'
        },
        {
          id: 'm-4',
          title: 'Sanctuary Birthday Gathering 🎂',
          subtitle: 'Fresh strawberry shortcake & herbal brews with loved ones',
          date: getRelativeDateString(11),
          daysBadge: '+11 DAYS',
          badgeClass: 'd11',
          category: 'rose'
        }
      ];
    } catch (e) {
      return [];
    }
  },
  saveMilestones(milestones) {
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
  },

  // Scrapbook Memories
  getMemories() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      if (data) return JSON.parse(data);
      return [
        {
          id: 'mem-1',
          image: 'assets/images/ghibli-sunset-hills.jpg',
          caption: 'Golden Sunset Hills ✨',
          note: 'Walking through sunlit hills at golden sunset. The wind was carrying the sweet scent of wild mountain flowers.',
          date: getRelativeDateString(0),
          displayDate: 'Today'
        },
        {
          id: 'mem-2',
          image: 'assets/images/ghibli-cottage.jpg',
          caption: 'Cottage Sanctuary 🏡🍃',
          note: 'A quiet afternoon in moss woods. Brewed chamomile tea and listened to raindrops tapping on wooden roof.',
          date: getRelativeDateString(-2),
          displayDate: '2 days ago'
        }
      ];
    } catch (e) {
      return [];
    }
  },
  saveMemories(memories) {
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
  },

  // Sanctuary Reflections & Mindful Notes (Matching Report)
  getNotes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (data) return JSON.parse(data);
      return [
        {
          id: 'n-1',
          title: '✨ Sanctuary Vision',
          text: 'Slow mornings, warm cups of roasted hojicha tea, and soft sunlight drifting through sheer linen curtains.',
          noteDate: getRelativeDateString(0),
          color: 'amber',
          date: 'Saved Today'
        },
        {
          id: 'n-2',
          title: '🌿 Color Harmonies',
          text: '• Forest Matcha: #475E3E\n• Wild Honey: #D49A58\n• Morning Mist: #DCE3C8\n• Sakura Cloud: #F7D4DA',
          noteDate: getRelativeDateString(-1),
          color: 'matcha',
          date: 'Yesterday'
        },
        {
          id: 'n-3',
          title: '🌸 Gentle Reminder',
          text: 'You don\'t have to carry everything at once. Put down heavy thoughts and take this minute for yourself.',
          noteDate: getRelativeDateString(-7),
          color: 'rose',
          date: 'Oct 14'
        }
      ];
    } catch (e) {
      return [];
    }
  },
  saveNotes(notes) {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  // Habit Garden & Mindful Rituals (Matching Report)
  getHabits() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (data) return JSON.parse(data);
      return [
        {
          id: 'h-1',
          title: '💧 Morning lemon water & hydration',
          streak: 'Daily wellness · 5-day active streak',
          level: 5,
          nurtured: true
        },
        {
          id: 'h-2',
          title: '📖 15 minutes mindful reading',
          streak: 'Study & calm · 4-day streak',
          level: 4,
          nurtured: true
        },
        {
          id: 'h-3',
          title: '🎯 Deep focus flow session',
          streak: 'Pomodoro craft · 5-day streak',
          level: 5,
          nurtured: true
        },
        {
          id: 'h-4',
          title: '🍃 Gentle walk in afternoon sunlight',
          streak: 'Movement & fresh air · 3-day streak',
          level: 3,
          nurtured: false
        },
        {
          id: 'h-5',
          title: '🍵 Evening chamomile wind-down',
          streak: 'Restorative sleep ritual · 4-day streak',
          level: 4,
          nurtured: false
        }
      ];
    } catch (e) {
      return [];
    }
  },
  saveHabits(habits) {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  },

  getMood() {
    return localStorage.getItem(STORAGE_KEYS.MOOD) || 'Peaceful & Calm';
  },

  setMood(mood) {
    localStorage.setItem(STORAGE_KEYS.MOOD, mood);
  },

  getRandomQuote() {
    const idx = Math.floor(Math.random() * COZY_QUOTES.length);
    return COZY_QUOTES[idx];
  },

  // Calendar Activity Aggregator for any given date
  getActivitiesForDate(dateStr) {
    const tasks = this.getTasks().filter(t => t.dueDate === dateStr);
    const milestones = this.getMilestones().filter(m => m.date === dateStr);
    const memories = this.getMemories().filter(mem => mem.date === dateStr);
    const notes = this.getNotes().filter(n => n.noteDate === dateStr);
    return { tasks, milestones, memories, notes };
  },

  // Get map of all dates in a month that have activities for doodler icons
  getMonthActivityMap(year, month) {
    const map = {};
    const pad = (n) => String(n).padStart(2, '0');
    
    // Check tasks
    this.getTasks().forEach(t => {
      if (t.dueDate) {
        if (!map[t.dueDate]) map[t.dueDate] = { tasks: 0, milestones: 0, memories: 0, notes: 0 };
        map[t.dueDate].tasks++;
      }
    });

    // Check milestones
    this.getMilestones().forEach(m => {
      if (m.date) {
        if (!map[m.date]) map[m.date] = { tasks: 0, milestones: 0, memories: 0, notes: 0 };
        map[m.date].milestones++;
      }
    });

    // Check memories
    this.getMemories().forEach(mem => {
      if (mem.date) {
        if (!map[mem.date]) map[mem.date] = { tasks: 0, milestones: 0, memories: 0, notes: 0 };
        map[mem.date].memories++;
      }
    });

    // Check notes
    this.getNotes().forEach(n => {
      if (n.noteDate) {
        if (!map[n.noteDate]) map[n.noteDate] = { tasks: 0, milestones: 0, memories: 0, notes: 0 };
        map[n.noteDate].notes++;
      }
    });

    return map;
  }
};
