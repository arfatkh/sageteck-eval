import pandas as pd
from sqlalchemy.orm import Session
from typing import Type, Dict, Any
from sqlalchemy.ext.declarative import DeclarativeMeta

def import_csv_to_db(
    db: Session,
    csv_file: str,
    model: Type[DeclarativeMeta],
    mapping: Dict[str, str] = None,
    chunk_size: int = 1000
) -> tuple[int, int]:
    """
    Import data from a CSV file into the database.
    
    Args:
        db: SQLAlchemy database session
        csv_file: Path to the CSV file
        model: SQLAlchemy model class
        mapping: Dictionary mapping CSV columns to model attributes
        chunk_size: Number of records to process at once
    
    Returns:
        tuple: (number of records processed, number of records imported)
    """
    try:
        # Read CSV in chunks to handle large files
        chunks = pd.read_csv(csv_file, chunksize=chunk_size)
        total_processed = 0
        total_imported = 0
        
        for chunk in chunks:
            # Rename columns if mapping is provided
            if mapping:
                chunk = chunk.rename(columns=mapping)
            
            # Convert DataFrame to list of dictionaries
            records = chunk.to_dict('records')
            total_processed += len(records)
            
            # Create model instances
            instances = []
            for record in records:
                # Remove any columns that don't exist in the model
                valid_data = {
                    k: v for k, v in record.items() 
                    if hasattr(model, k) and v is not None and pd.notna(v)
                }
                if valid_data:
                    instances.append(model(**valid_data))
            
            if instances:
                # Bulk insert the instances
                db.bulk_save_objects(instances)
                db.commit()
                total_imported += len(instances)
                
        return total_processed, total_imported
            
    except Exception as e:
        db.rollback()
        raise Exception(f"Error importing data: {str(e)}")

def validate_csv_headers(csv_file: str, expected_headers: list[str]) -> tuple[bool, list[str]]:
    """
    Validate if CSV file has the required headers.
    
    Args:
        csv_file: Path to the CSV file
        expected_headers: List of required headers
    
    Returns:
        tuple: (is_valid, missing_headers)
    """
    try:
        # Read just the headers
        headers = pd.read_csv(csv_file, nrows=0).columns.tolist()
        missing = [h for h in expected_headers if h not in headers]
        return len(missing) == 0, missing
    except Exception as e:
        raise Exception(f"Error validating CSV headers: {str(e)}") 