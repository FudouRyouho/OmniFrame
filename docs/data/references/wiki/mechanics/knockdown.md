---
Estado: "referencia"
Rol: "Mecánica de CC Knockdown — base para modelado en engine"
Version: "v0.1.0"
Impacto_ID: "REF-Knockdown"
Fidelidad_Fisica: "Project/public/data/arcane-stats.override.json"
Fecha_de_creacion: "2026-06-02"
Fecha_de_actualizacion: "2026-06-02"
Fuente: "https://wiki.warframe.com/w/Knockdown"
---

# Knockdown — Mecánica de Control de Masas

## Definición

Knockdown es un efecto de control de masas (CC) que derriba al objetivo al suelo, dejándolo vulnerable a cualquier ataque y a **Ground Finishers** mientras permanece caído.

---

## Comportamiento

- El objetivo queda en el suelo incapacitado durante la duración del efecto.
- El jugador puede recuperarse manualmente: saltar = levantamiento neutral; tecla direccional = rodada en esa dirección. Actuar durante el destello de inicio permite levantarse o rodar más rápidamente.
- Al caer, el objetivo es elegible para Ground Finishers (incluyendo interacción con Arcane Trickery y efectos similares).

---

## Diferencia con Stagger

| Efecto | Descripción |
|--------|-------------|
| **Knockdown** | Derriba completamente al suelo. Ground Finisher disponible. |
| **Stagger** | El objetivo se tambalea sin caer. No habilita Ground Finisher. |

Ambos son mecánicas de CC pero con grado de incapacitación distinto.

---

## Fuentes de Resistencia / Inmunidad

- **Overguard**: proporciona resistencia pasiva al knockdown mientras esté activo.
- **Mods**: `Primed Sure Footed` otorga inmunidad al knockdown.
- **Habilidades**: varias habilidades de Warframe incluyen inmunidad de estado (Scarab Shell, Warding Halo, Fire Walker, entre otras). Cualquier fuente de inmunidad de estado previene knockdown.

---

## Entidades no afectadas

Ciertos enemigos (principalmente bosses y unidades de alto rango) tienen inmunidad inherente al knockdown. Lista exacta pendiente de verificación en juego.

---

## Relevancia para el engine

- No existe token `upgrade_type` para "aplicar knockdown" — es una mecánica de estado, no un stat modifier.
- Arcanos que usan esta mecánica: `RadialKnockdownOnEnergyPickup` (Arcane Eruption), `PullEnemiesOnMeleeKill` (mecánica relacionada de "pull").
- Modelado futuro: requiere sistema de mecánicas de estado CC separado del pipeline de stats. Ver puerta 2 (D-20).
