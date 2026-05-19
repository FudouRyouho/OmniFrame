# Module:TextIcons/data — Documentación extraída

> Fuente: `https://wiki.warframe.com/w/Module:TextIcons/data?action=raw`
> Extraído: 2026-03-20
> Archivos raw: `text-icons.lua` (renderer), `text-icons-data.lua` (datos)

---

## Propósito

`Module:TextIcons` convierte tokens `<TOKEN>` en imágenes wiki.
Se usa en descripciones de habilidades, mods y tooltips para renderizar iconos inline.

El renderer (`text-icons.lua`) llama a `p.getIcon(text, options)` donde `options.platform`
puede ser `PC`, `PS4`, `XBONE`, `SWITCH`, `STEAM`. Si no se especifica, usa `AUTO` o `AGNOSTIC`.

**Para el builder:** los tokens relevantes son los de daño, polaridad, stats de habilidad y recursos.
El resto (gamepad, teclado, misiones) no aplica.

---

## Tokens de tipos de daño

Mapeados a los `InternalName` de `Module:DamageTypes/data`.

| Token | Archivo (outline) | Archivo (color) |
|---|---|---|
| `<DT_IMPACT>` | `Impact_d.png` | `ImpactSymbol.png` |
| `<DT_SLASH>` | `Slash_d.png` | `SlashSymbol.png` |
| `<DT_PUNCTURE>` | `Puncture_d.png` | `PunctureSymbol.png` |
| `<DT_FIRE>` | `Heat_d.png` | `HeatSymbol.png` |
| `<DT_FREEZE>` | `Cold_d.png` | `ColdSymbol.png` |
| `<DT_ELECTRICITY>` | `Electricity_d.png` | `ElectricitySymbol.png` |
| `<DT_POISON>` | `Poison_d.png` | `ToxinSymbol.png` |
| `<DT_EXPLOSION>` | `Blast_d.png` | `BlastSymbol.png` |
| `<DT_RADIATION>` | `Radiation_d.png` | `RadiationSymbol.png` |
| `<DT_GAS>` | `Gas_d.png` | `GasSymbol.png` |
| `<DT_MAGNETIC>` | `Magnetic_d.png` | `MagneticSymbol.png` |
| `<DT_VIRAL>` | `Viral_d.png` | `ViralSymbol.png` |
| `<DT_CORROSIVE>` | `Corrosive_d.png` | `CorrosiveSymbol.png` |
| `<DT_SENTIENT>` | `SentientFactionIcon.png` | — |
| `<DT_FINISHER>` | `Finisher_d.png` | — |

Variantes `_NO_ADV` (sin indicador de ventaja) disponibles para todos los tipos combinados.
Void/Tau no tienen token `DT_*` propio en este módulo.

---

## Tokens de polaridades

| Token | Polarity | Archivo |
|---|---|---|
| `<POLARITY_ATTACK>` | Madurai (V) | `PolarityTriangle.png` |
| `<POLARITY_DEFENSE>` | Vazarin (D) | `PolarityPoint.png` |
| `<POLARITY_TACTIC>` | Naramon (—) | `PolarityCircle.png` |
| `<POLARITY_POWER>` | Zenurik (=) | `PolarityMark.png` |
| `<POLARITY_PRECEPT>` | Penjaga | `PolarityPrecept.png` |
| `<POLARITY_FUSION>` | Aura | `PolarityAura.png` |
| `<POLARITY_WARD>` | Unairu | `PolarityWard.png` |
| `<POLARITY_UMBRA>` | Umbra | `PolarityUmbra.png` |
| `<POLARITY_ANY>` | Universal (Omni) | `PolarityUniversal.png` |

---

## Tokens de recursos / stats

| Token | Archivo | Uso |
|---|---|---|
| `<ENERGY>` | `IconEnergy.gif` | Costo de energía |
| `<HEALTH>` | `HealOrb.png` | Salud |
| `<SHIELD>` | `IconShield.png` | Escudo |
| `<STAT_POSITIVE>` | `PositiveSymbol.png` | Indicador de buff |
| `<STAT_NEGATIVE>` | `NegativeSymbol.png` | Indicador de debuff |
| `<STAT_RESIST>` | `ResistSymbol.png` | Indicador de resistencia |
| `<AMMO_MUTATION>` | `AmmoMutation_d.png` | Mutación de munición |

---

## Tokens de Focus (polaridades limpias)

| Token | Archivo |
|---|---|
| `<MADURAI_CLEAN>` | `IconFocusCleanMadurai.png` |
| `<NARAMON_CLEAN>` | `IconFocusCleanNaramon.png` |
| `<UNAIRU_CLEAN>` | `IconFocusCleanUnairu.png` |
| `<VAZARIN_CLEAN>` | `IconFocusCleanVazarin.png` |
| `<ZENURIK_CLEAN>` | `IconFocusCleanZenurik.png` |

---

## Relevancia para el builder

- Los tokens `<DT_*>` aparecen en descripciones de habilidades del módulo `Ability/data/stats`
- El mapeo `DT_FIRE` → Heat, `DT_FREEZE` → Cold, etc. conecta con `InternalName` de `DamageTypes/data`
- `<ENERGY>`, `<HEALTH>`, `<SHIELD>` aparecen en descripciones de costos y efectos
- `<POLARITY_*>` se usan en tooltips de mods — el builder ya tiene los SVG de polaridades en `src/assets/polarity/`
- Para renderizar descripciones en el builder, reemplazar `<TOKEN>` con el componente/imagen correspondiente
