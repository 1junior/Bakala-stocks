// Global variables
let transfers = JSON.parse(localStorage.getItem('transfers')) || [];
let currentDeleteId = null;

// DOM Elements
const transferTableBody = document.getElementById('transferTableBody');
const viewMoreTransfers = document.getElementById('viewMoreTransfers');
const totalTransfersElement = document.getElementById('totalTransfers');
const monthlyTransfersElement = document.getElementById('monthlyTransfers');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateTransferTable();
    updateTransferSummary();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Add Transfer Form
    document.getElementById('addTransferForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addTransfer();
    });

    // View More Button
    viewMoreTransfers.addEventListener('click', () => {
        showAllTransfers();
    });
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Transfer Management
function addTransfer() {
    const date = document.getElementById('transferDate').value;
    const description = document.getElementById('transferDescription').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);

    const transfer = {
        id: Date.now(),
        date,
        description,
        amount
    };

    transfers.push(transfer);
    saveTransfers();
    updateTransferTable();
    updateTransferSummary();
    closeModal('addTransferModal');
    document.getElementById('addTransferForm').reset();
}

function deleteTransfer(id) {
    transfers = transfers.filter(transfer => transfer.id !== id);
    saveTransfers();
    updateTransferTable();
    updateTransferSummary();
}

// Table Updates
function updateTransferTable() {
    transferTableBody.innerHTML = '';
    const displayCount = Math.min(transfers.length, 10);
    
    for (let i = 0; i < displayCount; i++) {
        const transfer = transfers[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(transfer.date).toLocaleDateString()}</td>
            <td>${transfer.description}</td>
            <td>$${transfer.amount.toFixed(2)}</td>
            <td>
                <button onclick="showDeleteModal(${transfer.id})" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        transferTableBody.appendChild(row);
    }

    viewMoreTransfers.style.display = transfers.length > 10 ? 'block' : 'none';
}

// Summary Updates
function updateTransferSummary() {
    const total = transfers.reduce((sum, transfer) => sum + transfer.amount, 0);
    totalTransfersElement.textContent = `$${total.toFixed(2)}`;

    const now = new Date();
    const thisMonth = transfers.filter(transfer => {
        const transferDate = new Date(transfer.date);
        return transferDate.getMonth() === now.getMonth() && 
               transferDate.getFullYear() === now.getFullYear();
    });

    const monthlyTotal = thisMonth.reduce((sum, transfer) => sum + transfer.amount, 0);
    monthlyTransfersElement.textContent = `$${monthlyTotal.toFixed(2)}`;
}

// Helper Functions
function showDeleteModal(id) {
    currentDeleteId = id;
    openModal('deleteModal');
}

function confirmDelete() {
    deleteTransfer(currentDeleteId);
    closeModal('deleteModal');
}

function showAllTransfers() {
    transferTableBody.innerHTML = '';
    transfers.forEach(transfer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(transfer.date).toLocaleDateString()}</td>
            <td>${transfer.description}</td>
            <td>$${transfer.amount.toFixed(2)}</td>
            <td>
                <button onclick="showDeleteModal(${transfer.id})" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        transferTableBody.appendChild(row);
    });

    viewMoreTransfers.style.display = 'none';
}

// Local Storage
function saveTransfers() {
    localStorage.setItem('transfers', JSON.stringify(transfers));
} 