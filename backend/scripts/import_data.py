from app.db.session import SessionLocal
from app.models.product import Product
from app.models.customer import Customer
from app.models.transaction import Transaction
from app.models.supplier import Supplier
from app.utils.data_import import import_csv_to_db, validate_csv_headers
import os
import sys

def import_products(csv_file: str):
    """Import products from CSV file."""
    # Expected CSV headers
    expected_headers = ['name', 'description', 'price', 'stock_quantity', 'category']
    
    # Validate headers
    is_valid, missing = validate_csv_headers(csv_file, expected_headers)
    if not is_valid:
        print(f"Missing headers in {os.path.basename(csv_file)}: {missing}")
        return
    
    # Import data
    with SessionLocal() as db:
        processed, imported = import_csv_to_db(db, csv_file, Product)
        print(f"Processed {processed} records, imported {imported} products")

def import_customers(csv_file: str):
    """Import customers from CSV file."""
    expected_headers = ['name', 'email', 'phone', 'address']
    
    is_valid, missing = validate_csv_headers(csv_file, expected_headers)
    if not is_valid:
        print(f"Missing headers in {os.path.basename(csv_file)}: {missing}")
        return
    
    with SessionLocal() as db:
        processed, imported = import_csv_to_db(db, csv_file, Customer)
        print(f"Processed {processed} records, imported {imported} customers")

def import_transactions(csv_file: str):
    """Import transactions from CSV file."""
    expected_headers = ['customer_id', 'product_id', 'quantity', 'total_amount', 'transaction_date']
    
    # Example of column mapping if CSV headers are different
    mapping = {
        'customer': 'customer_id',
        'product': 'product_id',
        'amount': 'total_amount',
        'date': 'transaction_date'
    }
    
    is_valid, missing = validate_csv_headers(csv_file, list(mapping.keys()))
    if not is_valid:
        print(f"Missing headers in {os.path.basename(csv_file)}: {missing}")
        return
    
    with SessionLocal() as db:
        processed, imported = import_csv_to_db(db, csv_file, Transaction, mapping=mapping)
        print(f"Processed {processed} records, imported {imported} transactions")

def import_suppliers(csv_file: str):
    """Import suppliers from CSV file."""
    expected_headers = ['name', 'contact_person', 'email', 'phone', 'address']
    
    is_valid, missing = validate_csv_headers(csv_file, expected_headers)
    if not is_valid:
        print(f"Missing headers in {os.path.basename(csv_file)}: {missing}")
        return
    
    with SessionLocal() as db:
        processed, imported = import_csv_to_db(db, csv_file, Supplier)
        print(f"Processed {processed} records, imported {imported} suppliers")

def create_data_directory(data_dir: str):
    """Create data directory if it doesn't exist."""
    try:
        os.makedirs(data_dir, exist_ok=True)
        print(f"Data directory is ready at: {data_dir}")
    except Exception as e:
        print(f"Error creating data directory: {str(e)}")
        sys.exit(1)

def check_csv_files(data_dir: str) -> bool:
    """Check if any CSV files exist in the data directory."""
    csv_files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
    if not csv_files:
        print(f"\nNo CSV files found in {data_dir}")
        print("Please add your CSV files with the following names:")
        print("- products.csv")
        print("- customers.csv")
        print("- transactions.csv")
        print("- suppliers.csv")
        return False
    return True

if __name__ == "__main__":
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Get the parent directory (backend)
    backend_dir = os.path.dirname(script_dir)
    # Path to data directory
    data_dir = os.path.join(backend_dir, 'data')
    
    print("Starting data import process...")
    
    # Ensure data directory exists
    if not os.path.exists(data_dir):
        print(f"\nData directory not found at: {data_dir}")
        create_data_directory(data_dir)
        print("\nPlease add your CSV files to the data directory and run this script again.")
        print("\nExpected files:")
        print("- products.csv")
        print("- customers.csv")
        print("- transactions.csv")
        print("- suppliers.csv")
        sys.exit(1)
    
    # Check if any CSV files exist
    if not check_csv_files(data_dir):
        sys.exit(1)
    
    print("\nFound data directory, proceeding with import...")
    
    # Import products
    products_file = os.path.join(data_dir, 'products.csv')
    if os.path.exists(products_file):
        print("\nImporting products...")
        import_products(products_file)
    else:
        print("\nSkipping products import - products.csv not found")
    
    # Import customers
    customers_file = os.path.join(data_dir, 'customers.csv')
    if os.path.exists(customers_file):
        print("\nImporting customers...")
        import_customers(customers_file)
    else:
        print("\nSkipping customers import - customers.csv not found")
    
    # Import suppliers
    suppliers_file = os.path.join(data_dir, 'suppliers.csv')
    if os.path.exists(suppliers_file):
        print("\nImporting suppliers...")
        import_suppliers(suppliers_file)
    else:
        print("\nSkipping suppliers import - suppliers.csv not found")
    
    # Import transactions (do this last as it depends on products and customers)
    transactions_file = os.path.join(data_dir, 'transactions.csv')
    if os.path.exists(transactions_file):
        print("\nImporting transactions...")
        import_transactions(transactions_file)
    else:
        print("\nSkipping transactions import - transactions.csv not found")
    
    print("\nData import process completed!") 