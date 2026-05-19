const ItemsDetailsFooter = () => {
  return (
    <>
      <button
        type="button"
        className="px-3 py-1 text-[10px] uppercase tracking-wide border border-ui-primary/35 hover:border-ui-accent hover:text-ui-accent transition-colors"
      >
        Build
      </button>

      <button
        type="button"
        className="px-3 py-1 text-[10px] uppercase tracking-wide border border-ui-primary/35 hover:border-ui-accent hover:text-ui-accent transition-colors"
      >
        Similar
      </button>

      <button
        type="button"
        className="px-3 py-1 text-[10px] uppercase tracking-wide border border-ui-primary/35 hover:border-ui-accent hover:text-ui-accent transition-colors"
      >
        Wiki
      </button>
    </>
  );
};

export default ItemsDetailsFooter;
