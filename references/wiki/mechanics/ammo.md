# Ammo — Mecánica de munición

**Fuente:** wiki.warframe.com/w/Ammo  
**Fecha de consulta:** 2026-05-31

---

## Estructura del sistema

El sistema distingue dos pools separados:

| Pool | Descripción | Token OmniFrame |
|---|---|---|
| **Magazine** (cargador) | Munición disponible inmediatamente. Se consume al disparar. | `WEAPON_ADD_MAGAZINE_MAX` |
| **Ammo Reserve** (reserva) | Munición total disponible para recargar. | `WEAPON_ADD_AMMO_MAX` |

Los dos pools son **independientes** — `Ammo Maximum` no afecta `Magazine Capacity`.

## Mods de Ammo MAX (reserva)

Ammo Drum, Ammo Chain, Primed Ammo Chain, Ammo Case, Trick Mag, Shell Compression.

## Impacto en simulación

`WEAPON_ADD_AMMO_MAX` es un stat de **economía de recursos**, no de DPS:
- No modifica cadencia de disparo, daño por proyectil ni velocidad de recarga.
- Mayor reserva = menos necesidad de buscar ammo pickups en combate prolongado.
- **No relevante para simulación de DPS teórico** — clasificado como `—` en el modelo.

## Casos especiales

- **Battery weapons** (Kuva Ogris, Shedu, etc.): no tienen ammo pool; regeneran carga automáticamente. `WEAPON_ADD_AMMO_MAX` no les aplica.
- **Armas sin reserva**: algunas armas especiales no consumen ammo reserve. Confirmación por arma necesaria antes de mapear.

## Relación con holster

Holster reload (recarga mientras el arma está guardada) no está documentada en esta página de la wiki. Mecánica separada — pendiente de referencia propia si se necesita modelar.
