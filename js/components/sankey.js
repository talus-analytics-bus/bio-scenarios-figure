(() => {
	App.buildSankey = (selector, data, param = {}) => {
		const margin = { top: 20, right: 100, bottom: 20, left: 100 };
		const width = param.width || 960;
		const height = param.height || 500;
		const chart = d3.selectAll(selector).append('svg')
			.classed('sankey-chart', true)
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
				.attr('transform', `translate(${margin.left}, ${margin.top})`);

		const color = d3.scaleOrdinal(d3.schemeCategory10);

		const sankey = d3.sankey()
			.nodeWidth(param.nodeWidth || 30)
			.nodePadding(param.nodePadding || 10)
			.extent([[1, 1], [width - 1, height - 6]]);

		sankey(data);

		// add in links
		chart.append('g').selectAll('path')
			.data(data.links)
			.enter().append('path')
				.attr('class', 'link')
				.attr('d', d3.sankeyLinkHorizontal())
				.style('fill', 'none')
				.style('stroke', 'black')
				.style('stroke-opacity', 0.2)
				.style('stroke-width', d => Math.max(1, d.width));

		// add in nodes
		const nodes = chart.append('g').selectAll('g')
			.data(data.nodes)
			.enter().append('g');
		nodes.append('rect')
			.attr('class', 'node')
			.attr('x', d => d.x0)
			.attr('y', d => d.y0)
			.attr('width', d => d.x1 - d.x0)
			.attr('height', d => d.y1 - d.y0)
			.style('stroke', 'black')
			.style('fill', d => color(d.name));
		nodes.append('text')
			.attr('class', 'node-label')
			.attr('x', d => d.x0 - 6)
			.attr('y', d => (d.y1 + d.y0) / 2)
			.attr('dy', '.35em')
			.text(d => d.name)
			.filter(d => d.x0 < width / 2)
				.attr('x', d => d.x1 + 6)
				.style('text-anchor', 'start');

		return chart;
	};
})();
