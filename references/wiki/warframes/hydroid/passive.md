# Hydroid — Pasiva

> Estado: activo
> Rol: pasiva de Hydroid — marca permanente sobre el enemigo dañado que sube el strip inicial de Corrosive de 26% a 50%
> Fuente de verdad de: el valor del strip inicial bajo la marca · que la marca la porta el enemigo y no la fuente del proc · su permanencia · su inmunidad en bosses
> No usar para: la ley general de stacks de Corrosive (ver [`../../mechanics/status-effects.md`](../../mechanics/status-effects.md)) · las habilidades numeradas de Hydroid (ver el `.md` de cada una)
> Última actualización: 2026-08-19
> Fuente: https://wiki.warframe.com/w/Hydroid/Abilities/Passive
> Fuente actualizada: 2025-11-03
> Raw: passive.wikitext

## Cómo funciona

*"Enemies damaged by Hydroid are **permanently** more vulnerable to Corrosive Status, with initial
status reducing armor by **50%** rather than 26%, allowing Corrosive Status to reach **100%** armor
reduction at full stacks."*

```
strip inicial = 50%   (bajo la marca)   ←→   26%   (por defecto)
strip por stack adicional = 6%          ←→   6%    (sin cambio)
```

La cuenta que la fuente declara cierra con esos dos valores: a 10 stacks, `50 + 6×9 = 104%` topa
contra el techo físico de 100% (no se saca más armadura de la que hay), mientras que por defecto
`26 + 6×9 = 80%`. El *"100% at full stacks"* de la fuente es ese techo, no un tercer coeficiente.

- **La marca la porta el enemigo, no el proc.** *"As long as Hydroid has damaged the enemy, the
  Corrosive Status Effects can be applied from **any source**, not just from Hydroid's weapons or
  abilities, and will receive the benefit."* Quien dispara el proc es indistinto: lo que decide el
  coeficiente es si el enemigo está marcado.
- **Permanente.** La fuente lo subraya (`permanently`): la marca no expira ni se consume — basta con
  que Hydroid haya dañado a ese enemigo una vez.
- **Reemplaza, no compone.** *"50% **rather than** 26%"* — es sustitución del coeficiente, no un
  bonus que se sume o multiplique sobre el valor por defecto.
- **Sólo toca el strip inicial.** El 6% por stack adicional y el conteo máximo de stacks quedan como
  están; lo que cambia es el primer término.
- **Bosses inmunes, excepto en el Simulacrum.** *"Bosses are immune to the increased armor reduction
  from Hydroid's passive, except in the Simulacrum."*
- Funciona en misiones de Archwing. El enemigo afectado se marca visualmente con un símbolo de
  Corrosive goteando agua sobre su cabeza.

## Fuentes

- https://wiki.warframe.com/w/Hydroid/Abilities/Passive
