# Warframe Mod Frame Asset Ripping — Research Notes

> **Estado**: Investigación en pausa. Solución temporal = recorte manual del juego.  
> **Objetivo futuro**: Generar los PNG de mod frames de Arconte (KahlMod) directamente desde los assets del juego.

---

## Herramientas

| Herramienta | Descripción | Link |
|-------------|-------------|------|
| **Warframe-Exporter (GUI)** | App Windows para exportar assets del cache | [GitHub - Puxtril/Warframe-Exporter](https://github.com/Puxtril/Warframe-Exporter) |
| **Warframe-Exporter-CLI** | Versión CLI del mismo tool, más granular | Mismo repo, release separado |
| **LotusLib** | Librería C++ que lee los `.toc`/`.cache` de Warframe | [GitHub - Puxtril/LotusLib](https://github.com/Puxtril/LotusLib) |
| **ImHex** | Hex editor con soporte para `.hexpat` patterns del exporter | [GitHub - WerWolv/ImHex](https://github.com/WerWolv/ImHex) |
| **b3d.wf** | Knowledge base comunitaria para ripping de modelos | [b3d.wf](https://b3d.wf) |
| **Discord b3d.wf** | Comunidad principal de model ripping de Warframe | [discord.gg/Jk3xA2T](https://discord.gg/Jk3xA2T) |
| **MEGA Archive** | Assets ya exportados por la comunidad | [mega.nz/folder/fIUQDQYZ](https://mega.nz/folder/fIUQDQYZ#vRNqurxNdzELIboK214Kxg) |

---

## Dependencia crítica: oo2core_9_win64.dll (Oodle)

El CLI necesita esta DLL en la misma carpeta que el `.exe`. Sin ella, el CLI ejecuta sin errores pero produce **output vacío silenciosamente**.

- **No viene incluida con Warframe** (a diferencia de lo que dice la documentación genérica)
- **Fuentes válidas**:
  - Cualquier juego AAA moderno instalado (Destiny 2, Hogwarts Legacy, Cyberpunk 2077, etc.)
  - Unreal Engine: `UE_5.x\Engine\Source\Runtime\OodleDataCompression\Sdks\2.9.x\lib\Win64\`
- **No descargar de sitios de DLLs** — vector de malware

La GUI (`Warframe-Exporter.exe`) parece cargarla de otra forma o desde un path diferente, por eso funciona aunque el CLI no.

---

## Estructura del Cache de Warframe

Los assets están en `.toc` + `.cache` en:
```
C:\SteamLibrary\steamapps\common\Warframe\Cache.Windows\
```

El exporter los organiza bajo el árbol interno `/Lotus/...`.

### Paths relevantes para Mod UI

| Path | Contenido |
|------|-----------|
| `/Lotus/Interface/Graphics/Mods/` | Texturas de los mod frames (UI) |
| `/Lotus/Interface/Icons/Mods/` | Iconos individuales de cada mod |
| `/Lotus/Upgrades/` | Definiciones de datos de mods |

---

## Cómo están construidos los Mod Frames

Los mod cards en Warframe son **composición de capas 2D**, NO modelos 3D complejos.  
El engine renderiza quads (planos) con materiales PBR aplicados encima.

### Capas de un mod card (de fondo a frente)

```
1. Background      → ej. GoldBackground.png
2. FrameBottom     → parte inferior del marco
3. FrameTop        → parte superior del marco
4. Mod Icon        → /Lotus/Interface/Icons/Mods/<nombre>
5. SideLight       → overlay de luz lateral
6. LowerTab        → tab inferior con rareza
7. Polarity Symbol → símbolo de polaridad
8. Text (dinámico) → nombre, rank, drain — generado en runtime
```

### Sufijos de texturas PBR

| Sufijo | Significado | Utilidad en 2D |
|--------|-------------|----------------|
| `_d`   | Diffuse / Albedo (color base) | ✅ El que se usa directamente como PNG |
| `_n`   | Normal map (iluminación de superficie) | ❌ No útil en web 2D |
| `_e`   | Emissive (glow/brillo) | ⚠️ Útil como overlay de glow |
| `_s`   | Specular / Roughness | ❌ No útil en web 2D |
| `Mask` | Alpha mask (define la forma/silueta) | ✅ Define el canal alpha del frame |

---

## Estado por tipo de Mod Frame

| Frame Type | Diffuse `_d` | Normal `_n` | Mask | Material | Estado |
|------------|:---:|:---:|:---:|:---:|--------|
| Bronze/Silver/Gold/Legendary | ✅ | ✅ | - | - | Exportable directamente |
| Galvanized / Omega / Amalgam | ✅ | ✅ | - | - | Exportable directamente |
| **KahlMod (Arconte)** | ❌ | ✅ | ✅ | ❌ | **Sin diffuse ni material** |
| Grimoire | ❌ | ✅ | ✅ | ❌ | Mismo problema |
| Avionic (Railjack) | ❌ | ✅ | ✅ | ❌ | Mismo problema |
| Immortal | ❌ | ✅ | - | ❌ | Tiene `GlassHoverGlow.png` |
| Antique | ✅ | ✅ | - | - | Exportable directamente |
| Foil | ✅ | - | - | - | Exportable directamente |

### Conclusión del patrón

Los frames "simples" (bronce a legendary) tienen el color **bakeado en la textura diffuse** → exportables como PNG de colores.

Los frames "complejos metálicos" (Kahl, Grimoire, Avionic) **no tienen diffuse** → el color es un **parámetro del Material** (solid color o gradient definido en el material JSON), y la forma viene de la `Mask`.

---

## El Problema con KahlMod (Arconte) específicamente

Búsqueda en el exporter con el filtro "KahlMod" devuelve **exactamente 4 archivos**:
```
/Lotus/Interface/Graphics/Mods/KahlModFrameBottom_n.png
/Lotus/Interface/Graphics/Mods/KahlModFrameBottomMask.png
/Lotus/Interface/Graphics/Mods/KahlModFrameTop_n.png
/Lotus/Interface/Graphics/Mods/KahlModFrameTopMask.png
```

- No existe `KahlModFrameTop_d.png` ni `KahlModFrameBottom_d.png`
- No existe un material llamado `KahlModFrame` o similar en `/Lotus/Interface/`
- La extracción de materiales (configurada como JSON) no produce output para esta ruta

### Hipótesis

El material que referencia estas texturas probablemente:
1. Tiene un nombre genérico (ej: `ModCardBase`, `ArchonModCard`) en una ruta diferente
2. Define el color base como parámetro escalar (RGB) o gradiente, no como textura
3. Usa la `Mask` como canal alpha y el color del material para el fill

---

## Pipeline para cuando se tenga la oo2core DLL

```powershell
# 1. Listar todos los archivos de una ruta
& ".\Warframe-Exporter-CLI_Windows.exe" --ls `
  --cache-dir "C:\SteamLibrary\steamapps\common\Warframe\Cache.Windows" `
  --game Warframe `
  --internal-path "/Lotus/Interface/Graphics/Mods"

# 2. Ver tipos de archivo (enums) en una ruta
& ".\Warframe-Exporter-CLI_Windows.exe" --print-enums `
  --cache-dir "..." --game Warframe `
  --internal-path "/Lotus/Interface"

# 3. Extraer materiales de Interface como JSON
& ".\Warframe-Exporter-CLI_Windows.exe" --extract-materials `
  --cache-dir "..." --game Warframe `
  --internal-path "/Lotus/Interface" `
  --material-format JSON `
  --output-path "D:\Development\Warframe\export\materials"

# 4. Buscar cuál material referencia KahlMod
Get-ChildItem "D:\Development\Warframe\export\materials" -Recurse -Filter "*.json" |
  Select-String "KahlMod" | Select-Object Path -First 10

# 5. Raw dump para ImHex (requiere .hexpat del repo)
& ".\Warframe-Exporter-CLI_Windows.exe" --write-raw `
  --cache-dir "..." --game Warframe `
  --internal-path "/Lotus/Interface/Graphics/Mods/KahlModFrameTop_n"
```

---

## Próximos pasos cuando se retome

1. **Conseguir `oo2core_9_win64.dll`** desde un juego AAA o Unreal Engine
2. **Usar el CLI** para extraer TODOS los materiales de `/Lotus/Interface/` como JSON
3. **Buscar** con `Select-String "KahlMod"` cuál material los referencia
4. **Leer el JSON** del material para obtener el color base exacto
5. **Compositar** en GIMP: `KahlModFrameTopMask.png` como alpha + color del material como fill + efectos metálicos
6. **Preguntar en el Discord de b3d.wf** — alguien puede conocer el nombre real del material

---

## Solución temporal actual

Recorte manual desde el juego:
- Abrir Warframe → Mods → localizar un mod de arconte
- Screenshot con herramienta de recorte
- Aislar el frame con transparencia en GIMP/Photoshop
- Guardar como `KahlFrameTop.png`, `KahlFrameBottom.png`, etc.
- Colocar en `/Project/public/mod-frames/`

> **Nota**: Overframe.gg usa las texturas de `Legendary` para los mods de arconte.  
> Esto sugiere que el frame de arconte visualmente es similar al Legendary pero con un tratamiento de color/shader diferente (probablemente un tinte rojo/anaranjado).
