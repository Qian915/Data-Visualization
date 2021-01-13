d3.text("flowers.csv")
    .then( scatterplotMatrix );

function scatterplotMatrix( fileText ){
    const data = d3.csvParse( fileText );

    const keys = Object.keys(data[0]);	// return an array: a special type of object !!! typeof(array)=object !!!
    console.log( keys );                  // which keys are given in the csv-file


    // quantitative color
    const colorKey = "datasetOrder";
    const cValue = d=> parseFloat( d[colorKey] );
    const cScale = d3.scaleSequential()        
        .domain([d3.min(data,cValue), d3.max(data,cValue)])
        .interpolator(d3.interpolateYlGn);


    //////////////////// drawing-area definition and division
    const W = 550, H = 300;
    const margin = { left:30, right:30, top:30, bottom:30 };
    const iW = W - margin.left - margin.right;
    const iH = H - margin.top - margin.bottom;

    // TODO setup a categorical-scale for the columns
    const xColumn = d3.scalePoint()      
        .domain(keys)
        .range([0, iW])

    const axisByKey = {};
    keys.forEach( k => {
        const val0 = parseFloat( data[0][ k ] );  //check if you can parse Value as float
        const canParseFloat = val0==val0;	//only numbers can be parsed, strings will return NaN !!! NaN != NaN !!!
        let accessor = (d)=>d[ k ];
        let scale = null;
        // TODO: setup scale and accessor depending on whether the content is
        // quantitative or categorical data
        if(canParseFloat){
            accessor = (d) => parseFloat(d[k]); // ??? why quantitative data must use parseFloat() ???
            scale = d3.scaleLinear()
                .domain( [d3.min(data, accessor), d3.max(data, accessor) ]);
        }else{
            scale = d3.scalePoint()
                .domain(data.map(accessor))
                .padding(.5);
            
        }
        
        scale.range([iH, 0]);
        
        axisByKey[k] = {    // axisByKey: { key:{...}, key:{...} }
            key : k,
            isQuantitative : canParseFloat,
            accessor :  accessor,
            scale : scale
        };
    });



    //  NOTE: use the d3 line-generator ...
    const lineGenerator = d3.line()
        .x(d=>d.x)
        .y(d=>d.y)

    // ... and the following function constructing the control-points of the line as an array of points
    const computeLine = (d)=>{
        return keys.map( key =>{return {	// array of objects: [{x: , y: }, {x: , y: } ...] 
            x: xColumn(key),
            y: axisByKey[key].scale( axisByKey[key].accessor(d) )
        };})
    }


    ////////////////////  composing SVG-content
    const svg = d3.select("#content")
        .append("svg")
        .attr("width",  W)
        .attr("height", H);

    const background = svg.append("rect")
        .attr("width",  W)
        .attr("height", H)
        .attr("fill",   "#eee");

    const diagram = svg.append("g")
        .attr("transform","translate("+margin.left+","+margin.top+")");

    // TODO:  draw colored lines for each data-entry  (also see NOTE above)
    // !!! not diagram. append("path"), existed before !!! 
    const lines = diagram.selectAll(".line").data( data ).enter()
        .append("path")		
        .attr("class", "line")
        .attr("d", (d)=>lineGenerator(computeLine(d)))
        .attr("fill", "none")
        .attr("opacity", 0.25)
        .attr("stroke-width", 3)
        .attr("stroke", (d)=>cScale(cValue(d)));    // !!! not cScale(d) !!!


    for(let key of keys){
        diagram.append("g")
            .attr("transform","translate(" + xColumn(key) + ",0)")
            .call( d3.axisLeft( axisByKey[key].scale ) );
    }

    diagram.append("g")
        .attr("transform","translate(0,"+iH+")")
        .call(d3.axisBottom( xColumn ));
}