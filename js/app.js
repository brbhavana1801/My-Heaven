/* ==========================================================================
   little heaven ♡ — Main Application Controller (Organized Sanctuary Dashboard)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  // State
  currentUser: null,
  tasks: [],
  milestones: [],
  memories: [],
  notes: [],
  habits: [],
  activeMemoryIndex: 0,
  activeView: 'overview',
  taskFilter: 'all',

  // Calendar State
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(), // 0-indexed

  // Auth State
  authTab: 'signin',

  // Pomodoro Focus State
  pomodoro: {
    mode: 'focus', // 'focus', 'short', 'long'
    timeLeft: 25 * 60,
    totalDuration: 25 * 60,
    isRunning: false,
    timerId: null,
    sessionsCompleted: 0
  },

  init() {
    this.checkAuth();
    this.loadState();
    this.initLiveClock();
    this.initHeaderAndDates();
    this.initCanvasLeaves();
    this.renderAll();
    this.bindEvents();
    this.initSootSpritesAndTotoro();
    this.updateUserBadge();
  },

  renderAll() {
    this.renderKPIs();
    this.renderTasks();
    this.renderDedicatedTasks();
    this.renderMilestones();
    this.renderDedicatedMilestones();
    this.renderMemories();
    this.renderDedicatedMemories();
    this.renderNotes();
    this.renderDedicatedNotes();
    this.renderHabits();
    this.renderDedicatedHabits();
    this.renderCalendar();
    this.renderDedicatedCalendar();
  },

  // --------------------------------------------------------------------------
  // Live Real-Time Clock & Header Dates
  // --------------------------------------------------------------------------
  initLiveClock() {
    const update = () => {
      const now = new Date();
      const timeEl = document.getElementById('liveClockTime');
      const dateEl = document.getElementById('liveClockDate');
      if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      }
      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }
    };
    update();
    setInterval(update, 1000);
  },

  initHeaderAndDates() {
    const todayStr = getRelativeDateString(0);
    const taskDateInput = document.getElementById('taskInlineDate');
    if (taskDateInput) taskDateInput.value = todayStr;

    const dateInlineDate = document.getElementById('dateInlineDate');
    if (dateInlineDate) dateInlineDate.value = getRelativeDateString(3);

    const dedDate = document.getElementById('dedicatedTaskDate');
    if (dedDate) dedDate.value = todayStr;
  },

  shuffleQuote() {
    const quoteEl = document.getElementById('dailyQuoteText');
    if (quoteEl) {
      quoteEl.textContent = HavenStorage.getRandomQuote();
      HavenSoundSystem.playPopSound();
    }
  },

  updateUserBadge() {
    const user = this.currentUser || { name: 'Forest Wanderer', email: 'wanderer@forest.me' };
    const nameEl = document.getElementById('topBarUserName');
    if (nameEl) {
      nameEl.textContent = user.name ? user.name.split(' ')[0] : 'Wanderer';
    }
    const ddName = document.getElementById('accDropdownName');
    if (ddName) {
      ddName.textContent = user.name || 'Forest Wanderer';
    }
    const ddEmail = document.getElementById('accDropdownEmail');
    if (ddEmail) {
      ddEmail.textContent = user.email || 'wanderer@forest.me';
    }
  },

  // --------------------------------------------------------------------------
  // Authentication Flow
  // --------------------------------------------------------------------------
  checkAuth() {
    this.currentUser = HavenStorage.getAuthUser();
    const loginOverlay = document.getElementById('loginGatewayOverlay');

    if (!this.currentUser) {
      if (loginOverlay) loginOverlay.classList.remove('hidden');
    } else {
      if (loginOverlay) loginOverlay.classList.add('hidden');
    }
    this.updateUserBadge();
  },

  switchAuthTab(tab) {
    this.authTab = tab;
    const tabSignin = document.getElementById('authTabBtnSignin');
    const tabRegister = document.getElementById('authTabBtnRegister');
    const formSignin = document.getElementById('authFormSignin');
    const formRegister = document.getElementById('authFormRegister');
    const authErrorMsg = document.getElementById('authErrorMessage');

    if (authErrorMsg) authErrorMsg.style.display = 'none';

    if (tab === 'signin') {
      if (tabSignin) tabSignin.classList.add('active');
      if (tabRegister) tabRegister.classList.remove('active');
      if (formSignin) formSignin.style.display = 'block';
      if (formRegister) formRegister.style.display = 'none';
    } else {
      if (tabSignin) tabSignin.classList.remove('active');
      if (tabRegister) tabRegister.classList.add('active');
      if (formSignin) formSignin.style.display = 'none';
      if (formRegister) formRegister.style.display = 'block';
    }
    HavenSoundSystem.playPopSound();
  },

  handleSignIn(e) {
    if (e) e.preventDefault();
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const errorEl = document.getElementById('authErrorMessage');

    if (!email || !password) return;

    const result = HavenStorage.authenticateUser(email, password);
    if (result.success) {
      this.currentUser = result.user;
      this.checkAuth();
      HavenSoundSystem.playCheckChime();
      this.showToast(`Welcome back, ${this.currentUser.name}! 🌿`, '✨');
    } else {
      if (errorEl) {
        errorEl.textContent = result.message;
        errorEl.style.display = 'block';
      }
      HavenSoundSystem.playPopSound();
    }
  },

  handleRegister(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('regName')?.value.trim();
    const email = document.getElementById('regEmail')?.value.trim();
    const password = document.getElementById('regPassword')?.value;
    const confirmPassword = document.getElementById('regConfirmPassword')?.value;
    const errorEl = document.getElementById('authErrorMessage');

    if (!email || !password) return;

    if (password !== confirmPassword) {
      if (errorEl) {
        errorEl.textContent = 'Passwords do not match. Please verify 🍃';
        errorEl.style.display = 'block';
      }
      HavenSoundSystem.playPopSound();
      return;
    }

    const result = HavenStorage.registerUser(name, email, password);
    if (result.success) {
      this.currentUser = result.user;
      this.checkAuth();
      HavenSoundSystem.playCheckChime();
      this.triggerKonpeitoBurst();
      this.showToast(`Account created! Welcome to your sanctuary, ${this.currentUser.name} 🌸✨`, '🎉');
    } else {
      if (errorEl) {
        errorEl.textContent = result.message;
        errorEl.style.display = 'block';
      }
      HavenSoundSystem.playPopSound();
    }
  },

  quickGuestLogin() {
    this.currentUser = HavenStorage.setAuthUser('guest.wanderer@forest.me', 'Guest Wanderer');
    this.checkAuth();
    HavenSoundSystem.playCheckChime();
    this.showToast('Welcome to little haven ♡ 🌸', '🍃');
  },

  logout() {
    HavenStorage.logout();
    this.currentUser = null;
    const loginOverlay = document.getElementById('loginGatewayOverlay');
    if (loginOverlay) loginOverlay.classList.remove('hidden');
    this.closeAccountModal();
    HavenSoundSystem.playPopSound();
    this.showToast('Logged out softly. Rest well 🌙', '🍂');
  },

  loadState() {
    this.tasks = HavenStorage.getTasks();
    this.milestones = HavenStorage.getMilestones();
    this.memories = HavenStorage.getMemories();
    this.notes = HavenStorage.getNotes();
    this.habits = HavenStorage.getHabits();
  },

  // --------------------------------------------------------------------------
  // Dashboard Multi-View Navigation
  // --------------------------------------------------------------------------
  switchDashboardView(viewName) {
    this.activeView = viewName;

    // 1. Update View Tabs
    const tabBtns = document.querySelectorAll('.dash-tab-btn');
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // 2. Update Bottom Dock
    const dockBtns = document.querySelectorAll('.dock-item-btn');
    dockBtns.forEach(btn => {
      const match = (viewName === 'overview' && btn.dataset.tab === 'home') || (btn.dataset.tab === viewName);
      btn.classList.toggle('active', match);
    });

    // 3. Switch Panel
    const panels = document.querySelectorAll('.dashboard-view-panel');
    panels.forEach(panel => panel.classList.remove('active'));

    const targetPanelId = 'view' + viewName.charAt(0).toUpperCase() + viewName.slice(1);
    const targetPanel = document.getElementById(targetPanelId);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Scroll to top of workspace
    window.scrollTo({ top: 0, behavior: 'smooth' });

    HavenSoundSystem.playPopSound();

    // Re-render specific view if needed
    if (viewName === 'tasks') this.renderDedicatedTasks();
    if (viewName === 'calendar') this.renderDedicatedCalendar();
    if (viewName === 'habits') this.renderDedicatedHabits();
    if (viewName === 'notes') this.renderDedicatedNotes();
    if (viewName === 'memories') this.renderDedicatedMemories();
    if (viewName === 'report') {
      const iframe = document.getElementById('reportIframe');
      if (iframe) iframe.src = 'report.html';
    }
  },

  // Legacy nav dock compatibility
  switchNavTab(tabName) {
    if (tabName === 'home') this.switchDashboardView('overview');
    else if (tabName === 'tasks') this.switchDashboardView('tasks');
    else if (tabName === 'calendar') this.switchDashboardView('calendar');
    else if (tabName === 'memories') this.switchDashboardView('memories');
    else if (tabName === 'more') this.openAccountModal();
  },

  // --------------------------------------------------------------------------
  // KPI Metrics Summary Ribbon
  // --------------------------------------------------------------------------
  renderKPIs() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter(t => t.completed).length;
    const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const kpiDone = document.getElementById('kpiTasksDone');
    const kpiTotal = document.getElementById('kpiTasksTotal');
    const kpiPct = document.getElementById('kpiTasksPct');
    const kpiFill = document.getElementById('kpiTasksFill');

    if (kpiDone) kpiDone.textContent = completedTasks;
    if (kpiTotal) kpiTotal.textContent = `/ ${totalTasks} done`;
    if (kpiPct) kpiPct.textContent = `${pct}%`;
    if (kpiFill) kpiFill.style.width = `${pct}%`;

    // Habit KPI
    const totalHabits = this.habits.length;
    const nurturedCount = this.habits.filter(h => h.nurtured).length;
    const habitPct = totalHabits > 0 ? Math.round((nurturedCount / totalHabits) * 100) : 0;

    const kpiHabitsNurtured = document.getElementById('kpiHabitsNurtured');
    const kpiHabitsTotal = document.getElementById('kpiHabitsTotal');
    const kpiHabitsStreak = document.getElementById('kpiHabitsStreak');

    if (kpiHabitsNurtured) kpiHabitsNurtured.textContent = nurturedCount;
    if (kpiHabitsTotal) kpiHabitsTotal.textContent = `/ ${totalHabits} nurtured`;
    if (kpiHabitsStreak) kpiHabitsStreak.textContent = `${habitPct}% Active`;

    // Next Milestone KPI
    const kpiNextEventTitle = document.getElementById('kpiNextEventTitle');
    const kpiNextEventDays = document.getElementById('kpiNextEventDays');
    if (this.milestones.length > 0) {
      const sorted = [...this.milestones].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      const next = sorted[0];
      if (kpiNextEventTitle) kpiNextEventTitle.textContent = next.title;
      if (kpiNextEventDays) kpiNextEventDays.textContent = this.formatDaysAway(next.date);
    } else {
      if (kpiNextEventTitle) kpiNextEventTitle.textContent = 'Zero deadlines ✨';
      if (kpiNextEventDays) kpiNextEventDays.textContent = 'All clear';
    }

    // Task badge in view tabs
    const tabBadgeTasks = document.getElementById('tabBadgeTasks');
    if (tabBadgeTasks) {
      const activeCount = this.tasks.filter(t => !t.completed).length;
      tabBadgeTasks.textContent = activeCount;
    }
  },

  formatDaysAway(dateStr) {
    if (!dateStr) return '';
    const today = new Date(getRelativeDateString(0) + 'T00:00:00');
    const target = new Date(dateStr + 'T00:00:00');
    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1) return `In ${diffDays} days`;
    return 'Past date';
  },

  // --------------------------------------------------------------------------
  // Quick Master Add Popover
  // --------------------------------------------------------------------------
  toggleQuickAddMenu() {
    const menu = document.getElementById('quickAddMenuPopover');
    if (menu) menu.classList.toggle('open');
  },

  closeQuickAddMenu() {
    const menu = document.getElementById('quickAddMenuPopover');
    if (menu) menu.classList.remove('open');
  },

  openQuickAddTask() {
    this.closeQuickAddMenu();
    this.switchDashboardView('overview');
    const input = document.getElementById('taskInlineInput');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  openQuickAddEvent() {
    this.closeQuickAddMenu();
    this.switchDashboardView('overview');
    const input = document.getElementById('dateInlineTitle');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  openQuickAddNote() {
    this.closeQuickAddMenu();
    this.switchDashboardView('overview');
    const input = document.getElementById('thoughtInlineInput');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  // --------------------------------------------------------------------------
  // Ambient Sound Controller Integration
  // --------------------------------------------------------------------------
  toggleAmbientSound() {
    const isPlaying = HavenSoundSystem.toggleAmbient();
    this.updateSoundUI(isPlaying);
  },

  changeAmbientTrack(track) {
    HavenSoundSystem.startAmbient(track);
    this.updateSoundUI(true);
    this.showToast(`Soundscape: ${track} 🍃`, '🎧');
  },

  changeAmbientVolume(val) {
    HavenSoundSystem.setVolume(parseFloat(val));
  },

  startAmbientWithTrack(track) {
    const select = document.getElementById('soundTrackSelect');
    if (select) select.value = track;
    HavenSoundSystem.startAmbient(track);
    this.updateSoundUI(true);
    this.showToast(`Ambient track: ${track} 🌧️`, '🍃');
  },

  stopAmbientSound() {
    HavenSoundSystem.stopAmbient();
    this.updateSoundUI(false);
    this.showToast('Ambient sounds resting in silence 🕊️', '🍃');
  },

  updateSoundUI(isPlaying) {
    const pill = document.getElementById('ambientSoundPill');
    const icon = document.getElementById('soundPlayIcon');
    const btn = document.getElementById('soundPlayToggleBtn');

    if (pill) pill.classList.toggle('playing', isPlaying);
    if (btn) btn.classList.toggle('playing', isPlaying);
    if (icon) icon.textContent = isPlaying ? '⏸' : '▶';
  },

  // --------------------------------------------------------------------------
  // Pomodoro Focus Studio
  // --------------------------------------------------------------------------
  setPomodoroMode(mode) {
    this.pomodoro.mode = mode;
    let mins = 25;
    if (mode === 'short') mins = 5;
    if (mode === 'long') mins = 15;

    this.pomodoro.totalDuration = mins * 60;
    this.pomodoro.timeLeft = mins * 60;
    this.pausePomodoro();

    // Update Mode tabs
    document.querySelectorAll('.pomo-mode-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });
    document.querySelectorAll('.pomo-mode-chip').forEach((chip, i) => {
      chip.classList.toggle('active', (i === 0 && mode === 'focus') || (i === 1 && mode === 'short') || (i === 2 && mode === 'long'));
    });

    const badge = document.getElementById('focusModeBadge');
    if (badge) {
      if (mode === 'focus') badge.textContent = 'Focus · 25m';
      else if (mode === 'short') badge.textContent = 'Break · 5m';
      else badge.textContent = 'Break · 15m';
    }

    this.updatePomodoroDisplay();
    HavenSoundSystem.playPopSound();
  },

  togglePomodoro() {
    if (this.pomodoro.isRunning) {
      this.pausePomodoro();
    } else {
      this.startPomodoro();
    }
  },

  startPomodoro() {
    this.pomodoro.isRunning = true;
    clearInterval(this.pomodoro.timerId);
    this.pomodoro.timerId = setInterval(() => {
      this.tickPomodoro();
    }, 1000);

    HavenSoundSystem.playCheckChime();
    this.updatePomodoroDisplay();

    const quickBtn = document.getElementById('kpiQuickFocusBtn');
    if (quickBtn) quickBtn.textContent = '⏸ Pause';
    const miniStartBtn = document.getElementById('pomoMiniStartBtn');
    if (miniStartBtn) miniStartBtn.textContent = 'Pause';
    const masterPlayBtn = document.getElementById('focusMasterPlayBtn');
    if (masterPlayBtn) masterPlayBtn.textContent = 'Pause Focus';
  },

  pausePomodoro() {
    this.pomodoro.isRunning = false;
    clearInterval(this.pomodoro.timerId);
    this.updatePomodoroDisplay();

    const quickBtn = document.getElementById('kpiQuickFocusBtn');
    if (quickBtn) quickBtn.textContent = '▶ Start';
    const miniStartBtn = document.getElementById('pomoMiniStartBtn');
    if (miniStartBtn) miniStartBtn.textContent = 'Start';
    const masterPlayBtn = document.getElementById('focusMasterPlayBtn');
    if (masterPlayBtn) masterPlayBtn.textContent = 'Start Focus Session';
  },

  resetPomodoro() {
    this.pausePomodoro();
    this.pomodoro.timeLeft = this.pomodoro.totalDuration;
    this.updatePomodoroDisplay();
    HavenSoundSystem.playPopSound();
    this.showToast('Focus timer reset gently', '⏱️');
  },

  tickPomodoro() {
    if (this.pomodoro.timeLeft > 0) {
      this.pomodoro.timeLeft--;
      this.updatePomodoroDisplay();
    } else {
      // Completed!
      this.pausePomodoro();
      HavenSoundSystem.playPomodoroBell();
      this.triggerKonpeitoBurst();
      this.pomodoro.sessionsCompleted++;
      this.showToast('Focus session complete! Rest gently 🌸', '✨');
      this.resetPomodoro();
    }
  },

  updatePomodoroDisplay() {
    const mins = Math.floor(this.pomodoro.timeLeft / 60);
    const secs = this.pomodoro.timeLeft % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Update KPI & mini widget & full view
    const kpiFocusTime = document.getElementById('kpiFocusTime');
    const kpiFocusStatus = document.getElementById('kpiFocusStatus');
    const miniTime = document.getElementById('pomodoroMiniTime');
    const hugeTime = document.getElementById('focusHugeTime');
    const hugeStatus = document.getElementById('focusHugeStatus');

    if (kpiFocusTime) kpiFocusTime.textContent = formatted;
    if (kpiFocusStatus) kpiFocusStatus.textContent = this.pomodoro.isRunning ? 'Active 🍃' : 'Ready';
    if (miniTime) miniTime.textContent = formatted;
    if (hugeTime) hugeTime.textContent = formatted;
    if (hugeStatus) hugeStatus.textContent = this.pomodoro.isRunning ? 'Flowing in focus...' : 'Ready for gentle focus';

    // SVG Ring Progress
    const ring = document.getElementById('focusRingProgress');
    if (ring && this.pomodoro.totalDuration > 0) {
      const circumference = 2 * Math.PI * 130; // ~816.8
      const fraction = this.pomodoro.timeLeft / this.pomodoro.totalDuration;
      const offset = circumference * (1 - fraction);
      ring.style.strokeDashoffset = offset;
    }
  },

  // --------------------------------------------------------------------------
  // Tasks Management & Filter
  // --------------------------------------------------------------------------
  setTaskFilter(filter) {
    this.taskFilter = filter;
    document.querySelectorAll('.task-pill-filter').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    this.renderTasks();
    this.renderDedicatedTasks();
    HavenSoundSystem.playPopSound();
  },

  getFilteredTasks() {
    const todayStr = getRelativeDateString(0);
    return this.tasks.filter(task => {
      if (this.taskFilter === 'today') return task.dueDate === todayStr;
      if (this.taskFilter === 'upcoming') return task.dueDate > todayStr;
      if (this.taskFilter === 'done') return task.completed;
      return true;
    });
  },

  renderTasks() {
    const container = document.getElementById('tasksListContainer');
    if (!container) return;

    const filtered = this.getFilteredTasks();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 24px 10px; color: var(--c-text-faint); font-size: 0.88rem;">
          <span style="font-size:1.8rem; display:block; margin-bottom:6px;">🍃</span>
          No tasks found for this view! Add a gentle task above.
        </div>
      `;
      this.renderKPIs();
      return;
    }

    const colorClasses = ['border-green', 'border-amber', 'border-peach', 'border-sage', 'border-sky'];

    container.innerHTML = filtered.map((task, idx) => {
      const colorClass = task.color ? `border-${task.color}` : colorClasses[idx % colorClasses.length];
      const isToday = task.dueDate === getRelativeDateString(0);
      const isTomorrow = task.dueDate === getRelativeDateString(1);
      let dateBadge = task.dueDate;
      if (isToday) dateBadge = 'Today';
      else if (isTomorrow) dateBadge = 'Tmrw';

      return `
        <div class="task-pill-item ${colorClass} ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <div class="task-pill-left" onclick="App.toggleTask('${task.id}')">
            <div class="pill-checkbox">
              <span class="pill-check-icon">✓</span>
            </div>
            <span class="task-pill-title">${this.escapeHtml(task.title)}</span>
          </div>
          <div class="task-pill-actions">
            ${task.category ? `<span class="task-category-badge">${this.escapeHtml(task.category)}</span>` : ''}
            ${dateBadge ? `<span style="font-size:0.68rem; font-weight:700; color:var(--c-text-faint); padding:1px 5px; border-radius:4px; background:rgba(255,255,255,0.7);">${dateBadge}</span>` : ''}
            ${!task.completed ? `
              <button class="task-pill-reschedule-btn" onclick="App.rescheduleTask('${task.id}')" title="Move to tomorrow gently">
                🍃 Tomorrow
              </button>
            ` : ''}
            <button class="btn-task-del" onclick="App.deleteTask('${task.id}')" title="Delete">✕</button>
          </div>
        </div>
      `;
    }).join('');

    this.renderKPIs();
  },

  renderDedicatedTasks() {
    const container = document.getElementById('dedicatedTasksContainer');
    if (!container) return;

    const searchInput = document.getElementById('taskSearchInput')?.value.toLowerCase().trim() || '';
    const categoryFilter = document.getElementById('taskCategoryFilter')?.value || 'all';

    let list = this.getFilteredTasks();

    if (searchInput) {
      list = list.filter(t => t.title.toLowerCase().includes(searchInput));
    }
    if (categoryFilter !== 'all') {
      list = list.filter(t => (t.category || 'General').toLowerCase() === categoryFilter.toLowerCase());
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding: 40px; color:var(--c-text-faint);">
          <span style="font-size:2rem; display:block; margin-bottom:8px;">🍃</span>
          Zero matching tasks. You are all caught up!
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(task => {
      return `
        <div class="haven-card" style="padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
            <span class="task-category-badge" style="font-size:0.75rem;">${this.escapeHtml(task.category || 'General')}</span>
            <span style="font-size:0.75rem; font-weight:800; color:var(--c-text-faint);">${this.formatDateReadable(task.dueDate)}</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px; cursor:pointer;" onclick="App.toggleTask('${task.id}')">
            <div class="pill-checkbox" style="width:20px; height:20px; ${task.completed ? 'background:var(--c-moss-deep); border-color:var(--c-moss-deep); color:#FFF;' : ''}">
              <span class="pill-check-icon" style="${task.completed ? 'display:block;' : ''}">✓</span>
            </div>
            <span style="font-size:1rem; font-weight:800; ${task.completed ? 'text-decoration:line-through; color:var(--c-text-faint);' : ''}">${this.escapeHtml(task.title)}</span>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:8px;">
            ${!task.completed ? `<button class="card-action-mini-btn" onclick="App.rescheduleTask('${task.id}')">🍃 Tomorrow</button>` : ''}
            <button class="btn-cancel-action" style="padding:4px 10px; font-size:0.78rem; color:#C94A3D;" onclick="App.deleteTask('${task.id}')">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  },

  addInlineTask() {
    const input = document.getElementById('taskInlineInput');
    const dateInput = document.getElementById('taskInlineDate');
    const categorySelect = document.getElementById('taskInlineCategory');
    if (!input || !input.value.trim()) return;

    const colors = ['green', 'amber', 'peach', 'sage', 'sky'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const chosenDate = (dateInput && dateInput.value) ? dateInput.value : getRelativeDateString(0);
    const category = categorySelect ? categorySelect.value : 'General';

    const newTask = {
      id: 't-' + Date.now(),
      title: input.value.trim(),
      category,
      dueDate: chosenDate,
      completed: false,
      color: randomColor
    };

    this.tasks.push(newTask);
    HavenStorage.saveTasks(this.tasks);
    input.value = '';
    HavenSoundSystem.playPopSound();
    this.showToast('Task added & saved 🌱', '✨');
    this.renderTasks();
    this.renderDedicatedTasks();
    this.renderCalendar();
    this.renderDedicatedCalendar();
  },

  addDedicatedTask() {
    const input = document.getElementById('dedicatedTaskInput');
    const dateInput = document.getElementById('dedicatedTaskDate');
    const categorySelect = document.getElementById('dedicatedTaskCategory');
    if (!input || !input.value.trim()) return;

    const colors = ['green', 'amber', 'peach', 'sage', 'sky'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const chosenDate = (dateInput && dateInput.value) ? dateInput.value : getRelativeDateString(0);
    const category = categorySelect ? categorySelect.value : 'General';

    this.tasks.push({
      id: 't-' + Date.now(),
      title: input.value.trim(),
      category,
      dueDate: chosenDate,
      completed: false,
      color: randomColor
    });

    HavenStorage.saveTasks(this.tasks);
    input.value = '';
    HavenSoundSystem.playPopSound();
    this.showToast('Task added to board! 🌿', '✨');
    this.renderTasks();
    this.renderDedicatedTasks();
    this.renderCalendar();
    this.renderDedicatedCalendar();
  },

  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    HavenStorage.saveTasks(this.tasks);

    if (task.completed) {
      HavenSoundSystem.playCheckChime();
      this.showToast('Task accomplished gently 🌸', '✨');
    }
    this.renderTasks();
    this.renderDedicatedTasks();
    this.renderCalendar();
    this.renderDedicatedCalendar();
  },

  rescheduleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    task.dueDate = tomorrow.toISOString().split('T')[0];

    HavenStorage.saveTasks(this.tasks);
    HavenSoundSystem.playPopSound();
    this.showToast('Gently moved to tomorrow. Zero guilt 🌿', '🍃');
    this.renderTasks();
    this.renderDedicatedTasks();
    this.renderCalendar();
    this.renderDedicatedCalendar();
  },

  deleteTask(id) {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return;
    this.tasks.splice(idx, 1);
    HavenStorage.saveTasks(this.tasks);
    this.renderTasks();
    this.renderDedicatedTasks();
    this.renderCalendar();
    this.renderDedicatedCalendar();
    this.showToast('Task removed', '🍂');
  },

  // --------------------------------------------------------------------------
  // Upcoming Dates & Milestones
  // --------------------------------------------------------------------------
  renderMilestones() {
    const container = document.getElementById('milestonesListContainer');
    if (!container) return;

    if (this.milestones.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 20px 10px; color: var(--c-text-faint); font-size: 0.86rem;">
          <span style="font-size:1.6rem; display:block; margin-bottom:4px;">📅</span>
          No upcoming dates yet. Add a deadline or celebration above!
        </div>
      `;
      this.renderKPIs();
      return;
    }

    let html = '<div class="dates-timeline">';

    this.milestones.forEach(item => {
      const isCelebration = item.category === 'celebration' || item.title.toLowerCase().includes('birthday');
      const dotColor = isCelebration ? 'celebration' : (item.category === 'green' ? 'green' : 'amber');

      html += `
        <div class="date-timeline-item" data-id="${item.id}">
          <span class="date-status-dot ${dotColor}"></span>
          <div>
            <div class="date-main-label">${this.escapeHtml(item.title)}</div>
            <div class="date-sub-time">${this.escapeHtml(item.subtitle || this.formatDateReadable(item.date))}</div>
          </div>
          <button class="btn-task-del" style="opacity:1;" onclick="App.deleteMilestone('${item.id}')" title="Delete">✕</button>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
    this.renderKPIs();
  },

  renderDedicatedMilestones() {
    const container = document.getElementById('dedicatedMilestonesList');
    if (!container) return;

    if (this.milestones.length === 0) {
      container.innerHTML = `<p style="color:var(--c-text-faint); text-align:center; padding:20px;">No upcoming milestones recorded.</p>`;
      return;
    }

    container.innerHTML = this.milestones.map(m => {
      return `
        <div class="date-timeline-item" style="padding-bottom:12px; border-bottom:1px solid #EAE4D8;">
          <span class="date-status-dot amber"></span>
          <div>
            <div class="date-main-label" style="font-size:1rem;">${this.escapeHtml(m.title)}</div>
            <div class="date-sub-time">${this.formatDateReadable(m.date)} (${this.formatDaysAway(m.date)})</div>
          </div>
          <button class="btn-task-del" style="opacity:1;" onclick="App.deleteMilestone('${m.id}')">✕</button>
        </div>
      `;
    }).join('');
  },

  addInlineUpcomingDate() {
    const titleInput = document.getElementById('dateInlineTitle');
    const dateInput = document.getElementById('dateInlineDate');
    if (!titleInput || !titleInput.value.trim() || !dateInput || !dateInput.value) return;

    const title = titleInput.value.trim();
    const date = dateInput.value;
    const isParty = title.toLowerCase().includes('birthday') || title.toLowerCase().includes('party') || title.toLowerCase().includes('celebration');

    const newMilestone = {
      id: 'm-' + Date.now(),
      title,
      subtitle: this.formatDateReadable(date),
      date,
      category: isParty ? 'celebration' : 'amber'
    };

    this.milestones.push(newMilestone);
    HavenStorage.saveMilestones(this.milestones);
    titleInput.value = '';
    HavenSoundSystem.playCheckChime();
    this.showToast('Upcoming date saved! 📅', '✨');
    this.renderMilestones();
    this.renderDedicatedMilestones();
    this.renderCalendar();
    this.renderDedicatedCalendar();
  },

  deleteMilestone(id) {
    const idx = this.milestones.findIndex(m => m.id === id);
    if (idx === -1) return;
    this.milestones.splice(idx, 1);
    HavenStorage.saveMilestones(this.milestones);
    this.renderMilestones();
    this.renderDedicatedMilestones();
    this.renderCalendar();
    this.renderDedicatedCalendar();
    this.showToast('Date removed', '🍂');
  },

  // --------------------------------------------------------------------------
  // Goals & Habits Garden
  // --------------------------------------------------------------------------
  renderHabits() {
    const container = document.getElementById('habitsListContainer');
    if (!container) return;

    container.innerHTML = this.habits.map((habit, idx) => {
      const level = habit.level !== undefined ? habit.level : (habit.nurtured ? 5 : 2);

      let leavesHtml = '';
      for (let i = 1; i <= 5; i++) {
        const isFilled = i <= level;
        leavesHtml += `<span class="leaf-pip ${isFilled ? 'filled' : 'unfilled'}">🌿</span>`;
      }

      return `
        <div class="habit-branch-row" onclick="App.advanceHabit(${idx})" title="Click to nurture leaf progress">
          <span class="habit-name-label">${this.escapeHtml(habit.title)}</span>
          <div class="leaf-branch-meter">
            ${leavesHtml}
          </div>
        </div>
      `;
    }).join('');

    this.renderKPIs();
  },

  renderDedicatedHabits() {
    const container = document.getElementById('dedicatedHabitsContainer');
    if (!container) return;

    container.innerHTML = this.habits.map((h, idx) => {
      const level = h.level || 3;
      return `
        <div class="habit-garden-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span style="font-size:1.1rem; font-weight:800; color:var(--c-text-deep);">🌱 ${this.escapeHtml(h.title)}</span>
            <span class="task-category-badge">${level}/5 leaves</span>
          </div>
          <div style="display:flex; gap:8px; margin-bottom:16px;">
            ${[1,2,3,4,5].map(step => `
              <span class="leaf-pip ${step <= level ? 'filled' : 'unfilled'}" style="font-size:1.4rem; cursor:pointer;" onclick="App.advanceHabit(${idx})">🌿</span>
            `).join('')}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <button class="card-action-mini-btn" onclick="App.advanceHabit(${idx})">+ Nurture</button>
            <button class="btn-task-del" style="opacity:1;" onclick="App.deleteHabit(${idx})">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  },

  toggleAddHabitForm() {
    const form = document.getElementById('inlineAddHabitForm');
    if (form) {
      const isVisible = form.style.display !== 'none';
      form.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) document.getElementById('newHabitNameInput')?.focus();
    }
  },

  saveInlineHabit() {
    const input = document.getElementById('newHabitNameInput');
    if (!input || !input.value.trim()) return;

    this.habits.push({
      id: 'h-' + Date.now(),
      title: input.value.trim(),
      level: 1,
      nurtured: false
    });

    HavenStorage.saveHabits(this.habits);
    input.value = '';
    this.toggleAddHabitForm();
    HavenSoundSystem.playCheckChime();
    this.showToast('New habit planted in garden! 🌱', '✨');
    this.renderHabits();
    this.renderDedicatedHabits();
  },

  deleteHabit(idx) {
    this.habits.splice(idx, 1);
    HavenStorage.saveHabits(this.habits);
    this.renderHabits();
    this.renderDedicatedHabits();
    this.showToast('Habit removed', '🍂');
  },

  advanceHabit(index) {
    const habit = this.habits[index];
    if (!habit) return;

    let current = habit.level !== undefined ? habit.level : 2;
    current = (current % 5) + 1;
    habit.level = current;
    habit.nurtured = current >= 4;

    HavenStorage.saveHabits(this.habits);
    HavenSoundSystem.playCheckChime();

    if (current === 5) {
      this.triggerKonpeitoBurst();
      this.showToast(`Full bloom on "${habit.title}"! 🌿✨`, '🌸');
    } else {
      this.showToast(`Nurtured "${habit.title}" (${current}/5) 🌱`, '💧');
    }

    this.renderHabits();
    this.renderDedicatedHabits();
  },

  // --------------------------------------------------------------------------
  // Notes & Thoughts Scratchpad
  // --------------------------------------------------------------------------
  renderNotes() {
    const textEl = document.getElementById('stickyNoteContent');
    if (!textEl) return;

    if (this.notes.length > 0) {
      textEl.innerHTML = this.escapeHtml(this.notes[0].text).replace(/\n/g, '<br>');
    } else {
      textEl.innerHTML = 'ideas & random<br>thoughts';
    }
  },

  renderDedicatedNotes() {
    const container = document.getElementById('dedicatedNotesContainer');
    if (!container) return;

    const query = document.getElementById('notesSearchInput')?.value.toLowerCase().trim() || '';
    let filtered = this.notes;
    if (query) {
      filtered = filtered.filter(n => n.text.toLowerCase().includes(query));
    }

    if (filtered.length === 0) {
      container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:var(--c-text-faint); padding:30px;">No notes found. Create your first sticky note!</p>`;
      return;
    }

    container.innerHTML = filtered.map((n, idx) => {
      return `
        <div class="pinboard-note-item">
          <div class="sticky-push-pin-red"></div>
          <div style="font-family:var(--font-main); font-size:0.95rem; font-weight:700; white-space:pre-wrap; margin-bottom:12px;">${this.escapeHtml(n.text)}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #D6C87C; padding-top:8px;">
            <button class="mini-creation-sketch" onclick="App.convertNoteAtIdx(${idx})">→ Add as Task</button>
            <button class="btn-task-del" style="opacity:1;" onclick="App.deleteNoteAtIdx(${idx})">✕</button>
          </div>
        </div>
      `;
    }).join('');
  },

  addInlineThought() {
    const input = document.getElementById('thoughtInlineInput');
    if (!input || !input.value.trim()) return;

    this.notes.unshift({
      id: 'n-' + Date.now(),
      text: input.value.trim(),
      noteDate: getRelativeDateString(0),
      color: 'buttercup',
      date: 'Today'
    });

    HavenStorage.saveNotes(this.notes);
    input.value = '';
    HavenSoundSystem.playCheckChime();
    this.showToast('Thought pinned to note! 📌', '✨');
    this.renderNotes();
    this.renderDedicatedNotes();
    this.renderCalendar();
  },

  convertNoteToTask() {
    if (this.notes.length === 0) return;
    const note = this.notes[0];
    const title = note.text.split('\n')[0].slice(0, 60);

    this.tasks.push({
      id: 't-' + Date.now(),
      title: title || 'Review scribble notes',
      category: 'Thoughts',
      dueDate: getRelativeDateString(0),
      completed: false,
      color: 'amber'
    });

    HavenStorage.saveTasks(this.tasks);
    this.renderTasks();
    this.renderDedicatedTasks();
    this.renderCalendar();
    HavenSoundSystem.playCheckChime();
    this.showToast('Thought converted into a gentle task! 🌿', '✨');
  },

  convertNoteAtIdx(idx) {
    const note = this.notes[idx];
    if (!note) return;
    this.tasks.push({
      id: 't-' + Date.now(),
      title: note.text.split('\n')[0].slice(0, 60) || 'Note task',
      category: 'Thoughts',
      dueDate: getRelativeDateString(0),
      completed: false,
      color: 'amber'
    });
    HavenStorage.saveTasks(this.tasks);
    this.renderTasks();
    this.renderDedicatedTasks();
    this.showToast('Converted to task! 🌿', '✨');
  },

  deleteNoteAtIdx(idx) {
    this.notes.splice(idx, 1);
    HavenStorage.saveNotes(this.notes);
    this.renderNotes();
    this.renderDedicatedNotes();
    this.showToast('Note deleted', '🍂');
  },

  // --------------------------------------------------------------------------
  // Memories Scrapbook
  // --------------------------------------------------------------------------
  renderMemories() {
    const container = document.getElementById('polaroidCardActive');
    if (!container || this.memories.length === 0) return;

    if (this.activeMemoryIndex >= this.memories.length) {
      this.activeMemoryIndex = 0;
    }
    if (this.activeMemoryIndex < 0) {
      this.activeMemoryIndex = this.memories.length - 1;
    }

    const current = this.memories[this.activeMemoryIndex];

    container.innerHTML = `
      <div class="polaroid-washi-top"></div>
      <div class="polaroid-photo-inner">
        <img src="${current.image}" alt="Memory" onerror="this.src='assets/images/ghibli-sunset-hills.jpg'" />
      </div>
      <div class="polaroid-washi-bottom"></div>
      <p class="polaroid-caption-text">${this.escapeHtml(current.caption)}</p>
    `;

    container.onclick = () => {
      this.openMemoryDetailModal(current);
    };
  },

  renderDedicatedMemories() {
    const container = document.getElementById('dedicatedMemoriesContainer');
    if (!container) return;

    container.innerHTML = this.memories.map(m => {
      return `
        <div class="haven-card" style="padding:16px; cursor:pointer;" onclick="App.openMemoryDetailModalById('${m.id}')">
          <div style="aspect-ratio:4/3; border-radius:10px; overflow:hidden; margin-bottom:10px;">
            <img src="${m.image}" alt="${this.escapeHtml(m.caption)}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/images/ghibli-sunset-hills.jpg'" />
          </div>
          <h4 style="font-family:var(--font-hand); font-size:1.3rem; margin-bottom:4px;">${this.escapeHtml(m.caption)}</h4>
          <span style="font-size:0.75rem; color:var(--c-text-faint); font-weight:800;">${this.formatDateReadable(m.date)}</span>
        </div>
      `;
    }).join('');
  },

  openMemoryDetailModalById(id) {
    const mem = this.memories.find(m => m.id === id);
    if (mem) this.openMemoryDetailModal(mem);
  },

  prevMemory() {
    HavenSoundSystem.playPopSound();
    this.activeMemoryIndex--;
    this.renderMemories();
  },

  nextMemory() {
    HavenSoundSystem.playPopSound();
    this.activeMemoryIndex++;
    this.renderMemories();
  },

  openMemoryDetailModal(memory) {
    const modal = document.getElementById('memoryDetailModal');
    if (!modal) return;

    document.getElementById('modalMemoryImg').src = memory.image;
    document.getElementById('modalMemoryCaption').textContent = memory.caption;
    document.getElementById('modalMemoryDate').textContent = this.formatDateReadable(memory.date || getRelativeDateString(0));
    document.getElementById('modalMemoryNote').textContent = memory.note || 'No additional note written for this memory.';

    modal.dataset.currentId = memory.id;
    modal.classList.add('active');
    HavenSoundSystem.playPopSound();
  },

  closeMemoryDetailModal() {
    const modal = document.getElementById('memoryDetailModal');
    if (modal) modal.classList.remove('active');
  },

  deleteCurrentMemory() {
    const modal = document.getElementById('memoryDetailModal');
    if (!modal) return;
    const id = modal.dataset.currentId;
    const idx = this.memories.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.memories.splice(idx, 1);
      HavenStorage.saveMemories(this.memories);
      this.closeMemoryDetailModal();
      this.renderMemories();
      this.renderDedicatedMemories();
      this.renderCalendar();
      this.showToast('Memory released', '🍂');
    }
  },

  openAddMemoryModal() {
    this.closeQuickAddMenu();
    const modal = document.getElementById('addMemoryModal');
    if (modal) {
      document.getElementById('newMemDate').value = getRelativeDateString(0);
      modal.classList.add('active');
    }
  },

  closeAddMemoryModal() {
    const modal = document.getElementById('addMemoryModal');
    if (modal) modal.classList.remove('active');
  },

  saveNewMemory(e) {
    if (e) e.preventDefault();
    const caption = document.getElementById('newMemCaption').value.trim();
    const note = document.getElementById('newMemNote').value.trim();
    const date = document.getElementById('newMemDate').value || getRelativeDateString(0);
    const fileInput = document.getElementById('newMemFileInput');
    const presetChoice = document.querySelector('input[name="presetMemRadio"]:checked')?.value || 'assets/images/ghibli-sunset-hills.jpg';

    if (fileInput && fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.finishAddingMemory(event.target.result, caption, note, date);
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      this.finishAddingMemory(presetChoice, caption, note, date);
    }
  },

  finishAddingMemory(imageSrc, caption, note, date) {
    const newMem = {
      id: 'mem-' + Date.now(),
      image: imageSrc,
      caption: caption || 'A lovely memory ✨',
      note: note || '',
      date: date
    };

    this.memories.push(newMem);
    this.activeMemoryIndex = this.memories.length - 1;
    HavenStorage.saveMemories(this.memories);
    this.closeAddMemoryModal();
    this.renderMemories();
    this.renderDedicatedMemories();
    this.renderCalendar();
    HavenSoundSystem.playCheckChime();
    this.showToast('Memory pinned to your scrapbook 📸', '✨');
  },

  // --------------------------------------------------------------------------
  // Calendar Sanctuary (Desk & Dedicated)
  // --------------------------------------------------------------------------
  renderCalendar() {
    const miniHeading = document.getElementById('calMiniMonthHeading');
    const miniDays = document.getElementById('calMiniGridDays');
    if (!miniHeading || !miniDays) return;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    miniHeading.textContent = `${monthNames[this.calMonth]} ${this.calYear}`;

    const firstDayIndex = new Date(this.calYear, this.calMonth, 1).getDay();
    const totalDays = new Date(this.calYear, this.calMonth + 1, 0).getDate();
    const activityMap = HavenStorage.getMonthActivityMap(this.calYear, this.calMonth);

    const pad = (n) => String(n).padStart(2, '0');
    const todayStr = getRelativeDateString(0);

    let html = '';

    for (let i = 0; i < firstDayIndex; i++) {
      html += '<div class="cal-mini-day-cell empty-day"></div>';
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${this.calYear}-${pad(this.calMonth + 1)}-${pad(day)}`;
      const isToday = dateStr === todayStr;
      const acts = activityMap[dateStr] || { tasks: 0, milestones: 0, memories: 0, notes: 0 };

      let dots = '';
      if (acts.tasks > 0) dots += '🌿';
      if (acts.milestones > 0) dots += '📅';
      if (acts.memories > 0) dots += '📷';
      if (acts.notes > 0) dots += '📌';

      html += `
        <div class="cal-mini-day-cell ${isToday ? 'is-today' : ''}" onclick="App.inspectDay('${dateStr}', ${day})">
          <span>${day}</span>
          <span class="mini-doodler-dots">${dots}</span>
        </div>
      `;
    }

    miniDays.innerHTML = html;
  },

  renderDedicatedCalendar() {
    const heading = document.getElementById('dedicatedCalMonthHeading');
    const grid = document.getElementById('dedicatedCalGridDays');
    if (!heading || !grid) return;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    heading.textContent = `${monthNames[this.calMonth]} ${this.calYear}`;

    const firstDayIndex = new Date(this.calYear, this.calMonth, 1).getDay();
    const totalDays = new Date(this.calYear, this.calMonth + 1, 0).getDate();
    const activityMap = HavenStorage.getMonthActivityMap(this.calYear, this.calMonth);

    const pad = (n) => String(n).padStart(2, '0');
    const todayStr = getRelativeDateString(0);

    let html = '';

    for (let i = 0; i < firstDayIndex; i++) {
      html += '<div class="cal-mini-day-cell empty-day" style="min-height:55px;"></div>';
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${this.calYear}-${pad(this.calMonth + 1)}-${pad(day)}`;
      const isToday = dateStr === todayStr;
      const acts = activityMap[dateStr] || { tasks: 0, milestones: 0, memories: 0, notes: 0 };

      let dots = '';
      if (acts.tasks > 0) dots += `🌿 ${acts.tasks} `;
      if (acts.milestones > 0) dots += `📅 ${acts.milestones} `;
      if (acts.memories > 0) dots += `📷 `;

      html += `
        <div class="cal-mini-day-cell ${isToday ? 'is-today' : ''}" style="min-height:55px; padding:6px;" onclick="App.inspectDay('${dateStr}', ${day})">
          <span style="font-weight:900;">${day}</span>
          <span class="mini-doodler-dots" style="font-size:0.75rem;">${dots}</span>
        </div>
      `;
    }

    grid.innerHTML = html;
  },

  calPrevMonth() {
    HavenSoundSystem.playPopSound();
    this.calMonth--;
    if (this.calMonth < 0) {
      this.calMonth = 11;
      this.calYear--;
    }
    this.renderCalendar();
    this.renderDedicatedCalendar();
  },

  calNextMonth() {
    HavenSoundSystem.playPopSound();
    this.calMonth++;
    if (this.calMonth > 11) {
      this.calMonth = 0;
      this.calYear++;
    }
    this.renderCalendar();
    this.renderDedicatedCalendar();
  },

  inspectDay(dateStr, dayNum) {
    const activities = HavenStorage.getActivitiesForDate(dateStr);
    const modal = document.getElementById('dayInspectorModal');
    if (!modal) return;

    document.getElementById('inspectorDateTitle').textContent = `Activities for ${dateStr}`;

    let contentHtml = '';

    if (activities.tasks.length === 0 && activities.milestones.length === 0 && activities.memories.length === 0 && activities.notes.length === 0) {
      contentHtml = `
        <div style="text-align:center; padding: 14px; color:var(--c-text-faint); font-size:0.86rem;">
          <span style="font-size:1.6rem; display:block; margin-bottom:4px;">🍃</span>
          Quiet day with nothing scheduled yet.
        </div>
      `;
    } else {
      if (activities.tasks.length > 0) {
        contentHtml += `<div style="margin-bottom:10px;"><b>🌿 Tasks Due (${activities.tasks.length}):</b>`;
        activities.tasks.forEach(t => {
          contentHtml += `<div style="font-size:0.84rem; padding:3px 0;">• ${this.escapeHtml(t.title)} ${t.completed ? '(Completed ✓)' : ''}</div>`;
        });
        contentHtml += '</div>';
      }

      if (activities.milestones.length > 0) {
        contentHtml += `<div style="margin-bottom:10px;"><b>📅 Milestones & Events:</b>`;
        activities.milestones.forEach(m => {
          contentHtml += `<div style="font-size:0.84rem; padding:3px 0;">• ${this.escapeHtml(m.title)}</div>`;
        });
        contentHtml += '</div>';
      }

      if (activities.memories.length > 0) {
        contentHtml += `<div style="margin-bottom:10px;"><b>📷 Memories Recorded:</b>`;
        activities.memories.forEach(mem => {
          contentHtml += `<div style="font-size:0.84rem; padding:3px 0;">• ${this.escapeHtml(mem.caption)}</div>`;
        });
        contentHtml += '</div>';
      }

      if (activities.notes.length > 0) {
        contentHtml += `<div><b>📌 Thoughts:</b>`;
        activities.notes.forEach(n => {
          contentHtml += `<div style="font-size:0.84rem; padding:3px 0;">• ${this.escapeHtml(n.text)}</div>`;
        });
        contentHtml += '</div>';
      }
    }

    document.getElementById('inspectorBody').innerHTML = contentHtml;
    modal.dataset.selectedDate = dateStr;
    modal.classList.add('active');
    HavenSoundSystem.playPopSound();
  },

  closeDayInspector() {
    const modal = document.getElementById('dayInspectorModal');
    if (modal) modal.classList.remove('active');
  },

  addTaskForSelectedDay() {
    const modal = document.getElementById('dayInspectorModal');
    const input = document.getElementById('inspectorTaskInput');
    const dateStr = modal ? modal.dataset.selectedDate : getRelativeDateString(0);

    if (!input || !input.value.trim()) return;

    this.tasks.push({
      id: 't-' + Date.now(),
      title: input.value.trim(),
      category: 'Calendar',
      dueDate: dateStr,
      completed: false,
      color: 'green'
    });

    HavenStorage.saveTasks(this.tasks);
    input.value = '';
    this.renderTasks();
    this.renderDedicatedTasks();
    this.renderCalendar();
    this.renderDedicatedCalendar();
    this.closeDayInspector();
    HavenSoundSystem.playCheckChime();
    this.showToast(`Task scheduled for ${dateStr} 🌿`, '✨');
  },

  // --------------------------------------------------------------------------
  // Account Details Modal
  // --------------------------------------------------------------------------
  openAccountModal() {
    const modal = document.getElementById('accountDetailsModal');
    if (!modal) return;

    const user = this.currentUser || { name: 'Forest Wanderer', email: 'wanderer@forest.me' };
    document.getElementById('accModalName').textContent = user.name;
    document.getElementById('accModalEmail').textContent = user.email;

    const taskCount = this.tasks.filter(t => t.completed).length;
    document.getElementById('accStatTasks').textContent = taskCount;
    document.getElementById('accStatMemories').textContent = this.memories.length;

    modal.classList.add('active');
    HavenSoundSystem.playPopSound();
  },

  closeAccountModal() {
    const modal = document.getElementById('accountDetailsModal');
    if (modal) modal.classList.remove('active');
  },

  // --------------------------------------------------------------------------
  // Header Account Dropdown
  // --------------------------------------------------------------------------
  toggleAccountDropdown(e) {
    if (e) e.stopPropagation();
    const dd = document.getElementById('headerAccountDropdown');
    const btn = document.getElementById('headerAccountBtn');
    if (!dd) return;
    const isOpen = dd.classList.contains('open');
    if (isOpen) {
      this.closeAccountDropdown();
    } else {
      dd.classList.add('open');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      HavenSoundSystem.playPopSound();
    }
  },

  closeAccountDropdown() {
    const dd = document.getElementById('headerAccountDropdown');
    const btn = document.getElementById('headerAccountBtn');
    if (dd) dd.classList.remove('open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  },

  // --------------------------------------------------------------------------
  // Easter Eggs: Totoro & Soot Sprites
  // --------------------------------------------------------------------------
  initSootSpritesAndTotoro() {
    const totoro = document.getElementById('totoroBuddy');
    if (totoro) {
      totoro.addEventListener('click', () => {
        HavenSoundSystem.playPopSound();
        totoro.style.transform = 'scale(1.25) translateY(-8px)';
        setTimeout(() => {
          totoro.style.transform = '';
        }, 300);
        this.showToast('Totoro is cheering for your day! 🌿', '🍃');
      });
    }

    const sootSprites = document.querySelectorAll('.soot-sprite-buddy, .soot-sprite-note-perch');
    sootSprites.forEach(sprite => {
      sprite.addEventListener('click', (e) => {
        HavenSoundSystem.playSootSqueak();
        this.spawnKonpeito(e.clientX, e.clientY);
        this.showToast('Soot sprite gifted you a star candy! 🍬', '✨');
      });
    });
  },

  spawnKonpeito(x, y) {
    const candies = ['✨', '⭐', '🌸', '🍬', '🍂', '🍄'];
    for (let i = 0; i < 5; i++) {
      const el = document.createElement('div');
      el.className = 'konpeito-particle';
      el.textContent = candies[Math.floor(Math.random() * candies.length)];
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.setProperty('--tx', `${(Math.random() - 0.5) * 70}px`);
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1200);
    }
  },

  triggerKonpeitoBurst() {
    const width = window.innerWidth;
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const rx = width * 0.2 + Math.random() * (width * 0.6);
        const ry = 180 + Math.random() * 220;
        this.spawnKonpeito(rx, ry);
      }, i * 90);
    }
  },

  initCanvasLeaves() {
    const canvas = document.getElementById('ambientLeavesCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const leaves = [];
    for (let i = 0; i < 12; i++) {
      leaves.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 7 + Math.random() * 6,
        speedY: 0.35 + Math.random() * 0.5,
        speedX: -0.2 + Math.random() * 0.4,
        angle: Math.random() * 360,
        spin: (Math.random() - 0.5) * 1.0,
        opacity: 0.15 + Math.random() * 0.2,
        color: ['#8FA87D', '#B5C9A3', '#D49A58'][Math.floor(Math.random() * 3)]
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      leaves.forEach(leaf => {
        leaf.y += leaf.speedY;
        leaf.x += Math.sin(leaf.y * 0.01) * 0.5 + leaf.speedX;
        leaf.angle += leaf.spin;

        if (leaf.y > height + 20) {
          leaf.y = -20;
          leaf.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate((leaf.angle * Math.PI) / 180);
        ctx.fillStyle = leaf.color;
        ctx.globalAlpha = leaf.opacity;

        ctx.beginPath();
        ctx.ellipse(0, 0, leaf.size, leaf.size * 0.52, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(animate);
    }

    animate();
  },

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMemoryDetailModal();
        this.closeAddMemoryModal();
        this.closeDayInspector();
        this.closeAccountModal();
        this.closeQuickAddMenu();
        this.closeAccountDropdown();
      }
    });

    // Close dropdowns if clicking outside
    document.addEventListener('click', (e) => {
      const container = document.querySelector('.quick-add-dropdown-container');
      if (container && !container.contains(e.target)) {
        this.closeQuickAddMenu();
      }
      const accountWrap = document.getElementById('headerAccountWrap');
      if (accountWrap && !accountWrap.contains(e.target)) {
        this.closeAccountDropdown();
      }
    });
  },

  formatDateReadable(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  },

  showToast(message, icon = '🍃') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'cozy-toast';
    toast.innerHTML = `<span>${icon}</span><span>${this.escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }
};
