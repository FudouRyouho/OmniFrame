---
Estado: "activo"
Rol: "Documentar el esquema operativo de ability-stats.override.json"
Impacto_ID: "data-abilities-schema"
Fidelidad_Fisica: "Project/public/data/ability-stats.override.json"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-07-24"
---

# Ability Stats Override Schema

## Fuente de verdad

| Artefacto | Rol |
|---|---|
| `references/game-ui/<Warframe>.md` | Fuente semántica (anotaciones manuales `$`/`$$`) |
| `Project/scripts/apply-ability-md.ts` | Parser + merge — transforma `.md` → override |
| `Project/public/data/ability-stats.override.json` | Runtime SSoT — nunca editar `groups`/`stats` a mano |
| `Project/src/shared/types/ability.ts` | Contrato TypeScript |

`name`, `description`, `image_name` provienen de `@wfcd/items` y son preservados por `apply-ability-md.ts` al hacer merge — `generate-data.ts` ya no lee ni escribe este archivo.

---

## Estructura raíz (`AbilityStatsData`)

```ts
interface AbilityStatsData {
  name: string;
  description: string;
  image_name: string;
  groups: AbilityGroup[];
}
```

---

## Grupos (`AbilityGroup`)

```ts
interface AbilityGroup {
  id?: string;             // Ausente = grupo base (siempre activo). Presente = grupo nombrado con toggle.
  label?: string;          // Nombre visible del grupo (augment, variante, modo).
  default_active?: boolean;
  exclusive?: boolean;     // No derivable del parser — asignar manualmente si aplica.
  stats: AbilityStatEntry[];
}
```

### Casos canónicos de grupos

El schema absorbe distintos patrones de organización de habilidades. Lista verificada (expandible):

| Caso | Tipo | Ejemplo |
|---|---|---|
| Warframe simple | Un solo grupo base (sin `id`), siempre activo | Excalibur, Volt |
| Modos exclusivos por elemento | Múltiples grupos con `exclusive: true` | Chroma (Heat/Cold/Toxin/Electric) |
| Modos exclusivos por forma | Múltiples grupos con `exclusive: true` con toggle | Equinox (Day/Night) |
| Modos aditivos | Múltiples grupos coexistentes (`exclusive: false`) | Wisp (Vitality/Haste/Shock motes) |
| Augments | Grupo adicional opcional | (warframes con augment activado) |

**Expansión futura conocida (a verificar contra el schema cuando se modelen):**
- **Lavos** — cooldowns vs energía: coste distinto a EFF/STR, requiere extensión del vocabulario `upgrade_by`.
- **Hildryn** — sin energy: usa shields, requiere `cost_type` alternativo.
- **Exaltadas** — la habilidad materializa una entidad derivada con shape de `Weapon` (Excalibur Exalted Blade, Mesa Peacemaker, Baruuk Serene Storm, etc.). Modelado como `behavior` que crea sub-entidad — ver [`../../../domains/engine/design/arch-decisions.md`](../../../domains/engine/design/arch-decisions.md) §3.

### Regla de separación

El schema declara solo qué grupos existen. La decisión de si el estado es local, global o sincronizado entre cards **pertenece a la UI o a la capa de integración**, no al schema.

> **Deficiencia conocida:** las pasivas de warframe no tienen modelo estable en `groups[]`. Las pasivas son fuente de condiciones transversales (Frost, Hydroid). Hasta que las pasivas tengan schema propio, el vocabulario canónico de condiciones está incompleto.

---

## Entrada de estadística (`AbilityStatEntry`)

```ts
interface AbilityStatEntry {
  label: string;                                            // Template: "Damage: <DT_HEAT> |val1|", "Range: |val1| - |val2|m"
  base_value: number | [number, number];                    // Escalar o rango [min, max]
  upgrade_by?: AbilityUpgradeBy | AbilityUpgradeBy[];       // Ausente = valor fijo. Array = multi-scaling (ver nota)
  upgrade_type?: string | string[];                         // Token D-6 del pool/nodo externo que el buff MUTA (verbo muta-state, arch §15)
  cap?: number | [number, number];                          // Techo: valor máximo alcanzable
  floor?: number | [number, number];                        // Piso: umbral mínimo independiente de modificadores negativos
  helminth_base?: number;
  helminth_cap?: number;
  inverse?: boolean;
}
```

`|val1|` resuelve `base_value` (escalar) o `base_value[0]` (rango).
`|val2|` resuelve `base_value[1]` — solo válido si `base_value` es rango.

**`cap` y `floor`:** campos planos opcionales e independientes. Aceptan escalar o `[val1, val2]` cuando el rango tiene techos o pisos distintos para cada extremo.

**`upgrade_type` = el verbo muta-state (arch-decisions §15).** Nombra el pool/nodo externo que el buff de la habilidad **muta** (ej. Roar → `GAMEPLAY_MULT_FACTION_DAMAGE`, el pool de facción del arma). Es la **proyección estática del source-state**: sin duración, el buff se hornea como un `Modifier` incondicional. Un stat **con** `upgrade_type` lo consume el motor (`AbilityRepository`); uno **sin** él es display puro (`upgrade_by` = solo cómo escala en la carta) y el motor lo ignora. **El valor entra crudo** (`base_value` = porcentaje directo, 50 = +50%); el scaling cross-entity (× Ability Strength) lo hace el grafo vía `source_attribute`, NO un `toPercent`. Roar (`RhinoRoarAbility`) es el primer caso real poblado — anotado en `references/game-ui/Rhino.md` con `$$GAMEPLAY_MULT_FACTION_DAMAGE`.

---

## Vocabulario `upgrade_by` (`AbilityUpgradeBy`)

Lista activa/extensible. Cambios de naming son un regex, no una refactorización.

| Token | Semántica |
|---|---|
| `AVATAR_ABILITY_STRENGTH` | Escala con Ability Strength |
| `AVATAR_ABILITY_RANGE` | Escala con Ability Range |
| `AVATAR_ABILITY_DURATION` | Escala con Ability Duration |
| `AVATAR_ABILITY_EFFICIENCY` | Escala con Ability Efficiency |
| `ENERGY_COST` | Coste de activación. Fórmula: `(2 − EFF) × base` |
| `ENERGY_DRAIN` | Drain por segundo. Fórmula: `(2 − EFF) × base / DUR` |
| *(ausente)* | Valor fijo — no escala con ningún modificador |

`"NONE"` fue un sentinel eliminado en D-11. La semántica correcta es ausencia del campo.

---

## Notas de integridad

- `groups`/`stats` solo se modifican vía `apply-ability-md.ts`. Ver `../../pipeline/ability-pipeline.md`.
- `exclusive` no se deriva automáticamente del parser — requiere anotación manual.
- Historial de decisiones: D-11 y D-12 en `docs/data/decisions.md`.

---

## Preguntas de diseño

### ¿Cómo se manejan los Augments?
Se modelan como grupos adicionales en `groups[]`. Si el augment es excluyente con el comportamiento base o con otros estados, se usa `exclusive: true`.

### ¿Qué ocurre con los stats que no escalan?
El campo `upgrade_by` se omite. Su ausencia es el contrato para "valor fijo" — el motor no aplica ningún multiplicador. `"NONE"` fue eliminado en D-11.

### ¿Dónde vive la descripción?
En el override. Se usan tags semánticos (`<DT_SLASH>`, etc.) para que la UI pueda inyectar iconos y colores dinámicamente.

### ¿Se permiten múltiples `upgrade_by` por stat?
Sí, desde el schema. `upgrade_by` acepta `AbilityUpgradeBy | AbilityUpgradeBy[]`. El engine actualmente usa solo `[0]` con cálculo convencional; los índices adicionales se ignorarán hasta que exista la capa `formulas/ability/` con fórmulas por habilidad (ver OQ-W-7). Anotar el array en el schema no bloquea nada hoy y evita un cambio de contrato posterior.

### ¿Puede un stat tener dos valores numéricos (rango)?
Sí. `base_value` acepta `number | [number, number]`. El rango cubre casos como Gara (Vitality Shield: 150–300). Se resuelve con `|val1|` y `|val2|` en el label. Introducido en D-12.
