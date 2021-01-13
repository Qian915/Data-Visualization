d3.text("theFile.json")
    .then( treemap );

function treemap( fileText ){
    const W = 550, H = 300;
    const data = JSON.parse( fileText );

    // TODO: the data contains hierarchical information
    // encoded in the name-property of each item
    // setup the d3-hierarchy to use this information properly
    const items = data.flare;
    console.log( Object.keys( items[0] ) );

    const root = {};
    items.forEach( i=>{
        const names = i.name.split(".");
        let node = root;
        let nameSoFar = "";
        names.forEach( name => {
            nameSoFar += name;
            if(!node.children) node.children = {};
            if(!node.children[ name ]) node.children[ name ] = {name:nameSoFar};
            node = node.children[name];
            nameSoFar += ".";
        });
        Object.assign(node, i);
    })

    const childAccessor = d => {
        if(d.children) return Object.values( d.children );
    }
    const hierarchy = d3.hierarchy( root, childAccessor );
    hierarchy.sum( n => n.size );


    const colorScale = d3.scaleOrdinal()
        .range( d3.schemeSet3 );


    //TODO: implement the recursive treemap layout-function
    // to set the correct values (x,y,w,h,color) for each rectangle
    // based on the "Slice and Dice" method

    // Sidenote: chose a color with the colorScale only on the highest hierarchy level
    // reuse but darken the color for further levels.

    recursivelyLayoutTreemap(hierarchy.children[0], 0,0 ,W,H, true, "white");
    function recursivelyLayoutTreemap(node, x,y,w,h, horizontal, color){
        Object.assign(node, {x,y,w,h,color});
        if(!node.children) return;
        const scale = d3.scaleLinear()
            .domain([0, node.value])
            .range([0, horizontal ? w : h ]);
        let i = 0;
        for(let a of node.children){
            let v = scale(a.value);
            recursivelyLayoutTreemap(
                a,
                x,y,
                horizontal?v:w,
                horizontal?h:v,
                !horizontal,
                color=="white"?colorScale(i++):d3.color(color).darker(0.5).hex()
            );
            if(horizontal) 	x+=v;
            else			y+=v;
        }
    }




    const svg = d3.select("#content")
        .append("svg")
        .attr("width",W)
        .attr("height",H)
    svg.append("rect")
        .attr("width",W)
        .attr("height",H)
        .attr("fill","#eee")

    svg.selectAll(".box")
        .data( hierarchy.descendants() )
        .enter()
            .append("rect")
            .attr("class","box")
            .attr("width", d => d.w )
            .attr("height", d => d.h )
            .attr("x", d => d.x )
            .attr("y", d => d.y )
            .attr("fill", d => d.color )
            .attr("stroke", d => d3.color(d.color)?.darker(-2).hex() )
            .attr("stroke-width", 0.5 )

    // NOTE: exam environment cannot export cyclic references
    hierarchy.eachAfter(n=>delete n.parent)
}