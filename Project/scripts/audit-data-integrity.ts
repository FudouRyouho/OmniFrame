/**
 * scripts/audit-data-integrity.ts
 * Utilidad para verificar la salud de los 4 pilares taxonómicos en los JSONs generados.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../public/data');

const DATASETS = [
  'warframes.json',
  'weapons.json',
  'mods.json',
  'arcanes.json',
  'companions.json',
  'archwing-weapons.json',
  'vehicles.json'
];

interface HealthReport {
  file: string;
  total: number;
  valid: number;
  invalid: number;
  drift: Array<{ id: string; name: string; issues: string[] }>;
  distribution: Record<string, number>;
}

async function auditFile(fileName: string): Promise<HealthReport> {
  const filePath = path.join(dataDir, fileName);
  const content = await fs.readFile(filePath, 'utf-8');
  const items = JSON.parse(content);

  const report: HealthReport = {
    file: fileName,
    total: items.length,
    valid: 0,
    invalid: 0,
    drift: [],
    distribution: {}
  };

  items.forEach((item: any) => {
    const issues: string[] = [];
    if (!item.domain) issues.push('missing domain');
    if (!item.kind) issues.push('missing kind');
    if (item.domain === 'unknown') issues.push('domain is unknown');
    if (item.kind === 'unknown') issues.push('kind is unknown');

    const key = `${item.domain}:${item.kind}`;
    report.distribution[key] = (report.distribution[key] || 0) + 1;

    if (issues.length > 0) {
      report.invalid++;
      report.drift.push({
        id: item.unique_name || item.id,
        name: item.name || 'Unknown',
        issues
      });
    } else {
      report.valid++;
    }
  });

  return report;
}

async function main() {
  console.log("🔍 Iniciando Auditoría de Integridad Taxonómica (OmniFrame)...\n");

  for (const file of DATASETS) {
    try {
      const report = await auditFile(file);
      console.log(`--- ${report.file} ---`);
      console.log(`📊 Total: ${report.total} | ✅ Válidos: ${report.valid} | ❌ Erróneos: ${report.invalid}`);
      
      if (report.invalid > 0) {
        console.log(`🚨 Drift Detectado (${report.invalid} ítems):`);
        report.drift.slice(0, 5).forEach(d => {
          console.log(`   - [${d.id}] ${d.name}: ${d.issues.join(', ')}`);
        });
        if (report.invalid > 5) console.log(`   ... y ${report.invalid - 5} más.`);
      }

      console.log(`📈 Distribución:`);
      Object.entries(report.distribution).forEach(([key, count]) => {
        console.log(`   · ${key}: ${count}`);
      });
      console.log("");
    } catch (e: any) {
      console.error(`❌ Error auditando ${file}: ${e.message}`);
    }
  }
}

main().catch(console.error);
