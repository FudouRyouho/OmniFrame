# Incarnon Raw

> Estado: activo
> Rol: alojar el wikitext bruto de paginas Incarnon e Incarnon Genesis
> Fuente de verdad de: captura textual base por pagina
> No usar para: decisiones cerradas de engine o schema final
> Ultima actualizacion: 2026-03-22

## Regla

- cada archivo `*.wikitext` representa una pagina wiki
- el nombre del archivo usa slug normalizado
- el raw actual se extrae desde `action=edit` leyendo `textarea#wpTextbox1`
- los `*.md` del directorio padre son documentacion derivada a partir de este raw

## Uso

Este bloque sirve para:

- revisar la tabla completa de evoluciones
- detectar valores por variante
- comprobar notas o bugs antes de modelar datos
- volver a procesar el contenido en otro formato si cambia la estrategia
