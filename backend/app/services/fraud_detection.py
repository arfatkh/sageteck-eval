from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import statistics
from app.models.transaction import Transaction
from app.models.customer import Customer

class FraudDetectionService:
    def __init__(self, db: Session):
        self.db = db
        # Configurable thresholds
        self.velocity_window_minutes = 60  # Time window for velocity check
        self.max_transactions_per_window = 5  # Max transactions in window
        self.amount_std_dev_threshold = 2.0  # Standard deviations above mean for amount anomaly
        self.min_customer_transactions = 3  # Minimum transactions needed for amount analysis

    def check_transaction_velocity(self, customer_id: int) -> Dict:
        """
        Check if customer has made too many transactions in the time window.
        Returns dict with is_suspicious flag and details.
        """
        window_start = datetime.utcnow() - timedelta(minutes=self.velocity_window_minutes)
        
        # Count transactions in window
        transaction_count = (
            self.db.query(Transaction)
            .filter(
                Transaction.customer_id == customer_id,
                Transaction.timestamp >= window_start
            )
            .count()
        )

        is_suspicious = transaction_count >= self.max_transactions_per_window
        
        return {
            "is_suspicious": is_suspicious,
            "reason": "High transaction velocity" if is_suspicious else None,
            "details": {
                "window_minutes": self.velocity_window_minutes,
                "transaction_count": transaction_count,
                "threshold": self.max_transactions_per_window
            }
        }

    def check_amount_anomaly(self, customer_id: int, current_amount: float) -> Dict:
        """
        Check if transaction amount is anomalous compared to customer's history.
        Returns dict with is_suspicious flag and details.
        """
        # Get customer's transaction history
        customer_transactions = (
            self.db.query(Transaction.price)
            .filter(Transaction.customer_id == customer_id)
            .all()
        )
        
        transaction_amounts = [t[0] for t in customer_transactions]
        
        # Not enough history for meaningful analysis
        if len(transaction_amounts) < self.min_customer_transactions:
            return {
                "is_suspicious": False,
                "reason": None,
                "details": {
                    "message": "Insufficient transaction history",
                    "transaction_count": len(transaction_amounts)
                }
            }
        
        # Calculate statistics
        mean_amount = statistics.mean(transaction_amounts)
        std_dev = statistics.stdev(transaction_amounts)
        z_score = (current_amount - mean_amount) / std_dev if std_dev > 0 else 0
        
        is_suspicious = z_score > self.amount_std_dev_threshold
        
        return {
            "is_suspicious": is_suspicious,
            "reason": "Unusual transaction amount" if is_suspicious else None,
            "details": {
                "z_score": round(z_score, 2),
                "customer_mean": round(mean_amount, 2),
                "customer_std_dev": round(std_dev, 2),
                "threshold": self.amount_std_dev_threshold
            }
        }

    def analyze_transaction(self, customer_id: int, amount: float) -> Dict:
        """
        Analyze a transaction for potential fraud using multiple detection methods.
        Returns combined analysis results.
        """
        velocity_check = self.check_transaction_velocity(customer_id)
        amount_check = self.check_amount_anomaly(customer_id, amount)
        
        is_suspicious = velocity_check["is_suspicious"] or amount_check["is_suspicious"]
        reasons = []
        if velocity_check["reason"]:
            reasons.append(velocity_check["reason"])
        if amount_check["reason"]:
            reasons.append(amount_check["reason"])
            
        return {
            "is_suspicious": is_suspicious,
            "reasons": reasons,
            "risk_score": len(reasons) * 0.5,  # Simple scoring: 0.5 per detection
            "details": {
                "velocity_check": velocity_check["details"],
                "amount_check": amount_check["details"]
            }
        } 