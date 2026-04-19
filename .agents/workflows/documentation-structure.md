---
description: Definición del Estándar de Estructura Documental (YAML Frontmatter) para OmniFrame
---

# Estándar de Estructura Documental (Anatomía de la Verdad)


> [!NOTE]
> **Estado**: Activo  
> **Rol**: Definir el formato obligatorio para la documentación de OmniFrame.  
> **Fuente de Verdad**: Acuerdos de Gobernanza 2026-04-19.

---

## 🏗️ La Cabecera YAML (Frontmatter)

Todo documento en `docs/` debe iniciar con un bloque YAML. Esto permite que los agentes de IA realicen análisis de trazabilidad y dependencias de forma determinista.

### Template Oficial:

```yaml
---
Estado: "activo" | "archivado" | "en revision"
Rol: "Breve resumen del propósito del documento"
Version: "vx.x.x"
Impacto_ID: "[ID-Matriz]" # Referencia a impact-matrix.md
Fidelidad_Fisica: "ruta/al/codigo" # Archivo o carpeta que este documento describe
Fecha_de_creacion: "YYYY-MM-DD"
Fecha_de_actualizacion: "YYYY-MM-DD"
Dependencias: 
  - "ruta/documento/del-que-depende.md"
Dependidos:
  - "ruta/documento/que-depende-de-este.md"
---
```

---

## 📜 Reglas de Mantenimiento

1. **Sincronización de Fechas**: Cada vez que se modifique el contenido del documento o el código referenciado en `Fidelidad_Fisica`, se debe actualizar la `Fecha_de_actualizacion`.
2. **Grafo de Dependencias**: Si se añade una referencia a otro documento en el cuerpo del archivo, se debe reflejar en el campo `Dependencias`.
3. **Verificación de Impacto**: El `Impacto_ID` debe ser rastreable en `docs/overview/impact-matrix.md`. Si no existe un ID, el documento se considera "en revisión" o "propuesta" hasta que se asigne uno.
4. **Fidelidad Física**: Si la ruta en `Fidelidad_Fisica` cambia en el proyecto, el agente debe detenerse y solicitar la actualización de la documentación correspondiente.

---

## 🤖 Uso para Agentes de IA

El agente utilizará este bloque para:
- Validar si el conocimiento está obsoleto (viendo si las dependencias son más nuevas que el documento actual).
- Reportar derivas arquitectónicas basadas en el archivo de `Fidelidad_Fisica`.
- Sugerir actualizaciones en cascada a través del campo `Dependidos`.
