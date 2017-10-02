(() => {
	App.buildForceDiagram = (selector, data, param = {}) => {
		const margin = { top: 30, right: 20, bottom: 30, left: 20 };
		const outerRadius = 350;
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

		// add arc gradient
		const arcGrad = defs.append('linearGradient')
			.attr('id', 'arc-gradient')
			.attr('x1', '0%')
			.attr('x2', '0%')
			.attr('y1', '0%')
			.attr('y2', '100%');
		arcGrad.append('stop')
			.attr('stop-color', 'lightsteelblue')
			.attr('offset', '0%');
		arcGrad.append('stop')
			.attr('stop-color', 'steelblue')
			.attr('offset', '100%');

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
					let threshold = 0.2;
					if (data.length === 6) threshold = 0.05;
					if (data.length === 7) threshold = 0.01;
					if (randNum < threshold) {
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
			d.numNodesForValue = [];
			d.values.forEach((v, i) => {
				let arcIndexNum = 0;
				const numForArc = nodeData.children.filter((node) => {
					return node.links.find(l => l.parameter === d.name && l.value === v);
				}).length;
				d.numNodesForValue.push(numForArc);

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

			const totalNodesForArc = d3.sum(d.numNodesForValue);
			let runningNodes = 0;

			d.values.forEach((v, i) => {
				const theta0 = runningTheta + arcPadding;
				const t0 = theta0 + dtheta * (runningNodes / totalNodesForArc);
				runningNodes += d.numNodesForValue[i];
				const t1 = theta0 + dtheta * (runningNodes / totalNodesForArc);
				arcData.push({
					parameter: d.name,
					value: v,
					numValues: d.values.length,
					index: i,
					theta0: t0,
					theta1: t1,
				});
			});

			d.theta0 = runningTheta + arcPadding;
			runningTheta += totalTheta;
			d.theta1 = runningTheta - arcPadding;
			d.avgTheta = (d.theta1 + d.theta0) / 2;
		});


		/* --------- Arc Section --------- */
		const arc = d3.arc()
			.innerRadius(innerRadius)
			.outerRadius(outerRadius)
			.padAngle(0)
			.startAngle(d => d.theta0)
			.endAngle(d => d.theta1);

		const arcGroups = arcG.selectAll('.arc')
			.data(arcData)
			.enter().append('g')
				.attr('class', 'arc');
		arcGroups.append('path')
			.attr('d', arc)
			.style('fill', 'url(#arc-gradient)')
			//.style('filter', 'url(#glow)')
			.each(function addTooltip(d) {
				$(this).tooltipster({
					trigger: 'hover',
					contentAsHTML: true,
					content: `<b>${d.parameter}:</b> ${d.value}`,
				});
			});

		// add labels to arcs
		arcG.selectAll('.arc-label-path')
			.data(data)
			.enter().append('path')
				.attr('id', (d, i) => `arc-path-${i}`)
				.attr('d', arc)
				.style('fill', 'none')
				.each(function(d) {
					const firstArcSection = /(^.+?)L/;
					let newArc = firstArcSection.exec(d3.select(this).attr('d'))[1];
					newArc = newArc.replace(/,/g , " ");

					// flip if bottom half of circle
					if (d.theta1 > Math.PI / 2 && d.theta0 < 3 * Math.PI / 2) {
						const startLoc = /M(.*?)A/;
						const middleLoc = /A(.*?)0 0 1/;
						const endLoc = /0 0 1 (.*?)$/;
						const newStart = endLoc.exec(newArc)[1];
						const newEnd = startLoc.exec(newArc)[1];
						const middleSec = middleLoc.exec(newArc)[1];
						newArc = `M${newStart}A${middleSec}0 0 0 ${newEnd}`;
					}

					d3.select(this).attr('d', newArc);
				});
		arcG.selectAll('.arc-label')
			.data(data)
			.enter().append('text')
				.attr('class', 'arc-label')
				.attr('dy', (d) => {
					if (d.theta1 > Math.PI / 2 && d.theta0 < 3 * Math.PI / 2) return 20;
					return -8;
				})
				.append('textPath')
					.attr('startOffset', '50%')
					.attr('xlink:href', (d, i) => `#arc-path-${i}`)
					.text(d => d.name);

		/*arcG.selectAll('.arc-label')
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
				.text(d => d.name);*/


		/* --------- Force Part --------- */
		// add node gradient fills
		const colors = ['#c91414', '#b01622', '#981930', '#801c3e', '#681f4c',
			'#50225a', '#382568', '#202876', '#082b84'];

		const colorScale = d3.scaleLinear().range(['#c91414', '#082b84']);
		const ribbonColorScale = d3.scaleThreshold()
			.domain(d3.range(1, colors.length - 1))
			.range(colors);

		colors.forEach((c, i) => {
			const color = d3.color(c);
			const grad = defs.append('linearGradient')
				.attr('id', `node-gradient-${i}`)
				.attr('x1', '0%')
				.attr('x2', '0%')
				.attr('y1', '0%')
				.attr('y2', '100%');
			grad.append('stop')
				.attr('stop-color', color.brighter(1.5))
				.attr('offset', '0%');
			grad.append('stop')
				.attr('stop-color', color.darker(1.5))
				.attr('offset', '100%');

			const grad2 = defs.append('linearGradient')
				.attr('id', `shadow-gradient-${i}`)
				.attr('x1', '0%')
				.attr('x2', '0%')
				.attr('y1', '0%')
				.attr('y2', '100%');
			grad2.append('stop')
				.attr('stop-color', color.brighter(1))
				.attr('offset', '0%');
			grad2.append('stop')
				.attr('stop-color', color.brighter(1))
				.attr('offset', '100%');
		});


		function createNodePack(nodeData, center, param = {}) {
			// start drawing the node pack
			const size = param.size || 180;
			const nodeOpacity = 0.7;
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

			const nodesG = nodes.append('g')
				.attr("class", (d) => {
					return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
				});

			nodesG.append('circle')
				.attr('r', d => d.r)
				.filter(d => d.parent)
					.style('fill', d => d.color = calcNodeColor(d))
					//.style('fill', d => `url(#node-gradient-${calcNodeColorNum(d)})`)
					//.style('filter', 'url(#glow)')
					.style('opacity', nodeOpacity)
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
						d3.selectAll('.ribbon').style('opacity', 0.01);
						d3.selectAll('.node').style('opacity', 0.2);
						d3.selectAll('.ribbon')
							.filter(r => d.data.id === r.source.data.id)
							.style('opacity', 0.5);
						d3.select(this.parentNode).style('opacity', 1);
					})
					.on('mouseout', function onMouseout() {
						d3.selectAll('.ribbon').style('opacity', 0.1);
						d3.selectAll('.node').style('opacity', nodeOpacity);
					});

			/*nodesG.append('circle')
				.attr('r', d => d.r + 1)
				.filter(d => d.parent)
					.style('opacity', 0.5)
					.style('fill', d => `url(#shadow-gradient-${calcNodeColorNum(d)})`);*/

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
						startAngle: angle - 0.02,
						endAngle: angle + 0.02,
						radius: (dist < d.source.r) ? 0 : dist - d.source.r,
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
					.style('fill', d => d.source.color)
					//.style('fill', d => ribbonColorScale(d.source.colorNum))
					.style('opacity', 0.1);
		}

		function calcNodeColorNum(d) {
			const type = d.data.links[0].value;
			let num = -1;
			if (type === 'Human') {
				num = Math.floor(3 * Math.random());
			} else if (type === 'Animal') {
				num = Math.floor(6 + 3 * Math.random());
			} else {
				num = Math.floor(3 + 3 * Math.random());
			}
			return d.colorNum = num;
		}

		function calcNodeColor(d) {
			const type = d.data.links[0].value;
			if (type === 'Human') return colorScale(0.33 * Math.random());
			else if (type === 'Animal') return colorScale(0.67 + 0.33 * Math.random());
			else return colorScale(0.33 + 0.34 * Math.random());
		}


		// create packs
		createNodePack(nodeData, [0, 0], { size: 280 });

		/*const nodeData1 = Object.assign({}, nodeData);
		nodeData1.children = nodeData.children.filter(d => d.links[0].value === 'Animal');
		createNodePack(nodeData1, [100, -20]);

		const nodeData2 = Object.assign({}, nodeData);
		nodeData2.children = nodeData.children.filter(d => d.links[0].value === 'Zoonotic');
		createNodePack(nodeData2, [-20, 100]);

		const nodeData3 = Object.assign({}, nodeData);
		nodeData3.children = nodeData.children.filter(d => d.links[0].value === 'Human');
		createNodePack(nodeData3, [-70, -70]);*/
	};
})();
