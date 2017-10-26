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
				name: 'Event Origin',
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
				name: 'Morbidity Rate',
				values: ['Low', 'Medium', 'Severe', 'Short-term', 'Long-term'],
			},
			{
				name: 'Population Affected',
				values: ['All', 'Pregnant Women', 'Children', 'Elderly', 'Targeted Attack2'],
			},
			{
				name: 'Personal Protective Equipment',
				values: ['Mask, Gloves, Gown', 'Respirator', 'Containment Suit'],
			},
			{
				name: 'Fatality Rate',
				values: ['Very Low', 'Low', 'Medium', 'High', 'Very High'],
			},
			{
				name: 'Stakeholders',
				values: ['Medical and Public Health', 'Law Enforcement', 'Logistics', 'Security/Military', 'Trade'],
			}
		];

		const chart = App.buildForceDiagram('.network-map', data, extraData);


		// populate dropdowns
		$('select').multiselect({
			//includeSelectAllOption: true,
			numberDisplayed: 0,
			onChange: updateDisplay,
			onSelectAll: updateDisplay,
			onDeselectAll: updateDisplay,
		});

		let threshold = 0.015;

		function updateDisplay() {
			NProgress.start();
			d3.selectAll('.arc').style('fill', function(d) {
				let isSelected = false;

				d3.selectAll('select').each(function() {
					const parameter = $(this).attr('name');
					const values = $(this).val();
					if (d.parameter === parameter && values.includes(d.value)) isSelected = true;
				});

				isSelected ? $(this).addClass('active') : $(this).removeClass('active');
				return isSelected ? 'url(#arc-gradient)' : 'url(#arc-gradient-empty)';
			});

			// build blacklist
			const blacklist = {};
			d3.selectAll('select').each(function() {
				const parameter = $(this).attr('name');
				const unselectedVals = [];
				$(this).find('option:not(:selected)').each(function() {
					unselectedVals.push($(this).val());
				});
				if (unselectedVals.length) blacklist[parameter] = unselectedVals;
			});

			// update nodes
			d3.selectAll('.node-g-container, .ribbon-g-container').remove();
			const nodeData = chart.getNodeData(data, 50, blacklist);
			chart.createNodePack(nodeData);

			const numNodesShowing = $('.node').length;
			$('.no-scenario-text').css('display', numNodesShowing > 1 ? 'none' : 'inline');

			NProgress.done();
		}

		// arc click toggles parameter
		d3.selectAll('.arc').on('click', function(d) {
			const $select = $(`select[name="${d.parameter}"]`);
			const numOptions = $select.find('option').length;

			if ($select.val().length === numOptions) {
				$select
					.multiselect('deselectAll', false)
					.multiselect('select', d.value);
			} else {
				const $arc = $(this);
				const isActive = $arc.hasClass('active');
				const verb = isActive ? 'deselect' : 'select';
				$select.multiselect(verb, d.value);
			}
			$select.multiselect('refresh');
			updateDisplay();
		});

		// shuffle button
		$('.shuffle-button').click(updateDisplay);

		// reset button
		$('.reset-button').click(() => {
			$('select')
				.multiselect('selectAll', false)
				.multiselect('refresh');
			updateDisplay();
		});

		// show more button rows
		$('.show-more-filters-button').click(() => {
			$('.extra-dropdown-row').slideDown();
			$('.show-more-filters-button').slideUp();
		});
		$('.show-more-description-button').click(() => {
			$('.extra-description').slideDown();
			$('.show-more-description-button').slideUp();
		});

		// create map legend
		const barHeight = 16;
		const barWidth = 300;
		const legendContainer = d3.select('.network-map-legend').append('svg')
			.attr('width', 800)
			.attr('height', barHeight + 75)
		const legend = legendContainer.append('g')
			.attr('transform', `translate(40, 45)`);

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
			.text('Fewer');
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
		circleLegend.append('text')
			.attr('class', 'legend-text')
			.attr('x', 72)
			.attr('y', -32)
			.style('text-anchor', 'middle')
			.text('Biological Event');
	};
})();
