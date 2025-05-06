// Global variables
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let currentDeleteId = null;

// DOM Elements
const expenseTableBody = document.getElementById('expenseTableBody');
const viewMoreExpenses = document.getElementById('viewMoreExpenses');
const totalExpensesElement = document.getElementById('totalExpenses');
const monthlyExpensesElement = document.getElementById('monthlyExpenses');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateExpenseTable();
    updateExpenseSummary();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Add Expense Form
    document.getElementById('addExpenseForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addExpense();
    });

    // View More Button
    viewMoreExpenses.addEventListener('click', () => {
        showAllExpenses();
    });
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Expense Management
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
    updateExpenseTable();
    updateExpenseSummary();
    closeModal('addExpenseModal');
    document.getElementById('addExpenseForm').reset();
}

function deleteExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    saveExpenses();
    updateExpenseTable();
    updateExpenseSummary();
}

// Table Updates
function updateExpenseTable() {
    expenseTableBody.innerHTML = '';
    const displayCount = Math.min(expenses.length, 10);
    
    for (let i = 0; i < displayCount; i++) {
        const expense = expenses[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(expense.date).toLocaleDateString()}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>$${expense.amount.toFixed(2)}</td>
            <td>
                <button onclick="showDeleteModal(${expense.id})" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        expenseTableBody.appendChild(row);
    }

    viewMoreExpenses.style.display = expenses.length > 10 ? 'block' : 'none';
}

// Summary Updates
function updateExpenseSummary() {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalExpensesElement.textContent = `$${total.toFixed(2)}`;

    const now = new Date();
    const thisMonth = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear();
    });

    const monthlyTotal = thisMonth.reduce((sum, expense) => sum + expense.amount, 0);
    monthlyExpensesElement.textContent = `$${monthlyTotal.toFixed(2)}`;
}

// Helper Functions
function showDeleteModal(id) {
    currentDeleteId = id;
    openModal('deleteModal');
}

function confirmDelete() {
    deleteExpense(currentDeleteId);
    closeModal('deleteModal');
}

function showAllExpenses() {
    expenseTableBody.innerHTML = '';
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(expense.date).toLocaleDateString()}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>$${expense.amount.toFixed(2)}</td>
            <td>
                <button onclick="showDeleteModal(${expense.id})" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        expenseTableBody.appendChild(row);
    });

    viewMoreExpenses.style.display = 'none';
}

// Local Storage
function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
} 