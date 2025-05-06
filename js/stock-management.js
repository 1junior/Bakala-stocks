// Global variables
let products = JSON.parse(localStorage.getItem('products')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];
let currentDeleteId = null;
let currentDeleteType = null;

// DOM Elements
const productTableBody = document.getElementById('productTableBody');
const salesTableBody = document.getElementById('salesTableBody');
const searchProduct = document.getElementById('searchProduct');
const viewMoreProducts = document.getElementById('viewMoreProducts');
const viewMoreSales = document.getElementById('viewMoreSales');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateProductTable();
    updateSalesTable();
    populateProductSelect();
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

    // Search Product
    searchProduct.addEventListener('input', () => {
        updateProductTable();
    });

    // Add click event for search button
    document.getElementById('searchProductBtn').addEventListener('click', () => {
        updateProductTable();
    });

    // Allow Enter key to trigger search
    searchProduct.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            updateProductTable();
        }
    });

    // View More Buttons
    viewMoreProducts.addEventListener('click', () => {
        showAllProducts();
    });

    viewMoreSales.addEventListener('click', () => {
        showAllSales();
    });
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Product Management
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
    updateProductTable();
    populateProductSelect();
    closeModal('addProductModal');
    document.getElementById('addProductForm').reset();
}

function deleteProduct(id) {
    products = products.filter(product => product.id !== id);
    saveProducts();
    updateProductTable();
    populateProductSelect();
}

// Sales Management
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
    updateProductTable();
    updateSalesTable();
    populateProductSelect();
    closeModal('recordSaleModal');
    document.getElementById('recordSaleForm').reset();
}

function deleteSale(id) {
    const sale = sales.find(s => s.id === id);
    const product = products.find(p => p.name === sale.productName);
    
    if (product) {
        product.quantity += sale.quantity;
    } else {
        products.push({
            id: Date.now(),
            name: sale.productName,
            quantity: sale.quantity,
            price: sale.price
        });
    }

    sales = sales.filter(s => s.id !== id);
    saveProducts();
    saveSales();
    updateProductTable();
    updateSalesTable();
    populateProductSelect();
}

// Table Updates
function updateProductTable() {
    const searchTerm = searchProduct.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );

    productTableBody.innerHTML = '';
    const displayCount = Math.min(filteredProducts.length, 10);
    
    for (let i = 0; i < displayCount; i++) {
        const product = filteredProducts[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>
                <button onclick="showDeleteModal(${product.id}, 'product')" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        productTableBody.appendChild(row);
    }

    viewMoreProducts.style.display = filteredProducts.length > 10 ? 'block' : 'none';
}

function updateSalesTable() {
    salesTableBody.innerHTML = '';
    const displayCount = Math.min(sales.length, 10);
    
    for (let i = 0; i < displayCount; i++) {
        const sale = sales[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(sale.date).toLocaleDateString()}</td>
            <td>${sale.productName}</td>
            <td>${sale.quantity}</td>
            <td>$${sale.price.toFixed(2)}</td>
            <td>${sale.paymentMethod}</td>
            <td>
                <button onclick="showDeleteModal(${sale.id}, 'sale')" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        salesTableBody.appendChild(row);
    }

    viewMoreSales.style.display = sales.length > 10 ? 'block' : 'none';
}

// Helper Functions
function populateProductSelect() {
    const select = document.getElementById('saleProductSelect');
    select.innerHTML = '<option value="">Select Product</option>';
    
    products.forEach(product => {
        if (product.quantity > 0) {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (${product.quantity} available)`;
            select.appendChild(option);
        }
    });
}

function showDeleteModal(id, type) {
    currentDeleteId = id;
    currentDeleteType = type;
    openModal('deleteModal');
}

function confirmDelete() {
    if (currentDeleteType === 'product') {
        deleteProduct(currentDeleteId);
    } else if (currentDeleteType === 'sale') {
        deleteSale(currentDeleteId);
    }
    closeModal('deleteModal');
}

function showAllProducts() {
    const searchTerm = searchProduct.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );

    productTableBody.innerHTML = '';
    filteredProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>
                <button onclick="showDeleteModal(${product.id}, 'product')" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        productTableBody.appendChild(row);
    });

    viewMoreProducts.style.display = 'none';
}

function showAllSales() {
    salesTableBody.innerHTML = '';
    sales.forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(sale.date).toLocaleDateString()}</td>
            <td>${sale.productName}</td>
            <td>${sale.quantity}</td>
            <td>$${sale.price.toFixed(2)}</td>
            <td>${sale.paymentMethod}</td>
            <td>
                <button onclick="showDeleteModal(${sale.id}, 'sale')" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        salesTableBody.appendChild(row);
    });

    viewMoreSales.style.display = 'none';
}

// Local Storage
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

function saveSales() {
    localStorage.setItem('sales', JSON.stringify(sales));
} 