(() => {
	App.initHome = () => {
		const data = [
			{
				name: 'Spread Modality',
				values: ['Communicable', 'Non-communicable'],
			},
			{
				name: 'Route of Transmission',
				values: ['Airborne', 'Waterborne', 'Foodborne', 'Bloodborne', 'Vector-borne'],
			},
			{
				name: 'Origin',
				values: ['Natural', 'Accidental', 'Deliberate'],
			},
			{
				name: 'Medical Countermeasures',
				values: ['Antivirals', 'Antibiotics', 'Vaccine', 'Post-exposure Prophylaxis', 'None'],
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
				values: ['All', 'Pregnant Women', 'Children', 'Elderly', 'Targeted'],
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

				return isSelected ? 'url(#arc-gradient)' : 'url(#arc-gradient-empty)';
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

		// create map legend
		const barHeight = 16;
		const barWidth = 300;
		const legendContainer = d3.select('.network-map-legend').append('svg')
			.attr('width', 800)
			.attr('height', barHeight + 75)
		const legend = legendContainer.append('g')
			.attr('transform', `translate(40, 40)`);

		const defs = legendContainer.append('defs');
		const legendGrad = defs.append('linearGradient')
			.attr('id', 'legend-gradient')
			.attr('x1', '0%')
			.attr('x2', '100%')
			.attr('y1', '0%')
			.attr('y2', '0%');
		legendGrad.append('stop')
			.attr('stop-color', '#c91414')
			.attr('offset', '0%');
		legendGrad.append('stop')
			.attr('stop-color', '#082b84')
			.attr('offset', '100%');

		legend.append('rect')
			.attr('class', 'legend-bar')
			.attr('width', barWidth)
			.attr('height', barHeight)
			.style('opacity', 0.75)
			.style('fill', 'url(#legend-gradient)');
		legend.append('text')
			.attr('class', 'legend-text')
			.attr('y', barHeight + 12)
			.attr('dy', '.35em')
			.text('Human');
		legend.append('text')
			.attr('class', 'legend-text')
			.attr('x', barWidth / 2)
			.attr('y', barHeight + 12)
			.attr('dy', '.35em')
			.text('Zoonotic');
		legend.append('text')
			.attr('class', 'legend-text')
			.attr('x', barWidth)
			.attr('y', barHeight + 12)
			.attr('dy', '.35em')
			.text('Animal');

		const circleLegend = legend.append('g')
			.attr('transform', `translate(${barWidth + 200}, ${barHeight})`);
		circleLegend.append('circle')
			.attr('cx', 5)
			.attr('r', 5)
			.attr('fill', '#681f4c');
		circleLegend.append('circle')
			.attr('cx', 130)
			.attr('r', 20)
			.attr('fill', '#681f4c');
		circleLegend.append('circle')
			.attr('cx', 40)
			.attr('r', 10)
			.attr('fill', '#681f4c');
		circleLegend.append('circle')
			.attr('cx', 80)
			.attr('r', 15)
			.attr('fill', '#681f4c');
		circleLegend.append('text')
			.attr('class', 'legend-text')
			.attr('x', -23)
			.attr('y', -9)
			.attr('dy', '.35em')
			.style('text-anchor', 'end')
			.text('Less');
		circleLegend.append('text')
			.attr('class', 'legend-text')
			.attr('x', -23)
			.attr('y', 10)
			.attr('dy', '.35em')
			.style('text-anchor', 'end')
			.text('Fatalities');
		circleLegend.append('text')
			.attr('class', 'legend-text')
			.attr('x', 170)
			.attr('y', -9)
			.attr('dy', '.35em')
			.style('text-anchor', 'start')
			.text('More');
		circleLegend.append('text')
			.attr('class', 'legend-text')
			.attr('x', 170)
			.attr('y', 10)
			.attr('dy', '.35em')
			.style('text-anchor', 'start')
			.text('Fatalities');
	};
})();
