(() => {
	App.buildForceDiagram = (selector, nodeData, edgeData, param = {}) => {
		const margin = { top: 20, right: 20, bottom: 20, left: 20 };
		const outerRadius = 200;
		const innerRadius = outerRadius - 15;
		const width = 2 * outerRadius;
		const height = 2 * outerRadius;

		const chart = d3.select(selector).append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
				.attr('transform', `translate(${margin.left}, ${margin.top})`);


		/* --------- Chord Part --------- */
		// establish chord stuff
		const chord = d3.chord()
			.padAngle(0.05);
		const arc = d3.arc()
			.innerRadius(innerRadius)
			.outerRadius(outerRadius);
		const ribbon = d3.ribbon()
			.radius(innerRadius);

		const matrix = [
			[11975,  5871, 8916, 2868],
			[ 1951, 10048, 2060, 6171],
			[ 8010, 16145, 8090, 8045],
			[ 1013,   990,  940, 6907],
		];

		const chordG = chart.append('g')
			.attr('transform', `translate(${outerRadius}, ${outerRadius})`)
			.datum(chord(matrix));
		const chordGroups = chordG.append('g')
			.attr('class', 'groups')
			.selectAll('g')
				.data(d => d.groups)
				.enter().append('g');
		chordGroups.append('path')
			.style('fill', 'steelblue')
			.attr('d', arc);

		chordG.append('g')
			.attr('class', 'ribbons')
			.selectAll('path')
				.data(d => d)
				.enter().append('path')
					.attr('d', ribbon)
					.style('fill', 'lightsteelblue')
					.style('stroke', 'rgba(0,0,0,0.5)');


		/* --------- Force Part --------- */
		const simulation = d3.forceSimulation()
			.velocityDecay(param.velocityDecay || 0.2)
			.force('link', d3.forceLink().id(d => d.id))
			.force('charge', d3.forceManyBody().strength(-2))
			.force('center', d3.forceCenter(width / 2, height / 2));

		// establish scales
		const radiusScale = d3.scaleLinear()
			.domain([0, 10])
			.range([5, 20]);
		const colorScale = d3.scaleLinear()
			.domain([0, 50])
			.range(['#082b84', '#c91414']);

		// prepare data (nodes and edges)


		// draw nodes and links
		const link = chart.append('g')
			.attr('class', 'links')
			.selectAll('.link')
				.data(edgeData)
				.enter().append('line')
					.attr('class', 'link');
		const node = chart.append('g')
			.attr('class', 'nodes')
			.selectAll('.node')
				.data(nodeData)
				.enter().append('circle')
					.attr('class', 'node')
					.attr('r', d => radiusScale(d.extremity))
					.style('fill', (d, i) => colorScale(i));

		// start simulation
		const numTicks = 100;
		let t = 0;
		simulation
			.nodes(nodeData)
			.on('tick', () => {
				link.attr('x1', d => d.source.x)
					.attr('y1', d => d.source.y)
					.attr('x2', d => d.target.x)
					.attr('y2', d => d.target.y);
				node.attr('cx', d => d.x)
					.attr('cy', d => d.y);
				t++;
				//if (t === numTicks) simulation.stop();
			});
		simulation.force('link').links(edgeData);
	};
})();
