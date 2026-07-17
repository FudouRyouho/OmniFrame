---
Estado: "referencia"
Rol: "Captura de conocimiento de Set Mods — bonus de conjunto ausente en @wfcd/items"
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

`@wfcd/items` (fork warframe-items) expone cada **mod miembro** de un set con su stat propio,
pero **no expone los valores del bonus de conjunto**. Modificar el fork no vale la pena: es más
rápido y reversible documentar acá + modelar vía estructura propia cuando exista consumidor.

## Tres hallazgos sobre la estructura del dato (2026-06-03)

- **Gap A — pertenencia al set:** derivable del `unique_name` (`/Lotus/Upgrades/Mods/Sets/<Set>/...`).
  19 sets, 72 mods miembro + 19 portadores. → `pipeline:debt`, bajo riesgo.
- **Portador del bonus existe pero vacío:** cada set tiene una entrada `<Codename>setmod` con
  `type: "Mod Set Mod"` (ej. `Gladiatorsetmod`) — **`description: ""`, `stats` sin tokens**. Es el
  slot natural del bonus, pero el dato no está. Discriminador limpio: `type === "Mod Set Mod"`
  (mejor que parsear el path).
- **Gap B — los valores del bonus:** ausentes. El bonus es un efecto del *set*, parametrizado por
  nº de piezas equipadas (stack) + condition propia. No cabe en `mod-stats.override.json`
  (shape per-mod). → `OQ-DATA-6`.

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

> Valores por nº de piezas equipadas. `[verify]` = revisar in-game antes de prototipar (la wiki es
> fuente secundaria; valores y condition pueden tener matices de versión).

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
