import { useState, useEffect } from "react";
import { db } from "@lib/db";
import ThemeSelector from "@providers/Theme/ThemeSelector";

/**
 * OptionsView — configuración de la aplicación.
 *
 * Placeholder para configuraciones futuras. Por ahora solo maneja IndexedDB.
 */
const OptionsView = () => {
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    calculateCacheSize();
  }, []);

  const calculateCacheSize = async () => {
    try {
      const counts = await Promise.all([
        db.warframes.count(),
        db.weapons.count(),
        db.mods.count(),
        db.arcanes.count(),
        db.companions.count(),
        db.vehicles.count(),
        db.archwingWeapons.count(),
      ]);
      setCacheSize(counts.reduce((a, b) => a + b, 0));
    } catch (err) {
      console.error("Error calculating cache size:", err);
    }
  };

  const clearCache = async () => {
    setIsClearing(true);
    try {
      await db.warframes.clear();
      await db.weapons.clear();
      await db.mods.clear();
      await db.arcanes.clear();
      await db.companions.clear();
      await db.vehicles.clear();
      await db.archwingWeapons.clear();
      await db.metadata.clear();
      setCacheSize(0);
      console.log("[Options] Cache cleared successfully");
    } catch (err) {
      console.error("[Options] Error clearing cache:", err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl text-ui-accent uppercase tracking-wider">Options</h1>
            <p className="text-sm text-ui-primary/70 mt-1">
              Configure application settings
            </p>
          </div>
          <ThemeSelector/>

          {/* IndexedDB Section */}
          <section className="border border-ui-primary/20 p-4">
            <h2 className="text-lg text-ui-accent uppercase tracking-wide mb-4">
              Data Cache (IndexedDB)
            </h2>

            <div className="space-y-4">
              {/* Cache Status */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-ui-primary">Cache Status</div>
                  <div className="text-xs text-ui-primary/50 mt-1">
                    Persistent storage for offline access
                  </div>
                </div>
                <div className="text-ui-accent">
                  {cacheSize > 0 ? "Active" : "Empty"}
                </div>
              </div>

              {/* Cache Size */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-ui-primary">Cached Items</div>
                  <div className="text-xs text-ui-primary/50 mt-1">
                    Total items stored locally
                  </div>
                </div>
                <div className="text-ui-primary/70">
                  {cacheSize.toLocaleString()}
                </div>
              </div>

              {/* Clear Cache Button */}
              <div className="pt-2 border-t border-ui-primary/10">
                <button
                  onClick={clearCache}
                  disabled={isClearing || cacheSize === 0}
                  className="w-full px-4 py-2 border border-ui-primary/40 hover:border-ui-accent hover:bg-ui-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm uppercase tracking-wide"
                >
                  {isClearing ? "Clearing..." : "Clear Cache"}
                </button>
                <p className="text-xs text-ui-primary/50 mt-2">
                  Clears all cached data. Next load will fetch from JSON files.
                </p>
              </div>
            </div>
          </section>

          {/* Future Sections Placeholder */}
          <section className="border border-ui-primary/20 p-4 opacity-50">
            <h2 className="text-lg text-ui-accent uppercase tracking-wide mb-4">
              Display Settings
            </h2>
            <p className="text-sm text-ui-primary/50">Coming soon...</p>
          </section>

          <section className="border border-ui-primary/20 p-4 opacity-50">
            <h2 className="text-lg text-ui-accent uppercase tracking-wide mb-4">
              Locale & Language
            </h2>
            <p className="text-sm text-ui-primary/50">Coming soon...</p>
          </section>
          
        </div>
      </div>
    </div>
  );
};

export default OptionsView;
