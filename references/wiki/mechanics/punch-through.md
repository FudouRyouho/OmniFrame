# Punch Through

> Estado: activo
> Rol: mecánica de penetración — geometry punch through, infinite body punch through y el caso bloqueado de las AoE
> Fuente de verdad de: qué mide el stat y en qué unidad, las tres variantes de la mecánica, qué no se penetra por diseño, valores de referencia
> No usar para: el catálogo completo de armas con punch through innato ni la tabla de rangos mínimos de mod (están en el raw)
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Punch_Through
> Fuente actualizada: 2026-07-19
> Raw: punch-through.wikitext

## Definición

> *"Determines how far projectiles can pass through enemies and objects. Each pierced target
> subtracts the value of the remaining Punch Through potential for that projectile."*

Se mide en **metros de material** —cobertura, objetos o enemigos— que el disparo puede atravesar
antes de desaparecer. Cada blanco atravesado **resta su grosor** del potencial restante.

Dos usos que la wiki destaca:

- Golpear **weak spots de enemigos en cobertura total**, sin esperar a que se expongan
  (→ [`enemy-body-parts.md`](enemy-body-parts.md)).
- Atravesar varios enemigos por disparo, lo que mejora mucho la eficiencia de munición contra hordas.

### Valores de referencia

- **1.2 m** basta para atravesar la mayoría de los enemigos **al menos una vez**, y es también el
  grosor de una fila de cuatro Grineer Butcher a la altura del pecho.
- **2.1 m** hace que los cuatro Butcher reciban el impacto.

## Las tres variantes

### Geometry Punch Through

Es el punch through **normal**: el que figura en el arsenal y el que dan los mods. Distancia total de
material atravesable antes de disiparse.

Los mods lo suman como **valor plano en metros** y **apilan aditivamente** con el innato del arma.
**No existen mods de punch through porcentual.**

| Mod | Rango |
|---|---|
| Metal Auger · Seeking Force | +0.4 → +2.1 m |
| Primed Shred | +0.2 → +2.2 m |
| Power Throw | +0.3 → +2.0 m |
| Vigilante Offense | +0.25 → +1.5 m |
| Shred · Merciless Gunfight | +0.2 → +1.2 m |

### Infinite Body Punch Through

Algunas armas de proyectil ancho o de flujo de partículas atraviesan una cantidad **ilimitada de
enemigos** — pero **no** geometría de nivel, objetos ni barreras. Arca Plasmor, Ignis (y Wraith),
Alternox en fuego primario, entre otras.

### AoE: punch through bloqueado

Con muy pocas excepciones, los proyectiles con componente de área **no atraviesan** nada: explotan al
primer contacto.

> Y en las AoE **de proyectil** (a diferencia de las hitscan) el stat de punch through **no se puede
> modificar**. El arsenal lo muestra con un **ícono de candado** junto al valor.

Algunas armas tienen varios modos, donde el modo AoE no aprovecha el punch through pero otro sí.

## Comportamiento por tipo de ataque

- **Hitscan** — lo aprovecha con normalidad.
- **Proyectil no-hitscan** — aplica; al atravesar geometría el proyectil sigue viajando.
- **Beam** — las de infinite body punch through atraviesan enemigos ilimitados, no geometría.
- **Melee** — el golpe regular puede usar punch through para atravesar geometría de nivel.

## Qué no se penetra

- Las **partes protegidas de jefes** hasta que se abren — el respiradero de General Sargas Ruk es el
  caso típico.
- Los **escudos de un Eximus Guardian**.
- **Jefes que se vuelven invulnerables** al desplegar protección en vez de usar una barrera física:
  Raptors, Captain Vor y Lephantis. Ahí el punch through no permite hacer daño durante esa fase.

## Bugs conocidos

- El punch through real de la **Drakgoon** en disparos cargados puede diferir del listado en arsenal
  y códice; parece ser **menor** que los 1.5 m declarados. La wiki pide más testeo.

## Fuentes

- https://wiki.warframe.com/w/Punch_Through
- [`enemy-body-parts.md`](enemy-body-parts.md) · [`multishot.md`](multishot.md) · [`damage-falloff.md`](damage-falloff.md)
