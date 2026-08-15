---
Estado: "referencia"
Rol: "Vocabulario canónico de anotaciones JSDoc en Project/src/"
Impacto_ID: "G-Naming"
Fidelidad_Fisica: "Project/src/"
Fecha_de_creacion: "2026-05-18"
Fecha_de_actualizacion: "2026-08-07"
---

# Estándar JSDoc — `Project/src/`

Aplica a todo archivo `.ts` y `.tsx` bajo `Project/src/`. Las anotaciones son consumidas por agentes de IA y desarrolladores para entender el estado de un módulo sin leer el código completo.

---

## Cabecera canónica

```typescript
/**
 * @domain <NombreDominio> / <SubDominio> / <Rol>   ← obligatorio
 * @status <valor>                                   ← solo si NO es `activo`
 * @SSoT <ruta-relativa-desde-raíz-del-repo>         ← solo si hay doc canónico
 */
```

Ejemplo correcto:
```typescript
/**
 * @domain Engine / Logic / Bridge
 * @status en-desarrollo
 * @SSoT docs/domains/engine/design/simulation-architecture.md
 */
```

**Solo `@domain` es obligatorio.** Los otros dos tags existen para **decir algo que el lector no
puede deducir**, y un tag que siempre está presente deja de leerse:

- **`@status` se escribe cuando el módulo NO está estable.** Ausencia = `activo`. Ponerle `activo` a
  todo convierte el tag en decoración; ponerlo solo donde hay deuda lo vuelve un mapa de riesgo
  legible de un grep.
- **`@SSoT` se escribe solo si existe el doc.** Sin doc canónico, se omite — nunca se inventa un path.

---

## Vocabulario canónico de `@status`

Exactamente 5 valores permitidos. Sin variantes libres, sin compuestos con `/`.

| Valor | Significado | Nota requerida |
| :--- | :--- | :--- |
| `activo` | Contrato estable. En producción. Sin deuda de diseño pendiente. **Es el default: normalmente se omite** — escribirlo solo si el archivo parece inestable y no lo es. | — |
| `en-desarrollo` | Funcional pero incompleto. Contratos pueden cambiar. Features parciales. | — |
| `stub` | Placeholder. Datos hardcodeados o lógica mínima. No representa funcionalidad real. | Opcional: qué lo reemplazará. |
| `bloqueado` | No puede avanzar. Depende de una decisión o recurso externo. | **Obligatoria**: especificar qué bloquea. |
| `deprecado` | Activo pero marcado para eliminación. | **Obligatoria**: especificar su reemplazo. |

### Ejemplos

```typescript
// ✅ Correcto
@status activo
@status en-desarrollo
@status stub
@status bloqueado — Pendiente resolución OQ-STATE-1
@status deprecado — Reemplazar por MutatorBridge.simulateFromScene()

// ❌ Incorrecto
@status stub / en desarrollo          // No usar compuestos con /
@status v2-flat-record                // No usar nombres de fase
@status Parche Inicial - Cargador...  // No usar texto libre
@status BLOQUEADO - Pendiente 'x'     // No usar MAYÚSCULAS
```

---

## Reglas de `@SSoT`

- Debe ser una ruta **relativa desde la raíz del repo** (`docs/...`, no rutas absolutas).
- El documento referenciado debe existir físicamente. Si fue archivado, actualizar la ruta a `docs-archive/`.
- Si no hay documento canónico asociado, omitir el tag — no inventar paths.

```typescript
// ✅ Correcto
@SSoT docs/domains/engine/design/simulation-architecture.md
@SSoT docs/domains/engine/engine-audit.md

// ❌ Incorrecto
@SSoT docs/domains/integration/runtime-composition.md  // si el doc fue archivado
@SSoT OMNIFRAME_SIMULATION_ARCHITECTURE.md            // path con mayúsculas que no existe
```

---

## Reglas de `@domain`

Formato estricto: `NombreDominio / SubDominio / Rol` — al menos dos niveles, en PascalCase.

El primer nivel nombra **la zona del árbol**, no el directorio de `docs/domains/`. Los nombres
canónicos son estos siete, con su superficie física:

| Nombre | Superficie |
|---|---|
| `Engine` | `core/engine/` — el motor: contratos, hidratación, resolución, fórmulas |
| `Shared` | `shared/` — tipos, componentes, hooks, providers de uso transversal |
| `Features` | `domains/<feature>/` — arsenal, equipment y lo que venga |
| `Integration` | `providers/` — los contextos React que cosen el árbol |
| `Data` | `shared/data/` — el piso "0": `DataSource`, adapters, registry |
| `Format` | `lib/format/` — el borde de salida: proyección de valores a display |
| `ViewModel` | `shared/view-model/` — el corte C→D |

```typescript
// ✅ Correcto
@domain Engine / Hydration
@domain Engine / Contracts
@domain Shared / Types / Ability
@domain Features / Arsenal
@domain Data / Adapters

// ❌ Incorrecto
@domain simulation/logic/hydration    // No usar kebab-case ni omitir espacios
@domain Engine                        // Un solo nivel — decí de qué parte del motor
@domain ViewModelContract — cut C→D…  // El tag lleva la coordenada, no la explicación
```

### Alias heredados — no crear más, migrar cuando se toque el archivo

Tres nombres siguen vivos en el árbol y significan lo mismo que `Engine`:

| Alias | Archivos | Reemplazo |
|---|---|---|
| `Simulation-v2` | 13 | `Engine` — el `-v2` es de cuando el motor se llamaba así |
| `Simulation` | 1 | `Engine` |
| `Arsenal` (primer nivel) | 1 | `Features / Arsenal`, que es como lo escriben los otros 6 |

No hay campaña de rename: se corrigen **cuando el archivo se toca por otra razón**. Un rename masivo
de cabeceras es ruido de diff sin ganancia.

---

## Sobre comentarios inline

El estándar de `Project/CLAUDE.md` aplica: no comentar el **qué**, solo el **por qué**.

```typescript
// ✅ Correcto — explica una invariante no obvia
// El perfil se selecciona en hidratación, no en resolve(). Ver OQ-ENGINE-2.

// ❌ Incorrecto — describe lo que el código ya dice
// Itera sobre todos los modificadores y los aplica al nodo
modifiers.forEach(mod => applyToNode(mod, node));
```

---

## Archivos exentos

No requieren cabecera de dominio:
- Archivos bajo `dev/` (laboratorio, nunca producción)
- Archivos de test (`__tests__/`, `*.test.ts`)
- Archivos de configuración (`vite.config.ts`, `tsconfig.json`, etc.)
- Archivos de re-export puro (`index.ts` con solo `export * from ...`)
