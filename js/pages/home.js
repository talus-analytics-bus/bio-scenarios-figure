(() => {
	App.initHome = () => {
		const data = [
			/*{
				name: 'Type',
				values: ['Human', 'Animal', 'Zoonotic'],
			},*/
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
			/*{
				name: 'Diagnostics',
				values: ['Point of Care', 'BSL1', 'BSL2', 'BSL3', 'BSL4'],
			},
			{
				name: 'Morbidity',
				values: ['Low', 'Medium', 'Severe', 'Short-term', 'Long-term'],
			},*/
		];

		App.buildForceDiagram('.network-map', data);


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
