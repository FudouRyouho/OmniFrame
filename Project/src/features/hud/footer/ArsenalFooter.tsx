import { useLoadout } from "@providers/Loadout/loadout-context";

const ArsenalFooter = () => {
	const { activeChannelCount, isLoading, error } = useLoadout();

	let label = `Arsenal / ${activeChannelCount} canales activos`;
	if (isLoading) {
		label = "Arsenal / cargando datasets";
	}
	if (error) {
		label = "Arsenal / error de carga";
	}

	return (
		<div className="text-[11px] uppercase tracking-widest text-ui-primary/75">
			{label}
		</div>
	);
};

export default ArsenalFooter;
