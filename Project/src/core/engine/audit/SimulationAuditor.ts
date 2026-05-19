/**
 * @domain Simulation-v2 / Logic / Auditor
 * @SSoT docs/design/sim-v2/simulation-roadmap.md
 */

import type { SimulationEngine } from "../resolution/SimulationEngine";
import type { AuditResponse, EntityId, AttributeId } from "../contracts";

export class SimulationAuditor {
  /**
   * Extrae la traza de auditoría para un atributo específico.
   */
  public static getAudit(entityId: EntityId, attrId: AttributeId, engine: SimulationEngine): AuditResponse {
    const session = engine.getAuditSession();
    const key = `${entityId}:${attrId}`;
    const trace = session.get(key) || [];

    return {
      entity_id: entityId,
      attribute_id: attrId,
      trace
    };
  }

  /**
   * Genera una explicación en Markdown denso para un Agente AI.
   */
  public static explain(response: AuditResponse): string {
    if (response.trace.length === 0) {
      return `> No hay modificadores registrados para **${response.entity_id}:${response.attribute_id}**. Se mantiene el valor base.`;
    }

    let md = `### Auditoría: ${response.attribute_id} (${response.entity_id})\n`;
    md += `| Pass | Source | Op | Impact | Result | Condition |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    response.trace.forEach(step => {
      const cond = step.condition_met === undefined ? "N/A" : (step.condition_met ? "✅" : "❌");
      const impact = step.impact > 0 ? `+${step.impact.toFixed(2)}` : step.impact.toFixed(2);
      
      md += `| ${step.pass} | ${step.source} | ${step.operation} | ${impact} | **${step.resulting_value.toFixed(2)}** | ${cond} |\n`;
    });

    return md;
  }

  /**
   * Resume el estado de una entidad resaltando los atributos con mayor actividad de modificadores.
   */
  public static summarizeEntity(entityId: EntityId, engine: SimulationEngine): string {
    const session = engine.getAuditSession();
    const entityKeys = Array.from(session.keys()).filter(k => k.startsWith(`${entityId}:`));

    if (entityKeys.length === 0) return `Entity **${entityId}** has no active modifiers.`;

    let summary = `## Resumen de Entidad: ${entityId}\n`;
    entityKeys.forEach(key => {
      const attrId = key.split(':')[1];
      const trace = session.get(key) || [];
      const finalValue = trace.length > 0 ? trace[trace.length - 1].resulting_value : 0;
      
      summary += `- **${attrId}**: ${finalValue.toFixed(2)} (${trace.length} mods)\n`;
    });

    return summary;
  }

  /**
   * Compara dos trazas y explica la desviación.
   */
  public static diff(auditA: AuditResponse, auditB: AuditResponse): string {
    let md = `## Diagnóstico de Diferencia: ${auditA.attribute_id}\n`;
    
    const maxLen = Math.max(auditA.trace.length, auditB.trace.length);
    md += `| Step | Trace A (${auditA.entity_id}) | Trace B (${auditB.entity_id}) | Impact Delta |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;

    for (let i = 0; i < maxLen; i++) {
      const stepA = auditA.trace[i];
      const stepB = auditB.trace[i];

      const valA = stepA ? `${stepA.source} (${stepA.impact.toFixed(1)})` : "-";
      const valB = stepB ? `${stepB.source} (${stepB.impact.toFixed(1)})` : "-";
      const delta = (stepB?.impact || 0) - (stepA?.impact || 0);
      const deltaStr = delta !== 0 ? `**${delta > 0 ? "+" : ""}${delta.toFixed(1)}**` : "0";

      md += `| ${i + 1} | ${valA} | ${valB} | ${deltaStr} |\n`;
    }

    const finalA = auditA.trace.length > 0 ? auditA.trace[auditA.trace.length - 1].resulting_value : 0;
    const finalB = auditB.trace.length > 0 ? auditB.trace[auditB.trace.length - 1].resulting_value : 0;
    
    md += `\n**Resultado Final A:** ${finalA.toFixed(2)}\n`;
    md += `**Resultado Final B:** ${finalB.toFixed(2)}\n`;
    md += `**Desviación Total:** ${(finalB - finalA).toFixed(2)}\n`;

    return md;
  }
}
