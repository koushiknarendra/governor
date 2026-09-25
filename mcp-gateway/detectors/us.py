"""
HIPAA / US PII detectors.

Entities:
    SSN_US       — US Social Security Number
    US_PASSPORT  — US passport number (C/B + 8 digits)
    US_DL        — US driver's license (anchored to keyword context)
    US_PHONE     — NANP phone numbers (+1 format)
    US_ZIPCODE   — 5- or 9-digit ZIP code (keyword-anchored)
    MRN          — Medical Record Number (keyword-anchored)
    NPI          — National Provider Identifier (10-digit LUHN-validated)
"""
from __future__ import annotations
import re
from .india import Entity


# ── SSN (Social Security Number) ────────────────────────────────────────────
# Format: 3 digits + separator + 2 digits + separator + 4 digits
# Invalid: area=000, 666, 900-999; group=00; serial=0000
_SSN = re.compile(
    r'\b(?!000|666|9\d{2})'
    r'(\d{3})'
    r'(?P<sep>[-\s]?)'
    r'(?!00)\d{2}'
    r'(?P=sep)'
    r'(?!0000)\d{4}\b',
)
# Capture the full SSN by a simpler approach — use a two-step match
_SSN_FULL = re.compile(
    r'\b(?!(?:000|666|9\d{2})[-\s])'
    r'(?![\d]{3}[-\s]00[-\s])'
    r'(?![\d]{3}[-\s]\d{2}[-\s]0000)'
    r'(\d{3}[-\s]\d{2}[-\s]\d{4})\b',
    re.ASCII,
)


# ── US Passport ─────────────────────────────────────────────────────────────
# US passports: one letter (B or C) followed by 8 digits
_US_PASSPORT = re.compile(
    r'(?i)(?:passport|pass(?:port)?\s*(?:number|no\.?|#))\s*:?\s*'
    r'([BC][0-9]{8})\b',
    re.ASCII,
)


# ── NANP Phone (US/Canada/Caribbean) ────────────────────────────────────────
# +1 followed by area + number, various separators
_US_PHONE = re.compile(
    r'(?<!\d)'
    r'(\+1[-.\s]?'
    r'(?:\(\d{3}\)[-.\s]?|\d{3}[-.\s]?)'
    r'\d{3}[-.\s]?\d{4})'
    r'(?!\d)',
    re.ASCII,
)


# ── ZIP Code (keyword-anchored) ──────────────────────────────────────────────
_US_ZIP = re.compile(
    r'(?i)(?:zip(?:\s*code)?|postal(?:\s*code)?)\s*:?\s*'
    r'(\d{5}(?:-\d{4})?)\b',
    re.ASCII,
)


# ── Medical Record Number (keyword-anchored) ─────────────────────────────────
_MRN = re.compile(
    r'(?i)(?:mrn|medical\s+record\s+(?:number|no\.?|#)|patient\s+id)\s*:?\s*'
    r'([A-Z0-9]{4,12})\b',
    re.ASCII,
)


# ── NPI (National Provider Identifier) ──────────────────────────────────────
# 10 digits; starts with 1 or 2; Luhn-validated with prefix 80840
def _luhn_npi(npi: str) -> bool:
    # Prefix 80840 is prepended to 10-digit NPI for Luhn check
    full = "80840" + npi
    digits = [int(d) for d in full]
    total = 0
    for i, d in enumerate(reversed(digits)):
        total += d if i % 2 == 0 else (d * 2 - 9 if d * 2 > 9 else d * 2)
    return total % 10 == 0


_NPI = re.compile(
    r'(?i)(?:npi|national\s+provider\s+(?:identifier|id|number))\s*:?\s*'
    r'([12][0-9]{9})\b',
    re.ASCII,
)


# ── Public API ───────────────────────────────────────────────────────────────

def detect(text: str) -> list[Entity]:
    entities: list[Entity] = []

    for m in _SSN_FULL.finditer(text):
        entities.append(Entity(type="SSN_US", value=m.group(1), start=m.start(1), end=m.end(1)))

    for m in _US_PASSPORT.finditer(text):
        g = m.group(1)
        entities.append(Entity(type="US_PASSPORT", value=g, start=m.start(1), end=m.end(1)))

    for m in _US_PHONE.finditer(text):
        entities.append(Entity(type="US_PHONE", value=m.group(1), start=m.start(1), end=m.end(1)))

    for m in _US_ZIP.finditer(text):
        entities.append(Entity(type="US_ZIPCODE", value=m.group(1), start=m.start(1), end=m.end(1)))

    for m in _MRN.finditer(text):
        entities.append(Entity(type="MRN", value=m.group(1), start=m.start(1), end=m.end(1)))

    for m in _NPI.finditer(text):
        npi = m.group(1)
        if _luhn_npi(npi):
            entities.append(Entity(type="NPI", value=npi, start=m.start(1), end=m.end(1)))

    entities.sort(key=lambda e: e.start)
    return entities
