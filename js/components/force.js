(() => {
	App.buildForceDiagram = (selector, data, param = {}) => {
		const margin = { top: 50, right: 150, bottom: 50, left: 150 };
		const outerRadius = 250;
		const innerRadius = outerRadius - 20;
		const width = 2 * outerRadius;
		const height = 2 * outerRadius;

		const chartContainer = d3.select(selector).append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
		const chart = chartContainer.append('g')
			.attr('transform', `translate(${outerRadius + margin.left}, ${outerRadius + margin.top})`);

		// add glow definition
		const defs = chartContainer.append('defs');
		const filter = defs.append('filter')
			.attr('id', 'glow');
		filter.append("feGaussianBlur")
			.attr("stdDeviation","3.5")
			.attr("result","coloredBlur");
		var feMerge = filter.append("feMerge");
		feMerge.append("feMergeNode")
			.attr("in","coloredBlur");
		feMerge.append("feMergeNode")
			.attr("in","SourceGraphic");

		// add different groups
		const ribbonG = chart.append('g');
		const arcG = chart.append('g');
		const nodeG = chart.append('g');


		/* --------- Data Section --------- */
		// calculate sum of values of all parameters
		const numTotalValues = d3.sum(data, d => d.values.length);

		// assign start and end angle to arcs
		const arcData = [];
		const arcPadding = 0.05;
		let runningTheta = 0;
		data.forEach((d) => {
			const totalTheta = 2 * Math.PI * (d.values.length / numTotalValues);
			let dtheta = totalTheta - 2 * arcPadding;
			if (dtheta < 0) dtheta = 0;

			d.values.forEach((v, i) => {
				const theta0 = runningTheta + arcPadding;
				arcData.push({
					parameter: d.name,
					value: v,
					index: i,
					theta0: theta0 + (i * dtheta / d.values.length),
					theta1: theta0 + ((i + 1) * dtheta / d.values.length),
				});
			});

			d.theta0 = runningTheta;
			runningTheta += totalTheta;
			d.theta1 = runningTheta;
			d.avgTheta = (d.theta1 + d.theta0) / 2;
		});


		/* --------- Arc Section --------- */
		const arc = d3.arc()
			.innerRadius(innerRadius)
			.outerRadius(outerRadius)
			.padAngle(0)
			.startAngle(d => d.theta0)
			.endAngle(d => d.theta1);

		const arcColorScale = d3.scaleOrdinal()
			.range(['#f7fbff', '#e1e8f1', '#cbd6e4', '#b5c3d6', '#a0b1c9', '#8a9ebb',
				'#748cae', '#5e79a0', '#496793', '#335485', '#1d4278', '#08306b'].reverse());

		arcG.selectAll('.arc')
			.data(arcData)
			.enter().append('path')
				.attr('class', 'arc')
				.attr('d', arc)
				.style('fill', d => arcColorScale(d.index))
				.each(function addTooltip(d) {
					$(this).tooltipster({
						trigger: 'hover',
						contentAsHTML: true,
						content: `<b>${d.parameter}:</b> ${d.value}`,
					});
				});
		arcG.selectAll('.arc-label')
			.data(data)
			.enter().append('text')
				.attr('class', 'arc-label')
				.attr('x', d => (outerRadius + 5) * Math.sin(d.avgTheta))
				.attr('y', d => (outerRadius + 5) * -Math.cos(d.avgTheta))
				.style('text-anchor', (d) => {
					if (d.avgTheta > (Math.PI / 8) && d.avgTheta < (7 * Math.PI / 8)) return 'start';
					if (d.avgTheta > (9 * Math.PI / 8) && d.avgTheta < (15 * Math.PI / 8)) return 'end';
					return 'middle';
				})
				.text(d => d.name);


		/* --------- Force Part --------- */
		function createNodePack(nodeData, center, nodeColor) {
			// start drawing the node pack
			const size = 300;
			const pack = d3.pack()
				.size([size, size])
				.padding(2);

			const offsetX = center[0] - size / 2;
			const offsetY = center[1] - size / 2;

			const root = d3.hierarchy(nodeData)
				.sum(d => d.size)
				.sort((a, b) => b.value - a.value);

			let focus = root;
			const nodePackData = pack(root).descendants();

			const nodeContainer = nodeG.append('g')
				.attr('transform', `translate(${offsetX}, ${offsetY})`);

			const nodes = nodeContainer.selectAll('g')
				.data(nodePackData)
				.enter().append('g')
					.attr('transform', d => `translate(${d.x}, ${d.y})`)
					.each(function(d) { d.node = this; });

			nodes.append('circle')
				.attr("class", (d) => {
					return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
				})
				.attr('r', d => d.r)
				.filter(d => d.parent)
					.style('fill', nodeColor)
					.style('filter', 'url(#glow)')
					.each(function(d) {
						const contentContainer = d3.select(document.createElement('div'));
						const content = contentContainer.append('div');
						const contentTitle = content.append('div')
							.attr('class', 'tooltip-title')
							.text(d.data.id);
						let textClass = 'text-success';
						if (d.data.size >= 8) textClass = 'text-danger';
						else if (d.data.size >= 5) textClass = 'text-warning';
						content.append('div')
							.attr('class', 'tooltip-line')
							.html(`<b>Extremity:</b> <b class="${textClass}">${d.data.size} out of 10</b>`);
						d.data.links.forEach((l) => {
							content.append('div')
								.attr('class', 'tooltip-line')
								.html(`<b>${l.parameter}:</b> ${l.value}`);
						});

						$(this).tooltipster({
							trigger: 'hover',
							contentAsHTML: true,
							minWidth: 300,
							content: contentContainer.html(),
						})
					});
					/*.on('mouseover', function onMouseover(d) {
						d3.selectAll('.ribbon').style('opacity', (rd) => {
							return rd.data.id === d.data.id ? 0.8 : 0.1;
						});
					})
					.on('mouseout', function onMouseout() {
						d3.selectAll('.ribbon').style('opacity', 0.5);
					});*/

			// make ribbon data
			const ribbonData = [];
			nodePackData.filter(d => d.parent).forEach((d) => {
				d.data.links.forEach((label) => {
					ribbonData.push({
						source: Object.assign({}, d),
						target: label,
					});
				});
			});

			// draw ribbons between nodes and chords
			const ribbon = d3.ribbon()
				.source((d) => {
					const x = offsetX + d.source.x;
					const y = offsetY + d.source.y;
					const dist = Math.sqrt(x * x + y * y);
					const angle = (Math.PI / 2) - Math.atan2(-y, x);
					return {
						startAngle: angle,
						endAngle: angle,
						radius: dist,
					};
				})
				.target((d) => {
					const arc = chart.selectAll('.arc')
						.filter((a) => {
							return a.parameter === d.target.parameter && a.value === d.target.value;
						})
						.data()[0];
					return {
						startAngle: arc.theta0,
						endAngle: arc.theta1,
						radius: innerRadius,
					};
				});

			ribbonG.append('g').selectAll('.ribbon')
				.data(ribbonData)
				.enter().append('path')
					.attr('class', 'ribbon')
					.attr('d', ribbon)
					.style('fill', 'none')
					.style('opacity', 0.01);
		}

		// create node data
		const nodeData = {
			name: 'background',
			children: []
		};
		const indexArray = data.map(d => 0);
		let nodeNum = 0;

		function loopIndexAndAdd(indexToLoop, numTimes) {
			for (let i = 0; i < numTimes; i++) {
				indexArray[indexToLoop] = i;
				if (indexToLoop === indexArray.length - 1) {
					const node = {
						id: `Scenario ${nodeNum}`,
						size: Math.ceil(10 * Math.random()),
						links: [],
					};
					const ia = indexArray.slice(0);
					ia.forEach((valueIndex, j) => {
						const parameter = data[j].name;
						const value = data[j].values[valueIndex];
						node.links.push({ parameter, value });
					});
					nodeData.children.push(node);
					nodeNum++;
				} else {
					loopIndexAndAdd(indexToLoop + 1, data[indexToLoop + 1].values.length);
				}
			}
		}
		loopIndexAndAdd(0, data[0].values.length);

		// create packs
		/*createNodePack(nodeData, [120, 0], "#082B84");
		createNodePack(nodeData, [-20, 100], "#C91414");
		createNodePack(nodeData, [-80, -80], "#552257");*/
		createNodePack(nodeData, [0, 0], '#c91414');
	};
})();
