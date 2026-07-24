---
Estado: "referencia"
Rol: "Taxonomía facetada de la naturaleza de condition — categorías mecánicas y reglas de composición"
Impacto_ID: "semantic-condition-nature"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-06-05"
Fecha_de_actualizacion: "2026-07-24"
Dependencias:
  - "docs/semantic/conditions.md"
  - "docs/data/rules/overrides.md"
  - "docs/governance/open-questions.md"
---

# Condition Nature — Taxonomía facetada

## Propósito y alcance

[`conditions.md`](conditions.md) es el **diccionario**: lista los tokens de `condition` y su semántica caso
por caso, agrupados por prefijo de forma **emergente** ("organización emergente, no taxonomía cerrada"). Este
documento es lo complementario: define las **categorías estructuradas** de las que ese diccionario carecía —
la **naturaleza mecánica** de cada token y las **reglas de composición** que operan sobre ella.

> **Estado: análisis, NO cerrado.** Esta taxonomía entra a **coherencia mínima** (ver `conditions.md §Altitud`).
> Su eje organizador está en **contraste vivo con [OQ-SEM-2](../governance/open-questions.md)** — ni se cierra ni
> se ignora; si se torna ambiguo, se debate su destino. No es un contrato; es el vocabulario que el prototipo de
> shape (`overrides.md §Prototipo de condition`) necesita para tener granularidad.

Por qué existe: el shape de composición `condition: string | {any|all:[…]}` **no tiene solidez propia** — la toma
prestada de (a) un vocabulario con la granularidad justa y (b) tener separados los ejes que no son condición. Esta
taxonomía formaliza (a). Cobertura verificada: **145 tokens del dato real, 0 huérfanos de naturaleza.**

---

## Dos ejes ortogonales

La condición de un stat se describe por **dos facetas independientes** (no un árbol único). Constatado en
`conditions.md`: el scope es ortogonal a la naturaleza.

```
condition-token  =  {NATURALEZA}  ⊥  {SCOPE}
                     qué tipo es      sobre qué entidad
```

### Eje 1 — Naturaleza (qué tipo de condición es)

Cuatro categorías mecánicas. El prefijo del token es su marca sintáctica; la naturaleza es lo que *significa*.

| Naturaleza | Prefijo | Definición mecánica | Qué computa el engine | Proyección `engine:class:c2/*` (derivada) | N |
| :--- | :--- | :--- | :--- | :--- | ---: |
| **Evento** | `on_` | Momento puntual de combate. El modifier vive en la ventana del trigger (o del buff que genera). | Disparo de un evento en el instante exacto. | `c2/event`, o `c2/stack` si lleva contador+ventana (`on_2_headshots_within_2s`). | 98 |
| **Estado** | `while_` | Flag booleano continuo: o se cumple o no, de forma sostenida. | Lectura de un flag de `SimContext`. | `c2/binary` | 37 |
| **Umbral** | `with_` | Comparación de un stat de runtime contra un valor N. | Comparar un stat (existente) contra N. | `c2/derived` | 8 |
| **Escala** | `per_` | **Disputado (ver abajo).** No activa/desactiva: *multiplica* proporcionalmente a un stat. | Factor proporcional, no booleano. | No encaja en `c2/*` booleano. | 2 |

> **Contraste con OQ-SEM-2 (registrado, no resuelto):** la columna `c2/*` se **deriva** de la naturaleza, no al
> revés. Eso sostiene la hipótesis de OQ-SEM-2 — que el eje primario debería ser la **mecánica real del juego**
> (naturaleza) y `engine:class:c2/*` una **proyección** anclada a un engine que aún no existe. Este doc adopta la
> naturaleza como eje primario **a título de análisis**; la decisión formal sigue en OQ-SEM-2.

### Eje 2 — Scope (sobre qué entidad se evalúa)

Ortogonal a la naturaleza. **No** pertenece a esta clasificación como sub-rama — es su propia faceta (y para los
prefijos de `upgrade_type` ya vive fuera, derivado de `WEAPON_`/`AVATAR_`/…).

| Scope | Significado | Ejemplos | N |
| :--- | :--- | :--- | ---: |
| `jugador/arma` | Estado o acción del propio frame/arma | `on_hit`, `while_sliding`, `with_armor_over_450` | 84 |
| `target` | Estado del enemigo o evento sobre él | `while_enemy_frozen`, `on_hitting_enemies_affected_by_corrosive` | 41 |
| `loadout` | Configuración de equipamiento | `while_melee_equipped`, `while_incarnon_form`, `while_dread_and_hate_equipped` | 9 |
| `operador` | Modo Operador / Transference (fuera del weapon-sim) | `on_void_sling`, `while_an_operator` | 9 |
| `zona` | Ubicación ambiental | `while_in_residual_zone` | 1 |
| `multiplayer` | Requiere aliados (fuera del sim personal) | `while_buffing_ally_warframes` | 1 |

---

## `per_` (escala) — naturaleza en disputa

`per_melee_combo_multiplier`, `per_status_type_on_target`. Estos **no son condiciones booleanas**: no encienden ni
apagan un modifier, lo **escalan** proporcionalmente a un stat de runtime. Hipótesis a debatir: `per_` no es
`condition` sino otro eje (scaling / cercano a `upgrade_by`). Se mantiene aquí **provisionalmente** mientras se
decide; si se confirma que es scaling, sale de `condition` y este doc lo refleja. Contador vivo: 2 casos.

---

## Reglas de composición

El shape (`condition: string | {any:[…]} | {all:[…]}`) y su semántica viven en
[`overrides.md §Prototipo de condition`](../data/rules/overrides.md). Aquí, lo que la **naturaleza** aporta a la composición:

1. **`any`/`all` son intención explícita del autor** — no se derivan de la naturaleza de los operandos. Un `any`
   puede mezclar naturalezas (`{any:["on_hit","while_aim"]}`); un `all` también. La naturaleza informa, no decide.
2. **Granularidad: composición vs sub-tipo atómico.** Un token compuesto es **composición** (→ obj-key) solo si
   sus partes son condiciones que existen y se evalúan **independientemente** en otros perks:
   - `on_hit_while_target_affected_by_electricity` → composición: `{all:["on_hit","while_target_affected_by_electricity"]}` (ambas partes existen sueltas).
   - `on_headshot_kill` → **átomo**: "headshot kill" es un *sub-tipo* de evento, no `on_headshot` ∧ `on_kill`. No se descompone.
   - Criterio: ¿la parte aparece sola en el vocabulario? Sí → componente. Solo pegada → átomo.
3. **`with_` (umbral) en composición:** se comporta como guarda (igual que `while_`) — `{all:["on_kill","with_armor_over_700"]}`. La diferencia con `while_` es de *evaluación* (comparar vs leer flag), no de composición.

### Tabla semilla de exclusión mutua

Base de una futura red de seguridad (no se construye aquí): un `all` de estados **mutuamente excluyentes** es
*siempre falso* = efecto muerto = error de autoría (caso Agile Executor, cuyo label dice "and" siendo OR). Semilla,
no exhaustiva — se amplía al madurar la taxonomía de movimiento/postura:

| Estado A | Estado B | Razón |
| :--- | :--- | :--- |
| `while_airborne` | `while_grounded` | aire vs suelo |
| `while_aim_gliding` | `while_sliding` | aim-glide es aéreo; slide es terrestre |
| `while_aim_gliding` | `while_grounded` | ídem |

> Regla derivada: `{all:[A,B]}` con A,B en la misma fila → **rechazar** (debió ser `{any:…}`). El operador correcto
> lo da la **mecánica de co-ocurrencia**, nunca la conjunción del label.

---

## Cobertura (validación)

Script read-only sobre los 4 overrides (`arcane-stats`, `incarnon-evolutions`, `mod-stats`, `archon-shards`):

- **145 tokens únicos**, **0 huérfanos de naturaleza** — todos caen en evento (98) / estado (37) / umbral (8) / escala (2).
- Cruce naturaleza × scope poblado y coherente (la faceta se sostiene): p. ej. `evento × jugador/arma` = 62, `estado × target` = 13, `evento × operador` = 7.
- Los ~12 token-paraguas se descomponen sin ambigüedad bajo §Reglas de composición: 5 OR → `{any}`, 2 evento∧estado → `{all}`, 3 pares stalker (loadout co-ocurrente) → `{all}`. Falsos positivos (`with_energy_at_or_above_90pct`, `while_impaling_5_or_more_enemies`) quedan fuera por ser umbrales, no composición.

---

## Qué NO define este documento

- No extiende el schema `condition` (sigue `string | null` en los contratos).
- No migra ningún token a obj-key (trabajo posterior, gateado).
- No cierra OQ-SEM-2 ni OQ-DATA-4.
- No construye el linter de exclusión mutua (solo siembra la tabla).
