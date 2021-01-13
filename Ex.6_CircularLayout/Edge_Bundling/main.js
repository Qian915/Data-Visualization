d3.text("theGraph.json")
    .then( circularLayoutHEB );

function circularLayoutHEB( fileText ){
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

    for(let n of graph.nodes) n.value = Math.sqrt(n.centrality); 

    // Sort Nodes by their value
    // !!!!   copy the array first, to keep the order of the original array unchanged
    const sortedNodes = graph.nodes.slice();  
    sortedNodes.sort( (a,b)=> (a.group!==b.group)?(a.group-b.group):(a.value-b.value) );



    layoutCircular(sortedNodes, R)


    const groups = [];
    for(let n of sortedNodes){
        if(!groups[n.group]) groups[n.group] = {id:n.group, value:0};
        // TODO::  setup the group so a valid circular layout for this group can be generated
        //groups[n.group]
        groups[n.group].value += n.value;
    }

    //TODO:  create a inner circular layout for the groups
    // Note that, you can use the function layoutCircular;
    layoutCircular(groups, R*0.5);


    function layoutCircular(nodes, R){
        let sum = 0;
        for(let n of nodes) sum += n.value;

        // Setup a scale Node-value to Radians
        const radiansScale = d3.scaleLinear()
            .domain([0, sum])
            .range([0, 2*Math.PI]);
        
        // Position Nodes on the Circle
        let angle = 0;
        for(let n of nodes){
            const rad = radiansScale(n.value);
            angle += rad*0.5;
        
            n.x = Math.cos(angle) * R;
            n.y = Math.sin(angle) * R;
            n.r = R * rad*0.5;
            
            angle += rad*0.5;
        }
    }

    //  Define link control points (source-node-position -> center of drawing area -> target-node-position)
    for(let e of graph.links){
        // TODO:  create paths that use the group-positions for hierarchically bundeled edges
        // Note that, you can assume that the root node is positioned at (0,0)  
        const S = graph.nodes[e.source];
        const Sg = groups[S.group];
        const T = graph.nodes[e.target];
        const Tg = groups[T.group];
        const C = {x:0, y:0};
        if(S.group==T.group) e.path = [S,Sg,T];
        else                 e.path = [S,Sg,C,Tg,T];
    }

    const linkPathGenerator = d3.line()
        .x(d=>d.x)
        .y(d=>d.y)
        .curve(d3.curveBundle.beta(0.7));

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

    center.selectAll(".group")
        .data( groups )
        .enter()
            .append("circle")
            .attr("class","group")
            .attr("r", 3 )
            .attr("cx", d => d.x )
            .attr("cy", d => d.y )
            .attr("fill", d => colorByGroup( d.id ) )
            .attr("stroke", d => d3.color(colorByGroup( d.id )).darker(2).hex() )
            .attr("stroke-width", 1 )
}

