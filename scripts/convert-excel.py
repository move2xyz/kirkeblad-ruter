#!/usr/bin/env python3
"""Convert Kirkeblad.xlsx to routes.json for the webapp."""

import json
import os
import re
from typing import Optional
import openpyxl

EXCEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'Kirkeblad.xlsx')
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'routes.json')

# Known non-street entries (notes/institutions, not actual streets to map)
NON_STREET_PATTERNS = [
    r'blade afleveres',
    r'plejehjemmet',
    r'plejehjem',
]


def is_note_entry(text: str) -> bool:
    """Check if a street entry is actually a note (not a real street)."""
    lower = text.lower()
    for pattern in NON_STREET_PATTERNS:
        if re.search(pattern, lower):
            return True
    return False


def parse_street_entry(raw: str) -> dict:
    """Parse a street entry into name and details."""
    raw = raw.replace('\xa0', ' ').strip()

    if is_note_entry(raw):
        return {"type": "note", "text": raw}

    # Try to separate street name from number details
    # Patterns like "Streetname lige nr. X-Y" or "Streetname 2-50" or "Streetname ulige numre"
    # Also handle "Østerbrogade 9-93" and "Rolighedsvej 2 -60 og ulige nr. 1-55"
    match = re.match(
        r'^(.+?)\s+(lige\s+nr\.|ulige\s+nr\.|lige\s+numre|ulige\s+numre|lige\b|ulige\b|\d+\s*[-–]\s*\d+)',
        raw
    )
    if match:
        name = match.group(1).strip()
        details = raw[match.start(2):].strip()
        return {"type": "street", "name": name, "details": details}

    # Check for "– alle boliger på pierren" style suffixes
    match = re.match(r'^(.+?)\s+[-–]\s+(.+)$', raw)
    if match:
        name = match.group(1).strip()
        details = match.group(2).strip()
        return {"type": "street", "name": name, "details": details}

    # Check for "syd for Vestergade" / "nord for Vestergade" style suffixes
    match = re.match(r'^(.+?)\s+(syd for|nord for|øst for|vest for)\s+(.+)$', raw)
    if match:
        name = match.group(1).strip()
        details = f"{match.group(2)} {match.group(3)}".strip()
        return {"type": "street", "name": name, "details": details}

    return {"type": "street", "name": raw, "details": None}


def normalize_route_id(route_id: str) -> str:
    """Normalize route IDs: '10 A' → '10A'."""
    return route_id.replace(' ', '')


def parse_multiline(value: Optional[str]) -> Optional[str]:
    """Clean up multiline text from Excel cells."""
    if not value:
        return None
    return value.replace('\xa0', ' ').strip()


def main():
    wb = openpyxl.load_workbook(EXCEL_PATH)
    ws = wb['Q4']  # Route definitions are the same across all sheets

    routes = []

    for row in ws.iter_rows(min_row=2, max_row=16, values_only=False):
        values = [cell.value for cell in row]

        sortering = values[0]
        if sortering is None:
            break

        route_id = normalize_route_id(str(values[1]).strip())
        antal_blade = int(values[2])
        note = parse_multiline(str(values[5])) if values[5] else None

        # Parse streets (columns G through O, indices 6-14)
        streets = []
        notes = []
        for i in range(6, 15):
            raw = values[i]
            if raw is None:
                continue
            raw = str(raw).replace('\xa0', ' ').strip()
            if not raw:
                continue

            entry = parse_street_entry(raw)
            if entry["type"] == "note":
                notes.append(entry["text"])
            else:
                streets.append(entry)

        # Parse door codes (column P, index 15)
        koder_raw = values[15]
        koder = parse_multiline(str(koder_raw)) if koder_raw else None

        route = {
            "id": route_id,
            "sortering": int(sortering),
            "antalBlade": antal_blade,
            "streets": streets,
            "notes": notes,
            "koder": koder,
        }
        if note:
            route["routeNote"] = note

        routes.append(route)

    # Sort by sortering
    routes.sort(key=lambda r: r["sortering"])

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(routes, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(routes)} routes to {OUTPUT_PATH}")
    for route in routes:
        street_names = [s["name"] for s in route["streets"]]
        print(f"  Route {route['id']}: {route['antalBlade']} blade, {len(route['streets'])} streets: {', '.join(street_names)}")
        if route["notes"]:
            print(f"    Notes: {route['notes']}")
        if route.get("koder"):
            print(f"    Koder: {route['koder'][:60]}...")


if __name__ == '__main__':
    main()
