class StockManagementSystem {
    constructor() {
        this.products = new Map();
        this.salesHistory = [];
        this.bankTransfers = [];
        this.totalSales = 0;
        this.initialize();
    }

    initialize() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateUI();
    }

    // Product Management
    addProduct(name, price, quantity) {
        try {
            // Input validation
            if (!name || !price || !quantity) {
                throw new Error('All fields are required');
            }

            const parsedPrice = parseFloat(price);
            const parsedQuantity = parseInt(quantity);

            if (isNaN(parsedPrice) || parsedPrice <= 0) {
                throw new Error('Price must be a positive number');
            }

            if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
                throw new Error('Quantity must be a positive number');
            }

            // Add or update product
            if (this.products.has(name)) {
                const existingProduct = this.products.get(name);
                existingProduct.quantity += parsedQuantity;
                this.products.set(name, existingProduct);
                return { success: true, message: `Updated existing product "${name}". Added ${parsedQuantity} units.` };
            } else {
                this.products.set(name, {
                    price: parsedPrice,
                    quantity: parsedQuantity,
                    sales: 0
                });
                return { success: true, message: `New product "${name}" added successfully!` };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Sales Management
    recordSale(name, quantity, paymentMethod) {
        try {
            if (!this.products.has(name)) {
                throw new Error('Product not found');
            }

            const product = this.products.get(name);
            const parsedQuantity = parseInt(quantity);

            if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
                throw new Error('Invalid quantity');
            }

            if (product.quantity < parsedQuantity) {
                throw new Error('Insufficient stock');
            }

            // Process sale
            const saleAmount = product.price * parsedQuantity;
            const sale = {
                id: Date.now(),
                date: new Date().toISOString(),
                product: name,
                quantity: parsedQuantity,
                amount: saleAmount,
                paymentMethod: paymentMethod,
                unitPrice: product.price // Store the unit price at time of sale
            };

            // Update product and sales history
            product.quantity -= parsedQuantity;
            product.sales += parsedQuantity;
            this.products.set(name, product);
            this.salesHistory.push(sale);
            this.totalSales += saleAmount;

            return { success: true, message: 'Sale recorded successfully!' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Stock Management
    getStock(name) {
        return this.products.has(name) ? this.products.get(name).quantity : null;
    }

    // Bank Transfer Management
    recordBankTransfer(amount, date, description) {
        try {
            const transfer = {
                id: Date.now(),
                date: date,
                amount: parseFloat(amount),
                description: description
            };

            this.bankTransfers.push(transfer);
            this.saveToStorage();
            this.updateTransfersTable();
            return { success: true, message: 'Bank transfer recorded successfully!' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Data Persistence
    saveToStorage() {
        const data = {
            products: Array.from(this.products.entries()),
            salesHistory: this.salesHistory,
            bankTransfers: this.bankTransfers,
            totalSales: this.totalSales
        };
        localStorage.setItem('stockData', JSON.stringify(data));
    }

    loadFromStorage() {
        const data = localStorage.getItem('stockData');
        if (data) {
            const parsed = JSON.parse(data);
            this.products = new Map(parsed.products);
            this.salesHistory = parsed.salesHistory.map(sale => ({
                ...sale,
                id: parseInt(sale.id)
            }));
            this.bankTransfers = parsed.bankTransfers || [];
            this.totalSales = parsed.totalSales;
        }
    }

    // UI Updates
    updateProductTable() {
        const tbody = document.getElementById('productTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        for (const [name, details] of this.products) {
            const row = document.createElement('tr');
            row.className = 'stock-product-item';
            row.innerHTML = `
                <td>${name}</td>
                <td>₵${details.price.toFixed(2)}</td>
                <td>${details.quantity}</td>
                <td>${details.sales}</td>
                <td>
                    <button class="btn-delete-product" data-product-name="${name}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        }

        // Add event listeners to delete buttons
        document.querySelectorAll('.btn-delete-product').forEach(button => {
            button.addEventListener('click', (e) => {
                const productName = e.currentTarget.dataset.productName;
                this.createDeleteDialog(productName);
            });
        });

        const totalSalesElement = document.getElementById('totalSalesAmount');
        if (totalSalesElement) {
            totalSalesElement.textContent = this.totalSales.toFixed(2);
        }
    }

    updateSalesHistoryTable() {
        const tbody = document.getElementById('salesHistoryTableBody');
        if (!tbody) return;

        const filteredSales = this.getFilteredSales();
        tbody.innerHTML = '';

        if (filteredSales.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="7" style="text-align: center;">No sales records found</td>`;
            tbody.appendChild(row);
            return;
        }

        filteredSales.forEach(sale => {
            const row = document.createElement('tr');
            const date = new Date(sale.date);
            const unitPrice = sale.amount / sale.quantity;
            
            row.innerHTML = `
                <td>${date.toLocaleDateString()}</td>
                <td>${sale.product}</td>
                <td>${sale.quantity}</td>
                <td>₵${unitPrice.toFixed(2)}</td>
                <td>₵${sale.amount.toFixed(2)}</td>
                <td>${sale.paymentMethod.toUpperCase()}</td>
                <td>
                    <button class="delete-sale-btn" data-sale-id="${sale.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-sale-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const saleId = e.currentTarget.dataset.saleId;
                this.createDeleteSaleDialog(saleId);
            });
        });
    }

    getFilteredSales() {
        const monthFilter = document.getElementById('filterSalesMonth')?.value;
        const productFilter = document.getElementById('filterSalesProduct')?.value.toLowerCase();
        const paymentMethodFilter = document.getElementById('filterPaymentMethod')?.value;

        return this.salesHistory.filter(sale => {
            const saleDate = new Date(sale.date);
            const saleMonth = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
            
            const matchesMonth = !monthFilter || saleMonth === monthFilter;
            const matchesProduct = !productFilter || sale.product.toLowerCase().includes(productFilter);
            const matchesPaymentMethod = !paymentMethodFilter || sale.paymentMethod === paymentMethodFilter;
            
            return matchesMonth && matchesProduct && matchesPaymentMethod;
        });
    }

    updateTransfersTable() {
        const tbody = document.getElementById('transfersTableBody');
        if (!tbody) return;

        const filteredTransfers = this.getFilteredTransfers();
        tbody.innerHTML = '';

        if (filteredTransfers.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4" style="text-align: center;">No transfer records found</td>`;
            tbody.appendChild(row);
            return;
        }

        let totalAmount = 0;
        filteredTransfers.forEach(transfer => {
            const row = document.createElement('tr');
            const date = new Date(transfer.date);
            
            row.innerHTML = `
                <td>${date.toLocaleDateString()}</td>
                <td>${transfer.description}</td>
                <td>₵${transfer.amount.toFixed(2)}</td>
                <td>
                    <button class="delete-transfer-btn" data-transfer-id="${transfer.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
            totalAmount += transfer.amount;
        });

        // Update total amount
        const totalAmountElement = document.getElementById('totalTransfersAmount');
        if (totalAmountElement) {
            totalAmountElement.textContent = `₵${totalAmount.toFixed(2)}`;
        }

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-transfer-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const transferId = e.currentTarget.dataset.transferId;
                this.createDeleteTransferDialog(transferId);
            });
        });
    }

    getFilteredTransfers() {
        const monthFilter = document.getElementById('filterTransferMonth')?.value;
        const yearFilter = document.getElementById('filterTransferYear')?.value;

        return this.bankTransfers.filter(transfer => {
            const transferDate = new Date(transfer.date);
            const transferMonth = `${transferDate.getFullYear()}-${String(transferDate.getMonth() + 1).padStart(2, '0')}`;
            const transferYear = transferDate.getFullYear().toString();
            
            const matchesMonth = !monthFilter || transferMonth === monthFilter;
            const matchesYear = !yearFilter || transferYear === yearFilter;
            
            return matchesMonth && matchesYear;
        });
    }

    updateUI() {
        this.updateProductTable();
        this.updateSalesHistoryTable();
        this.updateTransfersTable();
    }

    // Event Handlers
    setupEventListeners() {
        // Add Product Form
        const addProductForm = document.getElementById('addProductForm');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('productName').value.trim();
                const price = document.getElementById('productPrice').value;
                const quantity = document.getElementById('productQuantity').value;
                
                const result = this.addProduct(name, price, quantity);
                alert(result.message);
                
                if (result.success) {
                    addProductForm.reset();
                    this.saveToStorage();
                    this.updateUI();
                }
            });
        }

        // Record Sale Form
        const recordSaleForm = document.getElementById('recordSaleForm');
        if (recordSaleForm) {
            recordSaleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('saleProduct').value;
                const quantity = document.getElementById('saleQuantity').value;
                const paymentMethod = document.getElementById('paymentMethod').value;
                
                const result = this.recordSale(name, quantity, paymentMethod);
                alert(result.message);
                
                if (result.success) {
                    recordSaleForm.reset();
                    this.saveToStorage();
                    this.updateUI();
                }
            });
        }

        // Stock Check
        const searchProduct = document.getElementById('searchProduct');
        if (searchProduct) {
            searchProduct.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const name = searchProduct.value;
                    const stock = this.getStock(name);
                    const resultBox = document.getElementById('stockResult');
                    
                    if (stock === null) {
                        resultBox.textContent = `Product "${name}" not found!`;
                    } else {
                        resultBox.textContent = `Available stock for "${name}": ${stock}`;
                    }
                }
            });
        }

        // Sales History Filters
        const filterElements = [
            'filterSalesMonth',
            'filterSalesProduct',
            'filterPaymentMethod'
        ];

        filterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.updateSalesHistoryTable());
            }
        });

        // Bank Transfer Form
        const bankTransferForm = document.getElementById('bankTransferForm');
        if (bankTransferForm) {
            bankTransferForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const amount = document.getElementById('transferAmount').value;
                const date = document.getElementById('transferDate').value;
                const description = document.getElementById('transferDescription').value;
                
                const result = this.recordBankTransfer(amount, date, description);
                alert(result.message);
                
                if (result.success) {
                    bankTransferForm.reset();
                    this.updateTransfersTable();
                }
            });

            // Set default date to today
            const dateInput = document.getElementById('transferDate');
            if (dateInput) {
                const today = new Date().toISOString().split('T')[0];
                dateInput.value = today;
            }

            // Populate month and year filters
            this.populateDateFilters();
        }

        // Transfer Filters
        const transferFilterElements = ['filterTransferMonth', 'filterTransferYear'];
        transferFilterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.updateTransfersTable());
            }
        });
    }

    populateDateFilters() {
        const monthSelect = document.getElementById('filterTransferMonth');
        const yearSelect = document.getElementById('filterTransferYear');
        
        if (!monthSelect || !yearSelect) return;

        // Get unique years from transfers
        const years = new Set(this.bankTransfers.map(transfer => 
            new Date(transfer.date).getFullYear()
        ));
        
        // Add current year if no transfers exist
        if (years.size === 0) {
            years.add(new Date().getFullYear());
        }

        // Populate year filter
        yearSelect.innerHTML = '<option value="">All Years</option>';
        Array.from(years).sort().forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        // Populate month filter
        monthSelect.innerHTML = '<option value="">All Months</option>';
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            const month = String(i).padStart(2, '0');
            option.value = `${yearSelect.value}-${month}`;
            option.textContent = new Date(2000, i - 1).toLocaleString('default', { month: 'long' });
            monthSelect.appendChild(option);
        }
    }

    // Delete Product Dialog
    createDeleteDialog(productName) {
        const dialog = document.createElement('div');
        dialog.className = 'delete-dialog';
        dialog.innerHTML = `
            <div class="delete-dialog-content">
                <h3>Delete Product</h3>
                <p>Are you sure you want to delete "${productName}"? This action cannot be undone.</p>
                <div class="delete-dialog-actions">
                    <button class="btn-cancel">Cancel</button>
                    <button class="btn-confirm-delete">Delete</button>
                </div>
            </div>
        `;

        // Add event listeners
        dialog.querySelector('.btn-cancel').addEventListener('click', () => {
            dialog.remove();
        });

        dialog.querySelector('.btn-confirm-delete').addEventListener('click', () => {
            this.deleteProduct(productName);
            dialog.remove();
        });

        // Close dialog when clicking outside
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });

        document.body.appendChild(dialog);
    }

    // Delete Product
    deleteProduct(name) {
        if (!this.products.has(name)) {
            return { success: false, message: 'Product not found' };
        }

        this.products.delete(name);
        this.saveToStorage();
        this.updateUI();
        return { success: true, message: `Product "${name}" deleted successfully!` };
    }

    updateSalesHistory() {
        const salesHistory = document.getElementById('sales-history');
        if (!salesHistory) return;

        salesHistory.innerHTML = '';
        this.salesHistory.forEach(sale => {
            const saleItem = document.createElement('div');
            saleItem.className = 'sale-item';
            saleItem.innerHTML = `
                <div class="sale-info">
                    <span class="sale-product">${sale.productName}</span>
                    <span class="sale-quantity">${sale.quantity} sold</span>
                    <span class="sale-amount">$${sale.amount.toFixed(2)}</span>
                    <span class="sale-date">${new Date(sale.date).toLocaleString()}</span>
                </div>
                <button class="delete-sale-btn" data-sale-id="${sale.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            salesHistory.appendChild(saleItem);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-sale-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const saleId = e.currentTarget.dataset.saleId;
                this.createDeleteSaleDialog(saleId);
            });
        });
    }

    createDeleteSaleDialog(saleId) {
        const dialog = document.createElement('div');
        dialog.className = 'delete-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Delete Sale Record</h3>
                <p>Are you sure you want to delete this sale record? This action cannot be undone.</p>
                <div class="dialog-buttons">
                    <button class="cancel-btn">Cancel</button>
                    <button class="delete-btn">Delete</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Add event listeners
        dialog.querySelector('.cancel-btn').addEventListener('click', () => {
            dialog.remove();
        });

        dialog.querySelector('.delete-btn').addEventListener('click', () => {
            this.deleteSale(saleId);
            dialog.remove();
        });

        // Close dialog when clicking outside
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }

    deleteSale(saleId) {
        // Convert saleId to number since it's stored as a string in the data attribute
        const numericSaleId = parseInt(saleId);
        console.log('Deleting sale with ID:', numericSaleId);
        
        const saleIndex = this.salesHistory.findIndex(sale => sale.id === numericSaleId);
        console.log('Found sale at index:', saleIndex);
        
        if (saleIndex === -1) {
            console.log('Sale not found');
            return;
        }

        // Get the sale details before deleting
        const sale = this.salesHistory[saleIndex];
        console.log('Sale details:', sale);
        
        const product = this.products.get(sale.product);
        console.log('Product before update:', product);

        // Restore the product quantity and update sales count
        if (product) {
            product.quantity += sale.quantity;
            product.sales -= sale.quantity; // Deduct from product's total sales
            this.products.set(sale.product, product);
            console.log('Product after update:', product);
        }

        // Deduct from total sales
        this.totalSales -= sale.amount;

        // Remove the sale from history
        this.salesHistory.splice(saleIndex, 1);
        this.saveToStorage();
        this.updateProductTable();
        this.updateSalesHistoryTable();
        console.log('Sale deleted successfully');
    }

    createDeleteTransferDialog(transferId) {
        const dialog = document.createElement('div');
        dialog.className = 'delete-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Delete Transfer Record</h3>
                <p>Are you sure you want to delete this transfer record? This action cannot be undone.</p>
                <div class="dialog-buttons">
                    <button class="cancel-btn">Cancel</button>
                    <button class="delete-btn">Delete</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Add event listeners
        dialog.querySelector('.cancel-btn').addEventListener('click', () => {
            dialog.remove();
        });

        dialog.querySelector('.delete-btn').addEventListener('click', () => {
            this.deleteTransfer(transferId);
            dialog.remove();
        });

        // Close dialog when clicking outside
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }

    deleteTransfer(transferId) {
        const numericTransferId = parseInt(transferId);
        const transferIndex = this.bankTransfers.findIndex(transfer => transfer.id === numericTransferId);
        
        if (transferIndex === -1) return;

        this.bankTransfers.splice(transferIndex, 1);
        this.saveToStorage();
        this.updateTransfersTable();
    }
}

// Initialize the system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.stockSystem = new StockManagementSystem();
});

// Function to load products into the table
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    products.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>₵${product.price}</td>
            <td>${product.quantity}</td>
            <td>${product.totalSales}</td>
            <td>
                <div class="product-actions">
                    <button class="btn-delete" onclick="confirmDeleteProduct(${index})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to confirm product deletion
function confirmDeleteProduct(index) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products[index];
    
    const dialog = document.createElement('div');
    dialog.className = 'delete-dialog';
    dialog.innerHTML = `
        <div class="delete-dialog-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete "${product.name}"?</p>
            <p>This action cannot be undone.</p>
            <div class="delete-dialog-actions">
                <button class="btn-cancel" onclick="closeDeleteDialog()">Cancel</button>
                <button class="btn-confirm-delete" onclick="deleteProduct(${index})">Delete</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    document.body.style.overflow = 'hidden';
}

// Function to close delete dialog
function closeDeleteDialog() {
    const dialog = document.querySelector('.delete-dialog');
    if (dialog) {
        dialog.remove();
        document.body.style.overflow = '';
    }
}

// Function to delete product
function deleteProduct(index) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    products.splice(index, 1);
    localStorage.setItem('products', JSON.stringify(products));
    closeDeleteDialog();
    loadProducts();
    showNotification('Product deleted successfully', 'success');
} 