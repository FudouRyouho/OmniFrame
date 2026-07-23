---
Estado: "referencia"
Rol: "El Public Export de DE — cómo se accede, qué expone y qué no"
Impacto_ID: "D-Source-Public-Export"
Fidelidad_Fisica: "omniframe-items/build/raw-build.ts"
Fecha_de_creacion: "2026-07-23"
Fecha_de_actualizacion: "2026-07-23"
---

# Public Export — la fuente de datos de DE

Endpoint público de Digital Extremes que alimenta la app Companion, la extensión de Twitch y el
juego. Es la **capa-1 real** de todo el pipeline: `warframe-items` lo consume, `omniframe-items`
también (vía su `scraper`), y de ahí sale todo `public/data`.

Captura wikitext completa de la página oficial:
[`../../../references/wiki/modules/raw/public-export.wikitext`](../../../references/wiki/modules/raw/public-export.wikitext).

## Cómo se accede

Dos servidores, en dos pasos:

1. **Índice** (origin, HTTPS): `https://origin.warframe.com/PublicExport/index_<lang>.txt.lzma` —
   comprimido con LZMA, de ahí la dependencia `lzma` del build.
2. **Contenido** (CDN): `http://content.warframe.com/PublicExport/Manifest/<asset>`

El índice lista los archivos **con hash embebido**
(`ExportWeapons_en.json!00_HghAEHejKwa2JJrj9gZW3g`). Ese hash cambia cada vez que DE actualiza el
manifest — es el mecanismo de versionado nativo de la fuente, lo que alimenta
`data/cache/.export.json` del build, y el insumo natural de un pin de versión si algún día hace
falta. Un asset hasheado se puede cachear para siempre: si el contenido cambia, cambia el nombre.

15 idiomas disponibles; el build baja **todos** aunque el proyecto sólo consuma `en`.

## Qué expone — 15 archivos, nada más

```
ExportCustoms · ExportDrones · ExportFlavour · ExportFusionBundles · ExportGear
ExportKeys · ExportRecipes · ExportRegions · ExportRelicArcane · ExportResources
ExportSentinels · ExportSortieRewards · ExportUpgrades · ExportWarframes · ExportWeapons
```

Más `ExportManifest.json` (manifest de imágenes, sin idioma). Nombres como `ExportAbilities`,
`ExportRailjack`, `ExportModSet` u `ExportOther` aparecen en la documentación pero **no son
archivos**: son secciones dentro de los anteriores.

**Verificado sin intermediarios.** El índice se bajó y descomprimió directo del origin, sin pasar por
`warframe-items` (cuyo `fetchEndpoints` no filtra: devuelve el índice entero menos `ExportManifest`).
Resultado: **16 entradas exactas, nada oculto**. No hay endpoints sin documentar que la comunidad
esté ignorando.

## 🚨 Lo que no expone: enemigos

**No existe `ExportEnemies`**, ni indexado ni por ruta directa (`ExportEnemies_en.json`,
`ExportEnemy_en.json`, `ExportAI_en.json`, `ExportAvatars_en.json` → todos **404**).

La consecuencia —que el `Enemy.json` de upstream sea un fósil de 2019 y que el wiki sea la única
fuente viva de enemigos— está desarrollada en [`gaps.md`](gaps.md) **§G-2**.

El único dato de enemigos que sobrevive fresco en el export es `ExportRegions` (nivel y facción por
nodo del Star Chart): [`gaps.md`](gaps.md) **§G-3**.

**Taxonomía de facciones oficial de DE**, por índice, del propio export:
`0 = Grineer · 1 = Corpus · 2 = Infested · 3 = Corrupted · 7 = The Murmur · 8 = Scaldra · 9 = Techrot`
— los índices 4-6 no están documentados. Es la única taxonomía de facción que viene **de DE y no del
wiki**; contrastar con [`../../semantic/factions.md`](../../semantic/factions.md) antes de tratarla
como canónica (usa "Corrupted" donde el proyecto usa "Orokin").

## Qué sale mal al parsearlo

El export en sí es coherente; lo que se pierde o se tuerce ocurre en el parser de `warframe-items`.
Catálogo completo en [`gaps.md`](gaps.md): **G-1** (daño físico invertido), **G-3** (campos
publicados que el ecosistema descarta), **G-4/G-5** (falsos positivos ya descartados).

## Caveat de la fuente

La propia página lo advierte: el contenido *"does not necessarily represent the current and future
state of the game. Content is subjected for removal as the game updates"*. El Public Export es un
volcado de datos internos, no un contrato — que un endpoint desaparezca (como pasó con los enemigos)
es un modo de falla previsto, no una anomalía.
