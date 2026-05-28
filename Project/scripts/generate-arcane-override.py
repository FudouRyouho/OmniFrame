#!/usr/bin/env python3
"""
generate-arcane-override.py

Genera scaffold de arcane-stats.override.json desde arcanes.json.
Schema idéntico a mod-stats.override.json:
  { unique_name: { name, stats: [{ label, values: [{ base_value, upgrade_type }], condition }] } }

Estrategia:
  - Extrae trigger ("On X:") → condition token snake_case
  - Compara rank 0 vs rank MAX para identificar qué números escalan
  - Reemplaza valores escalables con placeholders |val1|, |val2| en label
  - upgrade_type: mapeado por keywords; null donde hay ambigüedad

Dry-run por defecto. --write para escribir arcane-stats.override.json.
Uso: python3 Project/scripts/generate-arcane-override.py [--write]
"""

import json, re, sys
from pathlib import Path

ARCANES_PATH = Path("Project/public/data/arcanes.json")
OUTPUT_PATH  = Path("Project/public/data/arcane-stats.override.json")

# ─── Keyword → upgrade_type (más específico primero) ─────────────────────────
KEYWORD_MAP = [
    (r'\bfire rate\b',                'WEAPON_ADD_FIRE_RATE'),
    (r'\battack speed\b',             'WEAPON_ADD_FIRE_RATE'),
    (r'\breload speed\b',             'WEAPON_ADD_RELOAD_SPEED'),
    (r'\bbase critical chance\b',     'WEAPON_BASE_CRIT_CHANCE'),
    (r'\bcritical chance\b',          'WEAPON_ADD_CRIT_CHANCE'),
    (r'\bcritical damage\b',          'WEAPON_ADD_CRIT_MULT'),
    (r'\bfinal critical damage\b',    'WEAPON_ADD_CRIT_MULT'),
    (r'\bcritical multiplier\b',      'WEAPON_ADD_CRIT_MULT'),
    (r'\bmultishot\b',                'WEAPON_ADD_MULTISHOT'),
    (r'\bstatus chance\b',            'WEAPON_ADD_STATUS_CHANCE'),
    (r'\baccuracy\b',                 'WEAPON_ADD_ACCURACY'),
    (r'\bpunch through\b',            'WEAPON_ADD_PUNCH_THROUGH'),
    (r'\brecoil\b',                   'WEAPON_ADD_RECOIL'),
    (r'\bammo efficiency\b',          None),   # no en UPGRADES aún
    (r'\bcombo (?:count )?chance\b',  None),   # no en UPGRADES aún
    (r'\bcombo duration\b',           'WEAPON_ADD_COMBO_DURATION'),
    (r'\binitial combo\b',            'WEAPON_BASE_COMBO_INITIAL'),
    (r'\bability strength\b',         'AVATAR_ADD_ABILITY_STRENGTH'),
    (r'\bability range\b',            'AVATAR_ADD_ABILITY_RANGE'),
    (r'\bability duration\b',         'AVATAR_ADD_ABILITY_DURATION'),
    (r'\bability efficiency\b',       'AVATAR_ADD_ABILITY_EFFICIENCY'),
    (r'\bmovement speed\b',           'AVATAR_ADD_MOVEMENT_SPEED'),
    (r'\bsprint speed\b',             'AVATAR_ADD_SPRINT_SPEED'),
    (r'\bparkour velocity\b',         'AVATAR_ADD_PARKOUR_VELOCITY'),
    # Damage: mapeado si no hay fórmula de cálculo compleja (per-X, based-on, converts...)
    # Stacking ("Stacks up to Nx") es solo anotación de runtime, no impide el mapeo.
]

ARCANE_REVIVE_RE    = re.compile(r'^\+?\d+\s+arcane\s+revive', re.IGNORECASE)
REVIVE_INLINE_RE    = re.compile(r'\s*\\?n?\+?\d+\s+arcane\s+revive.*$', re.IGNORECASE)

# ─── Utilidades ───────────────────────────────────────────────────────────────

def strip_markup(s: str) -> str:
    s = re.sub(r'<[^>]+>', '', s)
    s = s.replace('\\n', '\n').replace('&nbsp;', ' ')
    return re.sub(r'\s+', ' ', s).strip()

def strip_revive(s: str) -> str:
    """Elimina el sufijo '+N Arcane Revive' que @wfcd/items embede en stats[0] a partir de rank 3."""
    # Primero normalizar los literales \n antes de aplicar el regex
    cleaned = s.replace('\\n', '\n')
    cleaned = re.sub(r'\n\+?\d+\s+arcane\s+revive.*$', '', cleaned, flags=re.IGNORECASE)
    return cleaned.strip()

def normalize_text(s: str) -> str:
    """Texto limpio para label y parsing: markup removido, revive removido, \n → espacio."""
    return re.sub(r'\s+', ' ', strip_markup(strip_revive(s)).replace('\n', ' ')).strip()

def extract_trigger(text: str) -> tuple[str | None, str]:
    """
    Extrae el trigger ("On X:") del texto.
    Retorna (condition_token | None, effect_text_sin_trigger).
    """
    clean = normalize_text(text)
    m = re.match(
        r'^(On [^:]+|While [^:]+|Killing [^:]+|After [^:]+|When [^:]+):\s*(.*)',
        clean, re.IGNORECASE
    )
    if m:
        trigger_raw = m.group(1).strip()
        effect_text = m.group(2).strip()
        token = re.sub(r'[^a-z0-9]+', '_', trigger_raw.lower()).strip('_')
        return token, effect_text
    return None, clean

def get_numbers(text: str) -> list[float]:
    """Extrae todos los números del texto (incluyendo decimales y signos)."""
    return [float(x) for x in re.findall(r'[+-]?\d+(?:\.\d+)?', text)]

def find_scaling_positions(nums0: list[float], numsN: list[float]) -> list[int]:
    """Posiciones donde los valores difieren entre rank 0 y rank max."""
    if len(nums0) != len(numsN):
        return []
    return [i for i in range(len(nums0)) if nums0[i] != numsN[i]]

def build_series(level_stats: list, stat_idx: int, positions: list[int]) -> dict[int, list]:
    """
    Para cada posición escalable, construye la lista de valores por rank.
    Retorna { position: [val_rank0, val_rank1, ...] } o None si hay error.
    """
    series: dict[int, list] = {p: [] for p in positions}
    for rank_data in level_stats:
        stats = rank_data.get('stats', [])
        if stat_idx >= len(stats):
            return None
        nums = get_numbers(normalize_text(stats[stat_idx]))
        for p in positions:
            if p >= len(nums):
                return None
            series[p].append(nums[p])
    return series

def make_label(text: str, nums_rank0: list[float], scaling_pos: list[int]) -> str:
    """
    Reemplaza los valores escalables en el texto con |val1|, |val2|, etc.
    Hace la sustitución de derecha a izquierda para no corromper las posiciones.
    """
    result = text
    # Encontrar todas las ocurrencias numéricas en el texto para sustituir
    matches = list(re.finditer(r'[+-]?\d+(?:\.\d+)?', result))
    if len(matches) < len(nums_rank0):
        return result  # fallback: texto original

    # Sustituir de atrás hacia adelante, solo las posiciones escalables
    substitutions = sorted(scaling_pos, reverse=True)
    for rank_in_match, pos in enumerate(sorted(scaling_pos)):
        placeholder = f'|val{rank_in_match + 1}|'
        m = matches[pos]
        result = result[:m.start()] + placeholder + result[m.end():]
        # Recalcular matches después de sustitución (la posición anterior puede ser incorrecta)
        matches = list(re.finditer(r'[+-]?\d+(?:\.\d+)?', result))
    return result

def map_upgrade_type(effect_text: str) -> str | None:
    """Keyword matching para determinar upgrade_type. Conservador: null si ambiguo."""
    lower = effect_text.lower()
    for pattern, token in KEYWORD_MAP:
        if re.search(pattern, lower):
            return token

    # Damage: solo si es un patrón limpio "+N% [scope] Damage" sin fórmula
    if re.search(r'\bdamage\b', lower):
        # Excluir fórmulas de cálculo: per-X, for every, based on, converts
        # NO excluir: "stacks up to Nx" (anotación de runtime, el valor per-stack sigue siendo estático)
        formula_patterns = [
            r'\bper\s+\w+',        # "per kill", "per armor point"
            r'\bfor\s+every\b',    # "for every 200 shields"
            r'\bbased\s+on\b',     # "based on max magazine"
            r'\bconverts?\b',      # "converts X% to Y"
            r'\blife\s*steal\b',   # porcentaje de daño como curación
        ]
        if not any(re.search(p, lower) for p in formula_patterns):
            return 'WEAPON_ADD_DAMAGE'

    return None

# ─── Parsing de un arcane ─────────────────────────────────────────────────────

def is_revive_entry(text: str) -> bool:
    return bool(ARCANE_REVIVE_RE.match(normalize_text(text)))

def process_arcane(item: dict) -> dict | None:
    level_stats = item.get('level_stats', [])
    if not level_stats:
        return None

    stats_out = []

    # ── stats[0]: efecto principal ────────────────────────────────────────────
    rank0_text = level_stats[0]['stats'][0] if level_stats[0].get('stats') else None
    rankN_text = level_stats[-1]['stats'][0] if level_stats[-1].get('stats') else None

    if rank0_text and rankN_text and not is_revive_entry(rank0_text):
        condition, _ = extract_trigger(rank0_text)
        label_base = normalize_text(rank0_text)

        nums0 = get_numbers(normalize_text(rank0_text))
        numsN = get_numbers(normalize_text(rankN_text))
        scaling_pos = find_scaling_positions(nums0, numsN)

        if scaling_pos and len(nums0) == len(numsN):
            series = build_series(level_stats, 0, scaling_pos)

            if series:
                label = make_label(label_base, nums0, scaling_pos)
                values = []
                for i, pos in enumerate(sorted(scaling_pos)):
                    effect_text = normalize_text(rankN_text)
                    # Determinar upgrade_type basado en el efecto completo
                    upgrade_type = map_upgrade_type(effect_text)
                    # Para multi-valor: solo mapear si el keyword está cerca del placeholder
                    # (heurística: si hay más de un scaling value y el tipo es genérico, null)
                    if len(scaling_pos) > 1 and upgrade_type == 'WEAPON_ADD_DAMAGE':
                        upgrade_type = None
                    # Convertir serie a enteros si todos son enteros
                    raw = series[pos]
                    base_value = [int(v) if v == int(v) else v for v in raw]
                    values.append({
                        'base_value': base_value,
                        'upgrade_type': upgrade_type,
                    })

                # Si hay múltiples scaling values con tipos distintos, separar por posición
                if len(scaling_pos) > 1:
                    # Intentar mapear individualmente dividiendo el texto por " and " / ". "
                    fragments = re.split(r'\band\b|\.(?=\s+\+)', label_base, flags=re.IGNORECASE)
                    if len(fragments) >= len(scaling_pos):
                        values = []
                        for i, (pos, frag) in enumerate(zip(sorted(scaling_pos), fragments)):
                            ut = map_upgrade_type(frag)
                            raw = series[pos]
                            base_value = [int(v) if v == int(v) else v for v in raw]
                            values.append({'base_value': base_value, 'upgrade_type': ut})

                stats_out.append({
                    'label': label,
                    'values': values,
                    'condition': condition,
                })
            else:
                # No se pudo extraer series → placeholder manual
                stats_out.append({
                    'label': label_base,
                    'values': [{'base_value': None, 'upgrade_type': None}],
                    'condition': condition,
                })
        else:
            # No hubo scaling o estructura distinta → registrar como null
            stats_out.append({
                'label': label_base,
                'values': [{'base_value': None, 'upgrade_type': None}],
                'condition': condition,
            })

    # ── stats[1+] al rank MAX que no son Arcane Revive ────────────────────────
    max_stats = level_stats[-1].get('stats', [])
    for extra_text in max_stats[1:]:
        if is_revive_entry(extra_text):
            continue
        condition_e, _ = extract_trigger(extra_text)
        nums_e = get_numbers(normalize_text(extra_text))
        stats_out.append({
            'label': normalize_text(extra_text),
            'values': [{'base_value': nums_e if nums_e else None, 'upgrade_type': None}],
            'condition': condition_e,
        })

    if not stats_out:
        return None

    return {'name': item['name'], 'stats': stats_out}

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    dry_run = '--write' not in sys.argv

    arcanes = json.load(ARCANES_PATH.open())
    output  = {}
    ok = skipped = partial = 0

    for item in arcanes:
        uid    = item['unique_name']
        result = process_arcane(item)

        if result is None:
            skipped += 1
            continue

        # Clasificar resultado
        all_mapped = all(
            v.get('upgrade_type') is not None
            for stat in result['stats']
            for v in stat.get('values', [])
            if v.get('base_value') is not None
        )
        any_null = any(
            v.get('upgrade_type') is None
            for stat in result['stats']
            for v in stat.get('values', [])
        )

        if all_mapped:
            ok += 1
        elif any_null:
            partial += 1
        else:
            ok += 1

        output[uid] = result

    # ── Reporte ───────────────────────────────────────────────────────────────
    print(f'Total arcanes: {len(arcanes)}')
    print(f'  Procesados:       {len(output)}')
    print(f'  Skipped (vacíos): {skipped}')
    print(f'  Mapeados (%):     {ok}  ({ok * 100 // max(len(output),1)}%)')
    print(f'  Parciales (null): {partial}')

    print('\n─── Entradas con upgrade_type: null (requieren anotación manual) ───')
    for uid, entry in sorted(output.items(), key=lambda x: x[1]['name']):
        null_labels = [
            stat['label'][:60]
            for stat in entry['stats']
            for v in stat.get('values', [])
            if v.get('upgrade_type') is None
        ]
        if null_labels:
            print(f'  {entry["name"]:<35} | {null_labels[0]}')

    if dry_run:
        print('\n[DRY RUN] Pasa --write para escribir arcane-stats.override.json.')
        return

    with open(OUTPUT_PATH, 'w') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
        f.write('\n')

    print(f'\nEscrito: {OUTPUT_PATH}')
    print(f'Entradas: {len(output)}')


if __name__ == '__main__':
    main()
