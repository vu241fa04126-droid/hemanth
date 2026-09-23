/**
 * Assignment Management Module
 * Handles assignment creation, course allocations, submission tracking, status toggles, and CSV export.
 */

const AssignmentsModule = {
    currentSearch: '',
    currentDept: 'all',
    currentStatus: 'all',

    init() {
        this.bindEvents();
        this.renderTable();
    },

    bindEvents() {
        const searchInput = document.getElementById('assignmentSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', window.Utils.debounce((e) => {
                this.currentSearch = e.target.value.trim().toLowerCase();
                this.renderTable();
            }, 200));
        }

        const deptFilter = document.getElementById('assignmentDeptFilter');
        if (deptFilter) {
            deptFilter.addEventListener('change', (e) => {
                this.currentDept = e.target.value;
                this.renderTable();
            });
        }

        const statusFilter = document.getElementById('assignmentStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentStatus = e.target.value;
                this.renderTable();
            });
        }

        const btnAdd = document.getElementById('btnAddAssignment');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => this.openAssignmentModal());
        }

        const btnExport = document.getElementById('btnExportAssignments');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.exportCSV());
        }

        const assignmentForm = document.getElementById('assignmentForm');
        if (assignmentForm) {
            assignmentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSaveAssignment();
            });
        }
    },

    getFilteredData() {
        let list = window.dataStore.getAssignments();

        if (this.currentSearch) {
            list = list.filter(a =>
                (a.title && a.title.toLowerCase().includes(this.currentSearch)) ||
                (a.courseCode && a.courseCode.toLowerCase().includes(this.currentSearch)) ||
                (a.courseName && a.courseName.toLowerCase().includes(this.currentSearch)) ||
                (a.facultyName && a.facultyName.toLowerCase().includes(this.currentSearch)) ||
                (a.department && a.department.toLowerCase().includes(this.currentSearch))
            );
        }

        if (this.currentDept !== 'all') {
            list = list.filter(a => a.department === this.currentDept);
        }

        if (this.currentStatus !== 'all') {
            list = list.filter(a => a.status === this.currentStatus);
        }

        return list;
    },

    renderTable() {
        const tbody = document.getElementById('assignmentsTableBody');
        const countEl = document.getElementById('assignmentsTotalDisplay');
        if (!tbody) return;

        const filtered = this.getFilteredData();
        if (countEl) countEl.textContent = `Showing ${filtered.length} assignments`;

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <div class="empty-state-icon">📚</div>
                            <div class="empty-state-title">No Assignments Found</div>
                            <div class="empty-state-desc">Try adjusting your filters or publish a new course assignment.</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        const today = new Date().toISOString().split('T')[0];

        filtered.forEach(a => {
            const submitted = parseInt(a.submittedCount) || 0;
            const maxSub = parseInt(a.maxSubmissions) || 1;
            const pct = Math.min(100, Math.round((submitted / maxSub) * 100));
            const isOverdue = a.status === 'Active' && a.dueDate && a.dueDate < today;
            const statusClass = a.status === 'Active' ? 'badge-success' : 'badge-secondary';

            html += `
                <tr>
                    <td>
                        <div class="font-bold text-primary">${window.Utils.escapeHtml(a.courseCode)}</div>
                        <div class="text-xs text-muted">${window.Utils.escapeHtml(a.id)}</div>
                    </td>
                    <td>
                        <div class="font-semibold">${window.Utils.escapeHtml(a.title)}</div>
                        <div class="text-xs text-muted">${window.Utils.escapeHtml(a.courseName || '')}</div>
                    </td>
                    <td>
                        <span class="badge badge-primary">${window.Utils.escapeHtml(a.department)}</span>
                        <div class="text-xs text-muted" style="margin-top: 2px;">${window.Utils.escapeHtml(a.facultyName)}</div>
                    </td>
                    <td>
                        <div class="text-xs ${isOverdue ? 'text-danger font-bold' : ''}">
                            ${isOverdue ? '⚠️ ' : ''}${window.Utils.formatDate(a.dueDate)}
                        </div>
                        <div class="text-xs text-muted">Marks: ${a.totalMarks}</div>
                    </td>
                    <td style="min-width: 140px;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 3px;">
                            <span class="font-semibold">${submitted}/${maxSub}</span>
                            <span class="text-muted">${pct}%</span>
                        </div>
                        <div style="height: 6px; background-color: var(--bg-active); border-radius: var(--radius-full); overflow: hidden;">
                            <div style="height: 100%; width: ${pct}%; background-color: ${pct >= 80 ? 'var(--success)' : 'var(--primary)'}; border-radius: var(--radius-full);"></div>
                        </div>
                    </td>
                    <td>
                        <span class="badge ${statusClass}">${window.Utils.escapeHtml(a.status)}</span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 0.35rem;">
                            <button class="btn btn-secondary btn-sm" onclick="AssignmentsModule.toggleStatus('${a.id}')" title="Toggle Active / Closed Status">
                                ${a.status === 'Active' ? '🔒 Close' : '🔓 Reopen'}
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="AssignmentsModule.openAssignmentModal('${a.id}')" title="Edit Assignment">✏</button>
                            <button class="btn btn-danger btn-sm" onclick="AssignmentsModule.confirmDelete('${a.id}')" title="Delete Assignment">🗑</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    },

    openAssignmentModal(assignmentId = null) {
        const form = document.getElementById('assignmentForm');
        const titleEl = document.getElementById('assignmentModalTitle');
        if (!form) return;

        form.reset();

        if (assignmentId) {
            const a = window.dataStore.getAssignmentById(assignmentId);
            if (!a) return;
            if (titleEl) titleEl.textContent = 'Edit Course Assignment';
            document.getElementById('assignmentEditId').value = a.id;
            document.getElementById('assignmentTitle').value = a.title || '';
            document.getElementById('assignmentCourseCode').value = a.courseCode || '';
            document.getElementById('assignmentCourseName').value = a.courseName || '';
            document.getElementById('assignmentFacultyName').value = a.facultyName || '';
            document.getElementById('assignmentDepartment').value = a.department || 'Computer Science';
            document.getElementById('assignmentYear').value = a.year || '3rd Year';
            document.getElementById('assignmentSemester').value = a.semester || '6th Semester';
            document.getElementById('assignmentDueDate').value = a.dueDate || '';
            document.getElementById('assignmentTotalMarks').value = a.totalMarks || 50;
            document.getElementById('assignmentMaxSubmissions').value = a.maxSubmissions || 60;
            document.getElementById('assignmentSubmittedCount').value = a.submittedCount || 0;
            document.getElementById('assignmentStatus').value = a.status || 'Active';
            document.getElementById('assignmentDescription').value = a.description || '';
        } else {
            if (titleEl) titleEl.textContent = 'Publish New Assignment';
            document.getElementById('assignmentEditId').value = '';
            document.getElementById('assignmentTotalMarks').value = 50;
            document.getElementById('assignmentMaxSubmissions').value = 60;
            document.getElementById('assignmentSubmittedCount').value = 0;
            document.getElementById('assignmentStatus').value = 'Active';

            const next2Weeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            document.getElementById('assignmentDueDate').value = next2Weeks;
        }

        window.App.openModal('assignmentModal');
    },

    handleSaveAssignment() {
        const editId = document.getElementById('assignmentEditId').value;
        const assignmentId = editId || window.Utils.generateId('ASN');

        const assignment = {
            id: assignmentId,
            title: document.getElementById('assignmentTitle').value.trim(),
            courseCode: document.getElementById('assignmentCourseCode').value.trim().toUpperCase(),
            courseName: document.getElementById('assignmentCourseName').value.trim(),
            facultyName: document.getElementById('assignmentFacultyName').value.trim(),
            department: document.getElementById('assignmentDepartment').value,
            year: document.getElementById('assignmentYear').value,
            semester: document.getElementById('assignmentSemester').value,
            dueDate: document.getElementById('assignmentDueDate').value,
            totalMarks: parseInt(document.getElementById('assignmentTotalMarks').value) || 0,
            maxSubmissions: parseInt(document.getElementById('assignmentMaxSubmissions').value) || 1,
            submittedCount: parseInt(document.getElementById('assignmentSubmittedCount').value) || 0,
            status: document.getElementById('assignmentStatus').value,
            description: document.getElementById('assignmentDescription').value.trim()
        };

        if (!assignment.title || !assignment.courseCode || !assignment.facultyName || !assignment.dueDate) {
            window.Utils.showToast('Please fill in Assignment Title, Course Code, Faculty, and Due Date', 'warning');
            return;
        }

        window.dataStore.saveAssignment(assignment);
        window.Utils.showToast(editId ? 'Assignment updated successfully' : 'New assignment published successfully', 'success');
        window.App.closeModal('assignmentModal');
        this.renderTable();
        window.DashboardModule.init();
    },

    toggleStatus(id) {
        const a = window.dataStore.getAssignmentById(id);
        if (!a) return;

        a.status = a.status === 'Active' ? 'Closed' : 'Active';
        window.dataStore.saveAssignment(a);
        window.Utils.showToast(`Assignment status changed to ${a.status}`, 'info');
        this.renderTable();
        window.DashboardModule.init();
    },

    confirmDelete(id) {
        const a = window.dataStore.getAssignmentById(id);
        if (!a) return;

        if (confirm(`Are you sure you want to delete assignment "${a.title}" (${a.courseCode})?`)) {
            window.dataStore.deleteAssignment(id);
            window.Utils.showToast('Assignment deleted', 'success');
            this.renderTable();
            window.DashboardModule.init();
        }
    },

    exportCSV() {
        const assignments = this.getFilteredData();
        const headers = {
            id: 'Assignment ID',
            courseCode: 'Course Code',
            courseName: 'Course Name',
            title: 'Assignment Title',
            facultyName: 'Faculty Instructor',
            department: 'Department',
            dueDate: 'Due Date',
            totalMarks: 'Total Marks',
            submittedCount: 'Submissions Received',
            maxSubmissions: 'Total Expected',
            status: 'Status',
            description: 'Description'
        };
        window.Utils.exportToCSV('College_Assignments_Catalog', assignments, headers);
    }
};

window.AssignmentsModule = AssignmentsModule;
