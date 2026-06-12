/**
 * @domain Features / Arsenal / Incarnon Evolution
 * Placeholder funcional — UI pendiente.
 * Permite seleccionar perks de evolución incarnon y cambiar el perfil activo.
 */
import { useNavigate, useParams } from 'react-router';
import { useEnsemble, useEnsembleActions } from '@providers/Ensemble/EnsembleProvider';
import type { EnsembleChannel } from '@shared/types/ensemble';
import { useIncarnorCatalog, findEntryForWeapon } from './use-incarnon-catalog';

const WEAPON_CHANNELS: EnsembleChannel[] = ['primary', 'secondary', 'melee'];

export default function IncarnorEvolutionSelector() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const intention = useEnsemble();
  const { setEvolutionPerk, setActiveProfile } = useEnsembleActions();
  const catalog = useIncarnorCatalog();

  const channel = (
    WEAPON_CHANNELS.includes(category as EnsembleChannel) ? category : 'primary'
  ) as EnsembleChannel;

  const channelState = intention.items[channel];
  const currentPerks = channelState.evolution_perks ?? {};
  const currentProfile = channelState.active_profile ?? 'base';
  const weaponId = channelState.itemId;

  if (!catalog || !weaponId) {
    return <div className="p-8 text-ui-primary/30 text-sm">Cargando...</div>;
  }

  const entry = findEntryForWeapon(catalog, weaponId);

  if (!entry) {
    return (
      <div className="p-8 text-ui-primary/30 text-sm italic">
        Sin evoluciones Incarnon para esta arma.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden p-4 gap-4">
      <header className="flex items-center justify-between border-b border-ui-primary/10 pb-3">
        <button
          onClick={() => void navigate('/arsenal')}
          className="text-xs text-ui-primary/40 hover:text-ui-primary/70 transition-colors"
        >
          ← Arsenal
        </button>
        <span className="text-sm font-semibold text-ui-primary/80 font-mono">
          INCARNON — {channel.toUpperCase()}
        </span>
      </header>

      {/* Perfil activo */}
      <div className="flex gap-2">
        {(['base', 'incarnon_form'] as const).map(profile => (
          <button
            key={profile}
            data-active={currentProfile === profile ? '' : undefined}
            onClick={() => setActiveProfile(channel, profile)}
            className="px-3 py-1 text-xs border border-ui-primary/20 hover:border-ui-primary/40 transition-colors data-[active]:border-ui-accent/50 data-[active]:text-ui-accent"
          >
            {profile === 'base' ? 'Normal' : 'Incarnon Form'}
          </button>
        ))}
      </div>

      {/* Tiers de evolución */}
      <div className="flex flex-col gap-3 overflow-y-auto">
        {Object.entries(entry.evolutions).map(([tier, perks]) => (
          <div key={tier} className="border border-ui-primary/10 p-3">
            <div className="text-[10px] text-ui-primary/40 font-mono mb-2">
              EVOLUTION {tier}
            </div>
            <div className="flex flex-col gap-1">
              {Object.entries(perks).map(([perkId, upgrades]) => {
                const tierNum = Number(tier);
                const isSelected = currentPerks[tierNum] === perkId;
                const effectSummary = upgrades.stats
                  .map(u => u.upgrade_type
                    ? `${u.upgrade_type}${typeof u.base_value === 'number' ? ` ${u.base_value}` : ''}`
                    : u.label)
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <button
                    key={perkId}
                    data-active={isSelected ? '' : undefined}
                    onClick={() => setEvolutionPerk(channel, tierNum, isSelected ? null : perkId)}
                    className="text-left px-3 py-2 border border-transparent hover:border-ui-primary/20 transition-colors data-[active]:border-ui-accent/30 data-[active]:bg-ui-accent/5"
                  >
                    <div className="text-xs text-ui-primary/80 font-medium">
                      {perkId.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[10px] text-ui-primary/40 mt-0.5">
                      {effectSummary}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
