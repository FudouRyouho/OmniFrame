#!/usr/bin/env python3
"""
add-exilus-missing.py
---------------------
Añade las 27 entradas de weapon exilus que no están en mod-stats.override.json.

Uso:
  python3 add-exilus-missing.py            -- dry-run (muestra entradas a añadir)
  python3 add-exilus-missing.py --write    -- aplica cambios al override

Criterios de entrada:
  is_exilus=True, type != Warframe/Peculiar, mod_class != Requiem/Antivirus
  unique_name NOT YA en mod-stats.override.json

Notas de diseño aplicadas:
  D-14: condition? y note? como tracking de diseño
  D-15: Fase 0 siempre activo; stacking = total max en base_value
  D-16: ≥70% cobertura por sector — este batch cubre exilus weapon al 100%
"""

import json, sys, copy
from pathlib import Path

ROOT = Path(__file__).parent.parent
MODS_JSON = ROOT / "public/data/mods.json"
OVERRIDE  = ROOT / "public/data/mod-stats.override.json"

WRITE_MODE = "--write" in sys.argv

# ---------------------------------------------------------------------------
# Definición explícita de entradas.
# Clave: unique_name suffix (parte final del path).
# Cada entrada define el mapping semántico verificado manualmente.
# ---------------------------------------------------------------------------

ENTRIES_BY_SUFFIX = {

    # ------------------------------------------------------------------
    # Recoil reduction — token existente WEAPON_ADD_RECOIL
    # ------------------------------------------------------------------

    "WeaponRecoilReductionModExpert": {
        "name": "Primed Stabilizer",
        "stats": [{
            "label": "-|val1|% Weapon Recoil",
            "values": [{"base_value": [-7.7,-15.5,-23.2,-30.9,-38.6,-46.4,-54.1,-61.8,-69.5,-77.3,-85.0], "upgrade_type": "WEAPON_ADD_RECOIL"}],
            "condition": None,
        }],
    },

    # Nota: WeaponRecoilReductionMod aparece para Rifle (Stabilizer) y Pistol (Steady Hands)
    # Se distinguen por type — el script los resuelve por unique_name completo.
    "rifle_WeaponRecoilReductionMod": {
        "_type": "Primary Mod",
        "name": "Stabilizer",
        "stats": [{
            "label": "-|val1|% Weapon Recoil",
            "values": [{"base_value": [-15.0,-30.0,-45.0,-60.0], "upgrade_type": "WEAPON_ADD_RECOIL"}],
            "condition": None,
        }],
    },

    "pistol_WeaponRecoilReductionMod": {
        "_type": "Secondary Mod",
        "name": "Steady Hands",
        "stats": [{
            "label": "-|val1|% Weapon Recoil",
            "values": [{"base_value": [-15.0,-30.0,-45.0,-60.0], "upgrade_type": "WEAPON_ADD_RECOIL"}],
            "condition": None,
        }],
    },

    # ------------------------------------------------------------------
    # Critical Damage — WEAPON_ADD_CRIT_MULT (Beginner variant)
    # ------------------------------------------------------------------

    "WeaponCritDamageModBeginner": {
        "name": "Ravage",
        "stats": [{
            "label": "+|val1|% Critical Damage",
            "values": [{"base_value": [7.5,15.0,22.5,30.0], "upgrade_type": "WEAPON_ADD_CRIT_MULT"}],
            "condition": None,
        }],
    },

    # ------------------------------------------------------------------
    # On Equip — recoil + accuracy (3 variantes: Rifle, Pistol, Shotgun)
    # HolsterSpeedBonusMod se distingue por tipo de arma.
    # D-15: buff temporal 8s ignorado — siempre activo.
    # ------------------------------------------------------------------

    "rifle_HolsterSpeedBonusMod": {
        "_type": "Primary Mod",
        "name": "Twitch",
        "stats": [{
            "label": "On Equip: -|val1|% Weapon Recoil and +|val2|% Accuracy for 8s",
            "values": [
                {"base_value": [-10.0,-20.0,-30.0,-40.0], "upgrade_type": "WEAPON_ADD_RECOIL"},
                {"base_value": [ 10.0, 20.0, 30.0, 40.0], "upgrade_type": "WEAPON_ADD_ACCURACY"},
            ],
            "condition": "on_equip",
            "note": "buff temporal 8s — D-15 siempre activo",
        }],
    },

    "pistol_HolsterSpeedBonusMod": {
        "_type": "Secondary Mod",
        "name": "Reflex Draw",
        "stats": [{
            "label": "On Equip: -|val1|% Weapon Recoil and +|val2|% Accuracy for 8s",
            "values": [
                {"base_value": [-10.0,-20.0,-30.0,-40.0], "upgrade_type": "WEAPON_ADD_RECOIL"},
                {"base_value": [ 10.0, 20.0, 30.0, 40.0], "upgrade_type": "WEAPON_ADD_ACCURACY"},
            ],
            "condition": "on_equip",
            "note": "buff temporal 8s — D-15 siempre activo",
        }],
    },

    "shotgun_HolsterSpeedBonusMod": {
        "_type": "Shotgun Mod",
        "name": "Soft Hands",
        "stats": [{
            "label": "On Equip: -|val1|% Weapon Recoil and +|val2|% Accuracy for 8s",
            "values": [
                {"base_value": [-10.0,-20.0,-30.0,-40.0], "upgrade_type": "WEAPON_ADD_RECOIL"},
                {"base_value": [ 10.0, 20.0, 30.0, 40.0], "upgrade_type": "WEAPON_ADD_ACCURACY"},
            ],
            "condition": "on_equip",
            "note": "buff temporal 8s — D-15 siempre activo",
        }],
    },

    # ------------------------------------------------------------------
    # Ammo Maximum — gap token, registrado como null + note
    # Tres Beginner variants (Rifle, Shotgun, Pistol).
    # ------------------------------------------------------------------

    "rifle_WeaponAmmoMaxModBeginner": {
        "_type": "Primary Mod",
        "name": "Ammo Drum",
        "stats": [{
            "label": "+|val1|% Ammo Maximum",
            "values": [{"base_value": [2.5,5.0,7.5,10.0], "upgrade_type": None}],
            "condition": None,
            "note": "gap: token WEAPON_ADD_AMMO_MAX no definido en vocabulario D-6",
        }],
    },

    "shotgun_WeaponAmmoMaxModBeginner": {
        "_type": "Shotgun Mod",
        "name": "Shell Compression",
        "stats": [{
            "label": "+|val1|% Ammo Maximum",
            "values": [{"base_value": [3.0,6.0,9.0,12.0], "upgrade_type": None}],
            "condition": None,
            "note": "gap: token WEAPON_ADD_AMMO_MAX no definido en vocabulario D-6",
        }],
    },

    "pistol_WeaponAmmoMaxModBeginner": {
        "_type": "Secondary Mod",
        "name": "Trick Mag",
        "stats": [{
            "label": "+|val1|% Ammo Maximum",
            "values": [{"base_value": [10.0,20.0,30.0,40.0], "upgrade_type": None}],
            "condition": None,
            "note": "gap: token WEAPON_ADD_AMMO_MAX no definido en vocabulario D-6",
        }],
    },

    # ------------------------------------------------------------------
    # Canticles — Cavia Syndicate secondary exilus; efectos de aura aliados.
    # Out of scope del weapon sim. Registrados para completitud de cobertura.
    # ------------------------------------------------------------------

    "FassAuraMod": {
        "name": "Fass Canticle",
        "stats": [{
            "label": "Killing enemies grants Allies in Affinity Range |val1|% Shield Recharge Rate and -|val2|% Shield Recharge Delay for 15s.",
            "values": [
                {"base_value": [25.0,30.0,35.0,40.0], "upgrade_type": None},
                {"base_value": [ 7.0,14.0,21.0,28.0], "upgrade_type": None},
            ],
            "condition": "on_kill",
            "note": "on_kill ally aura — shield recharge buff; out of weapon sim scope",
        }],
    },

    "JahuAuraMod": {
        "name": "Jahu Canticle",
        "stats": [{
            "label": "Killing enemies reduces the Armor and Shields of other enemies within Affinity Range by |val1|%.",
            "values": [{"base_value": [2.0,3.0,4.0,5.0], "upgrade_type": None}],
            "condition": "on_kill",
            "note": "on_kill enemy debuff aura — armor/shield reduction; out of weapon sim scope",
        }],
    },

    "KhraAuraMod": {
        "name": "Khra Canticle",
        "stats": [{
            "label": "Enemies have a |val1|% chance to drop a Universal Orb on death.",
            "values": [{"base_value": [3.0,6.0,9.0,12.0], "upgrade_type": None}],
            "condition": "on_kill",
            "note": "on_kill drop chance mechanic — Universal Orb; out of weapon sim scope",
        }],
    },

    # ------------------------------------------------------------------
    # Galvanized Acceleration — primer galvanizado exilus con stacking.
    # D-15: base_value stat2 = max stack total (2x per_stack).
    # Stat 1: siempre activo. Stat 2: on_kill stacking hasta 2x.
    # ------------------------------------------------------------------

    "WeaponProjectileSpeedSPMod": {
        "name": "Galvanized Acceleration",
        "stats": [
            {
                "label": "+|val1|% Projectile Speed and +|val2|% Beam Range",
                "values": [
                    {"base_value": [2.7,5.5,8.2,10.9,13.6,16.4,19.1,21.8,24.5,27.3,30.0], "upgrade_type": "WEAPON_ADD_PROJECTILE_SPEED"},
                    {"base_value": [2.7,5.5,8.2,10.9,13.6,16.4,19.1,21.8,24.5,27.3,30.0], "upgrade_type": "WEAPON_ADD_RANGE"},
                ],
                "condition": None,
            },
            {
                "label": "On Kill: +|val1|% Projectile Speed and +|val2|% Beam Range for 10s. Stacks up to 2x.",
                "values": [
                    {"base_value": [5.4,11.0,16.4,21.8,27.2,32.8,38.2,43.6,49.0,54.6,60.0], "upgrade_type": "WEAPON_ADD_PROJECTILE_SPEED"},
                    {"base_value": [5.4,11.0,16.4,21.8,27.2,32.8,38.2,43.6,49.0,54.6,60.0], "upgrade_type": "WEAPON_ADD_RANGE"},
                ],
                "condition": "on_kill",
                "note": "galvanized stacking 2x; per_stack = stat1 base_value[rank]; D-15: base_value = max stack total",
            },
        ],
    },

    # ------------------------------------------------------------------
    # Guardian Derision — taunt radius + combo count chance while blocking.
    # Stat 1: mechanic (taunting), null. Stat 2: gap token.
    # ------------------------------------------------------------------

    "WeaponBlockingTauntMod": {
        "name": "Guardian Derision",
        "stats": [
            {
                "label": "Blocking taunts enemies within |val1| meters to target you instead of allies.",
                "values": [{"base_value": [6.0,7.0,8.0,10.0,12.0,15.0], "upgrade_type": None}],
                "condition": "while_blocking",
                "note": "blocking taunt range — enemy AI mechanic; out of weapon stat scope",
            },
            {
                "label": "+|val1|% Combo Count Chance while Blocking",
                "values": [{"base_value": [5.0,10.0,15.0,20.0,25.0,30.0], "upgrade_type": None}],
                "condition": "while_blocking",
                "note": "gap: token WEAPON_ADD_COMBO_COUNT_CHANCE no definido en vocabulario D-6",
            },
        ],
    },

    # ------------------------------------------------------------------
    # Tennokai mechanics — mecánica de melee de Whispers in the Walls.
    # Algunos tienen stats mapeables (crit mult, melee range) con on_tennokai_attack.
    # ------------------------------------------------------------------

    "CertainStrike": {
        "name": "Discipline's Merit",
        "stats": [{
            "label": "Enables Tennokai. Opportunities occur every |val1| melee hits instead of at random.",
            "values": [{"base_value": [7.0,6.0,5.0,4.0], "upgrade_type": None}],
            "condition": "on_tennokai_attack",
            "note": "Tennokai opportunity frequency — LOWER_IS_BETTER; mechanic enabler; no stat token",
        }],
    },

    "FocusedAttack": {
        "name": "Dreamer's Wrath",
        "stats": [{
            "label": "Enables Tennokai. Increases opportunity chance by |val1|% and critical damage by |val2|% for Tennokai attacks.",
            "values": [
                {"base_value": [12.5,25.0,37.5,50.0], "upgrade_type": None},
                {"base_value": [ 8.0,16.0,24.0,32.0], "upgrade_type": "WEAPON_ADD_CRIT_MULT"},
            ],
            "condition": "on_tennokai_attack",
            "note": "opportunity chance (val1): no token — Tennokai mechanic; crit damage (val2): WEAPON_ADD_CRIT_MULT",
        }],
    },

    "PerfectReach": {
        "name": "Opportunity's Reach",
        "stats": [{
            "label": "Enables Tennokai. Increases opportunity window to |val1|s and melee range by |val2|m for Tennokai attacks.",
            "values": [
                {"base_value": [2.8,3.2,3.6,4.0], "upgrade_type": None},
                {"base_value": [0.75,1.5,2.25,3.0], "upgrade_type": "WEAPON_ADD_RANGE"},
            ],
            "condition": "on_tennokai_attack",
            "note": "opportunity window (val1): no token — Tennokai timing; melee range (val2): WEAPON_ADD_RANGE",
        }],
    },

    "CursedSyndicateEmpoweredHeavyMeleeMod": {
        "name": "Truth's Flame",
        "stats": [
            {
                "label": "Enables Tennokai. Tennokai kills grant an additional 4s opportunity and increase Tennokai damage by |val1|%. CURSE: Suffer |val2| Heat Damage/s for 6s.",
                "values": [
                    {"base_value": [30.0,40.0,60.0,120.0], "upgrade_type": None},
                    {"base_value": [25.0,35.0,50.0,100.0], "upgrade_type": None},
                ],
                "condition": "on_tennokai_attack",
                "note": "Tennokai damage (val1): no token; curse self-damage (val2): no token; multi-mechanic — out of stat scope",
            },
            {
                "label": "+|val1| 'Truth'",
                "values": [{"base_value": [0.3,0.5,0.8,1.0], "upgrade_type": None}],
                "condition": "on_tennokai_attack",
                "note": "Truth counter mechanic — stacking tracker; no stat token",
            },
        ],
    },

    "TennokaiBaseMod": {
        "name": "Mentor's Legacy",
        "stats": [{
            "label": "Enables Tennokai.",
            "values": [{"base_value": [], "upgrade_type": None}],
            "condition": None,
            "note": "Tennokai mechanic enabler — rank 0, no scaling; enables base Tennokai system",
        }],
    },

    # ------------------------------------------------------------------
    # Out of scope — mechanics sin stat de arma modelable.
    # Registrados con upgrade_type null + note para completitud de cobertura.
    # ------------------------------------------------------------------

    "JumpRefreshOnKillRifleMod": {
        "name": "Aerial Ace",
        "stats": [{
            "label": "On Kill: Refresh Double Jump up to |val1|x while Airborne.",
            "values": [{"base_value": [1.0,2.0,3.0,4.0,5.0,6.0], "upgrade_type": None}],
            "condition": "on_kill",
            "note": "on_kill airborne jump refresh mechanic — not a weapon stat; movement system",
        }],
    },

    "MarkTargetRifleMod": {
        "name": "Apex Predator",
        "stats": [{
            "label": "Reveals target on Minimap for +|val1|s.",
            "values": [{"base_value": [1.0,2.0,3.0,4.0,5.0,6.0], "upgrade_type": None}],
            "condition": None,
            "note": "minimap tracking mechanic — not a weapon stat; HUD/radar system",
        }],
    },

    "AckBruntNightwatchMod": {
        "name": "Electromagnetic Shielding",
        "stats": [{
            "label": "While blocking, redirect |val1|% of damage taken by allies within |val2|m to yourself.",
            "values": [
                {"base_value": [25.0,30.0,35.0,40.0,45.0,50.0], "upgrade_type": None},
                {"base_value": [ 2.0, 4.0, 6.0, 8.0,10.0,12.0], "upgrade_type": None},
            ],
            "condition": "while_blocking",
            "note": "ally damage redirect mechanic — redirect% (val1) and range (val2) both scale; out of weapon stat scope",
        }],
    },

    "DrakgoonNightwatchMod": {
        "name": "Fomorian Accelerant",
        "stats": [{
            "label": "Flak now bounces up to |val1|x and travels |val2|% faster.",
            "values": [
                {"base_value": [1.0,2.0,3.0,4.0], "upgrade_type": None},
                {"base_value": [15.0,30.0,45.0,60.0], "upgrade_type": "WEAPON_ADD_PROJECTILE_SPEED"},
            ],
            "condition": None,
            "note": "Drakgoon-specific — bounces (val1): mechanic, no token; projectile speed (val2): mapped",
        }],
    },

    "TetraCorpusArenaMod": {
        "name": "Kinetic Ricochet",
        "stats": [{
            "label": "Shots now bounce up to |val1|x and travel |val2|% further.",
            "values": [
                {"base_value": [1.0,2.0,3.0,4.0,5.0,6.0], "upgrade_type": None},
                {"base_value": [5.0,10.0,15.0,20.0,25.0,30.0], "upgrade_type": "WEAPON_ADD_RANGE"},
            ],
            "condition": None,
            "note": "ricochet mechanic — bounces (val1): no token; travel range (val2): WEAPON_ADD_RANGE",
        }],
    },

    "PentaCorpusArenaMod": {
        "name": "Tether Grenades",
        "stats": [{
            "label": "Grenades tether up to |val1| enemies from |val2|m away.",
            "values": [
                {"base_value": [2.0,3.0,3.0,4.0,4.0,5.0], "upgrade_type": None},
                {"base_value": [4.0,5.0,6.0,7.0,8.0,9.0], "upgrade_type": None},
            ],
            "condition": None,
            "note": "grenade tether mechanic — enemy count (val1) and range (val2); out of weapon stat scope",
        }],
    },

    # ------------------------------------------------------------------
    # Bhisaj-Bal — dos stats distintos: health regen (null) y status chance (mapped).
    # ------------------------------------------------------------------

    "ParisHealOnStatusMod": {
        "name": "Bhisaj-Bal",
        "stats": [
            {
                "label": "Restore |val1| Health for every 3 Status effects.",
                "values": [{"base_value": [50.0,100.0,150.0,200.0,250.0,300.0], "upgrade_type": None}],
                "condition": None,
                "note": "health restore formula — per 3 status effects applied; no token for on-trigger health regen",
            },
            {
                "label": "+|val1|% Status Chance",
                "values": [{"base_value": [15.0,30.0,45.0,60.0,75.0,90.0], "upgrade_type": "WEAPON_ADD_STATUS_CHANCE"}],
                "condition": None,
            },
        ],
    },
}

# ---------------------------------------------------------------------------
# Resolución de claves por unique_name completo
# (para suffixes duplicados diferenciados por tipo de arma)
# ---------------------------------------------------------------------------

SUFFIX_OVERRIDES = {
    "/Lotus/Upgrades/Mods/Rifle/WeaponRecoilReductionMod":           "rifle_WeaponRecoilReductionMod",
    "/Lotus/Upgrades/Mods/Pistol/WeaponRecoilReductionMod":          "pistol_WeaponRecoilReductionMod",
    "/Lotus/Upgrades/Mods/Rifle/Beginner/WeaponAmmoMaxModBeginner":  "rifle_WeaponAmmoMaxModBeginner",
    "/Lotus/Upgrades/Mods/Shotgun/Beginner/WeaponAmmoMaxModBeginner":"shotgun_WeaponAmmoMaxModBeginner",
    "/Lotus/Upgrades/Mods/Pistol/Beginner/WeaponAmmoMaxModBeginner": "pistol_WeaponAmmoMaxModBeginner",
    "/Lotus/Upgrades/Mods/PvPMods/Rifle/HolsterSpeedBonusMod":       "rifle_HolsterSpeedBonusMod",
    "/Lotus/Upgrades/Mods/PvPMods/Pistol/HolsterSpeedBonusMod":      "pistol_HolsterSpeedBonusMod",
    "/Lotus/Upgrades/Mods/PvPMods/Shotgun/HolsterSpeedBonusMod":     "shotgun_HolsterSpeedBonusMod",
}

# ---------------------------------------------------------------------------

def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

def get_entry_key(unique_name):
    if unique_name in SUFFIX_OVERRIDES:
        return SUFFIX_OVERRIDES[unique_name]
    return unique_name.rstrip("/").split("/")[-1]

def main():
    mods_data = load_json(MODS_JSON)
    override  = load_json(OVERRIDE)

    weapon_exilus_missing = [
        m for m in mods_data
        if m.get("is_exilus")
        and m.get("type") not in ("Warframe Mod", "Peculiar Mod")
        and m.get("mod_class") not in ("Requiem", "Antivirus")
        and m["unique_name"] not in override
    ]

    print(f"Mods a procesar: {len(weapon_exilus_missing)}")
    print()

    updated_override = copy.deepcopy(override)
    added = []
    skipped = []

    for mod in weapon_exilus_missing:
        uname = mod["unique_name"]
        key = get_entry_key(uname)
        entry_def = ENTRIES_BY_SUFFIX.get(key)

        if entry_def is None:
            skipped.append((mod["name"], uname, "sin definición en ENTRIES_BY_SUFFIX"))
            continue

        # Eliminar campos internos del script (prefijo _)
        entry = {k: v for k, v in entry_def.items() if not k.startswith("_")}

        updated_override[uname] = entry
        added.append((mod["name"], uname, entry))

    print(f"A añadir:  {len(added)}")
    print(f"Sin def:   {len(skipped)}")
    print()

    for name, uname, entry in added:
        print(f"  [+] {name}")
        for stat in entry["stats"]:
            cond = stat.get("condition")
            note = stat.get("note", "")
            n_vals = len(stat.get("values", []))
            mapped = sum(1 for v in stat.get("values", []) if v.get("upgrade_type"))
            print(f"       label: {stat['label'][:65]}")
            print(f"       values: {n_vals} ({mapped} mapped) | condition: {cond!r}")
            if note:
                print(f"       note: {note[:70]}")
        print()

    if skipped:
        print("=== SIN DEFINICIÓN (revisar ENTRIES_BY_SUFFIX) ===")
        for name, uname, reason in skipped:
            print(f"  {name}: {reason}")
        print()

    if WRITE_MODE:
        save_json(OVERRIDE, updated_override)
        print(f"✓ Escrito: {OVERRIDE}")
    else:
        print("[dry-run] Pasar --write para aplicar cambios.")

if __name__ == "__main__":
    main()
