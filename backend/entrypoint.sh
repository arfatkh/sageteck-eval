#!/bin/bash

# Wait for database to be ready
echo "Waiting for PostgreSQL to be ready..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL is ready!"

# Initialize database tables
echo "Initializing database tables..."
python -m app.db.init_db

# Import data if needed (check if data is already imported)
echo "Checking and importing data..."
python -m scripts.import_data

# Start the FastAPI application
echo "Starting FastAPI application..."
exec "$@" 