/**
 * Data Management & Backup/Restore Module
 * Handles full JSON system state export/import, demo reset, and institution settings.
 */

const DataManagerModule = {
    init() {
        this.bindEvents();
        this.loadSettings();
    },

    bindEvents() {
        const btnExportJson = document.getElementById('btnExportFullJson');
        if (btnExportJson) {
            btnExportJson.addEventListener('click', () => this.exportFullBackup());
        }

        const btnImportJson = document.getElementById('btnImportFullJson');
        const jsonFileInput = document.getElementById('jsonFileInput');
        if (btnImportJson && jsonFileInput) {
            btnImportJson.addEventListener('click', () => jsonFileInput.click());
            jsonFileInput.addEventListener('change', (e) => this.handleJsonFileSelect(e));
        }

        const btnResetDemo = document.getElementById('btnResetDemoData');
        if (btnResetDemo) {
            btnResetDemo.addEventListener('click', () => this.confirmResetDemoData());
        }

        const settingsForm = document.getElementById('institutionSettingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }
    },

    loadSettings() {
        const settings = window.dataStore.getSettings();
        const collegeNameEl = document.getElementById('settingCollegeName');
        const academicYearEl = document.getElementById('settingAcademicYear');
        const termEl = document.getElementById('settingTerm');

        if (collegeNameEl) collegeNameEl.value = settings.collegeName || 'Apex Institute of Technology & Management';
        if (academicYearEl) academicYearEl.value = settings.academicYear || '2023 - 2024';
        if (termEl) termEl.value = settings.currentTerm || 'Spring Semester';

        // Update brand headers in UI
        const brandTitleEls = document.querySelectorAll('.brand-title');
        brandTitleEls.forEach(el => {
            el.textContent = settings.collegeName || 'Apex Institute';
        });
    },

    saveSettings() {
        const settings = window.dataStore.getSettings();
        settings.collegeName = document.getElementById('settingCollegeName').value.trim();
        settings.academicYear = document.getElementById('settingAcademicYear').value.trim();
        settings.currentTerm = document.getElementById('settingTerm').value.trim();

        window.dataStore.saveSettings(settings);
        window.Utils.showToast('Institution settings saved successfully', 'success');
        this.loadSettings();
    },

    exportFullBackup() {
        const jsonString = window.dataStore.exportFullBackupJSON();
        window.Utils.downloadJSON('College_System_Backup', jsonString);
        window.Utils.showToast('Full JSON backup downloaded successfully', 'success');
    },

    handleJsonFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const result = window.dataStore.importFullBackupJSON(content);

            if (result.success) {
                window.Utils.showToast('System data successfully restored from backup!', 'success');
                // Refresh all modules
                window.App.refreshCurrentView();
                window.DashboardModule.init();
            } else {
                window.Utils.showToast('Failed to import backup: ' + result.error, 'danger');
            }
            // Clear input
            event.target.value = '';
        };

        reader.readAsText(file);
    },

    confirmResetDemoData() {
        if (confirm('Are you sure you want to reset all records back to original demo dataset? Any new records will be overwritten.')) {
            window.dataStore.resetToDefaults();
            window.Utils.showToast('System reset to default demo dataset', 'success');
            window.App.refreshCurrentView();
            window.DashboardModule.init();
            this.loadSettings();
        }
    }
};

window.DataManagerModule = DataManagerModule;
