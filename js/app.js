const App = {};

(() => {
	App.initialize = () => {

	};

	App.getRandomFromArray = (array, numElements) => {
		const len = array.length;
		if (numElements >= len) return array;
		const inds = [];

		// include big guys
		array.forEach((v, i) => {
			if (v.size >= 5000) inds.push(i);
		});

		while (inds.length < numElements) {
			const index = Math.floor(len * Math.random());
			if (!inds.includes(index)) inds.push(index);
		}
		return inds.map(i => array[i]);
	};
	

	/* ------------------ Vendor Defaults ------------------- */
	// tooltipster defaults
	$.tooltipster.setDefaults({
		contentAsHTML: true,
		trigger: 'hover',
		offset: [5, -25],
		theme: 'tooltipster-shadow',
		maxWidth: 320,
	});

	// noty defaults
	$.noty.defaults.type = 'warning';
	$.noty.defaults.layout = 'center';
	$.noty.defaults.timeout = 2000;
})();
