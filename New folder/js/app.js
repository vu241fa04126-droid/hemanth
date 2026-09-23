/**
 * Main Application Orchestrator
 * Handles navigation routing, modals lifecycle, theme switching, global search, and responsive drawers.
 */

const App = {
    currentSection: 'dashboard',

    init() {
        this.initTheme();
        this.bindNavigation();
        this.bindGlobalSearch();
        this.bindModals();
        this.bindMobileSidebar();
        this.bindWindowResize();

        // Initialize all modules
        window.DashboardModule.init();
        window.StudentsModule.init();
        window.FacultyModule.init();
        window.InventoryModule.init();
        window.TasksModule.init();
        window.AssignmentsModule.init();
        window.DataManagerModule.init();

        // Check URL hash if any
        const hash = window.location.hash.replace('#', '');
        if (hash && document.getElementById(`view-${hash}`)) {
            this.navigateTo(hash);
        } else {
            this.navigateTo('dashboard');
        }
    },

    // --- NAVIGATION ---
    bindNavigation() {
        const navItems = document.querySelectorAll('[data-nav-target]');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = item.getAttribute('data-nav-target');
                this.navigateTo(target);

                // Close mobile sidebar if open
                this.closeMobileSidebar();
            });
        });
    },

    navigateTo(sectionId) {
        const targetView = document.getElementById(`view-${sectionId}`);
        if (!targetView) return;

        // Hide all views
        document.querySelectorAll('.view-section').forEach(view => {
            view.classList.remove('active');
        });

        // Show target view
        targetView.classList.add('active');
        this.currentSection = sectionId;
        window.location.hash = sectionId;

        // Update active sidebar nav
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.getAttribute('data-nav-target') === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update Header Page Title
        const pageTitles = {
            'dashboard': { title: 'Administrative Dashboard', subtitle: 'Overview of students, faculty, inventory, tasks & assignments' },
            'students': { title: 'Student Management', subtitle: 'Directory, enrollment records, GPA & academic standing' },
            'faculty': { title: 'Faculty & Staff Directory', subtitle: 'Manage professors, designations, courses & contact info' },
            'inventory': { title: 'College Inventory & Assets', subtitle: 'Track lab equipment, hardware, reorder levels & stock condition' },
            'tasks': { title: 'Academic & Admin Tasks', subtitle: 'Departmental deadlines, moderation, accreditation & task tracking' },
            'assignments': { title: 'Course Assignments Catalog', subtitle: 'Manage student homework, project submissions & grading status' },
            'data-manager': { title: 'System Backups & Settings', subtitle: 'JSON backup export/import, data integrity & institution settings' }
        };

        const titleInfo = pageTitles[sectionId] || { title: 'College Management System', subtitle: '' };
        const titleEl = document.getElementById('headerPageTitle');
        const subtitleEl = document.getElementById('headerPageSubtitle');

        if (titleEl) titleEl.textContent = titleInfo.title;
        if (subtitleEl) subtitleEl.textContent = titleInfo.subtitle;

        // Refresh views if needed
        this.refreshCurrentView();
    },

    refreshCurrentView() {
        if (this.currentSection === 'dashboard') {
            window.DashboardModule.init();
        } else if (this.currentSection === 'students') {
            window.StudentsModule.renderTable();
        } else if (this.currentSection === 'faculty') {
            window.FacultyModule.renderTable();
        } else if (this.currentSection === 'inventory') {
            window.InventoryModule.renderTable();
        } else if (this.currentSection === 'tasks') {
            window.TasksModule.render();
        } else if (this.currentSection === 'assignments') {
            window.AssignmentsModule.renderTable();
        }
    },

    // --- THEME MANAGEMENT ---
    initTheme() {
        const savedTheme = localStorage.getItem('cms_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeButtonIcon(savedTheme);

        const toggleBtn = document.getElementById('themeToggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme') || 'light';
                const next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('cms_theme', next);
                this.updateThemeButtonIcon(next);

                // Redraw dashboard charts to match theme colors
                if (this.currentSection === 'dashboard') {
                    window.DashboardModule.renderCharts();
                }
            });
        }
    },

    updateThemeButtonIcon(theme) {
        const btn = document.getElementById('themeToggleBtn');
        if (btn) {
            btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
            btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
        }
    },

    // --- GLOBAL SEARCH ---
    bindGlobalSearch() {
        const searchInput = document.getElementById('globalSearchInput');
        if (!searchInput) return;

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim().toLowerCase();
                if (!query) return;

                // Determine best match section
                const students = window.dataStore.getStudents().filter(s => s.name.toLowerCase().includes(query) || s.rollNo.toLowerCase().includes(query));
                const faculty = window.dataStore.getFaculty().filter(f => f.name.toLowerCase().includes(query) || f.department.toLowerCase().includes(query));
                const inventory = window.dataStore.getInventory().filter(i => i.name.toLowerCase().includes(query));
                const tasks = window.dataStore.getTasks().filter(t => t.title.toLowerCase().includes(query));
                const assignments = window.dataStore.getAssignments().filter(a => a.title.toLowerCase().includes(query) || a.courseCode.toLowerCase().includes(query));

                if (students.length > 0) {
                    this.navigateTo('students');
                    const studentSearch = document.getElementById('studentSearchInput');
                    if (studentSearch) {
                        studentSearch.value = query;
                        window.StudentsModule.currentSearch = query;
                        window.StudentsModule.renderTable();
                    }
                } else if (faculty.length > 0) {
                    this.navigateTo('faculty');
                    const facultySearch = document.getElementById('facultySearchInput');
                    if (facultySearch) {
                        facultySearch.value = query;
                        window.FacultyModule.currentSearch = query;
                        window.FacultyModule.renderTable();
                    }
                } else if (inventory.length > 0) {
                    this.navigateTo('inventory');
                    const invSearch = document.getElementById('inventorySearchInput');
                    if (invSearch) {
                        invSearch.value = query;
                        window.InventoryModule.currentSearch = query;
                        window.InventoryModule.renderTable();
                    }
                } else if (tasks.length > 0) {
                    this.navigateTo('tasks');
                    const taskSearch = document.getElementById('taskSearchInput');
                    if (taskSearch) {
                        taskSearch.value = query;
                        window.TasksModule.currentSearch = query;
                        window.TasksModule.render();
                    }
                } else if (assignments.length > 0) {
                    this.navigateTo('assignments');
                    const asnSearch = document.getElementById('assignmentSearchInput');
                    if (asnSearch) {
                        asnSearch.value = query;
                        window.AssignmentsModule.currentSearch = query;
                        window.AssignmentsModule.renderTable();
                    }
                } else {
                    window.Utils.showToast(`No results matching "${query}"`, 'info');
                }
            }
        });
    },

    // --- MODAL CONTROLLER ---
    bindModals() {
        // Close modals on overlay backdrop click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                }
            });
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });

        // Close buttons inside modals
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetModalId = btn.getAttribute('data-close-modal');
                if (targetModalId) {
                    this.closeModal(targetModalId);
                } else {
                    const parentModal = btn.closest('.modal-overlay');
                    if (parentModal) parentModal.classList.remove('active');
                }
            });
        });
    },

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            // Auto focus first input if any
            const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea');
            if (firstInput) setTimeout(() => firstInput.focus(), 50);
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    // --- MOBILE SIDEBAR ---
    bindMobileSidebar() {
        const toggleBtn = document.getElementById('mobileMenuToggle');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (toggleBtn && sidebar && overlay) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
                overlay.classList.toggle('active');
            });

            overlay.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }
    },

    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('active');
    },

    bindWindowResize() {
        window.addEventListener('resize', window.Utils.debounce(() => {
            if (this.currentSection === 'dashboard') {
                window.DashboardModule.renderCharts();
            }
        }, 200));
    }
};

window.App = App;

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.App.init();
});
