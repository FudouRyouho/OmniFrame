---
Estado: "referencia"
Rol: "Registrar gaps reales de la fuente de armas que afectan lectura o cálculo"
Impacto_ID: "data-weapons-gaps"
Fidelidad_Fisica: "Project/src/shared/types/weapon.ts"
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-06-01"
---

# Weapon Data Known Gaps

## Gaps confirmados

| Gap | Descripcion | Regla actual |
|---|---|---|
| `shot_speed` vs `flight` | alias redundante o incompleto | preferir `flight`; usar fallback controlado |
| `slide` vs `slideAttack` | inconsistente en algunas melee | preferir `attacks[].slide` y tratar top-level como referencia |
| `heavyAttackDamage` | vive solo en top-level para melee estandar | leerlo desde el arma, no desde `attacks[]` |
| `punchThrough` | no existe por ataque en `@wfcd/items` | no inventarlo en el JSON |
| `damage` top-level | no siempre coincide con el modo de ataque principal | no usarlo para calculo |
| `speed` ausente | algunos ataques no exponen `speed` | tratarlo como opcional |
| `multishot` por ataque | no existe en `attacks[]`; solo hay un valor global en `stats.multishot` | ver sección dedicada abajo |

## Gap: multishot no existe por perfil de ataque

### Origen del problema

`@wfcd/items` expone un único campo `stats.multishot` por arma. No existe `multishot` dentro
de `attacks[]`. Sin embargo, en el juego varias armas tienen valores de multishot distintos
según el perfil de ataque activo — verificado contra la wiki oficial (fuente: wiki.warframe.com/w/Multishot).

### Regla de resolución (engine)

El engine resuelve el multishot de cualquier ataque con esta prioridad:

```
1. ¿Existe entrada en weapon-stats.override.json para (unique_name, attack.name)?
   → usar ese valor

2. ¿Es este ataque attacks[0] del arma?
   → usar stats.multishot

3. Cualquier otro caso
   → multishot = 1
```

**Por qué `attacks[0]` y no `family: shotgun`:**
La heurística basada en family requeriría tratar diferente a shotguns secundarias
(Bronco, Brakk, Pyrana — `family: pistol`) y no resuelve el caso de shotguns con
Incarnon Form (Felarx: `attacks[0]` = pellets → hereda 4; `attacks[1]` = Incarnon Form → cae a 1).
`attacks[0]` es consistente para todos los tipos de arma sin casos especiales por family.

**Fuente de verdad para excepciones:**
`wiki.warframe.com/w/Multishot` lista exhaustivamente todos los perfiles con multishot
innato > 1. Si un perfil no aparece ahí, su multishot es 1 por definición del juego.
Las excepciones verificadas están en `weapon-stats.override.json` (ver sección abajo).

### Armas con gap confirmado

#### Primary / Secondary — `weapons.json` → `weapon-stats.override.json`

| Arma | Attack afectado | Multishot real | `stats.multishot` actual |
|------|----------------|---------------|--------------------------|
| Basmu | `Held` | 2 | 1 (global) |
| EFV-5 Jupiter | `Buckshot` | 11 | 1 (global) |
| Kuva Zarr | `Barrage Mode` | 10 | 1 (global) |
| Kuva Hek | `Alt-Fire` | 28 | 7 (solo aplica al primary) |
| Euphona Prime | `Buckshot` | 10 | 1 (global) |
| Fusilai | modo alternativo | 3 | 1 (global) |

#### Incarnon — perfil `Incarnon Form`

Estas armas tienen `Incarnon Form` con multishot innato. Su override natural sería
el sistema incarnon (pendiente de diseño). No forman parte del override de `weapons.json`.

| Arma | Multishot en Incarnon Form |
|------|---------------------------|
| Boltor Incarnon | 3 |
| Soma Incarnon | 8 |
| Kunai Incarnon | 2 |

#### Melee con proyectil (gunblades y chakrams)

Estas armas disparan proyectiles con multishot innato. Pertenecen a `weapons.json`
pero son `family: melee` — el override requiere criterio de diseño separado
ya que el sistema melee aún no está modelado.

| Arma | Attack afectado | Multishot real |
|------|----------------|---------------|
| Redeemer | `Normal Attack` | 10 |
| Vastilok | `Normal Attack` | 9 |
| Arum Spinosa | `Heavy Attack` | 18 / 9 |
| Quassus | `Heavy Attack` | 12 / 6 |
| Quassus Prime | `Heavy Attack` | 18 / 9 |

#### Archwing / Companion / Operador

Viven en JSONs separados (`archwing-weapons.json`, etc.). No cubiertos por el sistema
de override actual. Gap documentado para cuando se modelen esos dominios.

| Arma | Attack afectado | Multishot real |
|------|----------------|---------------|
| Cortege | Alternate Fire | 3 |
| Corvas | Atmospheric Mode | 11 |
| Mandonel | Uncharged Shot | 8 |
| Sweeper | Normal | 6 |

### Armas ya correctas (no requieren override)

Estas armas tienen multishot innato en su ataque principal y `stats.multishot` ya lo refleja:

| Arma | Multishot | Ataque |
|------|-----------|--------|
| Cernos Prime | 3 | Normal |
| Quanta / Quanta Vandal / Tenet Quanta | 2 | Normal |
| Todas las shotguns | según stats | Primary |

### Decisión de resolución

- **weapons.json (primary/secondary):** override manual en `Project/public/data/weapon-stats.override.json`. Scope: 5 armas activas + 1 pendiente (Fusilai, unique_name no verificado).
- **Incarnon Form:** la regla `attacks[0]` ya lo resuelve para escopetas (Felarx). Para incarnon con multishot propio en Incarnon Form (Boltor, Soma, Kunai), resolver junto al diseño del sistema incarnon.
- **Melee:** posponer hasta modelado del dominio melee.
- **Archwing/Special:** posponer hasta modelado de esos dominios.
- **Cosecharlo del wiki: sin descartar, sin verificar.** El warrant original ("no tocar el fork de `@wfcd/items`") caducó — ya no hay fork, y cosechar módulos Lua es rutina (`omniframe-items` tiene seis scrapers). Lo que sigue sin comprobarse es si `Module:Weapons/data` expone multishot **por ataque**: nuestro `WeaponScraper` es *lean* a propósito (sólo `weaponClass`), así que nadie miró. Con 5 armas resueltas por override, el override sigue siendo más barato; el día que la lista crezca, la pregunta se responde bajando un submódulo. Ver [`../../../domains/source/warframe-items.md`](../../../domains/source/warframe-items.md) §La cosecha propia.

## Implicacion

Estos gaps informan al builder y a la UI, pero no justifican desnormalizar el modelo
ni llenar el dataset con campos inventados.

