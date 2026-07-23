---
Estado: "referencia"
Rol: "Set Mods — el bonus de conjunto: dónde está el dato, qué falta modelar"
Impacto_ID: "REF-SetMods"
Fidelidad_Fisica: "Project/public/data/mods.json"
Fecha_de_creacion: "2026-06-03"
Fecha_de_actualizacion: "2026-06-03"
Fuente: "https://wiki.warframe.com/w/Set_Mods"
---

# Set Mods — Bonus de conjunto

> Capa de **captura** (procedencia/investigación), no hogar final. El bonus de conjunto está
> destinado a ser **estructura** consumida por el engine ([[feedback-schema-fidelidad-vs-engine]]);
> su modelado definitivo está gateado por consumidor real en `OQ-DATA-6`.

## Por qué este doc existe

Porque el bonus de conjunto no está en `public/data/mods.json` y hace falta para simular un loadout.
La tabla de valores de más abajo se capturó del wiki en 2026-06-03, cuando se creía que la fuente no
lo traía.

## 🚨 El dato SÍ está en la fuente — se pierde en nuestro pipeline

`warframe-items/data/json/Mods.json` trae, hoy y verificado:

- **`modSet`** — puntero al portador, en los **72 mods miembro**.
- **Los 19 portadores** `type: "Mod Set Mod"`, con `numUpgradesInSet` y el `stats[]` completo: un
  escalón por cantidad de piezas equipadas.

```
/Lotus/Upgrades/Mods/Sets/Vigilante/VigilanteSetMod · numUpgradesInSet: 6
  stats: ["5% chance to enhance Critical Hits from Primary Weapons.", … 6 escalones …]
```

`generate-data.ts` no lee ninguno de esos campos. Por eso los portadores llegan a nuestro dataset con
`description: ""` y sin `stats`, y ningún mod lleva su `modSet`. La lectura anterior —"el portador
existe pero está vacío"— describía **nuestra salida**, no la fuente.

Reencuadre de los dos gaps:

- **Gap A — pertenencia al set:** no hay que derivarla del `unique_name`; viene explícita en `modSet`.
  Sigue siendo `pipeline:debt`, ahora trivial: propagar el campo.
- **Gap B — los valores del bonus:** **no están ausentes**. Vienen como **texto libre**, así que hay
  que tokenizarlos (mismo problema que `levelStats`), y el bonus sigue sin caber en
  `mod-stats.override.json` (shape per-mod): es un efecto del *set*, parametrizado por piece-count +
  condition propia. Eso —el modelado, no la captura— es lo que sigue gateado en `OQ-DATA-6`.

Ver [`../../domains/source/gaps.md`](../../domains/source/gaps.md) §G-4.

El discriminador `type === "Mod Set Mod"` sigue siendo la clave natural para colgar el bonus, y es
más limpio que parsear el path.

## Puente codename interno ↔ nombre de set (wiki)

Algunos codenames no coinciden con el nombre display; resuelto vía nombres de mods miembro:

| Codename (`unique_name`) | Set (wiki) | Codename | Set (wiki) |
|---|---|---|---|
| Hawk | Aero | Ashen | Carnis |
| Boneblade | Jugulus | Femur | Saxum |
| Raptor | Motus | Spider | Proton |
| Sacrifice | Sacrificial | Umbra | Umbral |

(Los demás coinciden: Amar, Augur, Boreal, Gladiator, Hunter, Mecha, Nira, Strain, Synth, Tek, Vigilante.)

## Bonus de conjunto — tabla (wiki, 2026-06-03)

> **Fuente secundaria, ya no primaria.** Con el hallazgo de arriba, el `stats[]` del portador es el
> dato canónico. Esta tabla sirve como **contraste** (validar el tokenizado contra ella) y porque
> trae la lectura de *condition* que el texto plano no explicita.

| Set (codename) | Piezas | Bonus (texto) | Escala 1→max | Condition |
|---|---|---|---|---|
| Augur | 6 | % de energía gastada convertida a escudos | 40% → 240% (40%/pieza) | on_energy_spent |
| Gladiator | 6 | +crit melee por stack del Combo Counter | 10% → 60% por stack | with_combo_counter |
| Hunter | 6 | Compañeros +daño a targets con Slash status | 25% → 150% (25%/pieza) | target_slash_proc |
| Vigilante | 6 | % chance de mejorar tier de crítico (primarias) | 5% → 30% (5%/pieza) | on_critical_hit + primary |
| Mecha | 4 | Compañero marca target; matar marcado esparce status | 60s/3s/7.5m → 15s/12s/30m | requires_kubrow_o_predasite |
| Strain | 4 | Helminth Charger genera cysts que erupcionan en Maggots | 2 cysts/6s → 8 cysts/24s | requires_helminth_charger |
| Synth | 4 | Holstering recarga % de cargador por segundo | 5% → 20% /s | while_holstered |
| Tek | 4 | Compañero marca zona que daña enemigos dentro | 3m/60s/50dps → 12m/15s/200dps | — |
| Amar | 3 | Teleport a target dentro de X m al usar Heavy Attack | 10m → 30m | on_heavy_attack |
| Boreal | 3 | Reducción de daño % mientras airborne | 20% → 60% | while_airborne |
| Nira | 3 | +daño de Slam Attack % | 150% → 450% | on_slam_attack |
| Umbra | 3 | Potencia los mods Umbral equipados (Vit/Fiber/Intensify) | 2pc: +30/30/25% · 3pc: +80/80/75% | requires_umbral_mods |
| Hawk (Aero) | 3 | Daña enemigos en aim glide; los duerme al aterrizar | 3s → 9s sleep | while_aim_gliding + on_landing |
| Ashen (Carnis) | 3 | Heavy Attack kill → Evasion + inmunidad a status | 10%/2s → 30%/6s | on_heavy_attack_kill |
| Boneblade (Jugulus) | 3 | Slam genera tendrils (Puncture + stun) | 3m/25dmg/12s cd → 9m/75dmg/6s cd | on_slam_attack |
| Femur (Saxum) | 3 | Enemigos Lifted explotan al morir (% max HP Impact, radio) | 10%/4m → 30%/12m | on_lifted_enemy_death |
| Raptor (Motus) | 3 | % chance de inmunidad a Knockdown mientras airborne | 33% → 100% | while_airborne |
| Spider (Proton) | 3 | % Damage Reduction durante Wall Latch | 17% → 50% | while_wall_latch |
| Sacrifice (Sacrificial) | 2 | Aumenta el efecto de ambos mods 25% si los dos equipados | +25% con 2 piezas | requires_both_pieces |

## Observaciones de modelado (alimenta OQ-DATA-6)

- El bonus es un **efecto stacking por piece-count** → instancia directa de `OQ-DATA-4`
  (stacking) + condition. La columna *Escala* es literalmente un array indexado por nº de piezas.
- Casi todos tienen condition propia (`while_airborne`, `on_heavy_attack`, `with_combo_counter`,
  `requires_*`) → composición de condition + un eje nuevo `requires_<equipo>` (companion type,
  umbral mods, both pieces) que hoy no existe en el vocabulario.
- Varios bonus son **multi-efecto** (Mecha/Tek: cooldown + duración + rango; Carnis: evasion +
  inmunidad) → bajo la regla [[feedback-schema-one-label-one-stat]], split en stats separados.
- La noción "nº de piezas equipadas" requiere el loadout completo → cercano a `OQ-DATA-1`.
- El portador `type: "Mod Set Mod"` es la **clave natural** para colgar el bonus (override o
  entidad `sets`), sin tocar los mods miembro.
- El `stats[]` del portador es **texto libre** (`"5% chance to enhance Critical Hits from Primary
  Weapons."`): el escalado por piezas ya está resuelto —un elemento por escalón—, pero el valor y su
  token hay que extraerlos. Es el mismo parseo que ya se hace sobre `levelStats` de los mods, con la
  ventaja de que acá el eje es piece-count y no rank.
