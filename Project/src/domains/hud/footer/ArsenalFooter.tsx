const ArsenalFooter = () => {
	const active_channel_count = 0; // Stub
	const label = `Arsenal / ${active_channel_count} canales activos`;

	return (
		<div className="text-[11px] uppercase tracking-widest text-ui-primary/75">
			{label}
		</div>
	);
};

export default ArsenalFooter;
