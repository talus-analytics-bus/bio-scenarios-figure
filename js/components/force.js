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
			.padAngle(0.05)
            .sortSubgroups(d3.descending);

		const arc = d3.arc()
			.innerRadius(innerRadius)
			.outerRadius(outerRadius);

		const chordColorScale = d3.scaleOrdinal()
			.domain(d3.range(12))
			.range(['#e6f5ff', '#ccebff', '#b3e0ff', '#66c2ff',
					'#748FA1', '#637B8A', '#313D45', '#C0DCED',
					'#C0EDCE', '#A6E6BA', '#84B894', '#53735D',
					'#F2E3D2', '#EBD2B7', '#A18B74', '#736353']);

		const matrix = [
			[200, 6295, 893, 91, 1820, 4245, 1176, 1399, 1157, 7586, 1616, 1870],
			[1685, 4266, 3858, 2929, 7621, 9230, 1051, 1116, 701, 1749, 8886, 853],
			[8048, 4055, 5836, 5001, 10799, 12662, 11745, 5029, 16973, 18479, 2722, 13652],
			[12958, 7227, 14303, 1310, 13314, 5413, 7843, 17878, 536, 9371, 14537, 17700],
			[10362, 15302, 5379, 2834, 15747, 19423, 11276, 18460, 17491, 9648, 2419, 8974],
			[5004, 3956, 15488, 16646, 2614, 10712, 9502, 10110, 306, 12531, 12050, 12052],
			[19144, 14701, 6777, 10999, 14988, 5205, 8200, 11717, 4032, 18179, 15831, 10649],
			[12496, 846, 11719, 9697, 3007, 17794, 8242, 19855, 16990, 6714, 2999, 4658],
			[9774, 9250, 9730, 8145, 14544, 15329, 13342, 6569, 8838, 5778, 17125, 11046],
			[18486, 4791, 17489, 15943, 17331, 2337, 19419, 7972, 15708, 7965, 16729, 17216],
			[1251, 19170, 2970, 11084, 9388, 10915, 124, 10930, 13946, 13175, 17185, 1338],
			[18505, 4456, 1411, 11245, 4103, 2165, 19720, 10395, 16880, 3863, 3897, 519]
		];

		/*const arraySize = 12;
		const matrix = [];
		const maxSize = 20000;
		let row = [];
		for (let i = 0; i < arraySize; i++) {
			row = [];
			for (let j = 0; j < arraySize; j++) {
				row.push(Math.floor(Math.random() * maxSize));
			}
			matrix.push(row);
		}*/

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
