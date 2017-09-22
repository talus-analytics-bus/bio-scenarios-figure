(() => {
	App.initHome = () => {
		const data = [
			{
				name: 'Type',
				values: ['Human', 'Animal', 'Zoonotic'],
			},
			{
				name: 'Spread Modality',
				values: ['Contagious', 'Non-contagious'],
			},
			{
				name: 'Route of Transmission',
				values: ['Airborne', 'Waterborne', 'Foodborne', 'Bloodborne'],
			},
			{
				name: 'Origin',
				values: ['Natural', 'Accidental', 'Deliberate'],
			},
			{
				name: 'Medical Countermeasures',
				values: ['Antivirals', 'Antibiotics', 'Vaccine', 'Post-exposure Prophylaxis'],
			},
			/*{
				name: 'Outbreak Location',
				values: ['Permissive', 'Non-permissive', 'Unstable', 'State controlled with access', 'State controlled without access'],
			},*/
		];

		App.buildForceDiagram('.network-map', data);


		// populate dropdowns
		$('select').multiselect({
			includeSelectAllOption: true,
		});
	};
})();
