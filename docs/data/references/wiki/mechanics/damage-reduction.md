---
Estado: "referencia"
Rol: "Mecánica Damage Reduction — base para token AVATAR_DAMAGE_TAKEN"
Version: "v0.1.0"
Impacto_ID: "REF-DamageReduction"
Fidelidad_Fisica: "Project/public/data/mod-stats.override.json"
Fecha_de_creacion: "2026-06-04"
Fecha_de_actualizacion: "2026-06-04"
Fuente: "https://wiki.warframe.com/w/Damage_Reduction + https://wiki.warframe.com/w/Adaptation"
---

# Damage Reduction (DR) — Mecánica de Reducción de Daño

## Definición y fórmula

DR reduce el daño recibido por el jugador. **Las fuentes de DR apilan multiplicativamente**, no aditivamente:

```
Daño recibido = Daño infligido × (1 − DR1) × (1 − DR2) × …
```

Con armadura (solo afecta salud) se añade el factor de armadura:

```
Daño a salud = Daño × (1 − DR1) × … × 300 / (300 + Armadura)
```

Los modificadores por **tipo de daño** se aplican como `× (1 + DM)` dentro de su tipo (DM puede ser negativo = resistencia).

---

## Tipos de DR y su stacking

| Tipo | Aplica a | Stacking | Notas |
|---|---|---|---|
| **Armadura** | Solo salud | Bonus aditivos entre sí; multiplicativo vs otras DR | `300/(300+Armor)` |
| **Pure DR** (habilidades) | Escudos + salud | Multiplicativo | Temporal |
| **Type Modifiers** (resistencias por tipo) | El tipo específico | Multiplicativo dentro del tipo | Ej: `+45% Toxin Resistance` → toxin × (1−0.45) |
| **Energy-as-Health** | Energía (ratio 2:1) | Multiplicativo | Quick Thinking / Gladiator Finesse |
| **Damage Attenuation** | Salud del **enemigo** | Multiplicativo, escala con DPS | Lado enemigo — fuera de scope del jugador |

**Cap habitual: 90%** (varias habilidades: Desolate Hands, Preserving Shell, Immolation, Self Portrait).

---

## Mods en el override bajo `AVATAR_DAMAGE_TAKEN` — 3 sub-formas distintas

El bucket actual `AVATAR_DAMAGE_TAKEN` mezcla **tres mecánicas físicamente distintas**:

1. **Resistencia estática por tipo** — `+X% Toxin / Heat / Cold / Electricity / Radiation Resistance`, `+X% Physical Damage Resistance`. Type Modifier multiplicativo. El tipo está fijo en el label.
2. **DR genérica condicional** — `Reduced damage by X% while airborne`. No tiene tipo; tiene una **condition** (`while_airborne`). Eje ortogonal al tipo.
3. **DR adaptativa / stacking** — **Adaptation** (ver abajo). Ni tipo fijo ni valor estático.

---

## Adaptation — el caso que rompe la taxonomía per-elemento

| Propiedad | Comportamiento |
|---|---|
| Trigger | Al recibir daño de cualquier fuente (no auto-daño) |
| Stacking | **Separado por tipo de daño**, cada tipo hasta **90%** independiente |
| Por golpe | +10% a rank máximo (+5% rank 0); refresca el stack del mismo tipo |
| Decay | 10s (rank 0) → 20s (rank 10) por stack |
| Tipo afectado | El del **componente de mayor daño** del ataque ("un ataque → un tipo de resistencia") |
| Interacción | Multiplicativo con otras DR; no aplica a Overguard; no apila con el pasivo de Caliban |

**Por qué importa:** Adaptation **no es** `+X% [elemento] Resistance` estático. Es *"gana resistencia al elemento que acaba de golpearte, apilando, con decay, capeado por tipo"*. No hay elemento fijo en el efecto — el tipo es dinámico/stateful. Por tanto **no encaja ni como token-por-elemento ni como token genérico simple**: pertenece al territorio de stacking + condition (**OQ-DATA-4**), igual que Condition Overload o los set bonuses.

---

## Relevancia para el engine / token `AVATAR_DAMAGE_TAKEN`

- **Operación:** el bucket es **multiplicativo** (op `MULT`), no `ADD`.
- **Precedente de vocabulario:** ya existe la familia `AVATAR_CHANCE_RESIST_*` (per-elemento, 11 tokens) en `modifier.ts` — pero modela *chance de resistir un proc*, no reducción de daño. No es el mismo mecanismo.
- **Taxonomía sin cerrar:** (a) token por elemento (`AVATAR_MULT_<ELEMENT>_RESISTANCE`) vs (b) token genérico + elemento como `condition`/parámetro. Adaptation prueba que (a) no basta: necesita el eje stacking+condition de todos modos.
- **Sin consumidor de engine para DR todavía** → **coinage del token diferido**. Este doc cierra el drift de evidencia (el archivo faltante); la deuda afinada vive en `status.md §Mods`. No acuñar tokens finales hasta que haya capa de combate que consuma DR.
