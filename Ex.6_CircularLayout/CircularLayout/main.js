d3.text("theGraph.json")
    .then( circularLayout );

function circularLayout( fileText ){
    const W = 550, H = 550;
    const graph = JSON.parse( fileText );
    //console.log(fileText)

    // radius of the circular layout
    const R = Math.min(W,H)*0.45;

    // Compute degree-centrality
    for(let n of graph.nodes) n.centrality = 0;
    for(let e of graph.links){
    graph.nodes[e.source].centrality ++; 
    graph.nodes[e.target].centrality ++; 
    }

    // The value should be proportional to the radius, so the centrality is
    // proportional to the area.
    let sum = 0
    for(let n of graph.nodes){
        n.value = Math.sqrt(n.centrality)
        sum += n.value;
    }
        

    // TODO:  Setup a scale Node-value to Radians
    let sc = d3.scaleLinear()
        .domain([0, sum])
        .range([0, 2*Math.PI]);


    // TODO:   Sort Nodes by their group and value
    // !!!!   copy the array first, to keep the order of the original array unchanged
    const sortedNodes = graph.nodes.slice();  
    sortedNodes.sort( (a,b)=> (a.group!==b.group)?(a.group-b.group):(a.value-b.value) );    // new compareFunction !!!


    // TODO:  Position Nodes on the Circle
    // i.e. compute .x,.y and .r for each node
    let c = 0
    for (let n of sortedNodes){
        const r = 0.5 * sc(n.value)
        n.x = R * Math.cos(r+c)
        n.y = R * Math.sin(r+c)
        n.r = R * r
        c += r*2        
    }


    // TODO: Define link control points
    // e.g. (source-node-position -> center of drawing area -> target-node-position)
    for(let e of graph.links){
        // const x1 = graph.nodes[e.source].x 
        // const y1 = graph.nodes[e.source].y
        // const x2 = graph.nodes[e.target].x 
        // const y2 = graph.nodes[e.target].y
        
        // e.path = {x: [x1, x2], y: [y1, y2]};
        //TODO  // ??????
        const S = graph.nodes[e.source];
            const T = graph.nodes[e.target];
            const C = {x:0, y:0};
            e.path = [S,C,T];
    }
    const linkPathGenerator = d3.line()
        .x(d=>d.x)
        .y(d=>d.y)
        .curve(d3.curveBundle.beta(0.5));

    const colorByGroup = d3.scaleOrdinal()
        .domain(graph.nodes.map(d=>d.group))
        .range(d3.schemeSet3)


    ////////////////// Draw results
    const svg = d3.select("#content")
        .append("svg")
        .attr("width",W)
        .attr("height",H)
    svg.append("rect")
        .attr("width",W)
        .attr("height",H)
        .attr("fill","#eee")

    // Move the origin to the center of the drawing area
    const center = svg.append("g").attr("transform","translate("+[W*0.5,H*0.5]+")");

    center.selectAll(".link")
        .data( graph.links )
        .enter()
            .append("path")
            .attr("class","link")
            .attr("fill","none")
            .attr("stroke-width",2)
            .attr("stroke","black")
            .attr("opacity",0.25)
            .attr("d", d=> linkPathGenerator( d.path ) )

    center.selectAll(".node")
        .data( graph.nodes )
        .enter()
            .append("circle")
            .attr("class","node")
            .attr("r", d => d.r )
            .attr("cx", d => d.x )
            .attr("cy", d => d.y )
            .attr("fill", d => colorByGroup( d.group ) )
            .attr("stroke", d => d3.color(colorByGroup( d.group )).darker(2).hex() )
            .attr("stroke-width", 1 )
}
