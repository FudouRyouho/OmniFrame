# Recoil

> Estado: activo
> Rol: mecánica de recoil — el pateo de cámara al disparar, sus fuentes de reducción y por qué no es lo mismo que accuracy
> Fuente de verdad de: definición (recoil ≠ accuracy), el umbral de −100% que lo anula y las combinaciones que lo alcanzan, la interacción con fire rate, los ajustes de accesibilidad
> No usar para: valores de recoil por arma (no expuestos, ni en la wiki) · el catálogo de armas de recoil alto (galería del raw)
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Recoil
> Fuente actualizada: 2026-06-20
> Raw: recoil.wikitext

## Definición

> *"Recoil is described as the physical kick of a weapon when firing, represented by the target
> reticle and screen moving up a certain distance and/or shaking slightly."*
>
> *"accuracy is about how far from the reticle the weapon shoots its projectile, while recoil is the
> amount that the reticle moves after the weapon is shot."*

Ver [`accuracy.md`](accuracy.md).

## No es puramente cosmético

> *"while gun Accuracy will not improve through modding for recoil reduction, the decreased recoil
> **can** make it easier to land shots onto enemies."*

Es decir: el recoil **no toca el stat de accuracy** —el arma sigue disparando donde el retículo
apunta— pero mueve el retículo, así que **sí afecta cuántos disparos aciertan**. Con la Dual Cestra,
*"even if a weapon's accuracy is good […] the recoil will cause shots to deviate largely from the
point of aim as the reticle shakes around."*

## Sin valor numérico

El recoil **no tiene stat numérico** en el arsenal ni en la API. La propia wiki no publica valores por
arma: sólo clasifica cualitativamente cuáles son *"harder to manage"* (Boar, Grakata, Supra, Trumna,
Snipetron, Cestra, Kraken, Lex, Marelok, Pandero, Pyrana, Seer, Sicarus, Zakti, Velocitus, y los grips
de kitgun Haymaker / Lovetap / Steadyslam / Tremor).

La única semántica disponible es **relativa** — porcentaje sobre el recoil nato del arma.

### Representación interna

> La wiki marca esta sección con **`{{Stub}}`** y **`{{Speculation}}`**.

Vive en `/Lotus/Types/Game/WeaponProperties/Recoil/Weapon/`, con detalles en el
`LotusWeaponProjectileFireBehavior`. Separa **`AIMED_CAMERA_RECOIL`** de **`HIP_CAMERA_RECOIL`**, y
define una curva (`CameraRecoilCurve`, `CameraRecoilStrength`) más atenuadores por carga y por
spin-up.

## El umbral de −100%

> *"Having at least **−100% recoil bonus will negate all recoil**."*

La wiki lista las combinaciones concretas que lo alcanzan:

| Clase | Combinación |
|---|---|
| Rifles primarios | Stabilizer / Primed Stabilizer **+** Vile Precision *o* Primary Deadhead |
| Escopetas primarias | Counterbalance / Primed Counterbalance **+** Primary Deadhead |
| Pistolas | Steady Hands / Primed Steady Hands **+** Secondary Deadhead |

> **Los mods de reducción no hacen nada en armas con poco o nada de recoil.**

## Fuentes de reducción

Mods: Stabilizer (Primed) · Counterbalance (Primed) · Steady Hands (Primed) · Vile Precision · Twitch
· Soft Hands · Reflex Draw · Gun Glide · Double-Barrel Drift · Strafing Slide.
Arcanos: Primary Deadhead · Secondary Deadhead. Además, la **Afentis** reduce recoil con su efecto al
ser arrojada al suelo.

Hay mods **exclusivos de Conclave** que también afectan el recoil: Loose Hatch, Loose Chamber, Loose
Magazine, Hydraulic Gauge, Hydraulic Chamber, Hydraulic Barrel, Lie In Wait.

## Fire rate — el otro eje

> *"Fire rate also increases recoil in some weapons, such as the Grakata, which require burst firing
> in order to counter heavy recoil without modding."*

De ahí una segunda vía de mitigación: **bajar la cadencia** con Critical Delay, Creeping Bullseye o
Vile Precision reduce el efecto del recoil **sin gastar un slot en un mod de recoil**.

El caso inverso también existe: la mayoría de los sniper rifles tienen recoil pesado, pero su cadencia
baja le da tiempo al retículo de volver a posición antes del siguiente disparo, lo que vuelve poco
importantes los mods de recoil en ellos. La Boar tiene recoil alto que **sólo se nota** al subirle la
cadencia. Y en Brakk o Bronco no vale la pena reducirlo: disparan un rocío de pellets donde la
precisión no es el problema.

## Ajustes de accesibilidad

Desde la versión 40.0.3, **Screen Shake y Weapon Recoil son toggles separados**, y el recoil tiene
tres modos propios:

| Modo | Efecto |
|---|---|
| **Camera** (default) | la cámara rebota con cada disparo |
| **Reticle** | un rombo en el retículo representa el recoil; movimiento de cámara reducido |
| **Reduced** | sin representación de recoil; movimiento de cámara reducido |

## Trivia

**Heavy Caliber y Magnum Force *añadían* recoil** en vez de reducir accuracy. El cambio se hizo pese a
tener menos sentido físico —una bala más potente patea más, no dispersa más— porque con la versión
vieja las armas sin recoil obtenían un aumento de daño **puro**, sin desventaja.

## Fuentes

- https://wiki.warframe.com/w/Recoil
- [`accuracy.md`](accuracy.md)
