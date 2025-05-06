// Global variables
let products = JSON.parse(localStorage.getItem('products')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let transfers = JSON.parse(localStorage.getItem('transfers')) || [];

// DOM Elements
const totalProductsElement = document.getElementById('totalProducts');
const totalSalesElement = document.getElementById('totalSales');
const totalExpensesElement = document.getElementById('totalExpenses');
const totalTransfersElement = document.getElementById('totalTransfers');
const cashTotalElement = document.getElementById('cashTotal');
const momoTotalElement = document.getElementById('momoTotal');
const bankTotalElement = document.getElementById('bankTotal');
const activitiesList = document.getElementById('activitiesList');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Add Product Form
    document.getElementById('addProductForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addProduct();
    });

    // Record Sale Form
    document.getElementById('recordSaleForm').addEventListener('submit', (e) => {
        e.preventDefault();
        recordSale();
    });

    // Add Expense Form
    document.getElementById('addExpenseForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addExpense();
    });
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Dashboard Updates
function updateDashboard() {
    // Update totals
    totalProductsElement.textContent = products.length;
    
    const totalSales = sales.reduce((sum, sale) => sum + (sale.price * sale.quantity), 0);
    totalSalesElement.textContent = `$${totalSales.toFixed(2)}`;
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalExpensesElement.textContent = `$${totalExpenses.toFixed(2)}`;
    
    const totalTransfers = transfers.reduce((sum, transfer) => sum + transfer.amount, 0);
    totalTransfersElement.textContent = `$${totalTransfers.toFixed(2)}`;

    // Update payment method totals
    const cashSales = sales.filter(sale => sale.paymentMethod === 'cash')
        .reduce((sum, sale) => sum + (sale.price * sale.quantity), 0);
    cashTotalElement.textContent = `$${cashSales.toFixed(2)}`;

    const momoSales = sales.filter(sale => sale.paymentMethod === 'momo')
        .reduce((sum, sale) => sum + (sale.price * sale.quantity), 0);
    momoTotalElement.textContent = `$${momoSales.toFixed(2)}`;

    const bankSales = sales.filter(sale => sale.paymentMethod === 'bank')
        .reduce((sum, sale) => sum + (sale.price * sale.quantity), 0);
    bankTotalElement.textContent = `$${bankSales.toFixed(2)}`;

    // Update recent activities
    updateRecentActivities();
}

function updateRecentActivities() {
    activitiesList.innerHTML = '';
    
    // Combine all activities
    const allActivities = [
        ...sales.map(sale => ({
            type: 'sale',
            date: sale.date,
            description: `Sale: ${sale.productName} (${sale.quantity} units)`,
            amount: sale.price * sale.quantity
        })),
        ...expenses.map(expense => ({
            type: 'expense',
            date: expense.date,
            description: `Expense: ${expense.description}`,
            amount: -expense.amount
        })),
        ...transfers.map(transfer => ({
            type: 'transfer',
            date: transfer.date,
            description: `Transfer: ${transfer.description}`,
            amount: transfer.amount
        }))
    ];

    // Sort by date (newest first)
    allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Display only the 5 most recent activities
    const recentActivities = allActivities.slice(0, 5);

    recentActivities.forEach(activity => {
        const activityElement = document.createElement('div');
        activityElement.className = 'activity-item';
        activityElement.innerHTML = `
            <div class="activity-date">${new Date(activity.date).toLocaleDateString()}</div>
            <div class="activity-description">${activity.description}</div>
            <div class="activity-amount ${activity.amount >= 0 ? 'positive' : 'negative'}">
                ${activity.amount >= 0 ? '+' : ''}$${Math.abs(activity.amount).toFixed(2)}
            </div>
        `;
        activitiesList.appendChild(activityElement);
    });
}

// Form Handlers
function addProduct() {
    const name = document.getElementById('productName').value;
    const quantity = parseInt(document.getElementById('productQuantity').value);
    const price = parseFloat(document.getElementById('productPrice').value);

    const product = {
        id: Date.now(),
        name,
        quantity,
        price
    };

    products.push(product);
    saveProducts();
    updateDashboard();
    closeModal('addProductModal');
    document.getElementById('addProductForm').reset();
}

function recordSale() {
    const productId = parseInt(document.getElementById('saleProductSelect').value);
    const quantity = parseInt(document.getElementById('saleQuantity').value);
    const paymentMethod = document.getElementById('salePaymentMethod').value;

    const product = products.find(p => p.id === productId);
    if (!product || product.quantity < quantity) {
        alert('Not enough stock available!');
        return;
    }

    const sale = {
        id: Date.now(),
        productId,
        productName: product.name,
        quantity,
        price: product.price,
        paymentMethod,
        date: new Date().toISOString()
    };

    // Update product quantity
    product.quantity -= quantity;
    if (product.quantity === 0) {
        products = products.filter(p => p.id !== productId);
    }

    sales.push(sale);
    saveProducts();
    saveSales();
    updateDashboard();
    closeModal('recordSaleModal');
    document.getElementById('recordSaleForm').reset();
}

function addExpense() {
    const category = document.getElementById('expenseCategory').value;
    const description = document.getElementById('expenseDescription').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);

    const expense = {
        id: Date.now(),
        date: new Date().toISOString(),
        category,
        description,
        amount
    };

    expenses.push(expense);
    saveExpenses();
    updateDashboard();
    closeModal('addExpenseModal');
    document.getElementById('addExpenseForm').reset();
}

// Local Storage
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

function saveSales() {
    localStorage.setItem('sales', JSON.stringify(sales));
}

function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function saveTransfers() {
    localStorage.setItem('transfers', JSON.stringify(transfers));
} 