class LaptopStockSystem:
    def __init__(self):
        self.products = {}  # Dictionary to store products: {product_name: {'price': price, 'quantity': quantity, 'sales': sales}}
        self.total_sales = 0

    def add_product(self, name, price, quantity):
        """Add a new product or update existing product"""
        if name in self.products:
            self.products[name]['quantity'] += quantity
        else:
            self.products[name] = {
                'price': price,
                'quantity': quantity,
                'sales': 0
            }
        print(f"Product '{name}' added/updated successfully!")

    def record_sale(self, name, quantity):
        """Record a sale for a product"""
        if name not in self.products:
            print(f"Error: Product '{name}' not found!")
            return False
        
        if self.products[name]['quantity'] < quantity:
            print(f"Error: Not enough stock for '{name}'!")
            return False
        
        self.products[name]['quantity'] -= quantity
        self.products[name]['sales'] += quantity
        sale_amount = self.products[name]['price'] * quantity
        self.total_sales += sale_amount
        print(f"Sale recorded successfully! Amount: ${sale_amount:.2f}")
        return True

    def get_available_stock(self, name):
        """Get available quantity for a specific product"""
        if name not in self.products:
            print(f"Error: Product '{name}' not found!")
            return None
        return self.products[name]['quantity']

    def list_products(self):
        """List all products with their details"""
        if not self.products:
            print("No products in stock!")
            return
        
        print("\nProduct List:")
        print("-" * 60)
        print(f"{'Name':<20} {'Price':<10} {'Available':<10} {'Total Sales':<10}")
        print("-" * 60)
        
        for name, details in self.products.items():
            print(f"{name:<20} ${details['price']:<9.2f} {details['quantity']:<10} {details['sales']:<10}")
        print("-" * 60)
        print(f"Total Sales Amount: ${self.total_sales:.2f}")

def main():
    system = LaptopStockSystem()
    
    while True:
        print("\nLaptop Stock Management System")
        print("1. Add Product")
        print("2. Record Sale")
        print("3. Check Stock")
        print("4. List Products")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ")
        
        if choice == '1':
            name = input("Enter product name: ")
            try:
                price = float(input("Enter price: $"))
                quantity = int(input("Enter quantity: "))
                system.add_product(name, price, quantity)
            except ValueError:
                print("Error: Please enter valid numbers for price and quantity!")
        
        elif choice == '2':
            name = input("Enter product name: ")
            try:
                quantity = int(input("Enter quantity sold: "))
                system.record_sale(name, quantity)
            except ValueError:
                print("Error: Please enter a valid number for quantity!")
        
        elif choice == '3':
            name = input("Enter product name: ")
            stock = system.get_available_stock(name)
            if stock is not None:
                print(f"Available stock for '{name}': {stock}")
        
        elif choice == '4':
            system.list_products()
        
        elif choice == '5':
            print("Thank you for using the Laptop Stock Management System!")
            break
        
        else:
            print("Invalid choice! Please try again.")

if __name__ == "__main__":
    main() 