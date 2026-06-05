# Semantic — Vocabulario canónico del proyecto

Taxonomías y vocabulario consumidos por todos los dominios funcionales.
Esta es la **frontera de interpretación**: una vez fijado un token aquí, todos los dominios lo respetan.

## Documentos

| Archivo | Rol |
|---|---|
| [`damage-types.md`](damage-types.md) | Taxonomía canónica de tipos de daño |
| [`factions.md`](factions.md) | Vocabulario de facciones |
| [`polarity.md`](polarity.md) | Polaridades de mods y warframes |
| [`conditions.md`](conditions.md) | Diccionario consolidado de condition tokens (endógeno, D-19) |
| [`condition-nature.md`](condition-nature.md) | Taxonomía facetada de la naturaleza de condition (categorías + reglas de composición) — análisis, contraste con OQ-SEM-2 |
| [`upgrade-tokens.md`](upgrade-tokens.md) | Taxonomía D-6 de UpgradeType tokens — convención y vocabulario completo |

## Principio

`semantic/` NO es un dominio funcional. Define el lenguaje técnico compartido entre el motor,
los datos y la integración. No introduce comportamiento.
