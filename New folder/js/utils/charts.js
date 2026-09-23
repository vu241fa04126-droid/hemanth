/**
 * Native HTML5 Canvas Chart Engine
 * Lightweight, zero external dependencies, responsive, supporting Light & Dark themes.
 */

class SimpleCanvasCharts {
    /**
     * Renders a modern Vertical Bar Chart
     */
    static renderBarChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = (rect.width || 400) * dpr;
        canvas.height = (rect.height || 260) * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width || 400;
        const height = rect.height || 260;

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

        ctx.clearRect(0, 0, width, height);

        if (!data || !data.labels || data.labels.length === 0) {
            ctx.fillStyle = textColor;
            ctx.font = '14px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No data available to display', width / 2, height / 2);
            return;
        }

        const padding = { top: 30, right: 20, bottom: 45, left: 45 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const maxVal = Math.max(...data.values, 5);
        const yAxisMax = Math.ceil(maxVal * 1.25);

        // Draw horizontal grid lines & Y labels
        const gridSteps = 4;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.font = '11px system-ui, sans-serif';

        for (let i = 0; i <= gridSteps; i++) {
            const yVal = Math.round((yAxisMax / gridSteps) * i);
            const yPos = padding.top + chartHeight - (chartHeight / gridSteps) * i;

            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding.left, yPos);
            ctx.lineTo(width - padding.right, yPos);
            ctx.stroke();

            ctx.fillStyle = textColor;
            ctx.fillText(yVal.toString(), padding.left - 8, yPos);
        }

        // Draw Bars
        const barCount = data.labels.length;
        const gap = 14;
        const totalBarWidth = chartWidth - gap * (barCount + 1);
        const barWidth = Math.max(16, Math.min(48, totalBarWidth / barCount));
        const effectiveGap = (chartWidth - barWidth * barCount) / (barCount + 1);

        const colors = options.colors || ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

        data.labels.forEach((label, idx) => {
            const val = data.values[idx] || 0;
            const barHeight = (val / yAxisMax) * chartHeight;
            const x = padding.left + effectiveGap + idx * (barWidth + effectiveGap);
            const y = padding.top + chartHeight - barHeight;

            // Bar Gradient
            const color = colors[idx % colors.length];
            const gradient = ctx.createLinearGradient(0, y, 0, padding.top + chartHeight);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, color + 'aa');

            ctx.fillStyle = gradient;
            // Draw Rounded Top Bar
            const radius = 4;
            ctx.beginPath();
            ctx.moveTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.lineTo(x + barWidth - radius, y);
            ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
            ctx.lineTo(x + barWidth, padding.top + chartHeight);
            ctx.lineTo(x, padding.top + chartHeight);
            ctx.closePath();
            ctx.fill();

            // Value badge on top of bar
            ctx.fillStyle = isDark ? '#f8fafc' : '#1e293b';
            ctx.font = 'bold 11px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(val.toString(), x + barWidth / 2, Math.max(padding.top + 10, y - 6));

            // X-axis label
            ctx.fillStyle = textColor;
            ctx.font = '11px system-ui, sans-serif';
            ctx.textAlign = 'center';
            const shortLabel = label.length > 12 ? label.substring(0, 10) + '..' : label;
            ctx.fillText(shortLabel, x + barWidth / 2, height - padding.bottom + 18);
        });
    }

    /**
     * Renders a Doughnut / Pie Chart
     */
    static renderDoughnutChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = (rect.width || 300) * dpr;
        canvas.height = (rect.height || 260) * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width || 300;
        const height = rect.height || 260;

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#94a3b8' : '#64748b';

        ctx.clearRect(0, 0, width, height);

        const total = (data.values || []).reduce((acc, curr) => acc + curr, 0);

        if (!data || !data.labels || data.labels.length === 0 || total === 0) {
            ctx.fillStyle = textColor;
            ctx.font = '14px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', width / 2, height / 2);
            return;
        }

        const centerX = width / 2;
        const centerY = height / 2 - 15;
        const outerRadius = Math.min(centerX, centerY) - 15;
        const innerRadius = outerRadius * 0.62; // Doughnut hole

        const colors = options.colors || ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#3b82f6'];

        let currentAngle = -0.5 * Math.PI;

        data.values.forEach((val, idx) => {
            if (val <= 0) return;
            const sliceAngle = (val / total) * 2 * Math.PI;
            const color = colors[idx % colors.length];

            ctx.beginPath();
            ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            // Segment boundary divider
            ctx.strokeStyle = isDark ? '#1e293b' : '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            currentAngle += sliceAngle;
        });

        // Center total counter
        ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(total.toString(), centerX, centerY - 4);

        ctx.fillStyle = textColor;
        ctx.font = '10px system-ui, sans-serif';
        ctx.fillText(options.centerLabel || 'Total Items', centerX, centerY + 14);

        // Draw Legend below chart
        const legendContainer = document.getElementById(options.legendContainerId);
        if (legendContainer) {
            let legendHtml = '<div class="chart-legend-grid">';
            data.labels.forEach((label, idx) => {
                const color = colors[idx % colors.length];
                const count = data.values[idx] || 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                legendHtml += `
                    <div class="legend-item">
                        <span class="legend-dot" style="background-color: ${color}"></span>
                        <span class="legend-label">${Utils.escapeHtml(label)}:</span>
                        <span class="legend-value font-semibold">${count} (${pct}%)</span>
                    </div>
                `;
            });
            legendHtml += '</div>';
            legendContainer.innerHTML = legendHtml;
        }
    }
}

window.SimpleCanvasCharts = SimpleCanvasCharts;
