(() => {
	App.initHome = () => {
		d3.queue()
			/*.defer(d3.tsv, 'data/network_nodes.tsv')
			.defer(d3.tsv, 'data/network_edges.tsv')*/
            .defer(d3.json, 'data/network_nodes.json')
        	.defer(d3.json, 'data/network_edges.json')
			.await((error, nodeData, edgeData) => {
                /*d3.json("data/network_nodes.json", function(error, json) {
                    if (error) throw error;

                    nodeDataJson = json;


                    App.buildForceDiagram('.network-map', nodeData, edgeData, nodeDataJson);
                });*/
                App.buildForceDiagram('.network-map', nodeData, edgeData);

			});
	};
})();
