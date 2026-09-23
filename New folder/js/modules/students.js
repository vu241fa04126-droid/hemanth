/**
 * Student Management Module
 * Complete CRUD, search, multi-filter, profile modal, and CSV export.
 */

const StudentsModule = {
    currentSearch: '',
    currentDept: 'all',
    currentYear: 'all',
    currentStatus: 'all',
    currentPage: 1,
    pageSize: 10,

    init() {
        this.bindEvents();
        this.renderTable();
    },

    bindEvents() {
        const searchInput = document.getElementById('studentSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', window.Utils.debounce((e) => {
                this.currentSearch = e.target.value.trim().toLowerCase();
                this.currentPage = 1;
                this.renderTable();
            }, 200));
        }

        const deptFilter = document.getElementById('studentDeptFilter');
        if (deptFilter) {
            deptFilter.addEventListener('change', (e) => {
                this.currentDept = e.target.value;
                this.currentPage = 1;
                this.renderTable();
            });
        }

        const yearFilter = document.getElementById('studentYearFilter');
        if (yearFilter) {
            yearFilter.addEventListener('change', (e) => {
                this.currentYear = e.target.value;
                this.currentPage = 1;
                this.renderTable();
            });
        }

        const statusFilter = document.getElementById('studentStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentStatus = e.target.value;
                this.currentPage = 1;
                this.renderTable();
            });
        }

        const btnAdd = document.getElementById('btnAddStudent');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => this.openStudentModal());
        }

        const btnExport = document.getElementById('btnExportStudents');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.exportCSV());
        }

        const studentForm = document.getElementById('studentForm');
        if (studentForm) {
            studentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSaveStudent();
            });
        }
    },

    getFilteredData() {
        let list = window.dataStore.getStudents();

        if (this.currentSearch) {
            list = list.filter(s =>
                (s.name && s.name.toLowerCase().includes(this.currentSearch)) ||
                (s.rollNo && s.rollNo.toLowerCase().includes(this.currentSearch)) ||
                (s.email && s.email.toLowerCase().includes(this.currentSearch)) ||
                (s.department && s.department.toLowerCase().includes(this.currentSearch))
            );
        }

        if (this.currentDept !== 'all') {
            list = list.filter(s => s.department === this.currentDept);
        }

        if (this.currentYear !== 'all') {
            list = list.filter(s => s.year === this.currentYear);
        }

        if (this.currentStatus !== 'all') {
            list = list.filter(s => s.status === this.currentStatus);
        }

        return list;
    },

    renderTable() {
        const tbody = document.getElementById('studentsTableBody');
        const countEl = document.getElementById('studentTotalDisplay');
        if (!tbody) return;

        const filtered = this.getFilteredData();
        if (countEl) countEl.textContent = `Showing ${filtered.length} students`;

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <div class="empty-state-icon">👨‍🎓</div>
                            <div class="empty-state-title">No Students Found</div>
                            <div class="empty-state-desc">Try adjusting your search criteria or add a new student.</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        filtered.forEach(s => {
            const statusClass = s.status === 'Active' ? 'badge-success' : s.status === 'On Leave' ? 'badge-warning' : 'badge-secondary';
            html += `
                <tr>
                    <td>
                        <div class="font-bold text-primary">${window.Utils.escapeHtml(s.rollNo)}</div>
                        <div class="text-xs text-muted">${window.Utils.escapeHtml(s.id)}</div>
                    </td>
                    <td>
                        <div class="font-semibold">${window.Utils.escapeHtml(s.name)}</div>
                        <div class="text-xs text-muted">${window.Utils.escapeHtml(s.email)}</div>
                    </td>
                    <td>
                        <span class="badge badge-primary">${window.Utils.escapeHtml(s.department)}</span>
                    </td>
                    <td>
                        <div>${window.Utils.escapeHtml(s.year)}</div>
                        <div class="text-xs text-muted">${window.Utils.escapeHtml(s.semester || '')}</div>
                    </td>
                    <td>
                        <div class="font-bold ${s.cgpa >= 8.5 ? 'text-success' : ''}">${s.cgpa ? Number(s.cgpa).toFixed(2) : 'N/A'}</div>
                    </td>
                    <td>
                        <span class="badge ${statusClass}">${window.Utils.escapeHtml(s.status)}</span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 0.35rem;">
                            <button class="btn btn-secondary btn-sm" onclick="StudentsModule.viewProfile('${s.id}')" title="View Profile">👁</button>
                            <button class="btn btn-secondary btn-sm" onclick="StudentsModule.openStudentModal('${s.id}')" title="Edit Student">✏</button>
                            <button class="btn btn-danger btn-sm" onclick="StudentsModule.confirmDelete('${s.id}')" title="Delete Student">🗑</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    },

    openStudentModal(studentId = null) {
        const form = document.getElementById('studentForm');
        const titleEl = document.getElementById('studentModalTitle');
        if (!form) return;

        form.reset();

        if (studentId) {
            const s = window.dataStore.getStudentById(studentId);
            if (!s) return;
            if (titleEl) titleEl.textContent = 'Edit Student Record';
            document.getElementById('studentEditId').value = s.id;
            document.getElementById('studentRollNo').value = s.rollNo || '';
            document.getElementById('studentName').value = s.name || '';
            document.getElementById('studentEmail').value = s.email || '';
            document.getElementById('studentPhone').value = s.phone || '';
            document.getElementById('studentDepartment').value = s.department || 'Computer Science';
            document.getElementById('studentYear').value = s.year || '1st Year';
            document.getElementById('studentSemester').value = s.semester || '1st Semester';
            document.getElementById('studentCgpa').value = s.cgpa || '';
            document.getElementById('studentStatus').value = s.status || 'Active';
            document.getElementById('studentGender').value = s.gender || 'Male';
            document.getElementById('studentAddress').value = s.address || '';
            document.getElementById('studentEmergency').value = s.emergencyContact || '';
        } else {
            if (titleEl) titleEl.textContent = 'Enroll New Student';
            document.getElementById('studentEditId').value = '';
            document.getElementById('studentRollNo').value = 'CS' + Math.floor(2100 + Math.random() * 800);
            document.getElementById('studentStatus').value = 'Active';
        }

        window.App.openModal('studentModal');
    },

    handleSaveStudent() {
        const editId = document.getElementById('studentEditId').value;
        const studentId = editId || window.Utils.generateId('STU');

        const student = {
            id: studentId,
            rollNo: document.getElementById('studentRollNo').value.trim(),
            name: document.getElementById('studentName').value.trim(),
            email: document.getElementById('studentEmail').value.trim(),
            phone: document.getElementById('studentPhone').value.trim(),
            department: document.getElementById('studentDepartment').value,
            year: document.getElementById('studentYear').value,
            semester: document.getElementById('studentSemester').value,
            cgpa: parseFloat(document.getElementById('studentCgpa').value) || 0.0,
            status: document.getElementById('studentStatus').value,
            gender: document.getElementById('studentGender').value,
            address: document.getElementById('studentAddress').value.trim(),
            emergencyContact: document.getElementById('studentEmergency').value.trim(),
            enrollmentDate: editId ? (window.dataStore.getStudentById(editId)?.enrollmentDate || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]
        };

        if (!student.name || !student.rollNo || !student.email) {
            window.Utils.showToast('Please fill in required fields (Name, Roll No, Email)', 'warning');
            return;
        }

        window.dataStore.saveStudent(student);
        window.Utils.showToast(editId ? 'Student record updated successfully' : 'New student enrolled successfully', 'success');
        window.App.closeModal('studentModal');
        this.renderTable();
        window.DashboardModule.init();
    },

    confirmDelete(id) {
        const student = window.dataStore.getStudentById(id);
        if (!student) return;

        if (confirm(`Are you sure you want to remove student "${student.name}" (${student.rollNo})?`)) {
            window.dataStore.deleteStudent(id);
            window.Utils.showToast('Student record deleted', 'success');
            this.renderTable();
            window.DashboardModule.init();
        }
    },

    viewProfile(id) {
        const s = window.dataStore.getStudentById(id);
        if (!s) return;

        const detailContainer = document.getElementById('studentDetailContent');
        if (!detailContainer) return;

        const initials = s.name ? s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST';

        detailContainer.innerHTML = `
            <div class="detail-header-card">
                <div class="detail-avatar-lg">${initials}</div>
                <div>
                    <div style="font-size: 1.35rem; font-weight: 700;">${window.Utils.escapeHtml(s.name)}</div>
                    <div style="opacity: 0.9; font-size: 0.88rem;">Roll No: ${window.Utils.escapeHtml(s.rollNo)} | ID: ${window.Utils.escapeHtml(s.id)}</div>
                    <div style="margin-top: 0.4rem;">
                        <span class="badge ${s.status === 'Active' ? 'badge-success' : 'badge-warning'}">${window.Utils.escapeHtml(s.status)}</span>
                        <span class="badge badge-secondary" style="margin-left: 0.4rem; color: #fff; background: rgba(255,255,255,0.2);">${window.Utils.escapeHtml(s.department)}</span>
                    </div>
                </div>
            </div>

            <div class="detail-info-grid">
                <div class="detail-item">
                    <div class="detail-item-label">Academic Standing</div>
                    <div class="detail-item-value">${window.Utils.escapeHtml(s.year)} • ${window.Utils.escapeHtml(s.semester || 'N/A')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">Cumulative GPA</div>
                    <div class="detail-item-value font-bold ${s.cgpa >= 8.5 ? 'text-success' : ''}">${s.cgpa ? Number(s.cgpa).toFixed(2) : 'N/A'} / 10.0</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">Contact Email</div>
                    <div class="detail-item-value">${window.Utils.escapeHtml(s.email)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">Phone Number</div>
                    <div class="detail-item-value">${window.Utils.escapeHtml(s.phone || 'N/A')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">Enrollment Date</div>
                    <div class="detail-item-value">${window.Utils.formatDate(s.enrollmentDate)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">Emergency Contact</div>
                    <div class="detail-item-value">${window.Utils.escapeHtml(s.emergencyContact || 'N/A')}</div>
                </div>
                <div class="detail-item" style="grid-column: 1 / -1;">
                    <div class="detail-item-label">Residential Address</div>
                    <div class="detail-item-value font-regular text-sm">${window.Utils.escapeHtml(s.address || 'Not specified')}</div>
                </div>
            </div>
        `;

        window.App.openModal('studentDetailModal');
    },

    exportCSV() {
        const students = this.getFilteredData();
        const headers = {
            rollNo: 'Roll No',
            id: 'Student ID',
            name: 'Full Name',
            email: 'Email',
            phone: 'Phone',
            department: 'Department',
            year: 'Year',
            semester: 'Semester',
            cgpa: 'CGPA',
            status: 'Status',
            enrollmentDate: 'Enrollment Date'
        };
        window.Utils.exportToCSV('College_Students', students, headers);
    }
};

window.StudentsModule = StudentsModule;
