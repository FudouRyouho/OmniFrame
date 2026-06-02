---
Estado: "referencia"
Rol: "Mecánica Life Steal — base para token WEAPON_ADD_LIFESTEAL"
Version: "v0.1.0"
Impacto_ID: "REF-LifeSteal"
Fidelidad_Fisica: "Project/public/data/arcane-stats.override.json"
Fecha_de_creacion: "2026-06-02"
Fecha_de_actualizacion: "2026-06-02"
Fuente: "https://wiki.warframe.com/w/Life_Steal"
---

# Life Steal — Mecánica de Recuperación de Vida

## Definición

Life Steal convierte un porcentaje del daño infligido en recuperación de HP para el jugador. El cálculo se aplica **después** de cualquier reducción de daño del enemigo (no sobre daño bruto).

---

## Alcance — Ranged Y Melee

Life Steal **no es exclusivo de melee**. Fuentes confirmadas:

| Fuente | Tipo | Notas |
|--------|------|-------|
| Life Strike | Mod melee | Fuente canónica principal |
| Amalgam Daikyu Target Acquired | Mod rifle (Daikyu específico) | Ranged |
| Winds of Purity | Mod pistola (Furis específico) | Ranged |
| Exodia Might | Arcano Zaw | Melee — on_finisher_kill, 50% proc, 8s |
| Lohk Surge (Xaku) | Habilidad | Cross-domain |
| Penance (Harrow) | Habilidad | % escalado por rank |
| Gloom (Sevagoth) | Habilidad | % escalado por rank |

---

## Relevancia para el engine

- Token OmniFrame: `WEAPON_ADD_LIFESTEAL`
- Prefijo `WEAPON_` (no `MELEE_`) — la mecánica es agnóstica del tipo de arma.
- La restricción de Exodia Might a Zaws (melee) va por campo `weapon_type` cuando exista (ver OQ-DATA-5), no por el token.
- Operación: ADD (porcentaje acumulable con otras fuentes de Life Steal).
- No existe token `AVATAR_*` para Life Steal de habilidades — se modelan por separado en el dominio ability-stats.
