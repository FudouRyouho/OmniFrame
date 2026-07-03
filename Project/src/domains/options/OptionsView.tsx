import ThemeSelector from "@providers/Theme/ThemeSelector";

/**
 * OptionsView — configuración de la aplicación.
 */

  const OptionsView = () => {
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
