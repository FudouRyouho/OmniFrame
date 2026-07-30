# Projectile Speed

> Estado: activo
> Rol: mecánica de velocidad de proyectil — qué armas la tienen, cómo la afectan los mods, interacción con falloff y multishot
> Fuente de verdad de: definición, la distinción hitscan vs proyectil, la regla de falloff, y el catálogo de mods separado por PvE / weapon-specific / PvP
> No usar para: catálogo de valores de flight speed por arma (está en las tablas del raw)
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Projectile_Speed
> Fuente actualizada: 2026-07-09
> Raw: projectile-speed.wikitext · ../mods/terminal-velocity.wikitext · ../mods/feathered-arrows.wikitext · ../mods/whirlwind.wikitext · ../mods/entropy-flight.wikitext · ../mods/fatal-acceleration.wikitext · ../mods/heavy-warhead.wikitext

## Definición

**Projectile Speed** (también *projectile velocity* o *flight speed*) define qué tan rápido viaja la
munición de un arma **no-hitscan** hacia el blanco tras dejar el cañón.

Su consecuencia práctica es sobre la puntería: contra blancos en movimiento hay que **liderar** el
tiro —apuntar a dónde va a estar el objetivo cuando llegue el proyectil—, no al retículo.

## Hitscan vs proyectil

Un arma **hitscan** golpea el punto apuntado al instante; no hay que liderar nada.

**Cómo distinguirlas:** disparar a una pared lo más lejos que se vean los impactos. Si el agujero
aparece **instantáneamente, antes de cualquier animación de bala**, es casi seguro hitscan.

> Las animaciones de bala, estelas de humo o destellos **no** indican que un arma sea de proyectil:
> pueden ser puramente visuales.

Todo lo que no es hitscan es de proyectil. Los proyectiles son "tangibles": tienen **hitbox física**
— Valkyr puede enganchar con Rip Line el cohete de un Ogris.

## Hitscan y falloff: la excepción que importa

> *"Hitscan weapons that do **not** list Damage Falloff values in their UI are completely unaffected
> by Projectile Speed modifications."*

El `do not` es la clave:

- **Hitscan sin falloff** → projectile speed es totalmente irrelevante.
- **Hitscan con falloff** → los mods de projectile speed **sí lo afectan**, porque escalan su rango
  de falloff: *"will affect a weapon's entire Damage Falloff range accordingly, making them more or
  less effective at longer ranges."*

El efecto cae sobre el **rango de falloff**, no sobre una velocidad — no hay proyectil que acelerar.

## Mods

Además de aumentar la velocidad y reducir el tiempo de vuelo, estos mods **reducen la caída del
proyectil** (*projectile drop*) en las armas donde aplica, como Euphona Prime o Sporelacer.

### PvE — generales

| Mod | Rango (rank 0 → máx) | Notas |
|---|---|---|
| Terminal Velocity | +15% → **+60%** | rifle |
| Fatal Acceleration | +10% → **+40%** | shotgun |
| Whirlwind | +30% → **+180%** | **Exilus**, para glaives lanzados; como efecto directo también aumenta la distancia de lanzamiento |
| Entropy Flight | +35% → **+140%** | |
| Lethal Momentum · Jet Stream · Galvanized Acceleration | — | valores en la página de cada mod |

### PvE — específicos de arma

Static Alacrity · Focused Acceleration · Precision Munition.

### PvP — exclusivos de Conclave

| Mod | Rango | Notas |
|---|---|---|
| Feathered Arrows | +15% → **+60%** | arcos; el rank máximo lleva además un −20% en su segunda columna |
| Heavy Warhead | −12.5% → **−50%** | **pistola**: cambia velocidad por radio de explosión (+25% → +100%) |
| Blind Shot · Lucky Shot | — | valores en la página de cada mod |

> Heavy Warhead y Feathered Arrows son **Conclave-exclusive**. No aplican en PvE.

## Interacciones

- **Damage Falloff** — los mods escalan el rango completo (`start` y `end`), no el porcentaje de
  reducción. Ver [`damage-falloff.md`](damage-falloff.md).
- **Multishot** — *"the trajectory of the main projectile can be off-centered by using multishot,
  with the effect being more pronounced the slower the Projectile Speed value is."* Velocidad baja +
  multishot ⇒ más dispersión. Cruza con [`accuracy.md`](accuracy.md).

## Fuentes

- https://wiki.warframe.com/w/Projectile_Speed
- Páginas de mod citadas para sus valores por rank: Terminal Velocity · Feathered Arrows · Whirlwind ·
  Entropy Flight · Fatal Acceleration · Heavy Warhead
