# Semantic Reference Format

Fuente de verdad de texto plano para las habilidades de Warframe.
El objetivo es capturar exactamente lo que muestra el juego en la UI, sin interpretacion.

---

## Estructura de niveles

```
# NOMBRE — /Lotus/Powersuits/...  <- comentario de warframe, ignorado por el parser

## /Lotus/Powersuits/PowersuitAbilities/GlaiveAbility   <- clave del output (uniqueName)
// 1 - SHURIKEN                   <- comentario opcional para legibilidad humana
Label: valor
Label: valor

### Subgrupo                      <- grupo exclusivo (forma, elemento, mote) Title Case
Label: valor

#### NOMBRE AUGMENT               <- grupo no-exclusivo (augment) UPPER CASE
Label: valor

##! /Lotus/...                    <- skip: habilidad ya procesada en ability-stats.json
```

El output del parser es un objeto `{ [uniqueName]: { groups } }` directamente
compatible con `ability-stats.json`. Los `upgradeBy` se asignan manualmente
en `ability-stats.json` después de importar el output.

---

## Reglas de formato

### Headers
- Warframe: `# NOMBRE — /Lotus/...` — solo como referencia, el parser lo ignora
- Habilidad: `## /Lotus/Powersuits/PowersuitAbilities/NombreAbility` — uniqueName completo
- Habilidad procesada: `##! /Lotus/...` — el parser la omite completamente
- Subgrupo (forma/elemento/mote): `### Nombre` — Title Case
- Augment: `#### NOMBRE` — UPPER CASE

### Labels de stats
- Title Case exacto como lo muestra el juego: `Drain`, `Damage / Second`, `Energy / Mark`
- Separador de partes del label: ` / ` (con espacios)
- Separador label/valor: `: `

### Valores numericos
- Miles: `.` como separador (1.500, 8.000, 10.000)
- Decimales: `,` como separador (1,5s, 0,5x, 67,5)
- Rango min-max: `400 - 800` (con espacios alrededor del guion)
- Unidades pegadas al numero: `10m`, `12s`, `50%`, `1,25x`

### Comentarios (el parser los ignora)
- Linea que empieza con `//`
- Ejemplo: `// Solo puede equiparse un aumento a la vez`

---

## Casos especiales

### Habilidades con subgrupos exclusivos (Chroma, Equinox)
Los subgrupos van en `###`. Son mutuamente excluyentes entre si.
El augment va siempre en `####`, despues de todos los subgrupos.

```
## 2 - ELEMENTAL WARD
Drain: 50
Duration: 23s
### Heat
Health: 55%
### Cold
Armor: 145%
#### EVERLASTING WARD
Duration: 100%
```

### Habilidades con dos augments (Chroma Vex Armor)
Cada augment en su propio `####`. Son mutuamente excluyentes entre si.
Documentar con `//` si aplica.

```
#### VEXING RETALIATION
// Solo puede equiparse un aumento a la vez
Explosion Damage: 100
#### GUARDIAN ARMOR
// Solo puede equiparse un aumento a la vez
Damage Reduction: 75%
```

### Stats con rango min-max (Ember)
Dos valores bajo el mismo label, separados con ` - `.
Ambos escalan con el mismo upgradeBy.

```
Damage Reduction: 40 - 85%
Drain: 75 - 25
```

### Stats con valor base y modificado por augment
No anotar el valor del augment en el grupo base.
El valor del augment va en el grupo `####` como stat propio.

---

## Lo que NO va en estos archivos
- Descripciones de habilidades (las provee el JSON generado)
- upgradeBy / upgradeType (se resuelven en el parser o manualmente en el JSON)
- Valores de rangos intermedios (solo rango maximo)
- Stats de armas exaltadas (crit, status — pertenecen al arma, no a la habilidad)

## Labels con icono de tipo de daño
Cuando el juego muestra un icono de elemento antes del valor, se incluye el tag en el label.
El icono va pegado al placeholder del valor, reflejando la posicion exacta en la UI.

```
Damage: <DT_COLD_COLOR> |val1|
Extra Damage: <DT_COLD_COLOR> |val1|%
```

Cuando hay multiples tipos de daño en el mismo valor, se listan en secuencia:

```
Damage: <DT_SLASH_COLOR> <DT_IMPACT_COLOR> <DT_PUNCTURE_COLOR> |val1|
```

Tags disponibles (mismos que usa FormattedText.tsx):
`<DT_COLD_COLOR>`, `<DT_HEAT_COLOR>`, `<DT_ELECTRICITY_COLOR>`, `<DT_TOXIN_COLOR>`,
`<DT_BLAST_COLOR>`, `<DT_RADIATION_COLOR>`, `<DT_SLASH_COLOR>`, `<DT_IMPACT_COLOR>`,
`<DT_PUNCTURE_COLOR>`, `<DT_VIRAL_COLOR>`, `<DT_CORROSIVE_COLOR>`, `<DT_GAS_COLOR>`,
`<DT_MAGNETIC_COLOR>`, `<DT_VOID_COLOR>`


Actualizacion

- Se deja de añadir 'passive' como campo, ya que esta la provee la api practicamente de la misma manera, se 'revisara' en mas adelante junto a las descripciones de las habilidades.

- Uso de la siguiente semantica:
# LABEL
## ABILITY
### HEADER
#### AUGMENT

// <> aun no soportados por el formateo, pero son canonicos y utilizados en la UI de warframe `wiki.warframe.com/w/Text_Icons`

<DT_IMPACT>
<DT_PUNCTURE>
<DT_SLASH>
<DT_HEAT>
<DT_COLD>
<DT_ELECTRICITY>
<DT_TOXIN>
<DT_BLAST>
<DT_RADIATION>
<DT_GAS>
<DT_MAGNETIC>
<DT_VIRAL>
<DT_CORROSIVE>
<DT_VOID>
<DT_TAU>
<DT_TRUE>

<ENERGY> // No siempre representa el consumo de energia o regeneracion
<HEALTH> // No siempre representa el consumo de vida
<SHIELD> // No siempre representa el consumo de escudo (caso hildryn) o la recuperacion del mismo
