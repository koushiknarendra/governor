from .india import Entity, detect as detect_india, redact as redact_india
from .common import detect as detect_common
from .eu import detect as detect_eu
from .us import detect as detect_us


def detect_all(text: str) -> list[Entity]:
    india = detect_india(text)
    common = detect_common(text)
    eu = detect_eu(text)
    us = detect_us(text)

    seen: set[tuple[int, int]] = {(e.start, e.end) for e in india}
    merged = list(india)
    for e in common + eu + us:
        span = (e.start, e.end)
        if span not in seen:
            seen.add(span)
            merged.append(e)

    merged.sort(key=lambda e: e.start)
    return merged


def redact_all(text: str, replacement: str = "token") -> tuple[str, list[Entity]]:
    all_entities = detect_all(text)
    if not all_entities:
        return text, []

    # Resolve overlaps — keep longest span
    non_overlapping: list[Entity] = []
    for entity in all_entities:
        if non_overlapping and entity.start < non_overlapping[-1].end:
            if (entity.end - entity.start) > (non_overlapping[-1].end - non_overlapping[-1].start):
                non_overlapping[-1] = entity
        else:
            non_overlapping.append(entity)

    import re as _re
    from .india import _mask
    result = []
    cursor = 0
    for entity in non_overlapping:
        result.append(text[cursor:entity.start])
        if replacement == "mask":
            if entity.type in ("AADHAAR", "PAN", "MOBILE_IN", "UPI_ID"):
                result.append(_mask(entity))
            elif entity.type == "CREDIT_CARD":
                digits = _re.sub(r'\D', '', entity.value)
                result.append(f"XXXX-XXXX-XXXX-{digits[-4:]}")
            elif entity.type == "SSN_US":
                parts = _re.split(r'[-\s]', entity.value)
                result.append(f"XXX-XX-{parts[-1]}" if len(parts) == 3 else "[SSN_US]")
            elif entity.type == "IBAN":
                v = entity.value.replace(" ", "")
                result.append(v[:4] + "X" * (len(v) - 8) + v[-4:])
            else:
                result.append(f"[{entity.type}]")
        else:
            result.append(f"[{entity.type}]")
        cursor = entity.end
    result.append(text[cursor:])

    return "".join(result), non_overlapping
