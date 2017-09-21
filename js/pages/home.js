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
				name: 'Affected Population',
				values: ['All', 'Pregnant Women', 'Children', 'Elderly', 'Able-bodied'],
			},
			{
				name: 'Medical Countermeasures',
				values: ['Antivirals', 'Antibiotics', 'Vaccine', 'Post-exposure Prophylaxis'],
			},
			/*{
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
				name: 'Event Location',
				values: ['Permissive', 'Non-permissive', 'Unstable', 'State controlled with access', 'State controlled without access'],
			},
			/*{
				name: 'Natural, Intentional, Accidental Origin',
				values: ['Natural', 'Accidental', 'Deliberate'],
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
			},*/
		];

		App.buildForceDiagram('.network-map', data);
	};
})();
