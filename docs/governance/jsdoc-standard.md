---
Estado: "referencia"
Rol: "Vocabulario canónico de anotaciones JSDoc en Project/src/"
Version: "v0.1.0"
Impacto_ID: "G-Naming"
Fidelidad_Fisica: "Project/src/"
Fecha_de_creacion: "2026-05-18"
Fecha_de_actualizacion: "2026-05-18"
---

# Estándar JSDoc — `Project/src/`

Aplica a todo archivo `.ts` y `.tsx` bajo `Project/src/`. Las anotaciones son consumidas por agentes de IA y desarrolladores para entender el estado de un módulo sin leer el código completo.

---

## Cabecera canónica

Todo módulo de dominio o motor debe tener una cabecera con al menos `@domain` y `@status`:

```typescript
/**
 * @domain <DomainName> / <SubDomain> / <Rol>
 * @status <valor>
 * @SSoT <ruta-relativa-desde-raíz-del-repo>   ← opcional, solo si hay doc canónico
 */
```

Ejemplo correcto:
```typescript
/**
 * @domain Simulation-v2 / Logic / Bridge
 * @status en-desarrollo
 * @SSoT docs/domains/engine/design/simulation-architecture.md
 */
```

---

## Vocabulario canónico de `@status`

Exactamente 5 valores permitidos. Sin variantes libres, sin compuestos con `/`.

| Valor | Significado | Nota requerida |
| :--- | :--- | :--- |
| `activo` | Contrato estable. En producción. Sin deuda de diseño pendiente. | — |
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
@status deprecado — Reemplazar por EnsembleAdapter.fromIntention()

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

Formato estricto: `NombreDominio / SubDominio / Rol`

Los nombres de dominio válidos son los definidos en `docs/domains/`:
- `Simulation-v2`
- `Arsenal`
- `Equipment`
- `Shared`
- `Providers`
- `UI`

```typescript
// ✅ Correcto
@domain Simulation-v2 / Logic / Hydration
@domain Arsenal / State / Stub
@domain Shared / Data / Registry

// ❌ Incorrecto
@domain simulation/logic/hydration    // No usar kebab-case aquí
@domain Engine                    // Demasiado vago — al menos 2 niveles
```

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
