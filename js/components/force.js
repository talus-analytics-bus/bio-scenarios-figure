(() => {
	App.buildForceDiagram = (selector, data, param = {}) => {

		const margin = { top: 20, right: 20, bottom: 20, left: 20 };
		const outerRadius = 250;
		const innerRadius = outerRadius - 15;
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
		const chordG = chart.append('g');
		const nodeG = chart.append('g');


		/* --------- Chord Part --------- */
		// chord data
		const chordData = [
			'Spread Modality',
			'Route of Transmission',
			'Affected Population',
			'Diagnostics',
			'Medical Countermeasures',
			'Personal Protective Equipment',
			'Morbidity',
			'Response Level',
			'Policy Measures',
			'Stakeholders',
			'Event Location',
			'Natural, Intentional, Accidental Origin',
		];

		// establish chord stuff
		const chord = d3.chord()
			.padAngle(0.05)
			.sortSubgroups(d3.descending);

		const arc = d3.arc()
			.innerRadius(innerRadius)
			.outerRadius(outerRadius);

		const chordColorScale = d3.scaleOrdinal()
			.domain(d3.range(12))
			.range(['#EADAF0',
				'#D6B7E1',
				'#C293D1',
				'#A35EBA',
				'#DFC8E8',
				'#F4EDF7',
				'#B7C2E1',
				'#EDEFF7',
				'#bde4fc',
				'#3963bd',
				'#4C64B2',
				'#4B2559',
				'#3D508F',
				'#35467D',
				'#272c58',
				'#2D1636',]);

		const chordValues = chordData.map((c) => {
			const groupValues = [];
			for (let i = 0; i < chordData.length; i++) {
				groupValues.push(Math.round(1000 * Math.random()));
			}
			return groupValues;
		})

		chordG.datum(chord(chordValues));
		const chordGroups = chordG.append('g')
			.attr('class', 'groups')
			.selectAll('g')
				.data(d => d.groups)
				.enter().append('g');
		chordGroups.append('path')
			.style('fill', (d, i) => chordColorScale(i))
			.attr('d', arc);


		/* --------- Force Part --------- */
		function createNodePack(rawNodeData, center, nodeColor) {
			const size = 150;
			const pack = d3.pack()
				.size([size, size])
				.padding(2);

			const offsetX = center[0] - size / 2;
			const offsetY = center[1] - size / 2;

			const root = d3.hierarchy(rawNodeData)
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
						$(this).tooltipster({
							trigger: 'hover',
							contentAsHTML: true,
							content: `<b>${d.data.id}:</b> ${d.data.label}`,
						})
					})
					.on('mouseover', function onMouseover(d) {
						d3.selectAll('.ribbon').style('opacity', (rd) => {
							return rd.data.id === d.data.id ? 0.8 : 0.1;
						});
					})
					.on('mouseout', function onMouseout() {
						d3.selectAll('.ribbon').style('opacity', 0.5);
					});

			// draw ribbons between nodes and chords
			const ribbon = d3.ribbon()
				.source(d => {
					const x = offsetX + d.x;
					const y = offsetY + d.y;
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

			ribbonG.append('g').selectAll('.ribbon')
				.data(nodePackData.filter(d => d.parent))
				.enter().append('path')
					.attr('class', 'ribbon')
					.attr('d', ribbon)
					.style('fill', nodeColor)
					.style('opacity', 0.5);
					//.style('stroke', 'rgba(0,0,0,0.5)');
		}


		// create packs
		createNodePack(data[0], [120, 0], "#082B84");
		createNodePack(data[1], [-20, 100], "#C91414");
		createNodePack(data[2], [-80, -80], "#552257");
	};
})();
