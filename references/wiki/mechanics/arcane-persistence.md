# Arcane Persistence

> Estado: activo
> Rol: arcano warframe — remueve shields, cap de daño/s condicionado a Armor>700
> Fuente de verdad de: tabla de cap por rank, condiciones de activación/desactivación, comportamiento bajo Overguard
> No usar para: interacción exacta con múltiples hits/segundo bajo Overguard (sin confirmar en la wiki)
> Última actualización: 2026-07-09
> Fuente: https://wiki.warframe.com/w/Arcane_Persistence

## Qué es

Arcano warframe muy jugado actualmente (meta). Remueve todos los Shields del warframe; si el Armor
está por encima de 700, cappea el daño recibido por segundo.

**Cap de daño (Rank 5):** "Cannot be hit for more than 500 Damage/s."

## Escalado del cap por rank

| Rank | Cap Damage/s |
|---|---|
| 0 | 750 |
| 5 | 500 |

(la wiki no detalla los ranks intermedios explícitamente en la captura — verificar tabla completa
si se necesita precisión rank-por-rank).

## Condición de activación

**Requisito de Armor:** "If Armor is above 700" — pero la propia wiki aclara la ambigüedad de la
frase: "Despite the phrasing, the arcane will function with exactly 700 Armor" (el umbral es
`>= 700`, no estrictamente `> 700`).

**Costo:** "Remove all Shields" — desactiva el pool de shields por completo mientras el arcano está
equipado (no es un trigger condicional, es estructural).

## Efectos que desactivan la protección

1. **Magnetic Status** y **Ability Nullifying Effects** desactivan la protección por completo.
2. Corrosive/Heat reducen el Armor efectivo — notas específicas de la wiki: Corrosive necesita
   ≥946 Armor para inmunidad total al proc; Heat necesita ≥1400.

## Comportamiento bajo Overguard (limitación crítica)

"Works with Overguard from any source, but only caps the damage of the first hit every 1 second to
500" — esto reduce significativamente la efectividad defensiva del arcano cuando hay múltiples hits
en la misma ventana de 1s (solo el primero está capeado).

## Otras limitaciones documentadas

- **Quick Thinking / Gladiator Finesse:** limitan daño **por hit**, no por segundo — eje distinto
  al de Persistence (per-second).
- **No funciona en daño autoinfligido** (ej. Garuda's Bloodletting).
- **Hijack:** convierte el drenaje de shields (ya removidos) en drenaje de health.

## Ambigüedades para el simulador

- Comportamiento exacto con múltiples hits/segundo bajo Overguard requiere clarificación adicional
  (solo se sabe que cappea el primer hit de cada ventana de 1s).
- Interacción con otros modificadores de daño no está explícita en la wiki.

## Fuentes

- https://wiki.warframe.com/w/Arcane_Persistence
