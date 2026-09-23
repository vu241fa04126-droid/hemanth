/**
 * Inventory Management Module
 * Complete CRUD, stock level tracking, restock/issue adjustment, multi-filter, and CSV export.
 */

const InventoryModule = {
    currentSearch: '',
    currentCategory: 'all',
    currentStockStatus: 'all',
    currentCondition: 'all',

    init() {
        this.bindEvents();
        this.renderTable();
    },

    bindEvents() {
        const searchInput = document.getElementById('inventorySearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', window.Utils.debounce((e) => {
                this.currentSearch = e.target.value.trim().toLowerCase();
                this.renderTable();
            }, 200));
        }

        const catFilter = document.getElementById('inventoryCategoryFilter');
        if (catFilter) {
            catFilter.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.renderTable();
            });
        }

        const stockFilter = document.getElementById('inventoryStockStatusFilter');
        if (stockFilter) {
            stockFilter.addEventListener('change', (e) => {
                this.currentStockStatus = e.target.value;
                this.renderTable();
            });
        }

        const condFilter = document.getElementById('inventoryConditionFilter');
        if (condFilter) {
            condFilter.addEventListener('change', (e) => {
                this.currentCondition = e.target.value;
                this.renderTable();
            });
        }

        const btnAdd = document.getElementById('btnAddInventory');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => this.openInventoryModal());
        }

        const btnExport = document.getElementById('btnExportInventory');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.exportCSV());
        }

        const itemForm = document.getElementById('inventoryForm');
        if (itemForm) {
            itemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSaveItem();
            });
        }

        const stockAdjustForm = document.getElementById('stockAdjustForm');
        if (stockAdjustForm) {
            stockAdjustForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleStockAdjustment();
            });
        }
    },

    getFilteredData() {
        let list = window.dataStore.getInventory();

        if (this.currentSearch) {
            list = list.filter(i =>
                (i.name && i.name.toLowerCase().includes(this.currentSearch)) ||
                (i.id && i.id.toLowerCase().includes(this.currentSearch)) ||
                (i.location && i.location.toLowerCase().includes(this.currentSearch)) ||
                (i.category && i.category.toLowerCase().includes(this.currentSearch)) ||
                (i.supplier && i.supplier.toLowerCase().includes(this.currentSearch))
            );
        }

        if (this.currentCategory !== 'all') {
            list = list.filter(i => i.category === this.currentCategory);
        }

        if (this.currentStockStatus !== 'all') {
            list = list.filter(i => i.status === this.currentStockStatus);
        }

        if (this.currentCondition !== 'all') {
            list = list.filter(i => i.condition === this.currentCondition);
        }

        return list;
    },

    renderTable() {
        const tbody = document.getElementById('inventoryTableBody');
        const countEl = document.getElementById('inventoryTotalDisplay');
        if (!tbody) return;

        const filtered = this.getFilteredData();
        if (countEl) countEl.textContent = `Showing ${filtered.length} inventory items`;

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8">
                        <div class="empty-state">
                            <div class="empty-state-icon">📦</div>
                            <div class="empty-state-title">No Inventory Items Found</div>
                            <div class="empty-state-desc">No assets match your search or filter conditions.</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        filtered.forEach(item => {
            const avail = parseInt(item.availableQuantity) || 0;
            const thresh = parseInt(item.minThreshold) || 0;
            const isOut = avail <= 0;
            const isLow = !isOut && avail <= thresh;

            let statusBadge = `<span class="badge badge-success">In Stock</span>`;
            if (isOut) {
                statusBadge = `<span class="badge badge-danger">Out of Stock</span>`;
            } else if (isLow) {
                statusBadge = `<span class="badge badge-warning">Low Stock (≤${thresh})</span>`;
            }

            const conditionBadge = item.condition === 'Good' ? 'badge-success' : item.condition === 'Needs Repair' ? 'badge-danger' : 'badge-warning';

            html += `
                <tr>
                    <td>
                        <div class="font-bold text-primary">${window.Utils.escapeHtml(item.id)}</div>
                        <div class="text-xs text-muted">Audited: ${window.Utils.formatDate(item.lastAudited)}</div>
                    </td>
                    <td>
                        <div class="font-semibold">${window.Utils.escapeHtml(item.name)}</div>
                        <div class="text-xs text-muted">${window.Utils.escapeHtml(item.supplier || 'N/A')}</div>
                    </td>
                    <td>
                        <span class="badge badge-secondary">${window.Utils.escapeHtml(item.category)}</span>
                    </td>
                    <td>
                        <div class="text-xs font-medium">${window.Utils.escapeHtml(item.location)}</div>
                    </td>
                    <td>
                        <div class="font-bold ${isLow || isOut ? 'text-danger' : ''}">
                            ${item.availableQuantity} / ${item.quantity}
                        </div>
                        <div class="text-xs text-muted">Min: ${item.minThreshold}</div>
                    </td>
                    <td>
                        <span class="badge ${conditionBadge}">${window.Utils.escapeHtml(item.condition)}</span>
                    </td>
                    <td>
                        ${statusBadge}
                    </td>
                    <td>
                        <div style="display: flex; gap: 0.35rem;">
                            <button class="btn btn-primary btn-sm" onclick="InventoryModule.openAdjustStockModal('${item.id}')" title="Adjust Stock (Issue / Restock)">⚡ Stock</button>
                            <button class="btn btn-secondary btn-sm" onclick="InventoryModule.openInventoryModal('${item.id}')" title="Edit Item">✏</button>
                            <button class="btn btn-danger btn-sm" onclick="InventoryModule.confirmDelete('${item.id}')" title="Delete Item">🗑</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    },

    openInventoryModal(itemId = null) {
        const form = document.getElementById('inventoryForm');
        const titleEl = document.getElementById('inventoryModalTitle');
        if (!form) return;

        form.reset();

        if (itemId) {
            const item = window.dataStore.getInventoryById(itemId);
            if (!item) return;
            if (titleEl) titleEl.textContent = 'Edit Inventory Item';
            document.getElementById('inventoryEditId').value = item.id;
            document.getElementById('inventoryName').value = item.name || '';
            document.getElementById('inventoryCategory').value = item.category || 'Lab Equipment';
            document.getElementById('inventoryLocation').value = item.location || '';
            document.getElementById('inventoryTotalQty').value = item.quantity || 1;
            document.getElementById('inventoryAvailQty').value = item.availableQuantity !== undefined ? item.availableQuantity : item.quantity;
            document.getElementById('inventoryMinThreshold').value = item.minThreshold || 5;
            document.getElementById('inventoryCondition').value = item.condition || 'Good';
            document.getElementById('inventoryUnitCost').value = item.unitCost || 0;
            document.getElementById('inventorySupplier').value = item.supplier || '';
            document.getElementById('inventoryNotes').value = item.notes || '';
        } else {
            if (titleEl) titleEl.textContent = 'Add Inventory Asset';
            document.getElementById('inventoryEditId').value = '';
            document.getElementById('inventoryTotalQty').value = 10;
            document.getElementById('inventoryAvailQty').value = 10;
            document.getElementById('inventoryMinThreshold').value = 3;
            document.getElementById('inventoryCondition').value = 'Good';
        }

        window.App.openModal('inventoryModal');
    },

    handleSaveItem() {
        const editId = document.getElementById('inventoryEditId').value;
        const itemId = editId || window.Utils.generateId('INV');

        const totalQty = parseInt(document.getElementById('inventoryTotalQty').value) || 0;
        const availQty = parseInt(document.getElementById('inventoryAvailQty').value) || 0;

        const item = {
            id: itemId,
            name: document.getElementById('inventoryName').value.trim(),
            category: document.getElementById('inventoryCategory').value,
            location: document.getElementById('inventoryLocation').value.trim(),
            quantity: totalQty,
            availableQuantity: availQty > totalQty ? totalQty : availQty,
            minThreshold: parseInt(document.getElementById('inventoryMinThreshold').value) || 0,
            condition: document.getElementById('inventoryCondition').value,
            unitCost: parseFloat(document.getElementById('inventoryUnitCost').value) || 0,
            supplier: document.getElementById('inventorySupplier').value.trim(),
            notes: document.getElementById('inventoryNotes').value.trim(),
            lastAudited: new Date().toISOString().split('T')[0]
        };

        if (!item.name || !item.location) {
            window.Utils.showToast('Please specify Item Name and Room/Location', 'warning');
            return;
        }

        window.dataStore.saveInventoryItem(item);
        window.Utils.showToast(editId ? 'Inventory record updated successfully' : 'New inventory asset added', 'success');
        window.App.closeModal('inventoryModal');
        this.renderTable();
        window.DashboardModule.init();
    },

    openAdjustStockModal(id) {
        const item = window.dataStore.getInventoryById(id);
        if (!item) return;

        document.getElementById('adjustItemId').value = item.id;
        document.getElementById('adjustItemNameDisplay').textContent = `${item.name} (${item.id})`;
        document.getElementById('adjustItemCurrentAvail').textContent = `${item.availableQuantity} available (Total: ${item.quantity})`;
        document.getElementById('adjustActionType').value = 'issue';
        document.getElementById('adjustQuantity').value = 1;
        document.getElementById('adjustReason').value = '';

        window.App.openModal('stockAdjustModal');
    },

    handleStockAdjustment() {
        const id = document.getElementById('adjustItemId').value;
        const actionType = document.getElementById('adjustActionType').value;
        const qty = parseInt(document.getElementById('adjustQuantity').value) || 0;
        const reason = document.getElementById('adjustReason').value.trim() || 'Manual stock update';

        if (qty <= 0) {
            window.Utils.showToast('Please enter a valid quantity greater than 0', 'warning');
            return;
        }

        const delta = actionType === 'restock' ? qty : -qty;
        const updated = window.dataStore.adjustStock(id, delta, reason);

        if (updated) {
            window.Utils.showToast(`Stock updated! New available quantity: ${updated.availableQuantity}`, 'success');
            window.App.closeModal('stockAdjustModal');
            this.renderTable();
            window.DashboardModule.init();
        }
    },

    confirmDelete(id) {
        const item = window.dataStore.getInventoryById(id);
        if (!item) return;

        if (confirm(`Are you sure you want to delete inventory asset "${item.name}"?`)) {
            window.dataStore.deleteInventoryItem(id);
            window.Utils.showToast('Item deleted from inventory', 'success');
            this.renderTable();
            window.DashboardModule.init();
        }
    },

    exportCSV() {
        const items = this.getFilteredData();
        const headers = {
            id: 'Item ID',
            name: 'Item Name',
            category: 'Category',
            location: 'Location',
            availableQuantity: 'Available Quantity',
            quantity: 'Total Quantity',
            minThreshold: 'Reorder Threshold',
            condition: 'Condition',
            status: 'Stock Status',
            unitCost: 'Unit Cost',
            supplier: 'Supplier',
            lastAudited: 'Last Audited'
        };
        window.Utils.exportToCSV('College_Inventory_Ledger', items, headers);
    }
};

window.InventoryModule = InventoryModule;
