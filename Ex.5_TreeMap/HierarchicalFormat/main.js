d3.text("flare.json")
    .then( treemap );

function treemap( fileText ){
    const data = JSON.parse( fileText );

    // TODO: the data contains hierarchical information
    // encoded in the name-property of each item
    // setup the d3-hierarchy to use this information properly
    const items = data.flare;   // array
    console.log( Object.keys( items[0] ) );


    const root = {};
    items.forEach( i=>{     // array.forEach(currentValue_element, index)
        const names = i.name.split(".");    // string.split(separator): return an array of substrings
        let node = root;
        let nameSoFar = "";
        names.forEach( name => {
            nameSoFar += name;
            if(!node.children) node.children = {};
            if(!node.children[ name ]) node.children[ name ] = {name:nameSoFar};
            node = node.children[name];
            nameSoFar+=".";
        });
        Object.assign(node, i);     // Object.assign(targetObject, sourceObject): copy from source to targert
    })

    const childAccessor = d => {
        if(d.children) return Object.values( d.children );
    }
    const hierarchy = d3.hierarchy( root, childAccessor );



    hierarchy.sum( n => n.size );
    console.log( hierarchy.value );
    console.log( Object.values( hierarchy ));

    hierarchy.eachBefore( n => {
        console.log( "  ".repeat(n.depth) + n.data.name  );
    });



    // NOTE: exam environment cannot export cyclic references
    // hierarchy.eachAfter(n=>delete n.parent)
}