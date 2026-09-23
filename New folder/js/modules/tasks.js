/**
 * Academic Tasks Management Module
 * Supports Table & Interactive Kanban Board Views, Drag-and-Drop, Status Transitions, and CSV export.
 */

const TasksModule = {
    currentView: 'table', // 'table' or 'kanban'
    currentSearch: '',
    currentPriority: 'all',
    currentCategory: 'all',
    currentStatus: 'all',

    init() {
        this.bindEvents();
        this.render();
    },

    bindEvents() {
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', window.Utils.debounce((e) => {
                this.currentSearch = e.target.value.trim().toLowerCase();
                this.render();
            }, 200));
        }

        const priorityFilter = document.getElementById('taskPriorityFilter');
        if (priorityFilter) {
            priorityFilter.addEventListener('change', (e) => {
                this.currentPriority = e.target.value;
                this.render();
            });
        }

        const categoryFilter = document.getElementById('taskCategoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.render();
            });
        }

        const statusFilter = document.getElementById('taskStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentStatus = e.target.value;
                this.render();
            });
        }

        const btnAdd = document.getElementById('btnAddTask');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => this.openTaskModal());
        }

        const btnExport = document.getElementById('btnExportTasks');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.exportCSV());
        }

        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSaveTask();
            });
        }

        // View Toggles
        const btnTableView = document.getElementById('btnTaskTableView');
        const btnKanbanView = document.getElementById('btnTaskKanbanView');

        if (btnTableView && btnKanbanView) {
            btnTableView.addEventListener('click', () => {
                this.currentView = 'table';
                btnTableView.classList.add('active');
                btnKanbanView.classList.remove('active');
                this.render();
            });

            btnKanbanView.addEventListener('click', () => {
                this.currentView = 'kanban';
                btnKanbanView.classList.add('active');
                btnTableView.classList.remove('active');
                this.render();
            });
        }
    },

    getFilteredData() {
        let list = window.dataStore.getTasks();

        if (this.currentSearch) {
            list = list.filter(t =>
                (t.title && t.title.toLowerCase().includes(this.currentSearch)) ||
                (t.id && t.id.toLowerCase().includes(this.currentSearch)) ||
                (t.assignedTo && t.assignedTo.toLowerCase().includes(this.currentSearch)) ||
                (t.description && t.description.toLowerCase().includes(this.currentSearch))
            );
        }

        if (this.currentPriority !== 'all') {
            list = list.filter(t => t.priority === this.currentPriority);
        }

        if (this.currentCategory !== 'all') {
            list = list.filter(t => t.category === this.currentCategory);
        }

        if (this.currentStatus !== 'all') {
            list = list.filter(t => t.status === this.currentStatus);
        }

        return list;
    },

    render() {
        const tableContainer = document.getElementById('tasksTableViewContainer');
        const kanbanContainer = document.getElementById('tasksKanbanViewContainer');
        const countEl = document.getElementById('tasksTotalDisplay');

        const filtered = this.getFilteredData();
        if (countEl) countEl.textContent = `Showing ${filtered.length} tasks`;

        if (this.currentView === 'table') {
            if (tableContainer) tableContainer.style.display = 'block';
            if (kanbanContainer) kanbanContainer.style.display = 'none';
            this.renderTable(filtered);
        } else {
            if (tableContainer) tableContainer.style.display = 'none';
            if (kanbanContainer) kanbanContainer.style.display = 'grid';
            this.renderKanban(filtered);
        }
    },

    renderTable(filtered) {
        const tbody = document.getElementById('tasksTableBody');
        if (!tbody) return;

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <div class="empty-state-icon">📋</div>
                            <div class="empty-state-title">No Academic Tasks Found</div>
                            <div class="empty-state-desc">Try clearing your filters or create a new task.</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        const today = new Date().toISOString().split('T')[0];

        filtered.forEach(t => {
            const isOverdue = t.status !== 'Completed' && t.dueDate && t.dueDate < today;
            const priorityBadge = t.priority === 'High' ? 'badge-danger' : t.priority === 'Medium' ? 'badge-warning' : 'badge-info';
            const statusBadge = t.status === 'Completed' ? 'badge-success' : t.status === 'In Progress' ? 'badge-primary' : 'badge-secondary';

            html += `
                <tr>
                    <td>
                        <div class="font-bold text-primary">${window.Utils.escapeHtml(t.id)}</div>
                        <span class="badge ${priorityBadge}">${window.Utils.escapeHtml(t.priority)}</span>
                    </td>
                    <td>
                        <div class="font-semibold ${t.status === 'Completed' ? 'text-muted' : ''}" style="${t.status === 'Completed' ? 'text-decoration: line-through;' : ''}">
                            ${window.Utils.escapeHtml(t.title)}
                        </div>
                        <div class="text-xs text-muted" style="max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${window.Utils.escapeHtml(t.description || 'No description')}
                        </div>
                    </td>
                    <td>
                        <span class="badge badge-secondary">${window.Utils.escapeHtml(t.category)}</span>
                    </td>
                    <td>
                        <div class="font-medium text-xs">${window.Utils.escapeHtml(t.assignedTo)}</div>
                    </td>
                    <td>
                        <div class="text-xs ${isOverdue ? 'text-danger font-bold' : ''}">
                            ${isOverdue ? '⚠️ ' : ''}${window.Utils.formatDate(t.dueDate)}
                        </div>
                    </td>
                    <td>
                        <span class="badge ${statusBadge}">${window.Utils.escapeHtml(t.status)}</span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 0.35rem;">
                            ${t.status !== 'Completed' 
                                ? `<button class="btn btn-success btn-sm" onclick="TasksModule.quickSetStatus('${t.id}', 'Completed')" title="Mark as Completed">✓</button>`
                                : `<button class="btn btn-secondary btn-sm" onclick="TasksModule.quickSetStatus('${t.id}', 'In Progress')" title="Reopen Task">↺</button>`
                            }
                            <button class="btn btn-secondary btn-sm" onclick="TasksModule.openTaskModal('${t.id}')" title="Edit Task">✏</button>
                            <button class="btn btn-danger btn-sm" onclick="TasksModule.confirmDelete('${t.id}')" title="Delete Task">🗑</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    },

    renderKanban(filtered) {
        const cols = {
            'Pending': document.getElementById('kanbanPendingCards'),
            'In Progress': document.getElementById('kanbanInProgressCards'),
            'Completed': document.getElementById('kanbanCompletedCards')
        };

        const counts = { 'Pending': 0, 'In Progress': 0, 'Completed': 0 };

        Object.values(cols).forEach(col => {
            if (col) col.innerHTML = '';
        });

        const today = new Date().toISOString().split('T')[0];

        filtered.forEach(t => {
            const col = cols[t.status];
            if (!col) return;
            counts[t.status]++;

            const isOverdue = t.status !== 'Completed' && t.dueDate && t.dueDate < today;
            const priorityBadge = t.priority === 'High' ? 'badge-danger' : t.priority === 'Medium' ? 'badge-warning' : 'badge-info';

            const card = document.createElement('div');
            card.className = 'kanban-card';
            card.setAttribute('draggable', 'true');
            card.dataset.taskId = t.id;

            card.innerHTML = `
                <div class="kanban-card-header">
                    <span class="badge ${priorityBadge}">${window.Utils.escapeHtml(t.priority)}</span>
                    <span class="text-xs text-muted">${window.Utils.escapeHtml(t.category)}</span>
                </div>
                <div class="kanban-task-title ${t.status === 'Completed' ? 'text-muted' : ''}">${window.Utils.escapeHtml(t.title)}</div>
                <div class="kanban-task-desc">${window.Utils.escapeHtml(t.description || '')}</div>
                <div class="kanban-card-footer">
                    <div class="kanban-assignee">👤 ${window.Utils.escapeHtml(t.assignedTo)}</div>
                    <div class="kanban-due-date ${isOverdue ? 'overdue' : ''}">
                        📅 ${window.Utils.formatDate(t.dueDate)}
                    </div>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 0.35rem; margin-top: 0.5rem;">
                    <button class="btn btn-secondary btn-sm" onclick="TasksModule.openTaskModal('${t.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="TasksModule.confirmDelete('${t.id}')">✕</button>
                </div>
            `;

            // Setup drag events
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', t.id);
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });

            col.appendChild(card);
        });

        // Update column badge counts
        const updateBadge = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };
        updateBadge('kanbanCountPending', counts['Pending']);
        updateBadge('kanbanCountInProgress', counts['In Progress']);
        updateBadge('kanbanCountCompleted', counts['Completed']);

        // Setup drop zones on columns
        this.setupKanbanDropZones();
    },

    setupKanbanDropZones() {
        const dropContainers = document.querySelectorAll('.kanban-cards-container');
        dropContainers.forEach(container => {
            container.ondragover = (e) => {
                e.preventDefault();
                container.classList.add('drag-over');
            };

            container.ondragleave = () => {
                container.classList.remove('drag-over');
            };

            container.ondrop = (e) => {
                e.preventDefault();
                container.classList.remove('drag-over');
                const taskId = e.dataTransfer.getData('text/plain');
                const targetStatus = container.dataset.statusColumn;

                if (taskId && targetStatus) {
                    window.dataStore.updateTaskStatus(taskId, targetStatus);
                    window.Utils.showToast(`Task moved to ${targetStatus}`, 'info');
                    this.render();
                    window.DashboardModule.init();
                }
            };
        });
    },

    quickSetStatus(id, newStatus) {
        window.dataStore.updateTaskStatus(id, newStatus);
        window.Utils.showToast(`Task status set to ${newStatus}`, 'success');
        this.render();
        window.DashboardModule.init();
    },

    openTaskModal(taskId = null) {
        const form = document.getElementById('taskForm');
        const titleEl = document.getElementById('taskModalTitle');
        if (!form) return;

        form.reset();

        if (taskId) {
            const t = window.dataStore.getTaskById(taskId);
            if (!t) return;
            if (titleEl) titleEl.textContent = 'Edit Academic Task';
            document.getElementById('taskEditId').value = t.id;
            document.getElementById('taskTitle').value = t.title || '';
            document.getElementById('taskAssignedTo').value = t.assignedTo || '';
            document.getElementById('taskCategory').value = t.category || 'Academic';
            document.getElementById('taskPriority').value = t.priority || 'Medium';
            document.getElementById('taskStatus').value = t.status || 'Pending';
            document.getElementById('taskDueDate').value = t.dueDate || '';
            document.getElementById('taskDescription').value = t.description || '';
        } else {
            if (titleEl) titleEl.textContent = 'Create Academic Task';
            document.getElementById('taskEditId').value = '';
            document.getElementById('taskPriority').value = 'Medium';
            document.getElementById('taskStatus').value = 'Pending';
            
            // Set default due date to 7 days in future
            const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            document.getElementById('taskDueDate').value = nextWeek;
        }

        window.App.openModal('taskModal');
    },

    handleSaveTask() {
        const editId = document.getElementById('taskEditId').value;
        const taskId = editId || window.Utils.generateId('TSK');

        const task = {
            id: taskId,
            title: document.getElementById('taskTitle').value.trim(),
            assignedTo: document.getElementById('taskAssignedTo').value.trim(),
            category: document.getElementById('taskCategory').value,
            priority: document.getElementById('taskPriority').value,
            status: document.getElementById('taskStatus').value,
            dueDate: document.getElementById('taskDueDate').value,
            description: document.getElementById('taskDescription').value.trim()
        };

        if (!task.title || !task.assignedTo || !task.dueDate) {
            window.Utils.showToast('Please fill in Task Title, Assignee, and Due Date', 'warning');
            return;
        }

        window.dataStore.saveTask(task);
        window.Utils.showToast(editId ? 'Task updated successfully' : 'New task assigned successfully', 'success');
        window.App.closeModal('taskModal');
        this.render();
        window.DashboardModule.init();
    },

    confirmDelete(id) {
        const t = window.dataStore.getTaskById(id);
        if (!t) return;

        if (confirm(`Are you sure you want to delete task "${t.title}"?`)) {
            window.dataStore.deleteTask(id);
            window.Utils.showToast('Task removed', 'success');
            this.render();
            window.DashboardModule.init();
        }
    },

    exportCSV() {
        const tasks = this.getFilteredData();
        const headers = {
            id: 'Task ID',
            title: 'Task Title',
            category: 'Category',
            assignedTo: 'Assigned To',
            priority: 'Priority',
            dueDate: 'Due Date',
            status: 'Status',
            createdDate: 'Created Date',
            description: 'Description'
        };
        window.Utils.exportToCSV('College_Academic_Tasks', tasks, headers);
    }
};

window.TasksModule = TasksModule;
