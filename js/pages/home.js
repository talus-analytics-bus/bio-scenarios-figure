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
			//includeSelectAllOption: true,
			numberDisplayed: 0,
			onChange: (option, selected) => {
				const val = option.val();
				let parameter = '';
				for (let k = 0; k < data.length; k++) {
					if (data[k].values.includes(val)) {
						parameter = data[k].name;
						break;
					}
				}

				d3.selectAll('.arc')
					.filter(d => d.value === val)
					.style('fill', selected ? 'steelblue' : '#bbb');
				d3.selectAll('.node')
					.filter((d) => {
						if (!d.parent) return false;
						const obj = d.data.links.find(l => l.parameter === parameter);
						return (obj && obj.value === val);
					})
					.style('display', selected ? 'inline' : 'none')
					.each((d) => {
						d3.selectAll('.ribbon')
							.filter(r => r.source.data.id === d.data.id)
							.style('display', selected ? 'inline' : 'none');
					});
			},
			onSelectAll: updateDisplay,
			onDeselectAll: updateDisplay,
		});

		function updateDisplay() {
			
		}
	};
})();
