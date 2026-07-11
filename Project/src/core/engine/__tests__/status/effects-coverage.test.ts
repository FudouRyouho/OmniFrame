/**
 * Índice de cobertura de status (el §7 de damage-flow-model + los "Veredictos v1" de
 * damage-status-model.md, hechos EJECUTABLES). Un `describe` por efecto restante; `it.todo` marca
 * "esto NO lo tenemos hoy" con la fórmula/faceta de la wiki como texto (nunca un número contra
 * maquinaria ausente). Cuando un efecto se modela, GRADÚA a su propio archivo (ver corrosion/
 * infection/disruption). NO es fuente de verdad absoluta — es el mapa de qué falta.
 *
 * Modelados con archivo propio: Corrosion (corrosive), Infection (viral), Disruption (magnetic),
 * Slash/Bleed (valor del tick, prototipo Slice 2).
 * Fuente de los veredictos: docs/domains/engine/design/damage-status-model.md §Veredictos por tipo — v1.
 */
import { describe, it } from 'vitest';

// — DoT (Familia C). La LEY del VALOR del tick YA existe (formulas/status/dot-tick.ts, Slice 2);
//   falta GRADUAR cada uno a archivo propio + el faction² + el timeline (C2, Slice 3). —
describe('Toxin → Poison', () => {
  it.todo('hit directo: bypassa shields (MODELADO en resolveHit; ver infection.test)');
  it.todo('valor del tick: dotTickValue("toxin", ...) YA existe — falta graduar a toxin.test + bypass shields/no-Overguard en aplicación');
});
describe('Heat → Ignite', () => {
  it.todo('armor strip por TIEMPO (rampa 2s, cap 50%): MODELADO inline en EnemyState (excepción, no Familia A) — falta harness temporal');
  it.todo('valor del tick: dotTickValue("heat", ...) YA existe — falta graduar + stacks consolidados en 1 tick/s (timeline)');
  it.todo('FRONTERA 1: Heat NO es pulsos independientes — un pulso consolidado que crece + refresca duración (damage-status-model §Modelo de timeline)');
});
describe('Electricity → Tesla Chain', () => {
  it.todo('valor del tick: dotTickValue("electricity", ...) YA existe — falta graduar + arco 3m + stun');
});
describe('Gas → Gas Cloud', () => {
  it.todo('valor del tick: dotTickValue("gas", ...) YA existe — falta graduar + AoE radio 3m +0.3/stack (timeline)');
});

// — Debuff numérico Familia A/B, consumido FUERA de la resolución por capa (crit calc, status calc) —
describe('Puncture → Weakened', () => {
  it.todo('−40% daño saliente del enemigo (1er) −10%/stack → −80% a 5 — eje "daño recibido por el jugador", fuera del calculador hoy');
  it.todo('+5% crit chance del jugador/stack contra el target — consumido en crit calc, no en resolveHit');
});
describe('Cold → Freeze', () => {
  it.todo('slow 50% +5%/stack + crit-recibido +0.1×/+0.05× por stack (Familia A) — consumido en crit calc; sin consumidor aún');
  it.todo('10º stack: congelación 3s, residual 3 stacks; cap especial 4 en bosses/Overguard — C2');
});
describe('Tau → Status Vulnerability', () => {
  it.todo('+10% status chance recibida/stack, cap +100% (Familia A) — cross-cutting: modifica el SC efectivo de los demás procs; baja prioridad');
});

// — CC / scope-out (fuera del eje daño, o piso de dato/entidad ausente) —
describe('Impact → Stagger', () => {
  it.todo('CC (flinch) + threshold de Parazon Mercy (+8%/proc) — fuera del eje daño');
});
describe('Blast → Detonation', () => {
  it.todo('10 fusas independientes (1.5s c/u) → 30% base/stack, al 10º o al morir 300%/stack en 5m — timeline real, deferido completo');
});
describe('Radiation → Confusion', () => {
  it.todo('+100%/+50% daño del confundido a sus aliados — scope-out: el modelo no tiene daño de ataque del enemigo');
});
describe('Void → Bullet Attraction', () => {
  it.todo('campo 2.5m/3s + reset de damage-adaptation de Sentients — scope-out: Operador/Amp no son entidad en el DNA');
});

// — Regla de composición, no un proc con daño propio —
describe('True (Finisher/Cinematic)', () => {
  it.todo('NO dispara proc — es regla de composición #1 (ignora armor ≠ inmune a multiplicadores de capa; ver §Bleed)');
});

// — Modelo de timeline (superposición de pulsos) — supuestos y fronteras cross-cutting.
//   Narrativa: damage-status-model.md §Modelo de timeline. Frontera 1 (Heat) → describe Heat;
//   Frontera 4 (detonación) → describe Blast. Acá las que no cuelgan de un solo efecto: —
describe('Timeline / Familia C — superposición de pulsos declarados (suelo C1)', () => {
  it.todo('total = Σ(ticks × valor), independiente del fase; curva DPS(t) = pulsos vivos en t — fold puro sobre lista declarada, sin substrato');
  it.todo('FRONTERA 2 (snapshot/coupling): el pulso es rectángulo porque el daño se congela al nacer; Viral amplifica DoTs de salud EN VIVO → Viral+Slash (meta) rompe la amplitud constante');
  it.todo('FRONTERA 3 (pulsos que generan pulsos): arco de Electricity (secundarios sin crit) + Gas AoE (N targets) — un pulso ≠ un target');
  it.todo('FRONTERA 4 (terminación temprana): muerte del target trunca todos los pulsos y el instante de muerte es salida del propio timeline (circularidad, integrar hasta health=0)');
  it.todo('FRONTERA 5 (densidad): cientos de pulsos/s en builds reales → arch-decisions §4.4 (Hybrid/EV), la enumeración deja de ser viable');
  it.todo('HUECO DE DATO — Status Duration ensancha el pulso: (A) más ticks→total sube vs (B) ticks estirados→total igual. SIN VERIFICAR (wiki solo especifica Blast/Heat/Electric). Test: sumar total con/sin, no observar duración');
});
