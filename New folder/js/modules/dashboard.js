/**
 * Dashboard Module
 * Aggregates and renders analytics, charts, alerts, and recent activities.
 */

const DashboardModule = {
    init() {
        this.renderStats();
        this.renderCharts();
        this.renderRecentActivities();
        this.renderLowStockAlerts();
    },

    renderStats() {
        const students = window.dataStore.getStudents();
        const faculty = window.dataStore.getFaculty();
        const inventory = window.dataStore.getInventory();
        const tasks = window.dataStore.getTasks();
        const assignments = window.dataStore.getAssignments();

        const lowStockCount = inventory.filter(i => (parseInt(i.availableQuantity) || 0) <= (parseInt(i.minThreshold) || 0)).length;
        const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
        const activeAssignments = assignments.filter(a => a.status === 'Active').length;

        const updateEl = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        updateEl('statTotalStudents', students.length);
        updateEl('statTotalFaculty', faculty.length);
        updateEl('statTotalInventory', inventory.length);
        updateEl('statLowStock', lowStockCount);
        updateEl('statPendingTasks', pendingTasks);
        updateEl('statActiveAssignments', activeAssignments);

        // Update sidebar badges as well
        updateEl('badgeStudentCount', students.length);
        updateEl('badgeFacultyCount', faculty.length);
        updateEl('badgeInventoryCount', inventory.length);
        updateEl('badgeTaskCount', pendingTasks);
        updateEl('badgeAssignmentCount', activeAssignments);
    },

    renderCharts() {
        const students = window.dataStore.getStudents();
        const inventory = window.dataStore.getInventory();

        // 1. Students per Department
        const deptCounts = {};
        students.forEach(s => {
            const d = s.department || 'Other';
            deptCounts[d] = (deptCounts[d] || 0) + 1;
        });

        const barLabels = Object.keys(deptCounts);
        const barValues = Object.values(deptCounts);

        window.SimpleCanvasCharts.renderBarChart('deptStudentsChart', {
            labels: barLabels,
            values: barValues
        }, {
            colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
        });

        // 2. Inventory Status Breakdown
        const inStock = inventory.filter(i => i.status === 'In Stock').length;
        const lowStock = inventory.filter(i => i.status === 'Low Stock').length;
        const outOfStock = inventory.filter(i => i.status === 'Out of Stock').length;

        window.SimpleCanvasCharts.renderDoughnutChart('inventoryStatusChart', {
            labels: ['In Stock', 'Low Stock', 'Out of Stock'],
            values: [inStock, lowStock, outOfStock]
        }, {
            colors: ['#10b981', '#f59e0b', '#ef4444'],
            legendContainerId: 'inventoryChartLegend',
            centerLabel: 'Total Items'
        });
    },

    renderRecentActivities() {
        const container = document.getElementById('recentActivityFeed');
        if (!container) return;

        const activities = window.dataStore.getActivities(6);
        if (!activities || activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-title">No Recent Activities</div>
                    <div class="empty-state-desc">System actions will automatically be tracked here.</div>
                </div>
            `;
            return;
        }

        let html = '';
        activities.forEach(act => {
            const timeFormatted = window.Utils.timeAgo(act.timestamp);
            html += `
                <div class="activity-item">
                    <div class="activity-dot ${act.color || 'primary'}">
                        <span>●</span>
                    </div>
                    <div class="activity-body">
                        <div class="activity-title">${window.Utils.escapeHtml(act.title)}</div>
                        <div class="activity-meta">
                            <span class="badge badge-secondary text-xs">${window.Utils.escapeHtml(act.module)}</span>
                            <span>•</span>
                            <span>${timeFormatted}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    renderLowStockAlerts() {
        const container = document.getElementById('dashboardStockAlerts');
        if (!container) return;

        const inventory = window.dataStore.getInventory();
        const lowStockItems = inventory.filter(i => (parseInt(i.availableQuantity) || 0) <= (parseInt(i.minThreshold) || 0));

        if (lowStockItems.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 1.5rem;">
                    <div class="text-success font-semibold">✓ All Inventory Items Healthy</div>
                    <div class="empty-state-desc text-xs">No items currently below reorder thresholds.</div>
                </div>
            `;
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 0.6rem;">';
        lowStockItems.slice(0, 4).forEach(item => {
            const isOut = item.availableQuantity <= 0;
            html += `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.8rem; background-color: var(--bg-tertiary); border-radius: var(--radius-md); border-left: 3px solid ${isOut ? 'var(--danger)' : 'var(--warning)'};">
                    <div>
                        <div class="font-semibold text-sm">${window.Utils.escapeHtml(item.name)}</div>
                        <div class="text-xs text-muted">Loc: ${window.Utils.escapeHtml(item.location)} | Min: ${item.minThreshold}</div>
                    </div>
                    <div style="text-align: right;">
                        <span class="badge ${isOut ? 'badge-danger' : 'badge-warning'}">${item.availableQuantity} left</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    }
};

window.DashboardModule = DashboardModule;
