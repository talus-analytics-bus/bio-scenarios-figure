(() => {
	App.initHome = () => {
		const data = [
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
			},
			{
				name: 'Personal Protective Equipment',
				values: ['Mask, Gloves, Gown', 'Respirator', 'Containment Suit'],
			},
			{
				name: 'Policy Measures',
				values: ['National', 'International', 'None'],
			},
			{
				name: 'Stakeholders',
				values: ['Medical and Public Health', 'Law Enforcement', 'Logistics', 'Trade'],
			},
			{
				name: 'Diagnostics',
				values: ['Point of Care', 'BSL1', 'BSL2', 'BSL3', 'BSL4'],
			},
			{
				name: 'Morbidity',
				values: ['Low', 'Medium', 'Severe', 'Short-term', 'Long-term'],
			},
			{
				name: 'Response Level',
				values: ['Local', 'Intermediate', 'National', 'Regional', 'Global'],
			},
			{
				name: 'Affected Population',
				values: ['All', 'Pregnant Women', 'Children', 'Elderly', 'Able-bodied'],
			},*/
		];

		App.buildForceDiagram('.network-map', data);


		// populate dropdowns
		$('select').multiselect({
			includeSelectAllOption: true,
		});
	};
})();
