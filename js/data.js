/* ==========================================================================
   little haven ♡ — Data Store & LocalStorage Management (Dynamic & Authenticated)
   ========================================================================== */

const STORAGE_KEYS = {
  AUTH: 'little_haven_auth_user_v2',
  USERS: 'little_haven_registered_users_v2',
  TASKS: 'little_haven_tasks_v2',
  MILESTONES: 'little_haven_milestones_v2',
  MEMORIES: 'little_haven_memories_v2',
  NOTES: 'little_haven_notes_v2',
  HABITS: 'little_haven_habits_v2',
  MOOD: 'little_haven_mood_v2',
  SETTINGS: 'little_haven_settings_v2'
};

const COZY_QUOTES = [
  "Take today one thing at a time ✨",
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

  // Tasks (User-driven, persists in localStorage)
  getTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (data) return JSON.parse(data);
      // Starter tasks matching reference image
      return [
        {
          id: 't-1',
          title: 'Complete GATE practice',
          category: 'GATE Prep',
          dueDate: getRelativeDateString(0),
          completed: false,
          color: 'green'
        },
        {
          id: 't-2',
          title: 'Submit NPTEL assignment',
          category: 'NPTEL',
          dueDate: getRelativeDateString(0),
          completed: false,
          color: 'amber'
        },
        {
          id: 't-3',
          title: 'Submit assignment',
          category: 'General',
          dueDate: getRelativeDateString(1),
          completed: false,
          color: 'peach'
        },
        {
          id: 't-4',
          title: 'Complete foreening',
          category: 'Prep',
          dueDate: getRelativeDateString(1),
          completed: false,
          color: 'sage'
        },
        {
          id: 't-5',
          title: 'Complete GATE practice',
          category: 'GATE Prep',
          dueDate: getRelativeDateString(2),
          completed: false,
          color: 'green'
        },
        {
          id: 't-6',
          title: 'Submit GATE study',
          category: 'GATE Study',
          dueDate: getRelativeDateString(3),
          completed: false,
          color: 'amber'
        },
        {
          id: 't-7',
          title: 'Conmit add',
          category: 'Coding',
          dueDate: getRelativeDateString(0),
          completed: false,
          color: 'sky'
        }
      ];
    } catch (e) {
      return [];
    }
  },
  saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  // Upcoming Dates & Milestones (Matching reference image)
  getMilestones() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MILESTONES);
      if (data) return JSON.parse(data);
      return [
        {
          id: 'm-1',
          title: 'Submissions 📋',
          subtitle: 'January 1 - 20:30',
          date: getRelativeDateString(3),
          category: 'amber',
          label: 'Submissions'
        },
        {
          id: 'm-2',
          title: 'Common jurtters',
          subtitle: 'Community study review',
          date: getRelativeDateString(5),
          category: 'green',
          label: 'Common jurtters'
        },
        {
          id: 'm-3',
          title: 'Birthday 🎂',
          subtitle: 'Sweet pastries & celebration',
          date: getRelativeDateString(8),
          category: 'celebration',
          label: 'Birthday'
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
          caption: 'Today was magic ✨',
          note: 'Walking through the sunlit hills at sunset. The wind was gentle and carrying the scent of wild pine needles.',
          date: getRelativeDateString(0)
        },
        {
          id: 'mem-2',
          image: 'assets/images/ghibli-cottage.jpg',
          caption: 'Cottage sanctuary 🏡🍃',
          note: 'A quiet afternoon in the moss woods. Brewed herbal chamomile tea and listened to raindrops.',
          date: getRelativeDateString(-2)
        }
      ];
    } catch (e) {
      return [];
    }
  },
  saveMemories(memories) {
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
  },

  // Little Notes & Thoughts
  getNotes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (data) return JSON.parse(data);
      return [
        {
          id: 'n-1',
          text: 'ideas & random\nthoughts',
          noteDate: getRelativeDateString(0),
          color: 'buttercup',
          date: 'Today'
        }
      ];
    } catch (e) {
      return [];
    }
  },
  saveNotes(notes) {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  // Goals & Habits
  getHabits() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (data) return JSON.parse(data);
      return [
        { id: 'h-1', title: 'Read a little', level: 4, nurtured: true },
        { id: 'h-2', title: 'Study focus', level: 5, nurtured: true },
        { id: 'h-3', title: 'Take a break', level: 3, nurtured: false }
      ];
    } catch (e) {
      return [];
    }
  },
  saveHabits(habits) {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  },

  getMood() {
    return localStorage.getItem(STORAGE_KEYS.MOOD) || 'peaceful';
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
