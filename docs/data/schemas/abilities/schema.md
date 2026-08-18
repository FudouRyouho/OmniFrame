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
  exclusive?: boolean;     // Derivado del nivel de header (`###`) en los grupos con `id` que vienen
                            // de `game-ui/*.md` — ver "Gap declarado" abajo.
  stats: AbilityStatEntry[];
}
```

### Casos canónicos de grupos

El schema absorbe distintos patrones de organización de habilidades. Lista verificada (expandible):

| Caso | Tipo | Ejemplo |
|---|---|---|
| Warframe simple | Un solo grupo base (sin `id`), siempre activo | Excalibur, Volt |
| Modos exclusivos por elemento | Múltiples grupos, `exclusive: true` | Chroma (Heat/Cold/Toxin/Electric) |
| Modos exclusivos por forma | Múltiples grupos, `exclusive: true` con toggle | Equinox (Day/Night) |
| Modos aditivos | Múltiples grupos coexistentes, `exclusive` ausente por diseño | Wisp (Vitality/Haste/Shock motes) — ver gap declarado |
| Augments | Grupo adicional opcional | (warframes con augment) |

**Gap declarado — `exclusive` poblado, `default_active` sin materializar, ningún consumidor los lee.**
`apply-ability-md.ts` deriva `exclusive: true` del nivel de header `###` en la fuente
(`references/game-ui/README.md:16-17`) — 29 de los 177 grupos con `id` del corpus lo tienen (Chroma,
Equinox, Jade, Mag, Octavia, Protea, Titania, Vauban, Zephyr). `default_active` sigue en **cero
ocurrencias**: no hay señal de header que lo distinga. Wisp (Vitality/Haste/Shock motes) queda
deliberadamente afuera — la fuente los captura con `###` pero el patrón real es aditivo, no exclusivo
(contradicción entre convención de header, captura y este mismo doc, sin reconciliar). Y ningún
consumidor lee ninguno de los dos campos: ni `AbilityRepository` (`getModifiers`/`getEmissions` iteran
`entry.groups` sin condición), ni ningún componente de UI, ni el CLI oracle — `exclusive` está poblado
pero inerte. El campo `id` sirve hoy solo como discriminador estructural (identifica el grupo), no
como gate de activación — un stat de daño dentro de un grupo augment/modo se emite igual que uno del
grupo base. Medido: 19 casos confirmados de esto ([#29](https://github.com/FudouRyouho/OmniFrame/issues/29)).

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

**`upgrade_type` = el verbo muta-state (arch-decisions §15).** Nombra el pool/nodo externo que el buff de la habilidad **muta** (ej. Roar → `GAMEPLAY_MULT_FACTION_DAMAGE`, el pool de facción del arma). Es la **proyección estática del source-state**: sin duración, el buff se hornea como un `Modifier` incondicional. Un stat **con** `upgrade_type` lo consume el motor (`AbilityRepository`); uno **sin** él es display puro (`upgrade_by` = solo cómo escala en la carta) y el motor lo ignora. El scaling cross-entity (× Ability Strength) lo hace el grafo vía `source_attribute`, NO un `toPercent`. Roar (`RhinoRoarAbility`) es el primer caso real poblado — anotado en `references/game-ui/Rhino.md` con `$$GAMEPLAY_MULT_FACTION_DAMAGE`.

**Un renglón puede declarar N tokens.** La UI del juego colapsa en una sola línea buffs que mecánicamente son stats distintos: Volt Speed muestra `Speed Multiplier: 1,75x` para Movement Speed **y** Melee Attack Speed, que [`references/wiki/mechanics/movement-speed.md`](../../../../references/wiki/mechanics/movement-speed.md) declara separados (Movement Speed no afecta melee attack speed). El `.md` de `game-ui/` captura la pantalla literal — es su razón de ser —, así que lo que se pluraliza es la anotación, no el renglón: `$$AVATAR_ADD_MOVEMENT_SPEED $$MELEE_ADD_ATTACK_SPEED`. El parser emite escalar con un token y array con varios (mismo criterio que `base_value` con min-max), y cada token rutea a su destino por separado.

**La unidad del valor la declara el label, y se normaliza al consumirlo.** El juego expresa el mismo tipo de bonus en dos unidades según la habilidad, y ambas entran al dato tal como se ven en pantalla:

| label | `base_value` | lo que consume el motor |
|---|---|---|
| `"Reload Speed: \|val1\|%"` | `25` | +25% |
| `"Speed Multiplier: \|val1\|x"` | `1.75` | **+75%** |

El motor consume **porcentaje aditivo crudo** (el `50` de Roar = +50%), así que `AbilityRepository` convierte los multiplicadores leyendo el sufijo del placeholder (`|val1|x` → `(v − 1) × 100`). **No se normaliza en el `.md`**: escribir `75` donde la pantalla dice `1,75x` falsearía la captura, que es la única fuente. Sin la conversión, `1.75` entraría como +1.75% — plausible, silencioso y falso. Si un label deja de ser fiel a la unidad de su valor, esto se rompe sin ruido; el tripwire es `volt.test.ts`.

**El destino lo declara el token, no la pertenencia.** Un buff de habilidad puede aterrizar en el warframe que castea (`AVATAR_*`), en un arma concreta (`MELEE_*`, o la sub-familia `WEAPON_MELEE_*`) o en todas las equipadas (`WEAPON_*`, `GAMEPLAY_*` — el ALL-scope de Roar). Lo resuelve `channel-routing.ts`: sub-familia si la hay, familia si no. Una familia sin caso declarado **no aterriza** — no hereda el destino de las armas por descarte.

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
- `exclusive` se deriva del nivel de header (`###`/`####`, `references/game-ui/README.md:16-17`) —
  `apply-ability-md.ts`/`parse-ability-md.ts` marcan `exclusive: true` en los grupos `###`. `####`
  (augment) no lleva el campo. `default_active` sigue sin vía de anotación — no hay señal de header
  que lo distinga, y el tipo del override no tiene dónde recibirlo sin editar el JSON a mano
  (prohibido por `ability-pipeline.md` regla 1).
- Historial de decisiones: D-11 y D-12 en `docs/data/decisions.md`.

---

## Preguntas de diseño

### ¿Cómo se manejan los Augments?
Se modelan como grupos adicionales en `groups[]`, identificados por `id`. Los grupos `###` (formas/elementos/modos) llevan `exclusive: true`, derivado del parser; los grupos `####` (augments) no llevan el campo — pero ningún consumidor lo lee todavía (ver gap declarado más arriba). Hoy, un stat dentro de un grupo `id` se resuelve igual que uno del grupo base — el gate real es "¿el jugador tiene el augment equipado o el modo activo?", pregunta que el schema no responde por sí solo (ver "Regla de separación"). Un caso no cubierto por el header level: augments `####` mutuamente excluyentes entre sí (Chroma, Vexing Retaliation/Guardian Armor), declarados sólo en un comentario `//` de la fuente — el shape `exclusive: boolean` no alcanza para "excluyente CON un partner nombrado" (candidato a `exclusive_with: string[]`, sin construir).

### ¿Qué ocurre con los stats que no escalan?
El campo `upgrade_by` se omite. Su ausencia es el contrato para "valor fijo" — el motor no aplica ningún multiplicador. `"NONE"` fue eliminado en D-11.

### ¿Dónde vive la descripción?
En el override. Se usan tags semánticos (`<DT_SLASH>`, etc.) para que la UI pueda inyectar iconos y colores dinámicamente.

### ¿Se permiten múltiples `upgrade_by` por stat?
Sí, desde el schema. `upgrade_by` acepta `AbilityUpgradeBy | AbilityUpgradeBy[]`. El engine actualmente usa solo `[0]` con cálculo convencional; los índices adicionales se ignorarán hasta que exista la capa `formulas/ability/` con fórmulas por habilidad (ver OQ-W-7). Anotar el array en el schema no bloquea nada hoy y evita un cambio de contrato posterior.

### ¿Puede un stat tener dos valores numéricos (rango)?
Sí. `base_value` acepta `number | [number, number]`. El rango cubre casos como Gara (Vitality Shield: 150–300). Se resuelve con `|val1|` y `|val2|` en el label. Introducido en D-12.
