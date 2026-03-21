# Gap Técnico — Override de mods (mod-stats.json)

> Estado: activo
> Última actualización: 2026-03-19
> Referenciado desde `decisions/open-questions.md` §D1, §D2

---

## Contexto

`@wfcd/items` provee `levelStats` en cada mod: un array de objetos `{ stats: string[] }`,
uno por rango. Cada string es texto libre extraído del juego, por ejemplo:

```json
"levelStats": [
  { "stats": ["+15% Damage"] },
  { "stats": ["+165% Damage"] }
]
```

Suficiente para renderizar el card del mod, insuficiente para el motor de cálculo.

Tras añadir `upgradeTypes[]` al fork (2026-03-19), el ~85% de los mods de armas tienen
su stat identificado canónicamente. El override ya no es la fuente de verdad del modifier.

---

## Rol actual del override

El override es un complemento quirúrgico para los gaps que `upgradeTypes` no cubre solo.

### Gaps documentados

**Gap A — Tipo de daño en mods elementales**

`WEAPON_PERCENT_BASE_DAMAGE_ADDED` cubre todos los mods elementales y físicos, pero el
tipo específico (`DT_FIRE`, `DT_FREEZE`, `DT_PUNCTURE`...) está en `DamageType` del
Public Export, no en `upgradeTypes`.

Resolución: D2 (ampliar el fork). Hasta entonces, fallback en el override.

**Gap B — Condiciones de activación**

`ValidPostures` (AIMING, AIRBORNE, CROUCHING...) y `ValidProcTypes` están en el Public
Export pero el fork los descarta actualmente.

Resolución: D2 (ampliar el fork). Hasta entonces, fallback en el override.

**Gap C — Triggers de evento (On Kill, On Hit, On Headshot)**

No son posturas — son eventos. El Public Export los modela en `ValidModifiers` o en
lógica Lua. El builder v1 los trata como "asumir activo" (max stacks) o toggle.

Resolución: pendiente de DT-11 (arquitectura del motor).

**Gap D — Progresión no lineal**

Primed (10 rangos), Galvanized (10 rangos, progresión especial), Archon.
El Public Export solo tiene `Value` para rango 0. Los rangos intermedios no son lineales.

Resolución: `values[]` explícitos en el override para estos ~30-40 mods.

**Gap E — Augmentos UNIQUE**

`upgradeTypes: []` — efectos Lua sin `UpgradeType` estándar.
El override reserva `misc: []` como placeholder. No poblar hasta que el builder lo necesite.

---

## Schema del override

```json
{
  "/Lotus/Upgrades/Mods/Rifle/WeaponDamageAmountMod": {
    "values": [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165]
  },

  "/Lotus/Upgrades/Mods/Shotgun/Event/ProjectNightwatch/SobekNightwatchMod": {
    "misc": []
  }
}
```

Campos válidos en el override:
- `values[]` — valores por rango para progresión no lineal (Gap D)
- `damageType` — tipo de daño elemental como fallback hasta D2 (Gap A)
- `condition` — condición de activación como fallback hasta D2 (Gap B)
- `misc: []` — placeholder para augmentos UNIQUE (Gap E), sin poblar hasta DT-11

Campos que NO pertenecen al override:
- `modifier` con valores inventados (`DAMAGE_BASE`, `CRIT_CHANCE`, etc.) — obsoleto
- `label` con templates `|val1|` — la descripción la provee `warframe-items` directamente
- `rawStats[]` completos para mods estándar — innecesario, `upgradeTypes` los cubre

---

## Estado de los archivos mod.*.stats.json

Los archivos actuales en `Project/data/mods/` contienen el diseño anterior: `rawStats[]`
con `modifier` inventados y `label` templates para todos los mods. Son contexto histórico.

No bloquean nada. Cuando el builder empiece a consumir datos de mods, se reemplazarán
por el schema reducido documentado arriba.

---

## Próximo paso

D2: ampliar `warframe-items/build/parser.mjs` para extraer del Public Export:
`Value` (rango 0), `DamageType`, `ValidPostures`, `ValidProcTypes`, `OperationType`.

Esto cierra los Gaps A y B de raíz. Ver `decisions/open-questions.md` §D2.

---

## Referencias

- `decisions/mods-builder-analysis.md` §3 — gaps detallados con ejemplos
- `decisions/mods-builder-analysis.md` §5 — rol del override en su nuevo contexto
- `decisions/open-questions.md` §D1, §D2 — decisiones tomadas
- `architecture/warframe-items-changes.md` — cambios al fork
