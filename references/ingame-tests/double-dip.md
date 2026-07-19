# Double-dip de facción/buff en DoTs — data cruda (PROVISIONAL)

> Rol: mediciones in-game del double-dip del **bucket ②** (mods de facción + buffs de habilidad) en el tick de DoT.
> Fuente de verdad de: el exponente del pool ② en el DoT (empírico) — `DoT ÷ base` esperado al cuadrado.
> Última actualización: 2026-07-18 (movido desde `.working/`; medición original previa).
> El análisis vive en `docs/domains/engine/design/damage-status-model.md §Evidencia` — este archivo es **solo datos**.
>
> ⚠️ **PROVISIONAL — base medida, NO reproducible in-engine todavía.** A diferencia de `dot-scaling.md`
> (fixture Tiberon, reproduce al decimal), esto **no tiene fixture**: el loadout no está capturado con detalle
> suficiente (mods exactos por build) y **2 hits son anómalos** (filas 11 y 14). Pendiente **RE-MEDICIÓN con
> loadout completo** antes de tratarlo como ground-truth cerrado. El patrón del DoT (double-dip al cuadrado) es
> consistente en las 16 filas; lo que falta es reproducibilidad, no señal.

## Condiciones fijas (todas las tiradas)

| Parámetro | Valor |
|---|---|
| Arma | Akvasto Prime |
| Hit | **no-crit**, disparo al **cuerpo** (no headshot) |
| Roar | +112.8% → ×2.128 |
| Expel (rank 5) | +30% → ×1.30 |
| Roar + Expel | **aditivos** → ×(1+0.30+1.128) = ×2.428 |
| Nivel del target | 215, **camino normal** (sin Steel Path) |

**Builds por tanda** (cambia el arma entre tandas):
- **Tanda Slash:** Slash 169.4.
- **Tanda Toxin/Heat:** mods 60/60 → elemento **66**, Slash 77, Impact 16.5, Puncture 16.5 (total 176).

**Multiplicadores de referencia** (para chequear): en el **hit** el bucket se aplica ×1; en el **DoT tick**
se aplica **al cuadrado** (double-dip). `DoT ÷ base` esperado: none=1.00 · Expel=1.69 · Roar=4.53 · ambos=5.90.

## Resultados

| # | Elemento | Target | Facción | Elem vs target | Buff | Hit directo | DoT tick | DoT ÷ base |
|---|---|---|---|---|---|---|---|---|
| 1 | Slash | Arid Butcher | Grineer  | neutral    | ninguno       | 160 | 39  | 1.00 |
| 2 | Slash | Arid Butcher | Grineer  | neutral    | Expel         | 208 | 66  | 1.69 |
| 3 | Slash | Arid Butcher | Grineer  | neutral    | Roar          | 340 | 175 | 4.49 |
| 4 | Slash | Arid Butcher | Grineer  | neutral    | Expel + Roar  | 388 | 228 | 5.85 |
| 5 | Slash | Charger      | Infested | vuln ×1.5  | ninguno       | 287 | 39  | 1.00 |
| 6 | Slash | Charger      | Infested | vuln ×1.5  | Expel         | 373 | 66  | 1.69 |
| 7 | Slash | Charger      | Infested | vuln ×1.5  | Roar          | 611 | 175 | 4.49 |
| 8 | Slash | Charger      | Infested | vuln ×1.5  | Expel + Roar  | 697 | 228 | 5.85 |
| 9 | Toxin | Charger      | Infested | neutral    | ninguno       | 213 | 89  | 1.00 |
| 10| Toxin | Charger      | Infested | neutral    | Expel         | 277 | 150 | 1.69 |
| 11| Toxin | Charger      | Infested | neutral    | Roar          | 254 ⚠️ | 400 | 4.49 |
| 12| Toxin | Charger      | Infested | neutral    | Expel + Roar  | 517 | 521 | 5.85 |
| 13| Heat  | Charger      | Infested | vuln ×1.5  | ninguno       | 246 | 133 | 1.00 |
| 14| Heat  | Charger      | Infested | vuln ×1.5  | Expel         | 520 ⚠️ | 225 | 1.69 |
| 15| Heat  | Charger      | Infested | vuln ×1.5  | Roar          | 523 | 600 | 4.51 |
| 16| Heat  | Charger      | Infested | vuln ×1.5  | Expel + Roar  | 597 | 781 | 5.87 |

⚠️ **Hits a re-verificar** (no encajan con el patrón; el DoT de esas filas SÍ es correcto):
- Fila 11 (Toxin+Roar): hit **254**, esperado ~**453** (213 × 2.128).
- Fila 14 (Heat+Expel): hit **520**, esperado ~**320** (246 × 1.30); 520 parece un valor de Roar.

## Notas de lectura (para el Excel)

- **Hit directo = total combinado** (todos los elementos). La matriz se aplica **por elemento**: p. ej. Slash
  77 × 1.5 lo reciben ambos builds vs Charger (Slash-vuln); el elemento (66) solo se amplifica si el target es
  vulnerable a ÉL (Heat sí ×1.5, Toxin no).
- **DoT tick = solo el elemento** → ahí la vulnerabilidad se ve limpia (Heat DoT = Toxin DoT × 1.5).
- **Double-dip = el bucket ②** (Expel + Roar, aditivos) elevado al cuadrado en el DoT. La **matriz del target
  single-dipea** (×1.5 una vez). True (Slash bleed) bypasea la matriz → sus DoT no cambian con la facción.

## Pendiente (misma sombrilla, para completar)

- **Re-medición con loadout completo** (mods exactos por build) para volverlo reproducible in-engine + re-verificar filas 11/14.
- DoTs no-True que faltan: **Gas**, **Electricity** (se asume mismo patrón por inducción de Slash/Toxin/Heat; confirmar si querés).
- Eje matriz ③ con **resistente** (×0.5), no solo vulnerable/neutral.
- Repetir con crit (para separar el crit del bucket).
