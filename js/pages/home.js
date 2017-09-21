(() => {
	App.initHome = () => {
	   d3.json('data/network_nodes.json', (error, data) => {
			App.buildForceDiagram('.network-map', data);
		});
	};
})();
