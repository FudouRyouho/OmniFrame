# DoT scaling — composición del `modded_base`

> Rol: tests in-game sobre cómo escala el daño de un DoT (qué entra en `modded_base`, qué en `own_element`).
> Fuente de verdad de: el `modded_base` del DoT (empírico).
> Última actualización: 2026-07-15

Fórmula bajo prueba (autoritativa, `wiki/mechanics/status-effects.md §Procs de tipo DoT`):
`tick = coef × modded_base × (1 + own_element_bonuses) × (1 + faction)² × (1 + status_damage)`.

---

## Test 1 — ¿`modded_base` incluye el daño de mods de elemento? → **NO** (2026-07-15)

**Arma:** Tiberon Prime, perfil `auto`. **Enemigo:** Arid Butcher lvl 215, **no** Steel Path.
**Condiciones del hit:** directo, **no crit**, no weak-zone, sin buffs externos.

| Build | Mods | Stats display (total) |
|---|---|---|
| 1 | Serration + Rifle Aptitude (status chance) | Puncture 50.9 · Impact 38.2 · Slash 38.2 · **Total 127.2** · Status 18% |
| 2 | + Thermite Rounds (+60% Heat, +60% status) | + **Heat 76.3** (= 60% × 127.2) · **Total 203.5** · Status 28.8% |

**Observado:**

| Build | Proc | Hit (total, post-armor) | DoT/tick |
|---|---|---|---|
| 1 | Slash | 114 | **45** |
| 2 | Slash | 171 | **45** |
| 2 | Heat  | 171 | 81 |

### Conclusión

- **El Slash DoT es 45 en ambas builds**, aunque el hit subió 114→171 al agregar Heat. El bleed **NO ve el
  daño de mods de elemento** → **`modded_base` EXCLUYE los mods de elemento** (entran solo por `own_element`).
- Cierre numérico (Slash = True, bypasa armor, el 45 es crudo): `0.35 × 127.2 (total físico modado) = 44.5 ≈ 45`. ✓
  Con Heat el físico sigue 127.2 → sigue 45. Por eso "el Slash se compone diferente": usa el base físico
  total, `own_element = 0`, y es True (inmune a que le agregues elementos).
- **Heat DoT (81):** consistente con `0.5 × 127.2 × (1 + 0.60 Thermite) = 101.8` pre-armor → 81 post-armor
  (×0.80 mitigación, plausible para Heat vs Grineer armored). No revertible limpio (armor-affected); el número
  exacto de `own_element` pediría un test de Heat contra enemigo **sin armor**. No bloqueante — el eje
  (`modded_base` excluye mod-elementos) queda cerrado por el Slash (True, crudo).

**Impacto en el engine:** el `modded_base` del DoT = **base innato × base-damage-mods** (Σ innato del
`DamageCombiner`, NO el Σ compuesto que incluye mod-elementos). `own_element[E]` = Σ % de mods con
`type == WEAPON_ADD_<E>_DAMAGE`. Ambos están en el `DamageCombiner` y hoy se descartan.

### Reproducción en el engine (fix `43ce2c1`, validado)

Fixture `tiberon(heat)` + test `__tests__/tiberon-dot.test.ts` reproducen el test al decimal:

| | Engine | In-game |
|---|---|---|
| moddedBase (hit, físico) | 127.20 | 127.2 ✓ |
| moddedBase con Heat (hit) | 203.52 | 203.5 ✓ |
| dotModdedBase (DoT) | 127.20 (**invariante al Heat**) | (Slash DoT 45 invariante) ✓ |
| Slash DoT `0.35 × 127.2` | 44.52 ≈ **45** | 45 ✓ |
| own_element (Thermite) | `{heat: 60}` | mod +60% ✓ |
| Heat DoT pre-armor `0.5 × 127.2 × 1.6` | **101.76** | 81 post-armor (×0.80) |

### Pendiente — Test de Heat aislado (punto 2, own_element numérico)

El engine predice **Heat DoT = 101.76 pre-armor** (own_element=60% de Thermite). El in-game 81 es
post-armor (Arid Butcher lvl215, resolución ③). Para fijar `own_element` numéricamente sin la mitigación,
correr un **Heat DoT contra enemigo/zona sin armor** → debería dar ~101.76 (con `modded_base 127.2`).
Sin bloquear: `own_element` ya sale del % del mod (definicional), no de reverse-engineering.
