"""Hardcoded synthetic patient case — Maria Delgado prior auth."""

CASE = {
    "patient": {
        "name": "Maria Delgado",
        "dob": "1970-03-15",
        "mrn": "MRN-88472",
        "insurance": "BlueCross BlueShield",
        "ordering_physician": "Dr. Aisha Patel",
    },
    "procedure": {
        "description": "Brain MRI with and without contrast",
        "cpt": "70553",
    },
    "auth_episode": {
        "status": "Pending — Additional Documentation Required",
        "current_stage_index": 2,
    },
    "payer_requirements": [
        {"id": "req_1", "label": "Clinical notes with indication", "complete": True},
        {"id": "req_2", "label": "Referral from ordering physician", "complete": True},
        {"id": "req_3", "label": "Prior imaging history", "complete": True},
        {"id": "req_4", "label": "Prior conservative treatment documentation", "complete": False},
        {"id": "req_5", "label": "Symptom progression notes", "complete": False},
    ],
    "blockers": [
        "Prior conservative treatment documentation",
        "Symptom progression notes",
    ],
    "next_action": "Obtain and upload prior conservative treatment documentation and symptom progression notes before resubmitting.",
    "ai_summary": "Maria Delgado (54F) has a brain MRI with and without contrast (CPT 70553) ordered by Dr. Aisha Patel. BlueCross BlueShield has requested additional documentation. The case is at stage 3 of 6 (Documentation Requested). Two of five payer requirements are incomplete: prior conservative treatment documentation and symptom progression notes. Submit these to unblock the authorization.",
    "timeline": [
        {"date": "2025-02-01", "event": "Order placed by Dr. Aisha Patel"},
        {"date": "2025-02-03", "event": "Initial prior auth submitted to BlueCross BlueShield"},
        {"date": "2025-02-10", "event": "Payer requested additional documentation"},
        {"date": "2025-02-12", "event": "Clinical notes and referral uploaded"},
        {"date": "2025-02-14", "event": "Imaging history submitted; conservative treatment and symptom notes still pending"},
    ],
    "risk_signal": "medium",
    "stages": [
        "Order Received",
        "Initial Submission",
        "Documentation Requested",
        "Documentation Review",
        "Payer Decision",
        "Complete",
    ],
}
