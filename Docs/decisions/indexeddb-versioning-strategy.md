# Decisión: Estrategia de Versionado en IndexedDB

> Estado: activo
> Rol: documentar decisión de estrategia de persistencia con IndexedDB
> Fuente de verdad de: manejo de cache y versionado en datos
> No usar para: implementación técnica detallada
> Depende de: 
> Ultima actualizacion: 2026-03-25

## Decisión

Se utiliza IndexedDB con Dexie para versionado de cache, con fallback a JSON. La estrategia incluye checkDBVersion y fetchWithCache para persistencia de datos.

## Razones

- **Persistencia**: Mejora rendimiento al cachear datos localmente.
- **Versionado**: Permite actualizaciones controladas de esquema sin perder datos.
- **Fallback**: Garantiza funcionalidad si IndexedDB falla.

## Alternativas Consideradas

- Solo localStorage: Rechazada por límites de tamaño.
- Sin cache: Rechazada por impacto en UX.

## Consecuencias

- Dependencia de Dexie para manejo de versiones.
- Necesidad de migraciones en futuras actualizaciones.
- Documentar en [implementaciones-temporales.md](implementaciones-temporales.md) si cambia.

## Referencias

- [Docs/overview/current-state.md](../overview/current-state.md)
- [Docs/domains/integration/](../domains/integration/)