class ExpensesManager {
    constructor() {
        this.expenses = [];
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.updateExpensesTable();
        this.updateSummary();
    }

    setupEventListeners() {
        // Add expense form handler
        document.getElementById('addExpenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        // Filter handlers
        document.getElementById('filterMonth').addEventListener('change', () => this.updateExpensesTable());
        document.getElementById('filterCategory').addEventListener('change', () => this.updateExpensesTable());

        // Set default date to today
        document.getElementById('expenseDate').valueAsDate = new Date();
    }

    addExpense() {
        const date = document.getElementById('expenseDate').value;
        const category = document.getElementById('expenseCategory').value;
        const description = document.getElementById('expenseDescription').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);

        if (!date || !category || !description || isNaN(amount)) {
            alert('Please fill in all fields correctly');
            return;
        }

        const expense = {
            id: Date.now(), // Unique ID for each expense
            date,
            category,
            description,
            amount
        };

        this.expenses.push(expense);
        this.saveToLocalStorage();
        this.updateExpensesTable();
        this.updateSummary();
        
        // Reset form
        document.getElementById('addExpenseForm').reset();
        document.getElementById('expenseDate').valueAsDate = new Date();
        
        alert('Expense added successfully!');
    }

    deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            this.expenses = this.expenses.filter(expense => expense.id !== id);
            this.saveToLocalStorage();
            this.updateExpensesTable();
            this.updateSummary();
        }
    }

    getFilteredExpenses() {
        const monthFilter = document.getElementById('filterMonth').value;
        const categoryFilter = document.getElementById('filterCategory').value;

        return this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
            
            const matchesMonth = !monthFilter || expenseMonth === monthFilter;
            const matchesCategory = !categoryFilter || expense.category === categoryFilter;
            
            return matchesMonth && matchesCategory;
        });
    }

    updateExpensesTable() {
        const tbody = document.getElementById('expensesTableBody');
        tbody.innerHTML = '';
        
        const filteredExpenses = this.getFilteredExpenses();
        
        filteredExpenses.forEach(expense => {
            const row = document.createElement('tr');
            const date = new Date(expense.date);
            const formattedDate = date.toLocaleDateString();
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${expense.category}</td>
                <td>${expense.description}</td>
                <td>₵${expense.amount.toFixed(2)}</td>
                <td>
                    <button class="btn btn-danger action-btn" onclick="expensesManager.deleteExpense(${expense.id})">
                        Delete
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateSummary() {
        const totalExpenses = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        document.getElementById('totalExpenses').textContent = totalExpenses.toFixed(2);

        // Calculate monthly expenses
        const currentDate = new Date();
        const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        
        const monthlyExpenses = this.expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
                return expenseMonth === currentMonth;
            })
            .reduce((sum, expense) => sum + expense.amount, 0);
        
        document.getElementById('monthlyExpenses').textContent = monthlyExpenses.toFixed(2);
    }

    saveToLocalStorage() {
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('expenses');
        if (data) {
            this.expenses = JSON.parse(data);
        }
    }
}

// Initialize the expenses manager
const expensesManager = new ExpensesManager(); 