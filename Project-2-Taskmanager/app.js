/**
 * TaskPulse - Dynamic Task Manager & Productivity Tracker
 * ES6+ Vanilla JavaScript with zero server dependencies
 */

// ============================================================================
// State Management
// ============================================================================
const STORAGE_KEY = 'taskpulse_tasks_v1';
const THEME_KEY = 'taskpulse_theme';

/** @type {Array<{id: string, title: string, category: 'Work'|'Personal'|'Study', priority: 'High'|'Medium'|'Low', dueDate: string, completed: boolean, createdAt: string}>} */
let tasks = [];

// Filter & Sort State
let currentFilter = 'all'; // 'all' | 'active' | 'completed'
let currentCategory = 'all'; // 'all' | 'Work' | 'Personal' | 'Study'
let searchQuery = '';
let currentSort = 'date-asc';

// Deleted task buffer for Undo toast
let lastDeletedTask = null;
let lastDeletedIndex = null;
let toastTimeout = null;

// ============================================================================
// DOM Element Selectors
// ============================================================================
const elements = {
  // Theme & Date
  dateDisplay: document.getElementById('date-display'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),

  // Stats
  statCompletionRate: document.getElementById('stat-completion-rate'),
  statRateCaption: document.getElementById('stat-rate-caption'),
  statRatioText: document.getElementById('stat-ratio-text'),
  statTotalTasks: document.getElementById('stat-total-tasks'),
  statActiveTasks: document.getElementById('stat-active-tasks'),
  statCompletedTasks: document.getElementById('stat-completed-tasks'),
  progressRingCircle: document.getElementById('progress-ring-circle'),
  statDueTodayMeta: document.getElementById('stat-due-today-meta'),
  statCategoriesMeta: document.getElementById('stat-categories-meta'),

  // Task Creation Form
  taskForm: document.getElementById('task-form'),
  taskTitleInput: document.getElementById('task-title-input'),
  taskCategorySelect: document.getElementById('task-category-select'),
  taskPrioritySelect: document.getElementById('task-priority-select'),
  taskDueDate: document.getElementById('task-due-date'),
  quickPresets: document.querySelectorAll('.preset-chip'),

  // Search & Filters
  searchFilterInput: document.getElementById('search-filter-input'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  filterPills: document.querySelectorAll('.filter-pill'),
  categoryFilterSelect: document.getElementById('category-filter-select'),
  sortSelect: document.getElementById('sort-select'),
  clearCompletedBtn: document.getElementById('clear-completed-btn'),
  filterStatusBanner: document.getElementById('filter-status-banner'),
  filterStatusText: document.getElementById('filter-status-text'),
  resetFiltersBtn: document.getElementById('reset-filters-btn'),

  // Counts
  pillCountAll: document.getElementById('pill-count-all'),
  pillCountActive: document.getElementById('pill-count-active'),
  pillCountCompleted: document.getElementById('pill-count-completed'),

  // Task List & Empty State
  taskList: document.getElementById('task-list'),
  emptyState: document.getElementById('empty-state'),
  emptyStateTitle: document.getElementById('empty-state-title'),
  emptyStateDesc: document.getElementById('empty-state-desc'),

  // Edit Modal
  editModal: document.getElementById('edit-modal'),
  editTaskForm: document.getElementById('edit-task-form'),
  editTaskId: document.getElementById('edit-task-id'),
  editTaskTitle: document.getElementById('edit-task-title'),
  editTaskCategory: document.getElementById('edit-task-category'),
  editTaskPriority: document.getElementById('edit-task-priority'),
  editTaskDueDate: document.getElementById('edit-task-due-date'),
  closeModalBtn: document.getElementById('close-modal-btn'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),

  // Toasts
  toastContainer: document.getElementById('toast-container'),
};

// ============================================================================
// LocalStorage Helper Functions
// ============================================================================

/**
 * Saves current tasks array to browser localStorage
 */
function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
    showToast('Failed to save changes to storage.', 'danger');
  }
}

/**
 * Loads tasks array from browser localStorage or loads default sample tasks
 */
function loadFromLocalStorage() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
      tasks = JSON.parse(rawData);
    } else {
      // First-time visit: Seed inspiring productivity starter tasks
      tasks = getSampleTasks();
      saveToLocalStorage();
    }
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
    tasks = getSampleTasks();
  }
}

/**
 * Default sample tasks for demonstration
 */
function getSampleTasks() {
  const today = getTodayDateString();
  const tomorrow = getOffsetDateString(1);
  const nextWeek = getOffsetDateString(5);

  return [
    {
      id: 'task_' + Date.now() + '_1',
      title: 'Review team product roadmap & sprint deliverables',
      category: 'Work',
      priority: 'High',
      dueDate: today,
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task_' + Date.now() + '_2',
      title: 'Read 2 chapters of System Design & Architecture',
      category: 'Study',
      priority: 'Medium',
      dueDate: tomorrow,
      completed: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'task_' + Date.now() + '_3',
      title: '30-minute evening mindfulness walk and meditation',
      category: 'Personal',
      priority: 'Low',
      dueDate: today,
      completed: true,
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'task_' + Date.now() + '_4',
      title: 'Prepare presentation deck for client kick-off',
      category: 'Work',
      priority: 'High',
      dueDate: nextWeek,
      completed: false,
      createdAt: new Date(Date.now() - 10800000).toISOString()
    }
  ];
}

// ============================================================================
// Date & Time Utility Functions
// ============================================================================

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getOffsetDateString(daysOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return 'No due date';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const due = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dueTime = due.getTime();
  const todayTime = today.getTime();

  if (dueTime === todayTime) {
    return { text: 'Today', status: 'today' };
  } else if (dueTime === tomorrow.getTime()) {
    return { text: 'Tomorrow', status: 'upcoming' };
  } else if (dueTime < todayTime) {
    return { text: `Overdue (${due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})`, status: 'overdue' };
  } else {
    const formatted = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: due.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
    return { text: formatted, status: 'upcoming' };
  }
}

function updateHeaderDateDisplay() {
  const now = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  elements.dateDisplay.textContent = now.toLocaleDateString(undefined, options);
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Create a new task
 */
function createTask(title, category, priority, dueDate) {
  const cleanTitle = title.trim();
  if (!cleanTitle) {
    showToast('Please enter a task title.', 'danger');
    elements.taskTitleInput.focus();
    return false;
  }

  const newTask = {
    id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    title: cleanTitle,
    category: category || 'Work',
    priority: priority || 'Medium',
    dueDate: dueDate || getTodayDateString(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask);
  saveToLocalStorage();
  renderApp();

  showToast(`Task added to ${newTask.category}!`, 'success');
  return true;
}

/**
 * Toggle task completed status with smooth transition
 */
function toggleTaskComplete(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;
  saveToLocalStorage();
  renderApp();

  if (task.completed) {
    showToast(`Great job! Completed: "${truncate(task.title, 28)}" 🎉`, 'success');
  }
}

/**
 * Update/Edit existing task
 */
function updateTask(taskId, updatedData) {
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return false;

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: updatedData.title.trim(),
    category: updatedData.category,
    priority: updatedData.priority,
    dueDate: updatedData.dueDate
  };

  saveToLocalStorage();
  renderApp();
  showToast('Task updated successfully!', 'info');
  return true;
}

/**
 * Delete a task with undo buffer
 */
function deleteTask(taskId) {
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return;

  const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
  
  const performDelete = () => {
    lastDeletedTask = tasks[taskIndex];
    lastDeletedIndex = taskIndex;
    tasks.splice(taskIndex, 1);
    saveToLocalStorage();
    renderApp();
    showUndoToast(`Deleted "${truncate(lastDeletedTask.title, 24)}"`);
  };

  if (taskElement) {
    taskElement.classList.add('is-removing');
    setTimeout(performDelete, 250);
  } else {
    performDelete();
  }
}

/**
 * Undo last deleted task
 */
function undoDelete() {
  if (!lastDeletedTask) return;

  if (lastDeletedIndex !== null && lastDeletedIndex >= 0 && lastDeletedIndex <= tasks.length) {
    tasks.splice(lastDeletedIndex, 0, lastDeletedTask);
  } else {
    tasks.unshift(lastDeletedTask);
  }

  const restoredTitle = lastDeletedTask.title;
  lastDeletedTask = null;
  lastDeletedIndex = null;

  saveToLocalStorage();
  renderApp();
  showToast(`Restored "${truncate(restoredTitle, 26)}"`, 'info');
}

/**
 * Clear all completed tasks
 */
function clearCompletedTasks() {
  const completedCount = tasks.filter(t => t.completed).length;
  if (completedCount === 0) {
    showToast('No completed tasks to clear.', 'info');
    return;
  }

  if (confirm(`Remove ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
    tasks = tasks.filter(t => !t.completed);
    saveToLocalStorage();
    renderApp();
    showToast(`Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}.`, 'info');
  }
}

// ============================================================================
// Productivity Statistics & Metrics Computation
// ============================================================================

function updateProductivityStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Update counters
  elements.statTotalTasks.textContent = total;
  elements.statActiveTasks.textContent = active;
  elements.statCompletedTasks.textContent = completed;
  elements.statCompletionRate.textContent = `${rate}%`;
  elements.statRatioText.textContent = `${completed} of ${total} completed`;

  // Update filter pill counts
  elements.pillCountAll.textContent = total;
  elements.pillCountActive.textContent = active;
  elements.pillCountCompleted.textContent = completed;

  // Rate dynamic caption
  if (total === 0) {
    elements.statRateCaption.textContent = 'No tasks yet';
  } else if (rate === 100) {
    elements.statRateCaption.textContent = 'All Completed! 🌟';
  } else if (rate >= 75) {
    elements.statRateCaption.textContent = 'Crushing It! 🚀';
  } else if (rate >= 50) {
    elements.statRateCaption.textContent = 'Halfway There 🔥';
  } else if (rate > 0) {
    elements.statRateCaption.textContent = 'In Motion ⚡';
  } else {
    elements.statRateCaption.textContent = 'Ready to Start';
  }

  // Calculate Overdue / Due Today tasks
  const todayStr = getTodayDateString();
  const dueTodayOrOverdue = tasks.filter(t => !t.completed && t.dueDate <= todayStr).length;
  elements.statDueTodayMeta.textContent = dueTodayOrOverdue > 0 
    ? `${dueTodayOrOverdue} due soon or overdue` 
    : 'No overdue tasks 👍';

  // Category breakdown meta
  const workCount = tasks.filter(t => t.category === 'Work').length;
  const personalCount = tasks.filter(t => t.category === 'Personal').length;
  const studyCount = tasks.filter(t => t.category === 'Study').length;
  elements.statCategoriesMeta.textContent = `Work: ${workCount} | Personal: ${personalCount} | Study: ${studyCount}`;

  // Update SVG Circular Progress Ring
  // Circumference of r=36 is 2 * PI * 36 ≈ 226.195
  const circumference = 226.2;
  const offset = circumference - (rate / 100) * circumference;
  if (elements.progressRingCircle) {
    elements.progressRingCircle.style.strokeDashoffset = offset;
  }
}

// ============================================================================
// Filtering, Searching & Sorting Logic
// ============================================================================

function getFilteredAndSortedTasks() {
  let list = [...tasks];

  // 1. Filter by Status (all, active, completed)
  if (currentFilter === 'active') {
    list = list.filter(t => !t.completed);
  } else if (currentFilter === 'completed') {
    list = list.filter(t => t.completed);
  }

  // 2. Filter by Category (Work, Personal, Study)
  if (currentCategory !== 'all') {
    list = list.filter(t => t.category === currentCategory);
  }

  // 3. Search Filter by Title
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(t => t.title.toLowerCase().includes(q));
  }

  // 4. Sorting
  list.sort((a, b) => {
    // If completed status differs and we sort, keep active near top unless sorting specifically
    switch (currentSort) {
      case 'date-asc':
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      case 'date-desc':
        return (b.dueDate || '').localeCompare(a.dueDate || '');
      case 'priority-desc': {
        const pWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0);
      }
      case 'created-desc':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case 'title-asc':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return list;
}

function updateFilterStatusBanner(filteredCount, totalCount) {
  const isFiltering = currentFilter !== 'all' || currentCategory !== 'all' || searchQuery.trim() !== '';

  if (isFiltering) {
    elements.filterStatusBanner.classList.remove('hidden');
    let desc = `Showing ${filteredCount} of ${totalCount} tasks`;
    const details = [];
    if (currentFilter !== 'all') details.push(`Status: ${capitalize(currentFilter)}`);
    if (currentCategory !== 'all') details.push(`Category: ${currentCategory}`);
    if (searchQuery.trim() !== '') details.push(`Query: "${searchQuery}"`);

    if (details.length > 0) {
      desc += ` (${details.join(', ')})`;
    }
    elements.filterStatusText.textContent = desc;
  } else {
    elements.filterStatusBanner.classList.add('hidden');
  }
}

// ============================================================================
// Render & Template UI Generation
// ============================================================================

function renderApp() {
  updateProductivityStats();

  const filteredTasks = getFilteredAndSortedTasks();
  updateFilterStatusBanner(filteredTasks.length, tasks.length);

  elements.taskList.innerHTML = '';

  if (filteredTasks.length === 0) {
    elements.emptyState.classList.remove('hidden');
    if (searchQuery.trim() !== '') {
      elements.emptyStateTitle.textContent = 'No matching tasks';
      elements.emptyStateDesc.textContent = `No tasks matched your search "${searchQuery}". Try clearing the search or adding a new task.`;
    } else if (currentFilter === 'completed') {
      elements.emptyStateTitle.textContent = 'No completed tasks yet';
      elements.emptyStateDesc.textContent = 'Mark tasks as done to see them listed here and celebrate your progress!';
    } else if (currentFilter === 'active') {
      elements.emptyStateTitle.textContent = 'No active tasks';
      elements.emptyStateDesc.textContent = 'You have zero active tasks remaining. Add one above to keep your momentum going!';
    } else {
      elements.emptyStateTitle.textContent = 'Your task list is empty';
      elements.emptyStateDesc.textContent = 'Create your first task using the input form above to begin tracking productivity.';
    }
  } else {
    elements.emptyState.classList.add('hidden');

    const fragment = document.createDocumentFragment();
    filteredTasks.forEach(task => {
      const li = renderTaskItem(task);
      fragment.appendChild(li);
    });
    elements.taskList.appendChild(fragment);
  }
}

/**
 * Creates individual task list DOM element
 */
function renderTaskItem(task) {
  const li = document.createElement('li');
  li.className = `task-item ${task.completed ? 'is-completed' : ''}`;
  li.setAttribute('data-task-id', task.id);

  // Category Icon & Color
  const categoryConfig = {
    Work: { icon: '💼', class: 'badge-work' },
    Personal: { icon: '🧘', class: 'badge-personal' },
    Study: { icon: '📚', class: 'badge-study' }
  };
  const cat = categoryConfig[task.category] || { icon: '📌', class: 'badge-work' };

  // Priority Styling
  const prioClass = `priority-${task.priority.toLowerCase()}`;
  const prioIcon = task.priority === 'High' ? '🔥' : task.priority === 'Medium' ? '⚡' : '🌱';

  // Date Formatting
  const dateInfo = formatDisplayDate(task.dueDate);
  const dateBadgeClass = dateInfo.status === 'overdue' ? 'due-overdue' : dateInfo.status === 'today' ? 'due-today' : '';

  li.innerHTML = `
    <!-- Custom Animated Checkbox -->
    <label class="checkbox-container" title="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
      <input type="checkbox" ${task.completed ? 'checked' : ''} data-action="toggle" aria-label="Toggle task completion" />
      <span class="custom-checkbox">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </span>
    </label>

    <!-- Task Content Area -->
    <div class="task-content-block">
      <span class="task-title">${escapeHTML(task.title)}</span>
      <div class="task-meta-row">
        <!-- Category Badge -->
        <span class="category-badge ${cat.class}">
          <span>${cat.icon}</span> ${task.category}
        </span>

        <!-- Priority Badge -->
        <span class="priority-badge ${prioClass}">
          <span>${prioIcon}</span> ${task.priority}
        </span>

        <!-- Due Date Badge -->
        <span class="due-badge ${dateBadgeClass}">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          ${dateInfo.text}
        </span>
      </div>
    </div>

    <!-- Actions (Edit & Delete) -->
    <div class="task-actions">
      <button type="button" class="task-btn task-btn-edit" data-action="edit" title="Edit task" aria-label="Edit task">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
      <button type="button" class="task-btn task-btn-delete" data-action="delete" title="Delete task" aria-label="Delete task">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  `;

  return li;
}

// ============================================================================
// Modal Handlers (Task Editing)
// ============================================================================

function openEditModal(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  elements.editTaskId.value = task.id;
  elements.editTaskTitle.value = task.title;
  elements.editTaskCategory.value = task.category;
  elements.editTaskPriority.value = task.priority || 'Medium';
  elements.editTaskDueDate.value = task.dueDate;

  elements.editModal.classList.remove('hidden');
  elements.editTaskTitle.focus();
}

function closeEditModal() {
  elements.editModal.classList.add('hidden');
  elements.editTaskForm.reset();
}

// ============================================================================
// Toast & Feedback System
// ============================================================================

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';

  const icons = {
    success: `<svg class="toast-icon success" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    danger: `<svg class="toast-icon danger" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    info: `<svg class="toast-icon info" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
  };

  toast.innerHTML = `
    ${icons[type] || icons.info}
    <div class="toast-message">${escapeHTML(message)}</div>
  `;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-hiding');
    setTimeout(() => toast.remove(), 260);
  }, 3200);
}

function showUndoToast(message) {
  if (toastTimeout) clearTimeout(toastTimeout);

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg class="toast-icon danger" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
    <div class="toast-message">${escapeHTML(message)}</div>
    <button type="button" class="toast-undo-btn" id="toast-undo-action">Undo</button>
  `;

  elements.toastContainer.appendChild(toast);

  const undoBtn = toast.querySelector('#toast-undo-action');
  undoBtn.addEventListener('click', () => {
    undoDelete();
    toast.remove();
  });

  toastTimeout = setTimeout(() => {
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      toast.remove();
      lastDeletedTask = null;
      lastDeletedIndex = null;
    }, 260);
  }, 5000);
}

// ============================================================================
// Theme Toggle & Persistence
// ============================================================================

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(savedTheme);

  elements.themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  });
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  }
}

// ============================================================================
// Event Listeners & Interactive Wiring
// ============================================================================

function initEventListeners() {
  // 1. Task Creation Form Submission
  elements.taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = elements.taskTitleInput.value;
    const category = elements.taskCategorySelect.value;
    const priority = elements.taskPrioritySelect.value;
    const dueDate = elements.taskDueDate.value || getTodayDateString();

    const created = createTask(title, category, priority, dueDate);
    if (created) {
      elements.taskTitleInput.value = '';
      elements.taskDueDate.value = getTodayDateString();
      elements.taskTitleInput.focus();
    }
  });

  // 2. Quick Due Date Preset Chips
  elements.quickPresets.forEach(chip => {
    chip.addEventListener('click', () => {
      const preset = chip.getAttribute('data-preset');
      let targetDate = getTodayDateString();

      if (preset === 'today') {
        targetDate = getTodayDateString();
      } else if (preset === 'tomorrow') {
        targetDate = getOffsetDateString(1);
      } else if (preset === 'weekend') {
        const now = new Date();
        const day = now.getDay();
        const diff = (6 - day + 7) % 7 || 7; // Next Saturday
        targetDate = getOffsetDateString(diff);
      } else if (preset === 'next-week') {
        const now = new Date();
        const day = now.getDay();
        const diff = (8 - day) % 7 || 7; // Next Monday
        targetDate = getOffsetDateString(diff);
      }

      elements.taskDueDate.value = targetDate;
      chip.style.transform = 'scale(0.95)';
      setTimeout(() => chip.style.transform = '', 150);
    });
  });

  // 3. Task List Delegated Events (Complete Checkbox, Edit, Delete)
  elements.taskList.addEventListener('click', (e) => {
    const target = e.target;
    const taskItem = target.closest('.task-item');
    if (!taskItem) return;

    const taskId = taskItem.getAttribute('data-task-id');

    // Toggle complete
    if (target.matches('input[type="checkbox"]') || target.closest('.checkbox-container')) {
      toggleTaskComplete(taskId);
      return;
    }

    // Edit button
    const editBtn = target.closest('[data-action="edit"]');
    if (editBtn) {
      openEditModal(taskId);
      return;
    }

    // Delete button
    const deleteBtn = target.closest('[data-action="delete"]');
    if (deleteBtn) {
      deleteTask(taskId);
      return;
    }
  });

  // 4. Status Filter Pills (All, Active, Completed)
  elements.filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      elements.filterPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      currentFilter = pill.getAttribute('data-filter');
      renderApp();
    });
  });

  // 5. Category Filter Select
  elements.categoryFilterSelect.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    renderApp();
  });

  // 6. Sort Select
  elements.sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderApp();
  });

  // 7. Search Filter Input
  elements.searchFilterInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    if (searchQuery.trim() !== '') {
      elements.clearSearchBtn.classList.remove('hidden');
    } else {
      elements.clearSearchBtn.classList.add('hidden');
    }
    renderApp();
  });

  // Clear Search Button
  elements.clearSearchBtn.addEventListener('click', () => {
    elements.searchFilterInput.value = '';
    searchQuery = '';
    elements.clearSearchBtn.classList.add('hidden');
    elements.searchFilterInput.focus();
    renderApp();
  });

  // 8. Clear Completed Tasks
  elements.clearCompletedBtn.addEventListener('click', clearCompletedTasks);

  // 9. Reset Filter Banner Link
  elements.resetFiltersBtn.addEventListener('click', () => {
    currentFilter = 'all';
    currentCategory = 'all';
    searchQuery = '';
    elements.searchFilterInput.value = '';
    elements.categoryFilterSelect.value = 'all';
    elements.clearSearchBtn.classList.add('hidden');

    elements.filterPills.forEach(p => {
      const isAll = p.getAttribute('data-filter') === 'all';
      p.classList.toggle('active', isAll);
      p.setAttribute('aria-selected', isAll ? 'true' : 'false');
    });

    renderApp();
  });

  // 10. Edit Modal Form Submission & Closing
  elements.editTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskId = elements.editTaskId.value;
    const title = elements.editTaskTitle.value;
    const category = elements.editTaskCategory.value;
    const priority = elements.editTaskPriority.value;
    const dueDate = elements.editTaskDueDate.value;

    if (!title.trim()) {
      showToast('Task title cannot be empty.', 'danger');
      elements.editTaskTitle.focus();
      return;
    }

    updateTask(taskId, { title, category, priority, dueDate });
    closeEditModal();
  });

  elements.closeModalBtn.addEventListener('click', closeEditModal);
  elements.cancelEditBtn.addEventListener('click', closeEditModal);

  // Click outside modal content to close
  elements.editModal.addEventListener('click', (e) => {
    if (e.target === elements.editModal) {
      closeEditModal();
    }
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // ESC to close modal
    if (e.key === 'Escape' && !elements.editModal.classList.contains('hidden')) {
      closeEditModal();
      return;
    }

    // "/" key to focus search if not in an input
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      elements.searchFilterInput.focus();
      return;
    }
  });
}

// ============================================================================
// General Helpers
// ============================================================================

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function truncate(str, max = 25) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '...' : str;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================================
// Application Initialization
// ============================================================================

function init() {
  updateHeaderDateDisplay();
  initTheme();

  // Set default due date in task creation form to today
  if (elements.taskDueDate) {
    elements.taskDueDate.value = getTodayDateString();
    elements.taskDueDate.min = getTodayDateString();
  }

  // Load existing state from localStorage
  loadFromLocalStorage();

  // Bind UI interactions
  initEventListeners();

  // Initial full render
  renderApp();
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
