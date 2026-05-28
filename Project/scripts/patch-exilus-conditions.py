#!/usr/bin/env python3
"""
patch-exilus-conditions.py
--------------------------
Asigna condition tokens canónicos a los stats de weapon exilus mods
en mod-stats.override.json. Solo modifica entradas ya existentes en el override.

Uso:
  python3 patch-exilus-conditions.py            -- dry-run (imprime cambios)
  python3 patch-exilus-conditions.py --write    -- aplica cambios al override

Scope:
  - Weapon exilus (Primary, Secondary, Shotgun, Melee) con is_exilus=True
  - Excluye mod_class: Requiem, Antivirus
  - Excluye Warframe Mod, Peculiar Mod
  - Solo mods que ya existen en mod-stats.override.json

Fuera de scope (trabajo separado):
  - 27 weapon exilus que no están en el override (requieren upgrade_type también)
  - Normalización de tokens existentes (condition ya asignados)
"""

import json, re, sys, copy
from pathlib import Path

ROOT = Path(__file__).parent.parent
MODS_JSON = ROOT / "public/data/mods.json"
OVERRIDE = ROOT / "public/data/mod-stats.override.json"

WRITE_MODE = "--write" in sys.argv

# ---------------------------------------------------------------------------
# Vocabulario canónico de conditions (docs/data/schemas/conditions/vocabulary.md)
# Cada entrada: (regex sobre label, condition_token, note_override)
# Se aplican en orden; primer match gana.
# note_override=None -> sin note; str -> añadir/reemplazar note del stat.
# ---------------------------------------------------------------------------

CONDITION_RULES = [
    # "when Aiming for Xs" — el trigger real es on_hit (buff temporal); el label del override
    # omite el prefix "On Hit:" que sí aparece en mods.json. D-15: siempre activo.
    (
        re.compile(r'when aiming for', re.IGNORECASE),
        "on_hit",
        "buff applies while_aiming; label override missing On Hit: prefix (mods.json: On Hit: +X% Accuracy when Aiming for Ns); duracion escala r0→rMax — D-15 siempre activo",
    ),
    # Estado continuo de ADS (sin duración temporal)
    (re.compile(r'when aiming', re.IGNORECASE), "while_aiming", None),
    # Mecánica nombrada de Warframe: ADS en el aire (wiki: Maneuvers)
    (re.compile(r'while aim gliding', re.IGNORECASE), "while_aim_gliding", None),
    # Estado de slide
    (re.compile(r'when sliding', re.IGNORECASE), "while_sliding", None),
    # Estado de arma guardada. Nota: L1/L3 pendiente segun diseño de contexto multi-arma
    (
        re.compile(r'when holstered', re.IGNORECASE),
        "while_holstered",
        "L1/L3 ambiguo — depende de si el sim tiene nocion de arma activa; ver vocabulary.md",
    ),
    # Bloqueo continuo (distinto de on_block L3 evento puntual)
    (re.compile(r'while blocking', re.IGNORECASE), "while_blocking", None),
    # Mecánica Tennokai (Whispers in the Walls) — evento puntual L3
    (re.compile(r'on tennokai attacks', re.IGNORECASE), "on_tennokai_attack", None),
    # Buff temporal al sacar el arma — L3 evento
    (re.compile(r'on equip', re.IGNORECASE), "on_equip", None),
]

# ---------------------------------------------------------------------------
# Mods cuyo efecto es estructuralmente fuera del scope del weapon sim.
# Se asigna condition: null y se añade note explicativa.
# ---------------------------------------------------------------------------
OUT_OF_SCOPE_NOTES = {
    # Canticles — aura de aliados
    "FassAuraMod":    "ally aura effect — on kill grants ally shield recharge; out of weapon sim scope",
    "JahuAuraMod":    "ally aura effect — on kill reduces enemy armor/shields; out of weapon sim scope",
    "KhraAuraMod":    "ally aura effect — on kill chance to drop Universal Orb; out of weapon sim scope",
    "LohkAuraMod":    "ally aura effect — on kill grants ally fire rate; out of weapon sim scope",
}

# ---------------------------------------------------------------------------

def load_json(path: Path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def save_json(path: Path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

def map_condition(label: str) -> tuple[str | None, str | None]:
    """Devuelve (condition_token, note) para un label dado. None = sin cambio."""
    for pattern, token, note in CONDITION_RULES:
        if pattern.search(label):
            return token, note
    return None, None

def mod_id_from_unique_name(unique_name: str) -> str:
    return unique_name.rstrip("/").split("/")[-1]

def main():
    mods_data = load_json(MODS_JSON)
    override = load_json(OVERRIDE)

    # Conjunto de unique_names de weapon exilus elegibles
    weapon_exilus = {
        m["unique_name"]: m for m in mods_data
        if m.get("is_exilus")
        and m.get("type") not in ("Warframe Mod", "Peculiar Mod")
        and m.get("mod_class") not in ("Requiem", "Antivirus")
    }

    in_override = {k: v for k, v in weapon_exilus.items() if k in override}
    not_in_override = [m for k, m in weapon_exilus.items() if k not in override]

    print(f"Weapon exilus elegibles: {len(weapon_exilus)}")
    print(f"  En override (a patchear):  {len(in_override)}")
    print(f"  Fuera del override (skip): {len(not_in_override)}")
    print()

    updated_override = copy.deepcopy(override)
    changes = []

    for unique_name, mod in in_override.items():
        entry = updated_override[unique_name]
        mod_id = mod_id_from_unique_name(unique_name)

        # Caso: mod out-of-scope por ID
        if mod_id in OUT_OF_SCOPE_NOTES:
            for stat in entry["stats"]:
                old_note = stat.get("note")
                new_note = OUT_OF_SCOPE_NOTES[mod_id]
                if stat.get("condition") is None and old_note != new_note:
                    stat["note"] = new_note
                    changes.append({
                        "mod": entry["name"],
                        "label": stat["label"][:60],
                        "condition": None,
                        "note": new_note,
                    })
            continue

        for stat in entry["stats"]:
            label = stat.get("label", "")
            current_condition = stat.get("condition")

            # Si ya tiene condition asignada (no null), no sobreescribir
            if current_condition is not None:
                continue

            token, note = map_condition(label)
            if token is None:
                continue

            old_condition = stat.get("condition")
            old_note = stat.get("note")

            stat["condition"] = token
            if note is not None:
                stat["note"] = note

            changes.append({
                "mod": entry["name"],
                "label": label[:70],
                "old_condition": old_condition,
                "new_condition": token,
                "note": note,
            })

    # Reporte
    print(f"Cambios a aplicar: {len(changes)}")
    print()
    for c in changes:
        print(f"  [{c['mod']}]")
        print(f"    label:     {c['label']}")
        print(f"    condition: {c.get('old_condition')!r} → {c.get('new_condition')!r}")
        if c.get("note"):
            print(f"    note:      {c['note'][:80]}")
        print()

    if WRITE_MODE:
        save_json(OVERRIDE, updated_override)
        print(f"✓ Escrito: {OVERRIDE}")
    else:
        print("[dry-run] Pasar --write para aplicar cambios.")

    # Resumen de mods sin mapear (fuera del override)
    print()
    print(f"=== {len(not_in_override)} mods fuera del override (trabajo separado) ===")
    for m in sorted(not_in_override, key=lambda x: x["type"]):
        print(f"  [{m['type']}] {m['name']}")

if __name__ == "__main__":
    main()
