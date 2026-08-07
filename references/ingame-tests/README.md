# In-game tests — mediciones empíricas propias

> Rol: log de **tests in-game hechos por el usuario** (no capturas de wiki) — build completa +
> enemigo/condiciones + valores observados, para validar/derivar fórmulas del engine.
> Fuente de verdad de: comportamiento observado en partida (ground-truth empírico).
> Editable: ✅ (es data propia, no captura pasiva de wiki — a diferencia de `wiki/`).

Hermana de `wiki/` pero de **nuestras mediciones**. Cuando una fórmula del engine se valida o se corrige
contra uno de estos tests, se cita el archivo.

## Formato de una entrada

Cada test declara, sin ambigüedad: **arma + perfil · build (mods) · enemigo + nivel + condiciones
(SP/crit/zona/buffs) · valores observados (hit + DoT por tipo) · conclusión**. Las condiciones importan:
un DoT elemental es armor-affected (el número observado ya está mitigado), un DoT de Slash es True
(crudo). Anotarlo.

## Índice

- [`dot-scaling.md`](dot-scaling.md) — composición del `modded_base` del DoT (¿incluye mods de elemento?).
  **Cierra:** el `modded_base` del DoT **excluye** el daño de mods de elemento (Tiberon Prime, Slash DoT
  invariante al agregar Heat).
- [`damage-buckets.md`](damage-buckets.md) — cómo componen entre sí los multiplicadores de daño.
  **Cierra:** `Damage Vulnerability`, multiplicador de parte y Sonar son **buckets independientes que
  multiplican**; Sonar **no** reemplaza el weakpoint innato; **emisor y receptor no comparten bucket**
  (Roar ⊥ Reap, medido); y **Roar comparte bucket aditivo con las mods de facción** — o sea que ese
  bucket es *"multiplicadores finales del emisor"*, no *"facción"*. **Un DV filtrado no reparte
  bucket**: Paralysis (melee) × Molecular Prime (sin filtro), y un rifle contra Paralysis da el mismo
  número exacto — el filtro es un **predicado de elegibilidad previo** al producto. **Y en el tick de
  DoT los dos lados divergen:** el bucket del emisor se **dobla** (`1.6² = 2.56`), la DV **no**
  (`×2.00`) — medido en la misma tirada, con 0.13% de error. 🔴 **Además destapó una fisura de
  dataset:** `ExtraHeadshotDmg` es un stat de arma (13 armas lo declaran; Alternox `−2` → headshot 1x)
  que existe en `wiki/sources/weapons-data*.lua` y **no** en `weapons.json`.
- [`status-stack-caps.md`](status-stack-caps.md) — de quién es el cap de stacks con **dos emisores**.
  **Cierra:** el cap es **del que aplica**, el contador es **del receptor**, y un proc sobre-cap
  **refresca el stack más viejo en vez de rechazarse** — *"el proc siempre entra; el cap decide si suma
  o reemplaza"*. Confirma sin cambios el *"sobre-cap: reemplaza al más viejo"* del primitivo de stack
  tracker, escrito para un solo emisor. 🔴 **Destapa un bug latente:** `min(cap, count+1)` colapsa el
  contador hacia abajo donde el juego lo mantiene, y el estado escalar `{count}` no puede expresar
  "el más viejo" (dato para `OQ-ENGINE-16`).
- [`pending.md`](pending.md) — **preguntas que sólo se cierran midiendo**, cada una con el diseño del test.
  No son resultados: son huecos formulados para no volver a descubrirlos. Una entrada sale de ahí cuando
  se mide, y pasa a tener su propio `.md` en este directorio.
