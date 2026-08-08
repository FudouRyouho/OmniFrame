/**
 * @domain Shared / Capa A — composición de escenas
 *
 * Primitivas para DERIVAR un participante de otro. Hermano de `scene.ts`, que es el contrato:
 * acá no vive ninguna forma nueva, sólo operaciones sobre la que ya existe.
 *
 * POR QUÉ EXISTEN. Componer sobre la forma vieja era spread crudo —`{...base, items: {...base.items,
 * warframe: {...base.items.warframe, abilities: [...]}}}`— repetido en 24 sitios. Eso obligaba a
 * reconstruir a mano, cada vez, la convención que ataba `mods[canal]` con `items[canal]`. Y el corpus
 * mostró lo que pasa cuando una convención se reconstruye a mano 24 veces: **una de las nueve
 * derivadas lo hacía distinto que las otras ocho**, y nadie lo había notado (ver `withMods`).
 *
 * EL PORTADOR SE NOMBRA, PERO NO ES UN CANAL. `BearerSlot<P>` se **deriva de la variante**: no se
 * puede nombrar un portador que esa variante no tiene, y agregar una variante sin declarar sus
 * portadores no compila. El viejo `EquipmentChannel` era una lista suelta que podía apuntar a un slot
 * vacío — por eso `mods.primary` podía existir con `items.primary` en `null`.
 */
import type {
  Scene, PlayerIntent, HostileIntent, Bearer, WarframeIntent, WeaponIntent, CompanionIntent,
  SlotMap, ModIntent, ArcaneIntent, AbilityIntent, ShardIntent,
} from './scene';
import { NO_HOSTILE } from './scene';

/** Los portadores que cada variante admite. Derivado de la estructura, no una lista aparte. */
export type BearerSlot<P extends PlayerIntent> =
    P extends { kind: 'onfoot' }    ? 'warframe' | 'companion' | 'primary' | 'secondary' | 'melee'
  : P extends { kind: 'archwing' }  ? 'archwing' | 'archgun' | 'archmelee'
  : P extends { kind: 'necramech' } ? 'necramech' | 'archgun'
  : never;

const WEAPON_SLOTS = ['primary', 'secondary', 'melee'] as const;
type WeaponSlot = typeof WEAPON_SLOTS[number];
const isWeaponSlot = (s: string): s is WeaponSlot => (WEAPON_SLOTS as readonly string[]).includes(s);

// ─── Escena ⊥ participante ──────────────────────────────────────────────────────────────

/** El jugador de una escena. Sin índice: `squad[0]` es "vos" por tipo. */
export function player(scene: Scene): PlayerIntent {
  return scene.squad[0];
}

/** Envuelve un participante en una escena. El inverso de `player`. */
export function scene(p: PlayerIntent, hostile: HostileIntent[] = NO_HOSTILE): Scene {
  return { squad: [p], hostile };
}

/** Aplica una operación al jugador de una escena, conservando el resto (hostiles, aliados). */
export function onPlayer(s: Scene, fn: (p: PlayerIntent) => PlayerIntent): Scene {
  const [me, ...allies] = s.squad;
  return { ...s, squad: [fn(me), ...allies] as Scene['squad'] };
}

// ─── Leer y escribir un portador ────────────────────────────────────────────────────────

function readBearer<P extends PlayerIntent>(p: P, slot: BearerSlot<P>): Bearer | undefined {
  const key = slot as string;
  if (p.kind === 'onfoot' && isWeaponSlot(key)) return p.weapons?.[key];
  return (p as unknown as Record<string, Bearer | undefined>)[key];
}

function writeBearer<P extends PlayerIntent>(p: P, slot: BearerSlot<P>, bearer: Bearer): P {
  const key = slot as string;
  if (p.kind === 'onfoot' && isWeaponSlot(key)) {
    return { ...p, weapons: { ...p.weapons, [key]: bearer } } as P;
  }
  return { ...p, [key]: bearer } as P;
}

/**
 * Aplica una transformación al portador de un slot. Si no existe, TIRA: componer sobre algo que no
 * se declaró es un error del autor de la escena, no un caso a completar en silencio con un portador
 * inventado — el mismo criterio con el que B dejó de rellenar el warframe.
 */
function mapBearer<P extends PlayerIntent>(p: P, slot: BearerSlot<P>, fn: (b: Bearer) => Bearer): P {
  const current = readBearer(p, slot);
  if (!current) {
    throw new Error(
      `[escena] no hay portador en "${String(slot)}" sobre el que componer. Declaralo primero ` +
      `(\`withBearer\`) — derivar sobre un slot vacío inventaría un participante.`
    );
  }
  return writeBearer(p, slot, fn(current));
}

// ─── Las cinco primitivas ───────────────────────────────────────────────────────────────

/** Agrega o reemplaza el portador de un slot. Es la única que crea; el resto compone sobre lo que hay. */
export function withBearer<P extends PlayerIntent>(
  p: P, slot: BearerSlot<P>, bearer: Bearer | WeaponIntent | CompanionIntent | WarframeIntent,
): P {
  return writeBearer(p, slot, bearer);
}

/**
 * Suma mods a un portador. **MERGEA, no reemplaza**, y eso lo decidió el corpus:
 * `corrosiveProjectionTarget` era la única de nueve derivadas que escribía
 * `{ ...(base.mods.warframe ?? {}), 0: … }`; las otras ocho reemplazaban la tabla entera y sólo no
 * rompían porque sus bases no traían mods. Con merge, esas ocho dejan de ser frágiles sin que nadie
 * las toque — ver el test de regresión en `scene-compose.test.ts`.
 */
export function withMods<P extends PlayerIntent>(p: P, slot: BearerSlot<P>, mods: SlotMap<ModIntent>): P {
  return mapBearer(p, slot, b => ({ ...b, mods: { ...b.mods, ...mods } }));
}

/** Espejo de `withMods` para arcanos. Mismo criterio de merge. */
export function withArcanes<P extends PlayerIntent>(p: P, slot: BearerSlot<P>, arcanes: SlotMap<ArcaneIntent>): P {
  return mapBearer(p, slot, b => ({ ...b, arcanes: { ...b.arcanes, ...arcanes } }));
}

/** Habilidades activas. Sólo del warframe: un arma no lanza habilidades. */
export function withAbilities(p: PlayerIntent, abilities: AbilityIntent[]): PlayerIntent {
  return mapBearer(p, 'warframe' as BearerSlot<typeof p>, b => ({ ...b, abilities } as WarframeIntent));
}

/** Archon shards. Sólo del warframe, por la misma razón. */
export function withShards(p: PlayerIntent, shards: ShardIntent[]): PlayerIntent {
  return mapBearer(p, 'warframe' as BearerSlot<typeof p>, b => ({ ...b, shards } as WarframeIntent));
}
