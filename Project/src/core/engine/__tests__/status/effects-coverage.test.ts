/**
 * Índice de cobertura de status (el §7 de damage-flow-model + los "Veredictos v1" de
 * damage-status-model.md, hechos EJECUTABLES). Un `describe` por efecto restante; `it.todo` marca
 * "esto NO lo tenemos hoy" con la fórmula/faceta de la wiki como texto (nunca un número contra
 * maquinaria ausente). Cuando un efecto se modela, GRADÚA a su propio archivo (ver corrosion/
 * infection/disruption). NO es fuente de verdad absoluta — es el mapa de qué falta.
 *
 * Modelados con archivo propio: Corrosion (corrosive), Infection (viral), Disruption (magnetic).
 * Fuente de los veredictos: docs/domains/engine/design/damage-status-model.md §Veredictos por tipo — v1.
 */
import { describe, it } from 'vitest';

// — DoT (Familia C: tick dependiente del daño del arma; §Checkpoint 3, la Slice 2 lo prototipa) —
describe('Slash → Bleed', () => {
  it.todo('tick = 0.35 × modded_base × (1+status_damage) [True, bypass armor] — Familia C');
});
describe('Toxin → Poison', () => {
  it.todo('hit directo: bypassa shields (MODELADO en resolveHit; ver infection.test)');
  it.todo('tick = 0.5 × modded_base × (1+toxin) × (1+status_damage) [bypass shields, no Overguard] — Familia C');
});
describe('Heat → Ignite', () => {
  it.todo('armor strip por TIEMPO (rampa 2s, cap 50%): MODELADO inline en EnemyState (excepción, no Familia A) — falta harness temporal');
  it.todo('tick = 0.5 × modded_base × (1+heat) × (1+status_damage) [stacks consolidados en 1 tick/s] — Familia C');
});
describe('Electricity → Tesla Chain', () => {
  it.todo('tick = 0.5 × modded_base × (1+electric) × (1+status_damage) — Familia C');
  it.todo('arco a enemigos en 3m (filtro espacial) + stun ~3s solo al target original — deferido');
});
describe('Gas → Gas Cloud', () => {
  it.todo('tick = 0.5 × modded_base × (1+gas) × (1+status_damage) [AoE, radio 3m +0.3/stack] — Familia C');
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
