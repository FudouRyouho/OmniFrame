# Damage Types

> Estado: activo
> Rol: familias de daño, reglas de combinación elemental y peso de proc
> Fuente de verdad de: clasificación canónica de tipos de daño y sus combinaciones
> No usar para: mecánicas de efectos de estado — ver `status-effects.md`
> Última actualización: 2026-05-26

## Distinción clave: Tipo de daño ≠ Efecto de estado

Un **tipo de daño** (ej. `heat`) describe el componente de daño de un arma o habilidad y determina las eficiencias contra el tipo de salud/armor del enemigo.

Un **efecto de estado** (proc) es la consecuencia secundaria aplicada al enemigo al acumular suficiente status chance (ej. `Ignite`).

Son vocabularios independientes. El tipo de daño `heat` y el proc `Ignite` comparten origen pero el engine los modela por separado. Ver `status-effects.md` para fórmulas de proc.

Fuente canónica en código: `Project/src/shared/types/damage.ts` — campo `statusLabel`.

---

## Familias

| Grupo | Tipos | Proc asociado |
|---|---|---|
| Físico | `impact`, `puncture`, `slash` | Stagger, Weakened, Bleed |
| Elemental base | `heat`, `cold`, `electricity`, `toxin` | Ignite, Freeze, Tesla Chain, Poison |
| Combinado | `blast`, `corrosive`, `gas`, `magnetic`, `radiation`, `viral` | Detonation, Corrosion, Gas Cloud, Disruption, Confusion, Infection |
| Especial | `void`, `tau`, `true` | Bullet Attraction, Tau, — |

`true` (True Damage) ignora armor, shields y resistencias — no tiene proc de estado asociado.

---

## Reglas de combinación elemental

Solo los cuatro primarios (`heat`, `cold`, `electricity`, `toxin`) combinan entre sí, en orden de slot. Cada par adyacente genera un tipo combinado:

| Primario A | Primario B | Resultado |
|---|---|---|
| Heat | Cold | Blast |
| Heat | Electricity | Radiation |
| Heat | Toxin | Gas |
| Cold | Electricity | Magnetic |
| Cold | Toxin | Viral |
| Electricity | Toxin | Corrosive |

**Reglas adicionales:**
- El orden de slot determina qué par se combina primero.
- Si el arma tiene el elemento de forma innata, el mod lo absorbe (fusiona valores antes de colocarse en cola de combinación).
- `void`, `tau` y `true` no participan en combinaciones.

---

## Regla de elección de proc

Si un hit aplica estado, el tipo concreto del proc se elige con probabilidad proporcional al peso de cada tipo en el hit:

```
procTypeChance(type) = damageOfType / totalDamage
```

Consecuencia: aumentar el daño de un tipo específico sube su chance de proc aunque el `statusChance` total del arma no cambie.

Ejemplo: un arma con 50 Heat + 50 Slash tiene 50% de prob. de aplicar Bleed y 50% de aplicar Ignite por cada proc activado.

---

## Fuentes

- https://wiki.warframe.com/w/Damage
- https://wiki.warframe.com/w/Damage#Damage_Types
- https://wiki.warframe.com/w/Status_Effect
