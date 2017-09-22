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
						nodeNum,
						size: Math.ceil(10 * Math.random()),
						links: [],
					};
					const ia = indexArray.slice(0);
					ia.forEach((valueIndex, j) => {
						const parameter = data[j].name;
						const value = data[j].values[valueIndex];
						node.links.push({
							parameter,
							value,
							numValues: data[j].values.length,
						});
					});

					// randomize pushing
					const randNum = Math.random();
					if (randNum < 0.2) {
						nodeData.children.push(node);
						nodeNum++;
					}
				} else {
					loopIndexAndAdd(indexToLoop + 1, data[indexToLoop + 1].values.length);
				}
			}
		}
		loopIndexAndAdd(0, data[0].values.length);

		const numNodes = nodeData.children.length;

		// look through node data and add index for arc
		data.forEach((d) => {
			d.values.forEach((v, i) => {
				let arcIndexNum = 0;
				const numForArc = nodeData.children.filter((node) => {
					return node.links.find(l => l.parameter === d.name && l.value === v);
				}).length;
				nodeData.children.forEach((node) => {
					const link = node.links.find(l => l.parameter === d.name && l.value === v);
					if (link) {
						link.numValues = numForArc;
						link.index = arcIndexNum;
						arcIndexNum++;
					}
				});
			});
		});


		// create arc data
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
					numValues: d.values.length,
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

		// greys
		const arcColors2 = ['#bdbdbd', '#636363'];
		const arcColors3 = ['#bbb', '#969696', '#525252'];
		const arcColors4 = ['#bbb', '#969696', '#636363', '#393939'];
		const arcColors5 = ['#d9d9d9', '#bdbdbd', '#969696', '#636363', '#393939'];
		const arcColors6 = ['#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#393939'];

		// blues
		/*const arcColors2 = ['lightsteelblue', 'steelblue'];
		const arcColors3 = ['#deebf7','#9ecae1','#3182bd'];
		const arcColors4 = ['#eff3ff','#bdd7e7','#6baed6','#2171b5'];
		const arcColors5 = ['#eff3ff','#bdd7e7','#6baed6','#3182bd','#08519c'];
		const arcColors6 = ['#eff3ff','#c6dbef','#9ecae1','#6baed6','#3182bd','#08519c'];*/

		const arcColorScales = {};
		arcColorScales[2] = d3.scaleOrdinal().range(arcColors2);
		arcColorScales[3] = d3.scaleOrdinal().range(arcColors3);
		arcColorScales[4] = d3.scaleOrdinal().range(arcColors4);
		arcColorScales[5] = d3.scaleOrdinal().range(arcColors5);
		arcColorScales[6] = d3.scaleOrdinal().range(arcColors6);

		arcG.selectAll('.arc')
			.data(arcData)
			.enter().append('path')
				.attr('class', 'arc')
				.attr('d', arc)
				.style('fill', (d) => {
					//return arcColorScales[d.numValues](d.index);
					return 'steelblue';
				})
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
					if (d.avgTheta > 0 && d.avgTheta < Math.PI) return 'start';
					if (d.avgTheta > Math.PI && d.avgTheta < 2 * Math.PI) return 'end';
					return 'middle';
				})
				.text(d => d.name);


		/* --------- Force Part --------- */
		const colorScale = d3.scaleLinear().range(['#c91414', '#082b84']);

		function createNodePack(nodeData, center) {
			// start drawing the node pack
			const size = 180;
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
					.style('fill', d => calcNodeColor(d))
					.style('filter', 'url(#glow)')
					.each(function(d) {
						const contentContainer = d3.select(document.createElement('div'));
						const content = contentContainer.append('div');
						const contentTitle = content.append('div')
							.attr('class', 'tooltip-title')
							.text(d.data.id);
						/*content.append('div')
							.attr('class', 'tooltip-line')
							.html(`<b>Extremity:</b> ${d.data.size} out of 10`);*/
						d.data.links.forEach((l) => {
							content.append('div')
								.attr('class', 'tooltip-line')
								.html(`<b>${l.parameter}:</b> ${l.value}`);
						});

						$(this).tooltipster({
							trigger: 'click',
							contentAsHTML: true,
							minWidth: 300,
							content: contentContainer.html(),
						})
					})
					.on('mouseover', function onMouseover(d) {
						d3.selectAll('.ribbon').style('opacity', 0);
						d3.selectAll('.ribbon')
							.filter(r => d.data.id === r.source.data.id)
							.style('opacity', 0.5);
						d3.selectAll('.node').style('opacity', 0.1);
						d3.select(this).style('opacity', 1);
					})
					.on('mouseout', function onMouseout() {
						d3.selectAll('.ribbon').style('opacity', 0.1);
						d3.selectAll('.node').style('opacity', 0.8);
					});

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

					const arcWidth = arc.theta1 - arc.theta0;
					const totalLinks = d.target.numValues;
					const linkNum = d.target.index;
					let startAngle = arc.theta0 + (linkNum / totalLinks) * arcWidth;
					let endAngle = arc.theta0 + ((linkNum + 1) / totalLinks) * arcWidth;

					return {
						startAngle,
						endAngle,
						radius: innerRadius,
					};
				});

			ribbonG.append('g').selectAll('.ribbon')
				.data(ribbonData)
				.enter().append('path')
					.attr('class', 'ribbon')
					.attr('d', ribbon)
					.style('fill', d => calcNodeColor(d.source))
					.style('opacity', 0.1);
		}

		function calcNodeColor(d) {
			const type = d.data.links[0].value;
			if (type === 'Human') return colorScale(0.33 * Math.random());
			else if (type === 'Animal') return colorScale(0.67 + 0.33 * Math.random());
			else return colorScale(0.33 + 0.34 * Math.random());
		}


		// create packs
		const nodeData1 = Object.assign({}, nodeData);
		nodeData1.children = nodeData.children.filter(d => d.links[0].value === 'Human');
		createNodePack(nodeData1, [120, -20]);

		const nodeData2 = Object.assign({}, nodeData);
		nodeData2.children = nodeData.children.filter(d => d.links[0].value === 'Animal');
		createNodePack(nodeData2, [-20, 120]);

		const nodeData3 = Object.assign({}, nodeData);
		nodeData3.children = nodeData.children.filter(d => d.links[0].value === 'Zoonotic');
		createNodePack(nodeData3, [-80, -80]);

	};
})();
