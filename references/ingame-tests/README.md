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
- [`pending.md`](pending.md) — **preguntas que sólo se cierran midiendo**, cada una con el diseño del test.
  No son resultados: son huecos formulados para no volver a descubrirlos. Una entrada sale de ahí cuando
  se mide, y pasa a tener su propio `.md` en este directorio.
