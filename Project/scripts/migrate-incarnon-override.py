#!/usr/bin/env python3
"""
migrate-incarnon-override.py

Migra incarnon-evolutions.override.json de weapon-first a genesis-first.

  Antes: { unique_name: { evolutions: {...} } }
  Después: { genesis_slug: { weapons: str | { alias: str }, evolutions: {...} } }

Estrategia:
  - Fingerprint groups para AGRUPAR weapons (no wikitext — más fiable)
  - Wikitext para resolver genesis_slug + detectar weapons faltantes

Dry-run por defecto. Pasa --write para sobreescribir el archivo.
Uso: python3 Project/scripts/migrate-incarnon-override.py [--write]
"""

import re
import json
import sys
from pathlib import Path
from collections import defaultdict

OVERRIDE_PATH = Path("Project/public/data/incarnon-evolutions.override.json")
WEAPONS_PATH  = Path("Project/public/data/weapons.json")
WIKITEXT_DIR  = Path("references/wiki/systems/incarnon/raw")
OUTPUT_PATH   = Path("Project/public/data/incarnon-evolutions.override.json")

# Weapons con fingerprint distinto al resto de su genesis (datos incompletos).
# display_name.lower() → genesis_slug correcto.
MANUAL_OVERRIDES: dict[str, str] = {
    "burston prime":  "burston-incarnon-genesis",
    "mk1-braton":     "braton-incarnon-genesis",
    "gorgon wraith":  "gorgon-incarnon-genesis",
    "dex sybaris":    "sybaris-incarnon-genesis",
    "latron wraith":  "latron-incarnon-genesis",
}

# ─── Carga ────────────────────────────────────────────────────────────────────

def load_data():
    override = json.load(OVERRIDE_PATH.open())
    weapons  = json.load(WEAPONS_PATH.open())
    by_name  = {w["name"].lower(): w["unique_name"] for w in weapons}
    name_of  = {v: k for k, v in by_name.items()}  # unique_name → display_name
    return override, by_name, name_of

# ─── Normalización para matching ──────────────────────────────────────────────

def norm(s: str) -> str:
    """Normaliza para comparación: minúsculas, & → and, solo alfanumérico."""
    s = s.lower().replace("&", "and")
    s = re.sub(r"-incarnon-genesis$", "", s)
    s = re.sub(r"[^a-z0-9]", "", s)
    return s

# ─── Alias desde display name + genesis base ─────────────────────────────────

def derive_alias(display_name: str, genesis_base: str) -> str:
    n = display_name.strip().lower()
    # Si el display name ES el arma base del genesis → "base"
    if norm(n) == norm(genesis_base):
        return "base"
    if re.match(r"mk1", n.replace("-", "").replace(" ", "")):
        return "mk1"
    if "prime" in n:    return "prime"
    if "wraith" in n:   return "wraith"
    if "vandal" in n:   return "vandal"
    if "prisma" in n:   return "prisma"
    if "synoid" in n:   return "synoid"
    if "telos" in n:    return "telos"
    if "dex" in n:      return "dex"
    if "kuva" in n:     return "kuva"
    # Fallback: slug del display name completo
    return re.sub(r"[^a-z0-9]+", "_", n.strip()).strip("_")

# ─── Fingerprint de perks ─────────────────────────────────────────────────────

def perk_fingerprint(wdata: dict) -> frozenset:
    evos = wdata.get("evolutions", {})
    perks = set()
    for td in evos.values():
        if isinstance(td, dict):
            perks.update(td.keys())
    return frozenset(perks)

# ─── Grupos por fingerprint ───────────────────────────────────────────────────

def compute_fingerprint_groups(override: dict) -> list[list[str]]:
    """Retorna lista de grupos [uid, ...] con mismo fingerprint de perks."""
    groups: dict[frozenset, list[str]] = defaultdict(list)
    for uid, wdata in override.items():
        if not isinstance(wdata, dict):
            continue
        groups[perk_fingerprint(wdata)].append(uid)
    return list(groups.values())

# ─── Slug matching ────────────────────────────────────────────────────────────

def find_genesis_slug(display_names: list[str], wt_slugs: set[str]) -> str | None:
    """
    Dado un grupo de display names, encuentra el wikitext slug que coincide.
    Prueba los nombres más cortos primero (el nombre base suele ser el más corto).
    """
    wt_norm = {norm(slug): slug for slug in wt_slugs}
    for name in sorted(display_names, key=len):  # más corto primero
        n = norm(name)
        if n in wt_norm:
            return wt_norm[n]
    return None

# ─── Weapons faltantes via wikitext ──────────────────────────────────────────

def weapons_from_wikitext(path: Path) -> list[str]:
    content = path.read_text(encoding="utf-8")
    names = re.findall(r"\{\{Weapon\|([^|}]+)", content)
    return list(dict.fromkeys(n.strip() for n in names))

def find_missing_weapons(genesis_map: dict, by_name: dict, wikitext_dir: Path) -> dict:
    """
    Para cada genesis slug, lee el wikitext y detecta weapons que
    están en el wikitext pero NO en el override (asignados a esa genesis).
    """
    missing = {}
    assigned_in_genesis = {
        uid
        for weapons in genesis_map.values()
        for uid in (weapons.values() if isinstance(weapons, dict) else [weapons])
    }

    for slug, weapons in genesis_map.items():
        wt_path = wikitext_dir / f"{slug}.wikitext"
        if not wt_path.exists():
            continue

        wt_names = weapons_from_wikitext(wt_path)
        absent = []
        for dname in wt_names:
            uid = by_name.get(dname.lower())
            if uid and uid not in assigned_in_genesis:
                absent.append(dname)

        if absent:
            missing[slug] = absent

    return missing

# ─── Genesis map (fingerprint + slug matching) ────────────────────────────────

def build_genesis_map(override: dict, by_name: dict, name_of: dict):
    wt_slugs = {p.stem for p in WIKITEXT_DIR.glob("*.wikitext")}

    groups       = compute_fingerprint_groups(override)
    # Paso 1: asignar cada grupo de fingerprint a un genesis_slug
    uid_to_slug = {}    # uid → genesis_slug
    manual_uids = set() # uids asignados vía MANUAL_OVERRIDES (datos inconsistentes)

    for uids in sorted(groups, key=lambda g: sorted(g)):
        display_names = [name_of.get(uid, uid.split("/")[-1]) for uid in uids]
        dn_lower      = [d.lower() for d in display_names]

        genesis_slug = find_genesis_slug(display_names, wt_slugs)

        if genesis_slug is None:
            for dn in dn_lower:
                if dn in MANUAL_OVERRIDES:
                    genesis_slug = MANUAL_OVERRIDES[dn]
                    manual_uids.update(uids)
                    break

        if genesis_slug is None:
            print(f"⚠  Sin match (agregar a MANUAL_OVERRIDES si es correcto): {display_names}")
            genesis_slug = "_UNMAPPED_" + re.sub(
                r"[^a-z0-9]+", "-", display_names[0].lower()
            ).strip("-")

        for uid in uids:
            uid_to_slug[uid] = genesis_slug

    # Paso 2: agrupar por genesis_slug, asignar aliases
    slug_to_uids: dict[str, list[str]] = defaultdict(list)
    for uid, slug in uid_to_slug.items():
        slug_to_uids[slug].append(uid)

    genesis_map = {}
    for slug, uids in slug_to_uids.items():
        genesis_base = re.sub(r"-incarnon-genesis$", "", slug)
        weapons = {}
        for uid in uids:
            dname = name_of.get(uid, uid.split("/")[-1])
            alias = derive_alias(dname, genesis_base)
            base_alias = alias
            n = 2
            while alias in weapons:
                alias = f"{base_alias}_{n}"
                n += 1
            weapons[alias] = uid
        genesis_map[slug] = weapons

    if manual_uids:
        print("⚠  Weapons con fingerprint inconsistente (perk data a revisar/completar):")
        for uid in sorted(manual_uids):
            dname = name_of.get(uid, uid.split("/")[-1])
            print(f"   {dname} → {uid_to_slug[uid]}")

    return genesis_map

# ─── Merge de efectos ─────────────────────────────────────────────────────────

def merge_effects(effects_by_uid: dict, alias_of: dict) -> list:
    # Usar la primera lista no vacía como plantilla de tokens
    base_effects = next((fx for fx in effects_by_uid.values() if fx), [])
    if not base_effects:
        return []

    uids   = list(effects_by_uid.keys())
    merged = []

    for effect in base_effects:
        token = effect.get("upgrade_type")

        if token is None:
            merged.append(dict(effect))
            continue

        values = {}
        for uid in uids:
            e = next(
                (x for x in effects_by_uid[uid] if x.get("upgrade_type") == token),
                None,
            )
            values[alias_of[uid]] = e.get("value") if e else None

        unique_vals = set(str(v) for v in values.values())
        if len(unique_vals) == 1:
            merged.append({"upgrade_type": token, "value": effect.get("value")})
        else:
            merged.append({"upgrade_type": token, "value": values})

    return merged


def build_evolutions(genesis_weapons: dict, override: dict) -> dict:
    alias_of = {uid: alias for alias, uid in genesis_weapons.items()}
    uids     = list(genesis_weapons.values())

    # Unión de todos los tiers y perk IDs entre todos los weapons del genesis
    all_tiers: dict[str, list[str]] = {}
    for uid in uids:
        for tier, tier_data in override.get(uid, {}).get("evolutions", {}).items():
            if not isinstance(tier_data, dict):
                continue
            if tier not in all_tiers:
                all_tiers[tier] = []
            for perk_id in tier_data:
                if perk_id not in all_tiers[tier]:
                    all_tiers[tier].append(perk_id)

    merged = {}
    for tier in sorted(all_tiers.keys()):
        merged_tier = {}
        for perk_id in all_tiers[tier]:
            fx_by_uid = {
                uid: override.get(uid, {})
                         .get("evolutions", {})
                         .get(tier, {})
                         .get(perk_id, [])
                for uid in uids
            }
            merged_tier[perk_id] = merge_effects(fx_by_uid, alias_of)
        merged[tier] = merged_tier

    return merged

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    dry_run = "--write" not in sys.argv

    override, by_name, name_of = load_data()
    print(f"Override: {len(override)} weapons  |  Wikitext: {len(list(WIKITEXT_DIR.glob('*.wikitext')))} files\n")

    genesis_map = build_genesis_map(override, by_name, name_of)

    # Detectar weapons faltantes (en wikitext pero no en override)
    missing = find_missing_weapons(genesis_map, by_name, WIKITEXT_DIR)

    # ── Reporte ───────────────────────────────────────────────────────────────
    print(f"\nGenesis mapeados: {len(genesis_map)}")

    if missing:
        print("\n⚠  Weapons en wikitext AUSENTES del override (añadir manualmente):")
        for slug, names in sorted(missing.items()):
            print(f"   {slug}: {names}")

    print("\n--- Genesis map ---")
    for slug, weapons in sorted(genesis_map.items()):
        if isinstance(weapons, str):
            print(f"  {slug:<45} [{weapons.split('/')[-1]}]")
        else:
            aliases = ", ".join(f"{a}={uid.split('/')[-1]}" for a, uid in weapons.items())
            print(f"  {slug:<45} [{aliases}]")

    if dry_run:
        print("\n[DRY RUN] Pasa --write para sobreescribir el archivo.")
        return

    # ── Build output ──────────────────────────────────────────────────────────
    output = {}
    for slug in sorted(genesis_map.keys()):
        weapons = genesis_map[slug]
        evos    = build_evolutions(weapons, override)

        if len(weapons) == 1:
            weapons_field = list(weapons.values())[0]
        else:
            weapons_field = weapons  # { alias: unique_name }

        output[slug] = {"weapons": weapons_field, "evolutions": evos}

    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)
        f.write("\n")

    total_fx = sum(
        len(fx)
        for g in output.values()
        for tier in g["evolutions"].values()
        for fx in tier.values()
    )
    print(f"\nEscrito: {OUTPUT_PATH}")
    print(f"Genesis: {len(output)}  |  Efectos totales: {total_fx}")


if __name__ == "__main__":
    main()
