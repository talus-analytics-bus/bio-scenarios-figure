(() => {
	App.buildForceDiagram = (selector, nodeData, edgeData, param = {}) => {
		const margin = { top: 20, right: 20, bottom: 20, left: 20 };
		const outerRadius = 250;
		const innerRadius = outerRadius - 15;
		const width = 2 * outerRadius;
		const height = 2 * outerRadius;

		const chart = d3.select(selector).append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
				.attr('transform', `translate(${outerRadius + margin.left}, ${outerRadius + margin.top})`);
		const ribbonG = chart.append('g');
		const chordG = chart.append('g');
		const nodeG = chart.append('g');


		/* --------- Chord Part --------- */
		// establish chord stuff
		const chord = d3.chord()
			.padAngle(0.05);
		const arc = d3.arc()
			.innerRadius(innerRadius)
			.outerRadius(outerRadius);
		const chordColorScale = d3.scaleOrdinal(['#082b84', '#ff6d00']);

		const matrix = [
			[11975,  5871, 8916, 2868],
			[ 1951, 10048, 2060, 6171],
			[ 8010, 16145, 8090, 8045],
			[ 1013,   990,  940, 6907],
		];

		chordG.datum(chord(matrix));
		const chordGroups = chordG.append('g')
			.attr('class', 'groups')
			.selectAll('g')
				.data(d => d.groups)
				.enter().append('g');
		chordGroups.append('path')
			.style('fill', (d, i) => chordColorScale(i))
			.attr('d', arc);


		/* --------- Force Part --------- */
		const simulation = d3.forceSimulation()
			.velocityDecay(param.velocityDecay || 0.2)
			.force('link', d3.forceLink().id(d => d.id))
			.force('charge', d3.forceManyBody().strength(-3))
			.force('center', d3.forceCenter(0, 0));

		// establish scales
		const radiusScale = d3.scaleLinear()
			.domain([0, 10])
			.range([5, 22]);
		const colorScale = d3.scaleLinear()
			.domain([0, 50])
			.range(['#082b84', '#c91414']);

		// draw nodes and links
		const link = nodeG.append('g')
			.attr('class', 'links')
			.selectAll('.link')
				.data(edgeData)
				.enter().append('line')
					.attr('class', 'link');
		const node = nodeG.append('g')
			.attr('class', 'nodes')
			.selectAll('.node')
				.data(nodeData)
				.enter().append('circle')
					.attr('class', 'node')
					.attr('r', d => radiusScale(d.extremity))
					.style('fill', (d, i) => colorScale(i))
					.each(function addTooltip(d) {
						$(this).tooltipster({
							trigger: 'hover',
							content: d.id,
						});
					})
					.on('mouseover', (d) => {
						d3.selectAll('.ribbon')
							.filter(dd => dd.id === d.id)
							.classed('active', true);
					})
					.on('mouseout', (d) => {
						d3.selectAll('.ribbon').classed('active', false);
					});

		// start simulation
		const numTicks = 50;
		let t = 0;
		simulation
			.nodes(nodeData)
			.on('tick', () => {
				link
					.attr('x1', d => getConfinedX(d.source.x, d.source.y))
					.attr('y1', d => getConfinedY(d.source.x, d.source.y))
					.attr('x2', d => getConfinedX(d.target.x, d.target.y))
					.attr('y2', d => getConfinedY(d.target.x, d.target.y));
				node
					.attr('cx', d => getConfinedX(d.x, d.y))
					.attr('cy', d => getConfinedY(d.x, d.y));

				d3.selectAll('.ribbon')
					.attr('d', ribbon);

				// stop simulation if number of ticks has been exceeded
				t++;
				if (t === numTicks) simulation.stop();
			});
		simulation.force('link').links(edgeData);

		// draw ribbons between nodes and chords
		const ribbon = d3.ribbon()
			.source(d => {
				const x = getConfinedX(d.x, d.y);
				const y = getConfinedY(d.x, d.y);
				const dist = Math.sqrt(x * x + y * y);
				const angle = (Math.PI / 2) - Math.atan2(-y, x);
				return {
					startAngle: angle,
					endAngle: angle,
					radius: dist,
				};
			})
			.target(d => {
				const angle = 2 * Math.PI * Math.random();
				return {
					startAngle: angle,
					endAngle: angle + 0.1,
					radius: innerRadius,
				};
			});

		ribbonG.append('g')
			.attr('class', 'ribbons')
			.selectAll('.ribbon')
				.data(nodeData)
				.enter().append('path')
					.attr('class', 'ribbon')
					.attr('d', ribbon)
					.style('fill', 'lightsteelblue')
					.style('stroke', 'rgba(0,0,0,0.5)');


		function getConfinedX(x, y) {
			const x1 = x - outerRadius;
			const y1 = y - outerRadius;
			const dist = Math.sqrt(x1 * x1 + y1 * y1);
			const confinedRadius = innerRadius - 30;
			if (dist < confinedRadius) return x;
			if (x1 > 0) return x - 10;
			return x + 10;
		}

		function getConfinedY(x, y) {
			const x1 = x - outerRadius;
			const y1 = y - outerRadius;
			const dist = Math.sqrt(x1 * x1 + y1 * y1);
			const confinedRadius = innerRadius - 30;
			if (dist < confinedRadius) return y;
			if (y1 > 0) return y - 10;
			return y + 10;
		}
	};
})();
