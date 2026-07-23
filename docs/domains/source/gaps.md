---
Estado: "activo"
Rol: "Catálogo de gaps y bugs de las fuentes ajenas — síntoma, alcance, reproducción, impacto local y mitigación"
Impacto_ID: "D-Source-Gaps"
Fidelidad_Fisica: "omniframe-items/build/"
Fecha_de_creacion: "2026-07-23"
Fecha_de_actualizacion: "2026-07-23"
---

# Gaps y bugs de la fuente

Cada entrada responde cinco preguntas: **qué falla · sobre cuánto · cómo se comprueba hoy · qué rompe
acá · qué lo tapa.**

**Por qué reproducción y no versión:** `warframe-items` publica `0.0.0-dev` — no hay número que
citar. Y aunque lo hubiera, un hash ajeno diría *cuándo lo vimos*, no *si sigue vivo*. El comando de
reproducción sí. (Coincide con la regla 4 de [`../../CLAUDE.md`](../../CLAUDE.md): nada de hashes en
docs vivos.)

---

## G-1 · `puncture` ↔ `slash` invertidos en `item.damage`

**Síntoma.** El orden canónico de `damagePerShot` en el export es **Impact, Puncture, Slash**
(documentado por DE). El parser de `warframe-items` mapea la posición `[1]` a slash y la `[2]` a
puncture, invirtiendo los dos.

**Alcance.** 486 de 595 armas invertidas, **cero correctas**. Las 109 restantes no son distinguibles
(puncture = slash, o ambos en 0). Sólo esas dos posiciones fallan: los otros 18 tipos de daño mapean
bien, medido sobre 567 armas.

**Evidencia interna.** El `attacks[0]` del **mismo ítem** —que viene del wiki, no del export— trae
los valores bien, así que el raw se contradice a sí mismo ítem por ítem:

```
Braton Prime · damagePerShot (DE):  [1.75, 12.25, 21]  → impact, puncture, slash
              item.damage  (WFCD):  impact 1.75, puncture 21, slash 12.25   ← invertido
```

**Reproducir.** Comparar `it.damage.puncture` contra `it.damagePerShot[1]` sobre
`warframe-items/data/json/{Primary,Secondary,Melee}.json`. Si da cero invertidas, upstream lo arregló.

**Impacto acá: 1 arma.** `ItemRepository` lee `stats.attacks[]` (wiki, correctos) y sólo cae a
`stats.damage` cuando el arma no tiene ataques: de las 109 sin `attacks`, **una sola** tiene
puncture/slash > 0 — Dark Split-Sword, la regresión ya aceptada de la migración.

**Estado: vigente, y se replica en nuestro raw** — el build propio *importa* `parser.parse()` en vez
de copiarlo, así que hereda el bug tal cual. **Mitigación: ninguna hoy.** Corregirlo en el raw propio
es trabajo de la fase 3 de `OQ-DATA-16`.

> ⚠️ **Mina.** Cualquier movimiento que reduzca la dependencia del wiki para `attacks` haría que
> **todas** las armas tomen el daño físico mal repartido, no una. El bug está latente detrás de un
> fallback que hoy casi nunca se toma.

---

## G-2 · `Enemy.json` es un fósil de 2019

**Síntoma.** DE **no expone enemigos**. `ExportEnemies` no existe: cero menciones en la documentación
oficial, y 404 en las rutas directas del content server. El `case 'Enemies'` del parser de upstream
es **código muerto** — nunca le llega ese chunk.

**Fechado por dos vías independientes.** El último commit que tocó `data/json/Enemy.json` en WFCD es
de **2019-12-04** (API de GitHub). Y el contenido corta ahí solo: 54 enemigos de Plains of Eidolon
(2017), 52 de Orb Vallis (2018), y **cero** de Deimos (2020), Narmer (2021), Zariman (2022), Duviri
(2023) o 1999 (2024).

**Consecuencias — esto reencuadra el eje enemigo entero:**

- Las divergencias wiki↔export (health 22%, armor 16%, shields 38%) **no son un conflicto entre
  pares**. Son seis años de reworks que el fósil nunca vio. El wiki es la fuente viva, sin empate.
- El `fill-if-missing` que hacía ganar al export **estaba al revés**.
- Las facciones "modernas ausentes" (Narmer, Murmur, Techrot, Scaldra) son **posteriores a 2019** —
  no un gap misterioso de la cosecha.
- El `type` contaminado que motivó `OQ-DATA-15` es el output del parser **de 2019**, congelado. No es
  un bug vigente que alguien pueda arreglar aguas arriba.

**Estado: vigente y sin arreglo posible upstream.** **Mitigación:** el build propio hace passthrough
del fósil con warrant escrito, y la fuente real de enemigos pasa a ser la cosecha de
`Module:Enemies/data` del wiki. Contrato de salida en
[`../../data/schemas/enemy/schema.md`](../../data/schemas/enemy/schema.md).

---

## G-3 · Lo que falta no falta en la fuente: lo descarta nuestro pipeline

**Está acá para cortar una búsqueda equivocada.** Varios datos que el proyecto da por ausentes llegan
enteros a `warframe-items/data/json/*` y se pierden después, en `generate-data.ts`. Censado sobre
`All.json` (16.889 ítems) y `Node.json`:

| Campo | Llega de upstream | Para qué serviría |
|---|---|---|
| `modSet` · `numUpgradesInSet` + `stats[]` | 72 mods · 19 portadores | el bonus de set completo (ver §G-4) |
| `baseDrain` · `fusionLimit` | 1.784 mods de 1.803 | drain base y rango máximo del mod |
| `excludeFromCodex` | 2.890 ítems | DE diciendo qué no es contenido real — mejor filtro de entidades que el `ExcludedFromSimulacrum` del wiki |
| `minEnemyLevel`/`maxEnemyLevel` · `factionIndex` | los 269 nodos, sin huecos | anclar el nivel de simulación a misiones reales en vez de un número arbitrario; **único dato de enemigos fresco que sobrevive a §G-2** |
| `probability`/`tier` de sorties · `binCapacity`/`fillRate` de extractores | 17 · 6 | mecánicas menores, sin consumidor |

Ninguno llega a `public/data`: verificado, cero mods nuestros llevan `base_drain` o `modSet`.

**Estado: no es gap de fuente.** Es deuda de pipeline, y su hogar es
[`../../data/status.md`](../../data/status.md). **Mitigación:** propagar el campo — el trabajo es
nuestro y es barato.

**Lo único que upstream sí tira:** `secretIngredients` de las recetas (0 ítems lo conservan). Sin
consumidor ni interés hoy.

---

## G-4 · Falso positivo: el bonus de set no es un gap de fuente

Se registra porque **una deuda del proyecto lo daba por gap de la fuente durante meses**.

`Mods.json` de upstream trae, hoy y verificado: `modSet` (puntero al portador) en **72 mods**, y los
**19 portadores** `type: "Mod Set Mod"` con `numUpgradesInSet` y el `stats[]` completo — un escalón
de texto por cantidad de piezas equipadas.

```
/Lotus/Upgrades/Mods/Sets/Vigilante/VigilanteSetMod · numUpgradesInSet: 6
  stats: ["5% chance to enhance Critical Hits from Primary Weapons.", … 6 escalones …]
```

**Dónde se pierde: en nuestro pipeline.** `generate-data.ts` no lee ninguno de esos campos, así que
los 20 portadores llegan a `public/data/mods.json` con `description: ""` y sin `stats`, y ningún mod
lleva su `modSet`. La lectura vieja —"el portador existe pero está vacío"— describía **nuestra
salida**, no la fuente.

Lo que queda es trabajo real, pero de otro tipo: los valores vienen como **texto libre**, hay que
tokenizarlos, y el bonus sigue sin caber en un override per-mod. Eso es modelado nuestro
(`OQ-DATA-6`), no ausencia de dato.

**Estado: no es un gap de fuente.** Reclasificado a deuda de pipeline — ver
[`../../data/references/set-mods.md`](../../data/references/set-mods.md).

---

## G-5 · Falso positivo: el wiki no está desactualizado en armas

Se registra para **no re-investigarlo**.

Cruzando `attacks[0]` (wiki) contra el export (DE) sobre 343 armas y **normalizando unidades** —el
wiki usa porcentaje, el export fracción— divergen 9 en crit, 7 en crit-mult y 18 en status. Todas son
**armas de modo dual** (Fulmin, Epitaph, Cedo, Synoid Simulor, Sporothrix).

No es desactualización: `attacks[0]` es *un modo de disparo*, mientras el export da el stat plano del
arma. En armas de modo único coinciden 334 de 343.

**Estado: no es un gap.** Cerrado.

---

## Método sin agotar

El censo que destapó G-1 comparó campos de daño derivados contra el export crudo. **Nunca se aplicó a
los campos no-daño que el parser deriva** — `polarities`, `tags`, `masteryReq`, `productCategory`.
Es el mismo método sobre otro eje, y no hay razón para suponer que G-1 sea el único de su clase.
