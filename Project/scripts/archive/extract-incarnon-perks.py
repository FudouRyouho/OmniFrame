"""
extract-incarnon-perks.py
Extrae datos de perks de los archivos wikitext Incarnon y genera un JSON intermedio.

Output: Project/scratch/incarnon-raw-extract.json
  Estructura: { slug: { weapons: [...], tiers: { "2": [{ perk, effects }] } } }

Uso: python3 scripts/extract-incarnon-perks.py
"""

import re, json, os
from pathlib import Path

RAW_DIR = Path(__file__).parent.parent.parent / "references/wiki/systems/incarnon/raw"
OUT_FILE = Path(__file__).parent.parent / "scratch/incarnon-raw-extract.json"

# ─── Helpers ─────────────────────────────────────────────────────────────────

def slugify(name: str) -> str:
    name = re.sub(r"['’‘]", '', name)  # drop apostrophes before replacing
    return re.sub(r'[^a-z0-9]+', '_', name.lower().strip()).strip('_')

def clean_wiki(text: str) -> str:
    """Elimina marcado wiki básico dejando texto legible."""
    text = re.sub(r"'''(.+?)'''", r'\1', text)
    text = re.sub(r"''(.+?)''", r'\1', text)
    text = re.sub(r'\[\[(?!File:)(?:[^|\]]*\|)?([^\]]+)\]\]', r'\1', text)
    text = re.sub(r'\{\{[Ww]eapon\|[^}]*\}\}', '', text)
    text = re.sub(r'\{\{[Dd]\|([^}]+)\}\}', r'\1', text)
    text = re.sub(r'\{\{[Mm]\|([^}]+)\}\}', r'\1', text)
    text = re.sub(r'\{\{[^}]+\}\}', '', text)
    text = re.sub(r'\[\[File:[^\]]+\]\]', '', text)
    text = re.sub(r'<[^>]+>', '', text)
    return text.strip()

TIER_NAMES = {'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5}

# ─── Parser Format A: ====Evolution N==== ────────────────────────────────────

def parse_format_a(text: str) -> tuple[list[str], dict]:
    """Extrae perks del formato ====Evolution N==== con viñetas."""
    tiers = {}
    # Detectar variantes inline: buscar patrón "(Name / Name)" en efectos de perks
    # Las detectaremos por archivo, no globalmente

    # Secciones de evolución
    evo_pattern = re.compile(
        r'====Evolution (II|III|IV|V)====\n(.*?)(?=====Evolution |\Z)',
        re.DOTALL
    )
    # Perks dentro de cada sección
    perk_pattern = re.compile(
        r'\*\s*Perk \d+:\s*\'\'\'(.+?)\'\'\':?\s*\n((?:\*\*[^\n]*\n?)*)',
        re.DOTALL
    )

    weapons = []  # Format A no declara variantes explícitamente en header

    for evo_match in evo_pattern.finditer(text):
        tier_str = str(TIER_NAMES[evo_match.group(1)])
        section = evo_match.group(2)
        perks = []

        for pm in perk_pattern.finditer(section):
            perk_name = clean_wiki(pm.group(1)).strip()
            raw_effects = pm.group(2)
            effects = []

            for line in raw_effects.strip().split('\n'):
                line = line.strip().lstrip('*').strip()
                if not line:
                    continue
                cleaned = clean_wiki(line)
                if not cleaned:
                    continue

                # Detectar valores por variante inline: "+18 (Boltor) / +4 (Telos / Prime)"
                variant_match = re.search(
                    r'([+\-]?\d+(?:\.\d+)?%?)\s*\(([^)]+)\)(?:\s*/\s*([+\-]?\d+(?:\.\d+)?%?)\s*\(([^)]+)\))+',
                    cleaned
                )
                if variant_match:
                    # Extraer todos los pares valor(variante)
                    pairs = re.findall(r'([+\-]?\d+(?:\.\d+)?%?)\s*\(([^)]+)\)', cleaned)
                    values_by_variant = {v.strip(): val for val, v in pairs}
                    # Eliminar los valores inline del texto base
                    base_text = re.sub(
                        r'\s*[+\-]?\d+(?:\.\d+)?%?\s*\([^)]+\)(?:\s*/\s*[+\-]?\d+(?:\.\d+)?%?\s*\([^)]+\))*',
                        ' +X',
                        cleaned
                    ).strip()
                    effects.append({"text": base_text, "values": values_by_variant})
                else:
                    effects.append({"text": cleaned, "values": {}})

            if perk_name:
                perks.append({"perk": perk_name, "perk_id": slugify(perk_name), "effects": effects})

        if perks:
            tiers[tier_str] = perks

    return weapons, tiers

# ─── Parser Format B: wikitable con columnas por variante ────────────────────

def parse_format_b(text: str) -> tuple[list[str], dict]:
    """Extrae perks del formato wikitable con columnas de variantes."""
    # Extraer tabla
    table_match = re.search(r'\{\| class="wikitable.*?\|\}', text, re.DOTALL)
    if not table_match:
        return [], {}
    table = table_match.group(0)

    # Extraer columnas de armas del header
    weapon_cols = re.findall(r'\{\{Weapon\|([^|}]+)(?:\|([^}]+))?\}\}', table)
    weapons = []
    for full_name, alias in weapon_cols:
        name = full_name.strip()
        if name and name not in weapons:
            weapons.append(name)

    # Dividir en filas
    rows = re.split(r'\n\|-\n', table)
    tiers: dict = {}
    current_tier = None
    remaining_rows = 0  # rowspan pendiente

    for row in rows:
        row = row.strip()
        if not row:
            continue

        # Evolution Challenge row — ignorar
        if 'Evolution Challenge' in row:
            continue

        # Detectar tier marker: ! EVO2 o ! rowspan="N" | EVO2
        evo_marker = re.match(r'^!\s*(?:rowspan="(\d+)"?[^|]*\|)?\s*EVO(\d+)', row)
        if evo_marker:
            n_perks = int(evo_marker.group(1) or 1)
            tier_num = int(evo_marker.group(2))
            if tier_num == 1:
                current_tier = None
                continue  # EVO1 = transformación, ignorar
            current_tier = str(tier_num)
            remaining_rows = n_perks
            if current_tier not in tiers:
                tiers[current_tier] = []

            # El perk puede estar en la misma fila que el EVO marker
            # Extraer la parte después del EVO marker
            rest = re.sub(r'^!\s*(?:rowspan="\d+"?[^|]*\|)?\s*EVO\d+\n?', '', row).strip()
            if rest:
                perk = _extract_perk_from_b_row(rest, weapons)
                if perk:
                    tiers[current_tier].append(perk)
                    remaining_rows -= 1
            continue

        # Fila de perk dentro del tier activo
        if current_tier and remaining_rows > 0 and row.startswith('|'):
            perk = _extract_perk_from_b_row(row, weapons)
            if perk:
                tiers[current_tier].append(perk)
                remaining_rows -= 1

    return weapons, tiers


def _extract_perk_from_b_row(row: str, weapons: list[str]) -> dict | None:
    """Extrae nombre, efectos y valores por variante de una fila de tabla Format B."""
    # Dividir celdas por | respetando colspan/rowspan
    cells = re.split(r'\n\|(?!\|)', '\n' + row)
    cells = [c.strip() for c in cells if c.strip()]

    if len(cells) < 2:
        return None

    # Celda 0: nombre del perk (puede tener File: image)
    name_cell = clean_wiki(cells[0].lstrip('|').strip())
    # Quitar imagen y metadata de estilo
    name_cell = re.sub(r'\s*\[\[File:[^\]]+\]\]', '', name_cell)
    name_cell = re.sub(r'^[|!]?\s*style="[^"]*"\s*\|?\s*', '', name_cell)
    perk_name = name_cell.strip()

    if not perk_name or perk_name.startswith('colspan') or perk_name.startswith('!'):
        return None

    # Celda 1: descripción/efectos
    if len(cells) < 2:
        return None
    desc_cell = cells[1].lstrip('|').strip()
    desc_cell = re.sub(r'^style="[^"]*"\s*\|?\s*', '', desc_cell)

    effects = []
    for line in desc_cell.split('\n'):
        line = line.strip().lstrip('*').strip()
        if not line:
            continue
        cleaned = clean_wiki(line)
        if cleaned:
            effects.append({"text": cleaned, "values": {}})

    # Celdas 2..N-1: valores por variante (última celda puede ser "Notes")
    value_cells = cells[2:]
    # Última celda = Notes si el count > len(weapons)
    if len(value_cells) > len(weapons):
        value_cells = value_cells[:len(weapons)]

    for i, vcell in enumerate(value_cells):
        if i >= len(weapons):
            break
        weapon = weapons[i]
        val = vcell.lstrip('|').strip()
        val = re.sub(r'^style="[^"]*"\s*\|?\s*', '', val)
        val = re.sub(r'^colspan="\d+"[^|]*\|?\s*', '', val)
        val = clean_wiki(val).strip()
        if val and val != '-':
            # Asociar el valor con los efectos que tengan +X placeholder
            for eff in effects:
                if 'X' in eff["text"] or '+X' in eff["text"]:
                    eff["values"][weapon] = val
                    break
            else:
                # Si ningún efecto tiene placeholder, añadir el valor al primero
                if effects:
                    effects[0]["values"][weapon] = val

    if not perk_name:
        return None

    return {"perk": perk_name, "perk_id": slugify(perk_name), "effects": effects}

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    results = {}

    for wikifile in sorted(RAW_DIR.glob("*.wikitext")):
        slug = wikifile.stem
        text = wikifile.read_text(encoding='utf-8')

        has_a = '====Evolution II====' in text or '====Evolution III====' in text
        has_b = ('! rowspan' in text or '! EVO2' in text) and ('EVO2' in text or 'EVO3' in text)

        if has_b:
            weapons, tiers_b = parse_format_b(text)
        else:
            weapons, tiers_b = [], {}

        if has_a:
            _, tiers_a = parse_format_a(text)
        else:
            tiers_a = {}

        # Merge: Format B tiene prioridad sobre A para tiers que aparecen en ambos
        tiers = {**tiers_a, **tiers_b}

        if tiers:
            results[slug] = {
                "format": "B" if has_b else "A",
                "weapons": weapons,
                "tiers": tiers
            }
        else:
            results[slug] = {
                "format": "?",
                "weapons": [],
                "tiers": {},
                "_warning": "No se extrajo ningún perk"
            }

    OUT_FILE.parent.mkdir(exist_ok=True)
    OUT_FILE.write_text(json.dumps(results, indent=2, ensure_ascii=False))
    print(f"Extraídos {len(results)} archivos → {OUT_FILE}")

    # Resumen
    ok = sum(1 for v in results.values() if v["tiers"])
    empty = len(results) - ok
    print(f"  Con perks: {ok} | Sin extraer: {empty}")
    if empty:
        for slug, v in results.items():
            if not v["tiers"]:
                print(f"    ⚠ {slug}")

if __name__ == "__main__":
    main()
