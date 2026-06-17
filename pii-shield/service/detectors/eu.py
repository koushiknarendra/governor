"""
GDPR / EU PII detectors.

Entities:
    IBAN         — International Bank Account Number (ISO 13616)
    UK_NIN       — UK National Insurance Number
    EU_PASSPORT  — Generic EU passport number patterns
    CREDIT_CARD  — Payment card (Visa/MC/Amex/Discover, Luhn-validated)
"""
from __future__ import annotations
import re
from .india import Entity


# ── IBAN (ISO 13616) ────────────────────────────────────────────────────────
# 2-letter country code + 2 check digits + up to 30 alphanumeric BBAN
# Anchored to known SEPA/global country codes to minimise false positives.
_IBAN_CC = (
    r'GB|DE|FR|ES|IT|NL|BE|AT|CH|SE|DK|NO|FI|PL|PT|GR|IE|CZ|HU|RO|'
    r'BG|HR|SK|SI|LT|LV|EE|LU|CY|MT|IS|LI|MC|SM|VA|'
    r'SA|AE|KW|QA|BH|JO|IL|TR|UA|RS|BA|MK|AL|MD|GE|'
    r'AM|AZ|BY|KZ|TN|MA|MU|SC'
)
# Matches with or without spaces every 4 chars
_IBAN = re.compile(
    r'\b((?:' + _IBAN_CC + r')[0-9]{2}'
    r'(?:[A-Z0-9]{4}\s?){2,7}[A-Z0-9]{1,4})\b',
    re.ASCII,
)


# ── UK National Insurance Number ────────────────────────────────────────────
# Format: 2 letters + 6 digits + 1 letter suffix (A–D or space)
# First letter: not D, F, I, Q, U, V
# Second letter: not D, F, I, O, Q, U, V
# Prefix pairs not allowed: BG, GB, NK, KN, NT, TN, ZZ
_UK_NIN = re.compile(
    r'\b(?!BG|GB|NK|KN|NT|TN|ZZ)'
    r'[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]'
    r'[0-9]{6}'
    r'[A-D]\b',
    re.ASCII,
)


# ── EU Passport (generic) ───────────────────────────────────────────────────
# Most EU passports: 1–2 letters followed by 6–8 digits (e.g. P12345678)
# Anchored to keyword context to keep precision high.
_EU_PASSPORT = re.compile(
    r'(?i)(?:passport|pass(?:port)?\s*(?:number|no\.?|#))\s*:?\s*'
    r'([A-Z]{1,2}[0-9]{6,8})\b',
    re.ASCII,
)


# ── Credit / Debit Card ─────────────────────────────────────────────────────
# Visa (16), Mastercard (16), Amex (15), Discover (16)
# Luhn check applied to filter false positives.
_CARD_RAW = re.compile(
    r'\b('
    r'4[0-9]{12}(?:[0-9]{3})?'                                 # Visa 13/16
    r'|(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}'
    r'|27[01][0-9]|2720)[0-9]{12}'                             # Mastercard 16
    r'|3[47][0-9]{13}'                                         # Amex 15
    r'|6(?:011|5[0-9]{2})[0-9]{12}'                           # Discover 16
    r')\b'
)


def _luhn(number: str) -> bool:
    digits = [int(d) for d in number if d.isdigit()]
    if len(digits) < 13:
        return False
    total = 0
    for i, d in enumerate(reversed(digits)):
        total += d if i % 2 == 0 else (d * 2 - 9 if d * 2 > 9 else d * 2)
    return total % 10 == 0


# ── Public API ──────────────────────────────────────────────────────────────

def detect(text: str) -> list[Entity]:
    entities: list[Entity] = []

    for m in _IBAN.finditer(text):
        val = m.group(1).replace(" ", "")
        entities.append(Entity(type="IBAN", value=m.group(1), start=m.start(1), end=m.end(1)))

    for m in _UK_NIN.finditer(text):
        entities.append(Entity(type="UK_NIN", value=m.group(), start=m.start(), end=m.end()))

    for m in _EU_PASSPORT.finditer(text):
        g = m.group(1)
        entities.append(Entity(type="EU_PASSPORT", value=g, start=m.start(1), end=m.end(1)))

    for m in _CARD_RAW.finditer(text):
        digits_only = re.sub(r'\D', '', m.group(1))
        if _luhn(digits_only):
            entities.append(Entity(type="CREDIT_CARD", value=m.group(1), start=m.start(1), end=m.end(1)))

    entities.sort(key=lambda e: e.start)
    return entities
