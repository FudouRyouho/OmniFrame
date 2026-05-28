"""
map-incarnon-perks.py
Convierte Project/scratch/incarnon-raw-extract.json → incarnon-evolutions.override.json.

Estrategia: heurístico — mapea lo clasificable automáticamente;
            deja {upgrade_type: null, note: "..."} para el resto.
El usuario revisa y ajusta manualmente el JSON resultante.

Uso: cd /HDD/Development/Warframe/OmniFrame && python3 Project/scripts/map-incarnon-perks.py
"""

import re, json
from pathlib import Path

EXTRACT_FILE = Path("Project/scratch/incarnon-raw-extract.json")
WEAPONS_FILE = Path("Project/public/data/weapons.json")
OUT_FILE     = Path("Project/public/data/incarnon-evolutions.override.json")

extract     = json.load(EXTRACT_FILE.open())
weapons_raw = json.load(WEAPONS_FILE.open())
by_name     = {w["name"].lower(): w["unique_name"] for w in weapons_raw}

# ─── Value parser ─────────────────────────────────────────────────────────────

def parse_value(s: str) -> float | None:
    """Extrae el primer número absoluto de '+18', '+20%', 'X = 24\\nY = 30', '3.4x'."""
    if not s:
        return None
    m = re.search(r"(?:[A-Z]\s*=\s*)?([+\-]?\d+(?:\.\d+)?)", s)
    if m:
        return abs(float(m.group(1)))
    return None

def clean_value(v: float | None) -> int | float | None:
    if v is None:
        return None
    return int(v) if v == int(v) else v

# ─── Condicionales — excluir de clasificación automática ─────────────────────

COND = [
    "on kill", "on hit", "on reload", "on first", "on killing",
    "on targets", "on enemy", "on enemies", "on 50", "on slide",
    "stacks up", "per stack", "per enemy",
    "with armor", "with channeled", "with sprint", "with melee equipped",
    "with primary equipped", "with combo", "with critical chance below",
    "active:", "when ", "while ", "for 10s", "for 6s", "for 5s", "for 9s",
    "pauses when", "holstered", "does not apply", "requires manually",
    "currently not", "this applies", "damage bonus", "unique modifier",
]

def is_conditional(text: str) -> bool:
    t = text.lower()
    return any(kw in t for kw in COND)

# ─── Clasificador heurístico ──────────────────────────────────────────────────

CLASSIFIERS = [
    # (regex, token)  — orden importa: más específico primero
    (r"increase\s+(?:base\s+)?critical\s+chance\s+by\s+\+",    "WEAPON_BASE_CRIT_CHANCE"),
    (r"increase\s+(?:base\s+)?status\s+chance\s+by\s+\+",      "WEAPON_BASE_STATUS_CHANCE"),
    (r"increase\s+(?:magazine|ammo)\s+(?:capacity|maximum)\s+by\s+\+", "WEAPON_BASE_MAGAZINE_MAX"),
    (r"\+[\d.]+%\s+reload\s+speed",                             "WEAPON_ADD_RELOAD_SPEED"),
    (r"increase\s+reload\s+speed\b",                            "WEAPON_ADD_RELOAD_SPEED"),
    (r"\+[\d.]+\s+multishot",                                   "WEAPON_ADD_MULTISHOT"),
    (r"\+[\d.]+\s+range\b",                                     "WEAPON_ADD_RANGE"),
    (r"increase\s+(?:base\s+)?damage\s+by\s+\+",               "WEAPON_BASE_DAMAGE"),
    (r"increase\s+damage\s+by\s+\+",                            "WEAPON_BASE_DAMAGE"),
    (r"increase\s+damage\s+by\s+x\.",                           "WEAPON_BASE_DAMAGE"),
]

def classify(text: str, value_str: str | None) -> dict:
    if is_conditional(text):
        return {"upgrade_type": None, "note": text[:160]}

    t = text.lower()

    # SET operation — ammo capacity TO N (no ADD)
    if re.search(r"increase\s+(?:ammo|magazine)\s+(?:capacity|maximum)\s+to\b", t):
        val = clean_value(parse_value(value_str or text))
        return {"upgrade_type": None, "note": f"WEAPON_SET_MAGAZINE_MAX {val} — SET, token pending"}

    for pattern, token in CLASSIFIERS:
        if re.search(pattern, t):
            val = clean_value(parse_value(value_str) if value_str else parse_value(text))
            if val is not None:
                return {"upgrade_type": token, "value": val}
            return {"upgrade_type": None, "note": f"{token} — valor no extraído: {text[:80]}"}

    return {"upgrade_type": None, "note": text[:160]}

# ─── Resolución de nombres de variantes ──────────────────────────────────────

def expand_variant(variant_key: str, slug_base: str) -> list[str]:
    """
    Dado 'Telos / Prime' y base 'boltor', retorna lista de unique_names.
    Maneja: '{base} {part}', '{part} {base}', 'Mk1-{base}', 'Dex {base}'.
    """
    parts = [p.strip() for p in variant_key.split("/")]
    base_words = slug_base.split()
    base_cap   = " ".join(w.capitalize() for w in base_words)
    result     = []

    for part in parts:
        candidates = [
            part,
            f"{base_cap} {part}",
            f"{part} {base_cap}",
        ]
        # Prefijo Mk1- y Dex
        if re.match(r"^Mk\d", part, re.I):
            candidates.append(f"{part}-{base_cap}")
            for w in base_words:
                candidates.append(f"{part}-{w.capitalize()}")
        if part.lower() == "dex":
            candidates.append(f"Dex {base_cap}")

        found = False
        for c in candidates:
            uid = by_name.get(c.lower())
            if uid and uid not in result:
                result.append(uid)
                found = True
                break

        if not found:
            # Un solo word del base puede ser suficiente (e.g., "Bolt" no, pero para casos edge)
            for word in base_words:
                for c in [f"{word.capitalize()} {part}", f"{part} {word.capitalize()}",
                          f"Mk1-{word.capitalize()}"]:
                    uid = by_name.get(c.lower())
                    if uid and uid not in result:
                        result.append(uid)
                        found = True
                        break
                if found:
                    break

    return result

# ─── Weapons para un slug ─────────────────────────────────────────────────────

def weapons_for_slug(slug: str, slug_data: dict) -> dict[str, str]:
    """Retorna {weapon_name: unique_name} para el slug."""
    fmt          = slug_data.get("format", "A")
    weapons_list = slug_data.get("weapons", [])
    base         = re.sub(r"-incarnon-genesis$", "", slug).replace("-", " ")
    base_cap     = " ".join(w.capitalize() for w in base.split())

    # Format B con lista explícita
    if fmt == "B" and weapons_list:
        result = {}
        for wname in weapons_list:
            uid = by_name.get(wname.lower())
            if uid:
                result[wname] = uid
            else:
                print(f"  ⚠ no resuelto (B): '{wname}' en {slug}")
        return result

    # Recopilar variant keys de todos los effects
    variant_keys: set[str] = set()
    for tier_perks in slug_data["tiers"].values():
        for perk in tier_perks:
            for e in perk["effects"]:
                variant_keys.update(e.get("values", {}).keys())

    if variant_keys:
        result: dict[str, str] = {}
        for vk in variant_keys:
            uids = expand_variant(vk, base)
            for uid in uids:
                wobj = next((w for w in weapons_raw if w["unique_name"] == uid), None)
                if wobj and wobj["name"] not in result:
                    result[wobj["name"]] = uid
            if not uids:
                print(f"  ⚠ variant no resuelta: '{vk}' en {slug}")
        return result

    # Sin variants: búsqueda directa por nombre de slug base
    # Normalizar "and" ↔ "&" para slugs como "ack-and-brunt"
    base_alts = [base, base.replace(" and ", " & "), base.replace(" & ", " and ")]
    for alt in base_alts:
        uid = by_name.get(alt.lower())
        if uid:
            return {alt.title().replace(" & ", " & "): uid}
    uid = by_name.get(base.lower())
    if uid:
        return {base_cap: uid}

    # Búsqueda word-boundary (solo si base >= 4 chars para evitar falsos positivos)
    if len(base) >= 4:
        result = {}
        for w in weapons_raw:
            if re.search(r"\b" + re.escape(base.lower()) + r"\b", w["name"].lower()):
                result[w["name"]] = w["unique_name"]
        if result:
            return result

    print(f"  ⚠ sin weapons: {slug} (base='{base}')")
    return {}

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    output: dict = {}
    ok_count = null_count = weapon_count = 0

    for slug, slug_data in sorted(extract.items()):
        w_map = weapons_for_slug(slug, slug_data)  # {name: uid}
        if not w_map:
            continue

        all_uids  = list(w_map.values())
        uid_evos: dict[str, dict] = {uid: {} for uid in all_uids}

        for tier_str, perks in slug_data["tiers"].items():
            for perk in perks:
                perk_id  = perk["perk_id"]
                effects  = perk["effects"]
                has_vals = any(e.get("values") for e in effects)

                if has_vals:
                    uid_entries: dict[str, list] = {uid: [] for uid in all_uids}

                    for e in effects:
                        vals = e.get("values", {})
                        if vals:
                            for vk, val_str in vals.items():
                                targets = expand_variant(vk, re.sub(r"-incarnon-genesis$", "", slug).replace("-", " "))
                                if not targets:
                                    targets = all_uids  # fallback
                                for uid in targets:
                                    if uid in uid_entries:
                                        uid_entries[uid].append(classify(e["text"], val_str))
                        else:
                            # Sin variante → aplicar a todos
                            entry = classify(e["text"], None)
                            for uid in all_uids:
                                uid_entries[uid].append(entry)

                    for uid, entries in uid_entries.items():
                        if entries:
                            uid_evos[uid].setdefault(tier_str, {})[perk_id] = entries

                else:
                    entries = [classify(e["text"], None) for e in effects]
                    for uid in all_uids:
                        uid_evos[uid].setdefault(tier_str, {})[perk_id] = entries

        for uid, evos in uid_evos.items():
            if evos:
                output[uid] = {"evolutions": evos}
                weapon_count += 1
                for tier in evos.values():
                    for entries in tier.values():
                        for e in entries:
                            if e.get("upgrade_type") is not None:
                                ok_count += 1
                            else:
                                null_count += 1

    OUT_FILE.write_text(json.dumps(output, indent=2, ensure_ascii=False))
    total = ok_count + null_count
    pct   = int(ok_count * 100 / total) if total else 0
    print(f"\n→ {OUT_FILE}")
    print(f"  Weapons escritas : {weapon_count}")
    print(f"  Entries con token: {ok_count} / {total} ({pct}%)")
    print(f"  Entries null(gap): {null_count} / {total} ({100 - pct}%)")

if __name__ == "__main__":
    main()
