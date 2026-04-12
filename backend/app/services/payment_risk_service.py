from collections import defaultdict
from datetime import datetime

from sqlalchemy.orm import Session, selectinload

from app import models, schemas


UNPAID_STATUSES = (
    models.InvoiceStatus.SENT,
    models.InvoiceStatus.PARTIAL,
    models.InvoiceStatus.OVERDUE,
)
HIGH_DEBT_THRESHOLD = 5000.0
FREQUENT_CUSTOMER_MIN_INVOICES = 3


def _remaining_balance(invoice: models.Invoice) -> float:
    paid_amount = sum(payment.amount for payment in invoice.payments)
    return max(0.0, invoice.total - paid_amount)


def _clamp_score(score: float) -> float:
    return max(0.0, min(1.0, round(score, 2)))


def _risk_level(score: float) -> str:
    if score >= 0.70:
        return "high"
    if score >= 0.40:
        return "medium"
    return "low"


def _recommendation(score: float, is_overdue: bool) -> str:
    if is_overdue or score >= 0.70:
        return "Send reminder now and follow up personally."
    if score >= 0.40:
        return "Monitor closely and schedule a reminder before due date."
    return "Low risk. Standard reminder flow is enough."


def _build_customer_history(invoices: list[models.Invoice]) -> dict[int, dict]:
    history = defaultdict(
        lambda: {
            "invoice_count": 0,
            "unpaid_count": 0,
            "outstanding_balance": 0.0,
            "late_history_count": 0,
            "on_time_paid_count": 0,
        }
    )

    for invoice in invoices:
        customer_history = history[invoice.customer_id]
        customer_history["invoice_count"] += 1

        remaining = _remaining_balance(invoice)
        if invoice.status in UNPAID_STATUSES:
            customer_history["unpaid_count"] += 1
            customer_history["outstanding_balance"] += remaining

        last_payment = max(invoice.payments, key=lambda payment: payment.payment_date) if invoice.payments else None
        was_paid_late = bool(
            invoice.status == models.InvoiceStatus.PAID
            and last_payment
            and last_payment.payment_date > invoice.due_date
        )
        has_overdue_history = invoice.status == models.InvoiceStatus.OVERDUE

        if was_paid_late or has_overdue_history:
            customer_history["late_history_count"] += 1

        if (
            invoice.status == models.InvoiceStatus.PAID
            and last_payment
            and last_payment.payment_date <= invoice.due_date
        ):
            customer_history["on_time_paid_count"] += 1

    return history


def get_payment_risk_report(db: Session, user_id: int) -> schemas.PaymentRiskResponse:
    now = datetime.utcnow()

    # First collect the actual prediction set: invoices that still need payment.
    unpaid_invoices = (
        db.query(models.Invoice)
        .options(
            selectinload(models.Invoice.customer),
            selectinload(models.Invoice.payments),
        )
        .filter(
            models.Invoice.owner_id == user_id,
            models.Invoice.status.in_(UNPAID_STATUSES),
        )
        .order_by(models.Invoice.due_date.asc())
        .all()
    )

    if not unpaid_invoices:
        return schemas.PaymentRiskResponse(
            generated_at=now,
            invoice_risks=[],
            customer_risks=[],
        )

    customer_ids = sorted({invoice.customer_id for invoice in unpaid_invoices})

    # Then load full history for only the customers involved in those unpaid invoices.
    customer_history_invoices = (
        db.query(models.Invoice)
        .options(selectinload(models.Invoice.payments))
        .filter(
            models.Invoice.owner_id == user_id,
            models.Invoice.customer_id.in_(customer_ids),
        )
        .all()
    )
    customer_history = _build_customer_history(customer_history_invoices)

    invoice_risks: list[schemas.PaymentRiskInvoiceResponse] = []
    customer_rollup = defaultdict(
        lambda: {
            "customer_name": "",
            "scores": [],
            "unpaid_invoices_count": 0,
            "total_outstanding_balance": 0.0,
        }
    )

    for invoice in unpaid_invoices:
        stats = customer_history[invoice.customer_id]
        amount_due = _remaining_balance(invoice)
        score = 0.40
        factors = []

        if stats["late_history_count"] > 0:
            score += 0.20
            factors.append(
                schemas.PaymentRiskFactorResponse(
                    name="late_history",
                    impact=0.20,
                    value=f"{stats['late_history_count']} late or overdue invoices",
                )
            )

        if stats["outstanding_balance"] >= HIGH_DEBT_THRESHOLD:
            score += 0.20
            factors.append(
                schemas.PaymentRiskFactorResponse(
                    name="high_debt",
                    impact=0.20,
                    value=f"Outstanding balance {round(stats['outstanding_balance'], 2)}",
                )
            )

        is_overdue = invoice.status == models.InvoiceStatus.OVERDUE or invoice.due_date < now
        if is_overdue:
            score += 0.15
            days_overdue = max(0, (now - invoice.due_date).days)
            factors.append(
                schemas.PaymentRiskFactorResponse(
                    name="current_invoice_overdue",
                    impact=0.15,
                    value=f"{days_overdue} days overdue",
                )
            )

        frequent_and_reliable = (
            stats["invoice_count"] >= FREQUENT_CUSTOMER_MIN_INVOICES
            and stats["on_time_paid_count"] >= 2
            and stats["late_history_count"] == 0
        )
        if frequent_and_reliable:
            score -= 0.15
            factors.append(
                schemas.PaymentRiskFactorResponse(
                    name="frequent_reliable_customer",
                    impact=-0.15,
                    value=f"{stats['invoice_count']} invoices, {stats['on_time_paid_count']} paid on time",
                )
            )

        score = _clamp_score(score)
        risk_level = _risk_level(score)

        invoice_risks.append(
            schemas.PaymentRiskInvoiceResponse(
                invoice_id=invoice.id,
                invoice_number=invoice.invoice_number,
                customer_id=invoice.customer_id,
                customer_name=invoice.customer.name,
                due_date=invoice.due_date,
                amount_due=round(amount_due, 2),
                outstanding_balance=round(stats["outstanding_balance"], 2),
                risk_score=score,
                risk_level=risk_level,
                recommendation=_recommendation(score, is_overdue),
                factors=factors,
            )
        )

        customer_bucket = customer_rollup[invoice.customer_id]
        customer_bucket["customer_name"] = invoice.customer.name
        customer_bucket["scores"].append(score)
        customer_bucket["unpaid_invoices_count"] += 1
        customer_bucket["total_outstanding_balance"] = stats["outstanding_balance"]

    customer_risks = []
    for customer_id, data in customer_rollup.items():
        average_score = round(sum(data["scores"]) / len(data["scores"]), 2)
        highest_score = round(max(data["scores"]), 2)

        # Use the highest invoice score for the label so one risky invoice is not hidden.
        customer_risks.append(
            schemas.PaymentRiskCustomerResponse(
                customer_id=customer_id,
                customer_name=data["customer_name"],
                unpaid_invoices_count=data["unpaid_invoices_count"],
                total_outstanding_balance=round(data["total_outstanding_balance"], 2),
                average_risk_score=average_score,
                highest_risk_score=highest_score,
                risk_level=_risk_level(highest_score),
            )
        )

    customer_risks.sort(key=lambda customer: customer.highest_risk_score, reverse=True)
    invoice_risks.sort(key=lambda invoice: invoice.risk_score, reverse=True)

    return schemas.PaymentRiskResponse(
        generated_at=now,
        invoice_risks=invoice_risks,
        customer_risks=customer_risks,
    )
