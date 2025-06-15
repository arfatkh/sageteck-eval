# TechMart Analytics Dashboard Backend

This is the backend service for the TechMart Analytics Dashboard, built with FastAPI and PostgreSQL.

## Setup

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the backend directory with:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/techmart
SECRET_KEY=your-secret-key
```

4. Database Setup:
- Install PostgreSQL if not already installed
- Create a database named 'techmart'
- The application will automatically create all necessary tables on startup

## Data Import

The application comes with data import utilities for CSV files. Sample data files are provided in the `data` directory:

- `products.csv`: Product catalog data
- `customers.csv`: Customer information
- `transactions.csv`: Sales transaction records
- `suppliers.csv`: Supplier information

To import the data, run the import script:
```bash
# Activate your virtual environment first
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Run the import script for specific data
python -m scripts.import_data
```

Expected CSV formats:

1. products.csv:
   - Headers: name, description, price, stock_quantity, category

2. customers.csv:
   - Headers: name, email, phone, address

3. transactions.csv:
   - Headers: customer, product, quantity, amount, date
   (These will be mapped to: customer_id, product_id, quantity, total_amount, transaction_date)

4. suppliers.csv:
   - Headers: name, contact_person, email, phone, address

## Running the Application

Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`

## API Documentation

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Database Management

The application uses SQLAlchemy's declarative models for database schema management. Tables are automatically created on application startup based on the SQLAlchemy models defined in the `app/models` directory.

To modify the database schema:
1. Update the relevant model in `app/models/`
2. Restart the application - tables will be automatically updated

Note: For production environments, it's recommended to implement proper database migrations using tools like Alembic. 