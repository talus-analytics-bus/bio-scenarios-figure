(() => {
	App.initHome = () => {
		const data = [
			{
				name: 'Spread Modality',
				values: ['Communicable', 'Non-communicable'],
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
			{
				name: 'Outbreak Location',
				values: ['Permissive', 'Non-permissive', 'Unstable', 'State controlled with access', 'State controlled without access'],
			},
			{
				name: 'Response Level',
				values: ['Local', 'Intermediate', 'National', 'Regional', 'Global'],
			},
			{
				name: 'Policy Measures',
				values: ['National', 'International', 'None'],
			},
		];

		const extraData = [
			{
				name: 'Diagnostics',
				values: ['Point of Care', 'BSL1', 'BSL2', 'BSL3', 'BSL4'],
			},
			{
				name: 'Morbidity',
				values: ['Low', 'Medium', 'Severe', 'Short-term', 'Long-term'],
			},
			{
				name: 'Populations Affected',
				values: ['All', 'Pregnant Women', 'Children', 'Elderly', 'Able-Bodied', 'Targeted (work done by some state programs to target race)'],
			},
			{
				name: 'Personal Protective Equipment',
				values: ['Mask, Gloves, Gown', 'Respirator', 'Containment Suit'],
			},
			{
				name: 'Fatality Rates',
				values: ['Very Low', 'Low', 'Medium', 'High', 'Very High'],
			},
			{
				name: 'Stakeholders',
				values: ['Medical and Public Health', 'Law Enforcement', 'Logistics', 'Security/Military', 'Trade'],
			}
		];

		App.buildForceDiagram('.network-map', data, extraData);


		// populate dropdowns
		$('select').multiselect({
			//includeSelectAllOption: true,
			numberDisplayed: 0,
			onChange: updateDisplay,
			onSelectAll: updateDisplay,
			onDeselectAll: updateDisplay,
		});

		function updateDisplay() {
			d3.selectAll('.arc').style('fill', (d) => {
				let isSelected = false;

				d3.selectAll('select').each(function() {
					const parameter = $(this).attr('name');
					const values = $(this).val();
					if (values.includes(d.value)) isSelected = true;
				});

				return isSelected ? 'steelblue' : '#bbb';
			});

			d3.selectAll('.node')
				.filter(d => d.parent)
				.style('display', (d) => {
					let isSelected = true;

					d3.selectAll('select').each(function() {
						const parameter = $(this).attr('name');
						const values = $(this).val();
						const obj = d.data.links.find(l => l.parameter === parameter);
						if (!values.includes(obj.value)) isSelected = false;
					});

					// toggle ribbons first
					d3.selectAll('.ribbon')
						.filter(r => r.source.data.id === d.data.id)
						.style('display', isSelected ? 'inline' : 'none');


					return isSelected ? 'inline' : 'none';
				});
		}
	};
})();
