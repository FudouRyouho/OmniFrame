---
Estado: "activo"
Rol: "Contrato del override JSON de Incarnon Genesis / Incarnon nativo"
Version: "v2.0.0"
Impacto_ID: "data-incarnon"
Fidelidad_Fisica: "Project/public/data/incarnon-evolutions.override.json"
Fecha_de_creacion: "2026-05-27"
Fecha_de_actualizacion: "2026-06-01"
---

# Schema: incarnon-evolutions.override.json

Datos de perks de evolución Incarnon. Indexado por `unique_name` del arma.

> **v2.0.0 (2026-05-30):** el schema migró de array de modificadores `[{upgrade_type, value}]`
> a `stats[]` con `label`/`base_value`/`upgrade_type`/`condition` — convergente con el patrón
> de abilities (plano) + `condition` de mods. Ver [D-18](../../decisions.md).

## Estructura

```json
{
  "<unique_name>": {
    "_challenges": { "<tier>": "challenge text" },
    "weapons": "<unique_name>"  // o  { "<alias>": "<unique_name>", ... } para variantes
    "evolutions": {
      "<tier>": {
        "<perk_id>": {
          "name":       "Display Name",
          "image_name": "WikiFile.png",
          "stats":      [ /* StatEntry[] */ ],
          "notes":      ["aclaración para la UI", "[engine] detalle de cálculo"]
        }
      }
    }
  }
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `_challenges` | `Record<tier, string>` | Texto del challenge por tier. Top-level del weapon entry. |
| `weapons` | `string \| Record<alias, unique_name>` | `unique_name` único, o dict alias→unique_name si hay variantes (Boltor/Telos/Prime). |
| `tier` | string (número) | EVO tier: "1"–"5". EVO 1 es la transformación base (`incarnon_form`), perks display-only. |
| `perk_id` | string (snake_case) | ID del perk. Coincide con `evolution_perks[tier]` en `SlotIntention`. |
| `name` | string | Nombre de display del perk (de la wiki). |
| `image_name` | string | Filename del icono del perk (sin ruta). |
| `stats` | `StatEntry[]` | Efectos del perk. Cada bullet de la wiki es un stat. |
| `notes` | `string[]?` | Aclaraciones de la wiki. Prefijo `[engine]` para detalles de cálculo (D-15). |

### StatEntry (entrada de stats)

```ts
interface StatEntry {
  label:         string;                       // Template display: "Increase Damage by |val1|.", "With Overshields: ..."
  base_value?:   number | Record<alias, number>; // Escalar, o dict por variante. Ausente = display-only.
  upgrade_type?: string;                        // Token D-6 del atributo. Ausente = no modelable (gap).
  condition?:    string | null;                 // Token canónico | null | ausente — ver tabla
}
```

`|val1|` resuelve `base_value` (escalar) o `base_value[<alias>]` (dict por variante).
La condición se conserva **también** en el texto del `label` para display (precedente mods), además
del token en `condition` para el engine.

### Estados de `condition` (taxonomía monosemántica, [D-18](../../decisions.md))

| `condition` | Significado | Detección |
|---|---|---|
| `"<token>"` | Condicional, mapeada. Token canónico de `docs/semantic/conditions.md`. | label arranca con marcador (`With`/`On`/`While`/...) y mapea |
| `null` | Condición real sin token todavía (hueco de mapeo). | label condicional + sin token (en incarnon: 0 casos) |
| *(ausente)* | No hay condición. | label no condicional |

`condition` habla solo de la condición. El estado "analizado" se infiere de `upgrade_type`/`note`.
Cobertura (2026-06-01): **175** token · **0** null · **539** ausente (714 stats). 69 tokens únicos; 21 en cola de clasificación — ver `docs/semantic/conditions.md` §Ingesta incarnon (2026-06-01).

## Tokens `upgrade_type` usados

| Token | Mapea a | Operación |
|---|---|---|
| `WEAPON_BASE_DAMAGE` | `WEAPON_DAMAGE` | `BASE_FLAT` |
| `WEAPON_BASE_CRIT_CHANCE` | `WEAPON_ADD_CRIT_CHANCE` | `BASE_FLAT` |
| `WEAPON_BASE_STATUS_CHANCE` | `WEAPON_ADD_STATUS_CHANCE` | `BASE_FLAT` |
| `WEAPON_BASE_MAGAZINE_MAX` | `WEAPON_ADD_MAGAZINE_MAX` | `BASE_FLAT` |
| (otros `WEAPON_ADD_*`, `WEAPON_BASE_HEAVY_EFFICIENCY`, …) | vocabulario D-6 | según token |

`BASE_FLAT` se suma al `base` del atributo antes de mods porcentuales — se amplifica por Serration/Hornet Strike/etc.

## Semántica de valores

- `WEAPON_BASE_DAMAGE`: unidades absolutas de daño.
- `WEAPON_BASE_CRIT_CHANCE` / `WEAPON_BASE_STATUS_CHANCE`: puntos porcentuales.
- `WEAPON_ADD_RELOAD_SPEED` / `WEAPON_ADD_PROJECTILE_SPEED`: porcentaje.

## Gaps conocidos

- Stats con `condition` token pero **sin** `upgrade_type`: efecto condicional con atributo no tokenizado
  (ej. "+300% Combo Count Chance", Punch Through, Accuracy). Display-only legítimo.
- Tokens L3 (eventos): presentes como dato; el engine no los aplica hasta tener sistema de eventos (D-15 Fase 0).
- Multi-valor por label (X / Y): se modela como stats separados; no hay `|val2|` en incarnon todavía.

## Consumer

`IncarnonRepository.getModifiers(uniqueName, evolutionPerks, targetId)` → `Modifier[]`.

> **Deuda (2026-05-30):** el repository todavía lee el formato viejo `perk.upgrades[]`. Tras la migración
> a `stats[]`, devuelve `[]` en runtime. La actualización para consumir `stats` + respetar `condition`
> (default-activo, D-15) es fase posterior, al conectar engine↔UI. Fuera de scope del trabajo de datos.

## Convención de variantes per-arma

`weapons` como dict mapea alias→`unique_name`. `base_value` puede ser dict por alias cuando el valor
difiere entre variantes (ej. `{"base": 14, "prime": 10}`). No existe un campo `variant` separado.
