/**
 * Faculty Management Module
 * Complete CRUD, search, department/designation filters, profile modal, and CSV export.
 */

const FacultyModule = {
    currentSearch: '',
    currentDept: 'all',
    currentDesignation: 'all',
    currentStatus: 'all',

    init() {
        this.bindEvents();
        this.renderTable();
    },

    bindEvents() {
        const searchInput = document.getElementById('facultySearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', window.Utils.debounce((e) => {
                this.currentSearch = e.target.value.trim().toLowerCase();
                this.renderTable();
            }, 200));
        }

        const deptFilter = document.getElementById('facultyDeptFilter');
        if (deptFilter) {
            deptFilter.addEventListener('change', (e) => {
                this.currentDept = e.target.value;
                this.renderTable();
            });
        }

        const designationFilter = document.getElementById('facultyDesignationFilter');
        if (designationFilter) {
            designationFilter.addEventListener('change', (e) => {
                this.currentDesignation = e.target.value;
                this.renderTable();
            });
        }

        const statusFilter = document.getElementById('facultyStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentStatus = e.target.value;
                this.renderTable();
            });
        }

        const btnAdd = document.getElementById('btnAddFaculty');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => this.openFacultyModal());
        }

        const btnExport = document.getElementById('btnExportFaculty');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.exportCSV());
        }

        const facultyForm = document.getElementById('facultyForm');
        if (facultyForm) {
            facultyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSaveFaculty();
            });
        }
    },

    getFilteredData() {
        let list = window.dataStore.getFaculty();

        if (this.currentSearch) {
            list = list.filter(f =>
                (f.name && f.name.toLowerCase().includes(this.currentSearch)) ||
                (f.id && f.id.toLowerCase().includes(this.currentSearch)) ||
                (f.email && f.email.toLowerCase().includes(this.currentSearch)) ||
                (f.department && f.department.toLowerCase().includes(this.currentSearch)) ||
                (f.specialization && f.specialization.toLowerCase().includes(this.currentSearch))
            );
        }

        if (this.currentDept !== 'all') {
            list = list.filter(f => f.department === this.currentDept);
        }

        if (this.currentDesignation !== 'all') {
            list = list.filter(f => f.designation === this.currentDesignation);
        }

        if (this.currentStatus !== 'all') {
            list = list.filter(f => f.status === this.currentStatus);
        }

        return list;
    },

    renderTable() {
        const tbody = document.getElementById('facultyTableBody');
        const countEl = document.getElementById('facultyTotalDisplay');
        if (!tbody) return;

        const filtered = this.getFilteredData();
        if (countEl) countEl.textContent = `Showing ${filtered.length} faculty members`;

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <div class="empty-state-icon">👨‍🏫</div>
                            <div class="empty-state-title">No Faculty Members Found</div>
                            <div class="empty-state-desc">Try adjusting your filters or add a new faculty profile.</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        filtered.forEach(f => {
            const statusClass = f.status === 'Active' ? 'badge-success' : 'badge-warning';
            html += `
                <tr>
                    <td>
                        <div class="font-bold text-primary">${window.Utils.escapeHtml(f.id)}</div>
                        <div class="text-xs text-muted">${window.Utils.escapeHtml(f.officeRoom || 'N/A')}</div>
                    </td>
                    <td>
                        <div class="font-semibold">${window.Utils.escapeHtml(f.name)}</div>
                        <div class="text-xs text-muted">${window.Utils.escapeHtml(f.email)}</div>
                    </td>
                    <td>
                        <span class="badge badge-primary">${window.Utils.escapeHtml(f.department)}</span>
                    </td>
                    <td>
                        <div class="font-medium">${window.Utils.escapeHtml(f.designation)}</div>
                        <div class="text-xs text-muted">${f.experienceYears ? f.experienceYears + ' yrs exp.' : ''}</div>
                    </td>
                    <td>
                        <div class="text-xs text-secondary" style="max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${window.Utils.escapeHtml(f.specialization || 'N/A')}
                        </div>
                    </td>
                    <td>
                        <span class="badge ${statusClass}">${window.Utils.escapeHtml(f.status)}</span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 0.35rem;">
                            <button class="btn btn-secondary btn-sm" onclick="FacultyModule.viewProfile('${f.id}')" title="View Profile">👁</button>
                            <button class="btn btn-secondary btn-sm" onclick="FacultyModule.openFacultyModal('${f.id}')" title="Edit Details">✏</button>
                            <button class="btn btn-danger btn-sm" onclick="FacultyModule.confirmDelete('${f.id}')" title="Delete Faculty">🗑</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    },

    openFacultyModal(facultyId = null) {
        const form = document.getElementById('facultyForm');
        const titleEl = document.getElementById('facultyModalTitle');
        if (!form) return;

        form.reset();

        if (facultyId) {
            const f = window.dataStore.getFacultyById(facultyId);
            if (!f) return;
            if (titleEl) titleEl.textContent = 'Edit Faculty Profile';
            document.getElementById('facultyEditId').value = f.id;
            document.getElementById('facultyName').value = f.name || '';
            document.getElementById('facultyEmail').value = f.email || '';
            document.getElementById('facultyPhone').value = f.phone || '';
            document.getElementById('facultyDepartment').value = f.department || 'Computer Science';
            document.getElementById('facultyDesignation').value = f.designation || 'Assistant Professor';
            document.getElementById('facultySpecialization').value = f.specialization || '';
            document.getElementById('facultyQualification').value = f.qualification || '';
            document.getElementById('facultyExperience').value = f.experienceYears || '';
            document.getElementById('facultyOffice').value = f.officeRoom || '';
            document.getElementById('facultyStatus').value = f.status || 'Active';
            document.getElementById('facultyJoiningDate').value = f.joiningDate || '';
        } else {
            if (titleEl) titleEl.textContent = 'Add Faculty Member';
            document.getElementById('facultyEditId').value = '';
            document.getElementById('facultyStatus').value = 'Active';
            document.getElementById('facultyJoiningDate').value = new Date().toISOString().split('T')[0];
        }

        window.App.openModal('facultyModal');
    },

    handleSaveFaculty() {
        const editId = document.getElementById('facultyEditId').value;
        const facultyId = editId || window.Utils.generateId('FAC');

        const faculty = {
            id: facultyId,
            name: document.getElementById('facultyName').value.trim(),
            email: document.getElementById('facultyEmail').value.trim(),
            phone: document.getElementById('facultyPhone').value.trim(),
            department: document.getElementById('facultyDepartment').value,
            designation: document.getElementById('facultyDesignation').value,
            specialization: document.getElementById('facultySpecialization').value.trim(),
            qualification: document.getElementById('facultyQualification').value.trim(),
            experienceYears: parseInt(document.getElementById('facultyExperience').value) || 0,
            officeRoom: document.getElementById('facultyOffice').value.trim(),
            status: document.getElementById('facultyStatus').value,
            joiningDate: document.getElementById('facultyJoiningDate').value || new Date().toISOString().split('T')[0]
        };

        if (!faculty.name || !faculty.email || !faculty.department) {
            window.Utils.showToast('Please provide Name, Email, and Department', 'warning');
            return;
        }

        window.dataStore.saveFaculty(faculty);
        window.Utils.showToast(editId ? 'Faculty record updated successfully' : 'New faculty member added successfully', 'success');
        window.App.closeModal('facultyModal');
        this.renderTable();
        window.DashboardModule.init();
    },

    confirmDelete(id) {
        const f = window.dataStore.getFacultyById(id);
        if (!f) return;

        if (confirm(`Are you sure you want to delete faculty record for "${f.name}"?`)) {
            window.dataStore.deleteFaculty(id);
            window.Utils.showToast('Faculty record removed', 'success');
            this.renderTable();
            window.DashboardModule.init();
        }
    },

    viewProfile(id) {
        const f = window.dataStore.getFacultyById(id);
        if (!f) return;

        const detailContainer = document.getElementById('facultyDetailContent');
        if (!detailContainer) return;

        const initials = f.name ? f.name.replace('Dr. ', '').replace('Prof. ', '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'FC';

        detailContainer.innerHTML = `
            <div class="detail-header-card" style="background: linear-gradient(135deg, #0ea5e9, #6366f1);">
                <div class="detail-avatar-lg">${initials}</div>
                <div>
                    <div style="font-size: 1.35rem; font-weight: 700;">${window.Utils.escapeHtml(f.name)}</div>
                    <div style="opacity: 0.9; font-size: 0.88rem;">${window.Utils.escapeHtml(f.designation)} • ${window.Utils.escapeHtml(f.department)}</div>
                    <div style="margin-top: 0.4rem;">
                        <span class="badge ${f.status === 'Active' ? 'badge-success' : 'badge-warning'}">${window.Utils.escapeHtml(f.status)}</span>
                        <span class="badge badge-secondary" style="margin-left: 0.4rem; color: #fff; background: rgba(255,255,255,0.2);">ID: ${window.Utils.escapeHtml(f.id)}</span>
                    </div>
                </div>
            </div>

            <div class="detail-info-grid">
                <div class="detail-item">
                    <div class="detail-item-label">Highest Qualification</div>
                    <div class="detail-item-value">${window.Utils.escapeHtml(f.qualification || 'N/A')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">Teaching Experience</div>
                    <div class="detail-item-value">${f.experienceYears ? f.experienceYears + ' Years' : 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">Official Email</div>
                    <div class="detail-item-value">${window.Utils.escapeHtml(f.email)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">Contact Phone</div>
                    <div class="detail-item-value">${window.Utils.escapeHtml(f.phone || 'N/A')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">Office / Chamber</div>
                    <div class="detail-item-value">${window.Utils.escapeHtml(f.officeRoom || 'N/A')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">Date of Joining</div>
                    <div class="detail-item-value">${window.Utils.formatDate(f.joiningDate)}</div>
                </div>
                <div class="detail-item" style="grid-column: 1 / -1;">
                    <div class="detail-item-label">Research & Core Specialization</div>
                    <div class="detail-item-value font-medium text-sm">${window.Utils.escapeHtml(f.specialization || 'Not specified')}</div>
                </div>
            </div>
        `;

        window.App.openModal('facultyDetailModal');
    },

    exportCSV() {
        const faculty = this.getFilteredData();
        const headers = {
            id: 'Faculty ID',
            name: 'Full Name',
            email: 'Email',
            phone: 'Phone',
            department: 'Department',
            designation: 'Designation',
            specialization: 'Specialization',
            qualification: 'Qualification',
            experienceYears: 'Experience (Years)',
            officeRoom: 'Office Room',
            status: 'Status',
            joiningDate: 'Joining Date'
        };
        window.Utils.exportToCSV('College_Faculty_Directory', faculty, headers);
    }
};

window.FacultyModule = FacultyModule;
