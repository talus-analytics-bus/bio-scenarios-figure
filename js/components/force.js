(() => {
	App.buildForceDiagram = (selector, nodeData, edgeData, param = {}) => {
		const width = param.width || 1000;
		const height = param.height || 500;

		const network = d3.select(selector).append('svg')
			.attr('width', width)
			.attr('height', height);
		const simulation = d3.forceSimulation()
			.velocityDecay(param.velocityDecay || 0.2)
			.force('link', d3.forceLink().id(d => d.id))
			.force('charge', d3.forceManyBody().strength(-2))
			.force('center', d3.forceCenter(width / 2, height / 2));

		const radiusScale = d3.scaleLinear()
			.domain([0, 10])
			.range([5, 20]);
		const colorScale = d3.scaleLinear()
			.domain([0, 50])
			.range(['#082b84', '#c91414']);

		// prepare data (nodes and edges)


		// draw nodes and links
		const link = network.append('g')
			.attr('class', 'links')
			.selectAll('.link')
				.data(edgeData)
				.enter().append('line')
					.attr('class', 'link');
		const node = network.append('g')
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
