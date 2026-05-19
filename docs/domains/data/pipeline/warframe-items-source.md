# Warframe Items Source Integration

> Estado: activo — **Verificado 2026-04-22**
> Rol: documentar la relación entre OmniFrame y el ecosistema `warframe-items`
> Fuente de verdad de: arquitectura del pipeline externo y deltas del fork
> Última actualización: 2026-04-22

OmniFrame utiliza un fork especializado de `warframe-items` para obtener, transformar y enriquecer el dataset base del juego antes de aplicarle los overrides manuales internos.

## 1. El Pipeline Externo (Build)

Ubicación del fork: repositorio hermano `warframe-items`.

### Flujo de transformación
```text
build/build.mjs
  -> scraper.mjs (Fetch de wikia y export del juego)
  -> sub-scrapers (Módulos Lua)
  -> parser.mjs (Merge, filtros y normalización base)
  -> data/json/*.json (Artefactos de salida)
```

### Componentes clave
- **Scraper**: Obtiene la información bruta.
- **Parser**: Aplica la primera capa de limpieza para reducir el ruido visual en los JSON.

---

## 2. Mejoras del Fork (Deltas Activos)

El fork de OmniFrame añade campos de alta inteligencia que no están en el export público estándar:

- **Warframes**: Enriquecimiento de metadata y campos adicionales de habilidades capturados de la wiki.
- **Mods**: Inyección de `upgradeTypes[]`, `isExilus`, `isWeaponAugment`, `modClass` e incompatibilidades de equipo.
- **Armas**: Estructuración de ataques y flags de behavior. Persistencia del campo `weaponClass` inyectado desde la Wiki (ver `parser.mjs:addWeaponWikiaData`).
- **Compañeros**: Normalización determinística de categorías para evitar solapamientos con armas modulares (Moas/Hounds).
- **Taxonomía**: Inyección de metadatos de "clase" (glaive, sword, sniper) persistidos desde la Wiki para habilitar el motor de filtrado de OmniFrame.

---

## 3. Límites e Implicaciones

Aunque el fork es la fuente primaria automatizada, **no cierra todos los gaps**:
- El export público a veces descarta estructuras de upgrades necesarias para la simulación.
- Cuando la fuente no expone un dato vital, OmniFrame utiliza el **Override Pattern** (ver `overrides.md`).
---

## 4. Registro de Modificaciones
Para un detalle histórico de los parches aplicados al fork y al pipeline de normalización, consultar:
- [Audit: Taxonomic Stabilization (2026-04-22)](./taxonomic-stabilization-audit.md)
Antes de diagnosticar un error de datos como "problema del engine", se debe verificar si el dato está presente en este pipeline o si requiere una corrección manual.
