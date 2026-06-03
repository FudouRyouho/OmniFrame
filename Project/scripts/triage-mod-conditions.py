#!/usr/bin/env python3
"""
triage-mod-conditions.py
------------------------
Triage READ-ONLY de mod-stats.override.json: parsea el texto del label para
detectar la condición embebida en la prosa y la cruza contra el campo `condition`
ya presente. NO escribe el override — solo reduce el universo a auditar a mano.

Objetivo: en vez de eyeballear ~835 stats sin condition, separar en baldes:

  MAPPED  -> ya tiene condition (no auditar)
  SUGGEST -> sin condition, label matchea una frase canónica conocida -> token sugerido
  SIGNAL  -> sin condition, label tiene palabra-señal pero sin frase conocida -> auditar
  CLEAN   -> sin condition y sin señal -> probablemente incondicional (D-18: ausente)

El parser FLAGEA; la confirmación es humana (gate sobre dudosos).

Uso:
  python3 triage-mod-conditions.py                -- reporte a stdout
  python3 triage-mod-conditions.py --md PATH.md   -- además vuelca markdown a PATH
"""

import json, re, sys
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).parent.parent
OVERRIDE = ROOT / "public/data/mod-stats.override.json"

MD_OUT = None
if "--md" in sys.argv:
    MD_OUT = Path(sys.argv[sys.argv.index("--md") + 1])

# ---------------------------------------------------------------------------
# Diccionario "Texto libre equivalente" -> token canonico (docs/semantic/conditions.md).
# Orden importa: primer match gana. Regex sobre el label, case-insensitive.
# Solo las frases con token consolidado; lo demas cae a SIGNAL para auditoria.
# ---------------------------------------------------------------------------
KNOWN_PHRASES = [
    (r'while aim gliding',              "while_aim_gliding"),
    (r'when aiming|while aiming',       "while_aiming"),
    (r'when sliding|while sliding',     "while_sliding"),
    (r'when holstered',                 "while_holstered"),
    (r'while blocking',                 "while_blocking"),
    (r'when airborne|while airborne',   "while_airborne"),
    (r'while grounded',                 "while_grounded"),
    (r'while invisible',                "while_invisible"),
    (r'on tennokai attacks?',           "on_tennokai_attack"),
    (r'on slide attacks?',              "on_slide_attack"),
    (r'on heavy attack hit',            "on_heavy_attack_hit"),
    (r'on heavy attack kill',           "on_heavy_attack_kill"),
    (r'on bleed proc',                  "on_bleed_proc"),
    (r'on reload from empty',           "on_reload_from_empty"),
    (r'on reload',                      "on_reload"),
    (r'on headshot kill',               "on_headshot_kill"),
    (r'on headshot',                    "on_headshot"),
    # \bon evita falso positivo: "Weapon Critical" -> "on Crit" (caso Hunter Synergy)
    (r'\bon (critical hit|crit)',       "on_critical_hit"),
    (r'on melee kill',                  "on_melee_kill"),
    (r'on melee hit',                   "on_melee_hit"),
    (r'on status effect',               "on_status_effect"),
    (r'on ground slam',                 "on_ground_slam"),
    (r'on equip',                       "on_equip"),
    (r'on block',                       "on_block"),
    (r'on hit',                         "on_hit"),
    (r'on kill',                        "on_kill"),
]
KNOWN_PHRASES = [(re.compile(p, re.IGNORECASE), t) for p, t in KNOWN_PHRASES]

# ---------------------------------------------------------------------------
# Palabras-senal: marcan un label como "sospechoso de condicion" sin proponer token.
# Word-boundary para evitar falsos positivos (p.ej. "on" dentro de "Combo"/"Zoom").
# ---------------------------------------------------------------------------
SIGNAL_WORDS = [
    re.compile(r'\bwhile\b', re.IGNORECASE),
    re.compile(r'\bwhen\b', re.IGNORECASE),
    re.compile(r'\bwhenever\b', re.IGNORECASE),
    re.compile(r'\bon\b', re.IGNORECASE),
    re.compile(r'\bupon\b', re.IGNORECASE),
    re.compile(r'\bafter\b', re.IGNORECASE),
    re.compile(r'\beach time\b', re.IGNORECASE),
    re.compile(r'\bduring\b', re.IGNORECASE),
    re.compile(r'\bper\b', re.IGNORECASE),
    re.compile(r'\bover\b', re.IGNORECASE),
    re.compile(r'\bbelow\b', re.IGNORECASE),
    re.compile(r'\babove\b', re.IGNORECASE),
    re.compile(r'\bwith\b.*\bequipped\b', re.IGNORECASE),
    # --- enriquecimiento 2026-06-03 (verificación de falsos negativos en CLEAN) ---
    re.compile(r'stacks with', re.IGNORECASE),          # Blood Rush: "stacks with Combo Multiplier"
    re.compile(r'\bconsecutive\b', re.IGNORECASE),       # consecutive hits/throws
    re.compile(r'\bfor \d+\s*s(econds?)?\b', re.IGNORECASE),  # buff temporal "for Xs"
    re.compile(r'affected by|afflicted', re.IGNORECASE), # status en el target (familia on_hitting_*)
    re.compile(r'\bagainst\b|\bvs\.?\b', re.IGNORECASE), # restricción/condición de facción
    re.compile(r'\b(Grineer|Corpus|Infested|Corrupted|Sentient|Orokin|Murmur)\b', re.IGNORECASE),
]


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def match_known(label):
    for pat, token in KNOWN_PHRASES:
        if pat.search(label):
            return token
    return None


def has_signal(label):
    for pat in SIGNAL_WORDS:
        if pat.search(label):
            return pat.pattern
    return None


def main():
    override = load_json(OVERRIDE)

    buckets = {"MAPPED": [], "REVIEWED": [], "SUGGEST": [], "SIGNAL": [], "CLEAN": []}
    suggest_tokens = Counter()
    signal_hits = Counter()

    for unique_name, entry in override.items():
        name = entry.get("name", unique_name)
        for stat in entry.get("stats", []):
            label = stat.get("label", "")
            has_cond = "condition" in stat and stat["condition"] is not None
            vals = stat.get("values") or [{}]
            ut = vals[0].get("upgrade_type") or ""
            scope = ut.split("_", 1)[0] if ut else "—"  # WEAPON / AVATAR / VEHICLE
            row = {"mod": name, "uname": unique_name, "label": label,
                   "condition": stat.get("condition", "<ausente>"), "scope": scope}

            if has_cond:
                buckets["MAPPED"].append(row)
                continue

            # ausente + notes[] = ya revisado (resuelto out-of-scope / non-modelable); no re-auditar
            if stat.get("notes"):
                buckets["REVIEWED"].append(row)
                continue

            token = match_known(label)
            if token:
                row["suggested"] = token
                suggest_tokens[token] += 1
                buckets["SUGGEST"].append(row)
                continue

            sig = has_signal(label)
            if sig:
                row["signal"] = sig
                signal_hits[sig] += 1
                buckets["SIGNAL"].append(row)
                continue

            buckets["CLEAN"].append(row)

    total = sum(len(v) for v in buckets.values())

    print(f"=== Triage mod-stats.override.json — {total} stats ===\n")
    for b in ("MAPPED", "REVIEWED", "SUGGEST", "SIGNAL", "CLEAN"):
        print(f"  {b:9} {len(buckets[b]):4}")
    print()

    print("--- SUGGEST: token sugerido por frase canonica (confirmar) ---")
    for tok, n in suggest_tokens.most_common():
        print(f"  {n:3}  {tok}")
    print()

    print("--- SIGNAL: palabra-senal sin frase conocida (auditar a mano) ---")
    for sig, n in signal_hits.most_common():
        print(f"  {n:3}  /{sig}/")
    print()

    scope_sig = Counter(r["scope"] for r in buckets["SIGNAL"])
    print("--- SIGNAL por scope (upgrade_type prefix): WEAPON=in-scope, AVATAR/VEHICLE=fuera ---")
    for sc, n in scope_sig.most_common():
        print(f"  {n:3}  {sc}")
    print()

    if MD_OUT:
        write_md(buckets, total)
        print(f"[md] reporte volcado a {MD_OUT}")


def write_md(buckets, total):
    lines = []
    lines.append("# Triage condition — mod-stats.override.json\n")
    lines.append(f"> Generado por `triage-mod-conditions.py` (read-only). Total: {total} stats.\n")
    lines.append("> El parser FLAGEA; la confirmacion es humana. No escribe el override.\n")
    counts = " · ".join(f"{b} {len(buckets[b])}" for b in ("MAPPED", "SUGGEST", "SIGNAL", "CLEAN"))
    lines.append(f"\n**Baldes:** {counts}\n")

    lines.append("\n## SUGGEST — token sugerido por frase canonica (confirmar)\n")
    lines.append("| Mod | Label | Token sugerido |\n|---|---|---|")
    for r in sorted(buckets["SUGGEST"], key=lambda x: x["suggested"]):
        lines.append(f"| {r['mod']} | {r['label']} | `{r['suggested']}` |")

    lines.append("\n## SIGNAL — palabra-senal sin frase conocida (auditar)\n")
    lines.append("| Mod | Label | Senal |\n|---|---|---|")
    for r in sorted(buckets["SIGNAL"], key=lambda x: x["mod"]):
        lines.append(f"| {r['mod']} | {r['label']} | `{r['signal']}` |")

    MD_OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
