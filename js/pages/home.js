(() => {
	App.initHome = () => {
		d3.queue()
			.defer(d3.tsv, 'data/network_nodes.tsv')
			.defer(d3.tsv, 'data/network_edges.tsv')
			.await((error, nodeData, edgeData) => {
				App.buildForceDiagram('.network-map', nodeData, edgeData);
			});
	};
})();
