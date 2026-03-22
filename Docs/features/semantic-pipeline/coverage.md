# Semantic Pipeline Coverage

> Estado: activo
> Rol: registrar la cobertura conocida de los markdown semanticos por warframe
> Fuente de verdad de: inventario operativo de cobertura del track semantic pipeline
> No usar para: contrato del schema o reglas del parser
> Depende de: `status.md`
> Ultima actualizacion: 2026-03-22

## Estado conocido heredado

Base heredada desde auditorias previas del track y pendiente de revalidacion.

Este inventario debe tratarse como:
- util para planificacion inicial
- no completamente verificado contra el estado real actual de `references/Semantic/`

## Formato nuevo listo para parser

| Warframe | Estado |
|---|---|
| Ash | completo |

## Formato antiguo o migracion parcial

Atlas, Banshee, Baruuk, Chroma, Ember, Equinox, Excalibur Umbra, Frost, Gara,
Garuda, Gauss, Harrow, Hildryn, Hydroid, Inaros, Ivara, Khora, Limbo, Loki,
Mag, Mesa, Oberon, Rhino, Vauban, Wisp, Zephyr

## Placeholders sin stats reales

Caliban, Citrine, Cyte-09, Dagath, Grendel, Gyre, Jade, Koumei, Kullervo, Lavos,
Mirage, Nekros, Nezha, Nidus, Nokko, Nova, Nyx, Octavia, Oraxia, Protea, Qorvex,
Revenant, Saryn, Sevagoth, Styanax, Temple, Titania, Trinity, Uriel, Valkyr, Volt,
Voruna, Wukong, Xaku, Yareli

## Advertencias

- el usuario indico que ya actualizo mas `.md` con `uniqueName` en `##`
- el estado de este inventario puede estar atrasado respecto del filesystem real
- no usar este archivo como verdad final sin re-auditar `references/Semantic/`

## Proximo paso operativo

Hacer una auditoria real del arbol `references/Semantic/` y reemplazar este inventario
heredado por uno verificado automaticamente o semiautomaticamente.
