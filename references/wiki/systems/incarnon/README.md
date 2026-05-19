# Wiki Incarnon

> Estado: activo
> Rol: indexar referencia raw y semantica de Incarnon e Incarnon Genesis
> Fuente de verdad de: ubicacion de capturas wiki y markdown derivado de Incarnon
> No usar para: schema final del proyecto o decisiones cerradas de engine
> Ultima actualizacion: 2026-03-22

## Objetivo

Este bloque existe para guardar:

- paginas raw descargadas desde la wiki

## Regla

- `raw/*.wikitext` es la fuente bruta descargada
- no asumir que el markdown derivado ya resuelve el modelo final del engine
- cuando `action=raw` no responde de forma util, el raw se extrae desde `action=edit`
  leyendo `textarea#wpTextbox1`

## Alcance actual

Incluye:

- armas Incarnon innatas de Zariman, Sanctum Anatomica e Isleweaver
- Incarnon Genesis de primary, secondary y melee

## Referencia

Ver:

- [raw/README.md](./raw/README.md)
