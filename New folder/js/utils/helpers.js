/**
 * Utility functions for formatting, ID generation, sanitization, CSV exports, and toast alerts.
 */

const Utils = {
    /**
     * Generates standard prefixed unique IDs (e.g., STU-2024-839)
     */
    generateId(prefix = 'ID') {
        const year = new Date().getFullYear();
        const rand = Math.floor(100 + Math.random() * 900);
        return `${prefix}-${year}-${rand}`;
    },

    /**
     * Formats ISO date string to clean human readable format (e.g. Mar 05, 2024)
     */
    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit'
            });
        } catch (e) {
            return dateStr;
        }
    },

    /**
     * Relative time ago formatter (e.g. 5 mins ago, 2 hours ago, yesterday)
     */
    timeAgo(isoString) {
        if (!isoString) return '';
        const now = new Date();
        const past = new Date(isoString);
        const diffMs = now - past;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHours = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSec < 60) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 30) return `${diffDays}d ago`;
        return Utils.formatDate(isoString);
    },

    /**
     * Formats Indian Rupee / Currency number
     */
    formatCurrency(amount) {
        if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Escapes HTML string to prevent XSS injection
     */
    escapeHtml(str) {
        if (!str && str !== 0) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    /**
     * Converts an array of objects to CSV format and triggers browser download
     */
    exportToCSV(filename, rows, headers) {
        if (!rows || !rows.length) {
            Utils.showToast('No data available to export', 'warning');
            return;
        }

        const keys = headers ? Object.keys(headers) : Object.keys(rows[0]);
        const titles = headers ? Object.values(headers) : keys;

        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += titles.map(t => `"${String(t).replace(/"/g, '""')}"`).join(',') + '\r\n';

        rows.forEach(row => {
            const line = keys.map(k => {
                const val = row[k] !== undefined && row[k] !== null ? row[k] : '';
                return `"${String(val).replace(/"/g, '""')}"`;
            }).join(',');
            csvContent += line + '\r\n';
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Utils.showToast(`Exported ${rows.length} records to CSV`, 'success');
    },

    /**
     * Triggers file download for JSON payload
     */
    downloadJSON(filename, jsonString) {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * UI Toast Notification Dispatcher
     */
    showToast(message, type = 'info', duration = 3500) {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast-card toast-${type} animate-slide-in`;

        const iconMap = {
            success: '✓',
            danger: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <div class="toast-icon">${iconMap[type] || 'ℹ'}</div>
            <div class="toast-content">${Utils.escapeHtml(message)}</div>
            <button class="toast-close" aria-label="Close">&times;</button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.onclick = () => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        };

        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('fade-out');
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    },

    /**
     * Debounce helper for instant search input filters
     */
    debounce(fn, delay = 250) {
        let timer = null;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }
};

window.Utils = Utils;
