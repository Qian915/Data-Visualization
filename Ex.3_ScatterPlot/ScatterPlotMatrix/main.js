const data = d3.csvParse( fileText );
let keys = Object.keys(data[0]);	//return an array
console.log( keys );        // which keys are given in the csv-file


const colorKey = "species";
const cValue = d=> d[colorKey];

//TODO: we assume a dataset with only quantitative data
// exept for one categorical entry used as colorKey.
// when your custom dataset is structured differently, you have to format it here accordingly
keys = new Set(keys);
keys.delete(colorKey);  // the color key should not be used as column or row
keys = Array.from(keys);

//////////////////// drawing-area definition and division
const W = 600, H = 600;
const margin = { left:30, right:30, top:30, bottom:30 };
const zoom = 0.5;
const iW = (W - margin.left - margin.right)/zoom;
const iH = (H - margin.top - margin.bottom)/zoom;

const xMatrix = d3.scaleBand()      // TODO setup Band-scales for the Matrix rows and columns
	.domain(keys)
	.range([0, iW])
	.padding(.2);

const yMatrix = d3.scaleBand()
    .domain(keys)
	.range([0, iH])         //dont inverse !!!
	.padding(.2);

const valueByKey = {};
const xScaleByKey = {};
const yScaleByKey = {};
for(const k of keys){           // TODO  setup value accessors and Scales for each key
    // Note: we assume for now, that all properties are quantitative
    valueByKey[k] = (d)=>parseFloat(d[k]);
    xScaleByKey[k] = d3.scaleLinear()
         .domain([ d3.min(data, valueByKey[k]), d3.max(data, valueByKey[k]) ])
     	 .range([ 0, xMatrix.bandwidth() ]);    //for every sp in the spm, range is from 0 to bandwidth!
        
    yScaleByKey[k] = d3.scaleLinear() 
        .domain([ d3.min(data, valueByKey[k]), d3.max(data, valueByKey[k]) ])
        .range([ yMatrix.bandwidth(), 0 ]);
       
}

const cScale = d3.scaleOrdinal(d3.schemeSet2);

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
    .attr("transform","translate("+margin.left+","+margin.top+")scale("+zoom+")");

for(let x of keys){
    for(let y of keys){     
        // TODO:   for each matrix-cell, add an svg-group
        // and use the predefined functions (scatterplot and histogram) 
        // to generate the respective visualization inside the group
        // NOTE:  that there is a small but important detail missing in the histogram-function
        const group = diagram.append("g")
            .attr("transform","translate("+xMatrix(x)+","+yMatrix(y)+")");
        	if(x==y){
                histogram(group, data, xMatrix.bandwidth(), yMatrix.bandwidth(), 
                    valueByKey[x], xScaleByKey[x], valueByKey[y], yScaleByKey[y], cValue, cScale)
            }
            else{
                scatterplot(group, data, xMatrix.bandwidth(), yMatrix.bandwidth(), 
                    valueByKey[x], xScaleByKey[x], valueByKey[y], yScaleByKey[y], cValue, cScale)
            }
        
       
        
        
       
    }
}


function scatterplot( group, data, width, height, xValue, xScale, yValue, yScale, cValue, cScale){
    const xAxis = group.append("g")
        .attr("transform","translate(0,"+height+")")
        .call( d3.axisBottom( xScale ) );
    const yAxis = group.append("g")
        .call( d3.axisLeft( yScale ) );
    const dots = group.selectAll(".dot").data(data)
        .enter().append("circle")
            .attr("class","dot")
            .attr("cx", d => xScale( xValue(d) ) )
            .attr("cy", d => yScale( yValue(d) ) )
            .attr("r", 3 )
            .attr("fill", d=> cScale(cValue(d)) )
}


function histogram( group, data, width, height, xValue, xScale, yValue, yScale, cValue, cScale){
    // set histogram specific X-Axis lables:
    const xAxis = group.append("g")
        .attr("transform","translate(0,"+height+")")
        .call( d3.axisBottom( xScale ) );
    
    const resolution = 10;
    const histoData = new Array(resolution)
        .fill(null)
        .map((a,i)=>{return {
            index:i,
            count:0
        }});
    
    const barRangeScale = d3.scaleLinear()
        .domain([ d3.min(data, xValue), d3.max(data, xValue) ])
        .range([0, resolution]);
    
    // TODO: generate the histogram data 
    // i.e. count the data-elements inside each histogram-bar-range
    // HINT:  use data, the existing histoData-object and the binIndex-function
    const binIndex  =  (d) => Math.min( resolution-1, Math.floor( barRangeScale( xValue(d))));
    data.forEach( (d)=>{                    //???????????
        histoData[  binIndex(d)  ].count++;
    });
    
    
    
    
    
    const hXValue = (d) => d.index;
    const hYValue = (d) => d.count;
    
    const hXScale = d3.scaleBand()
        .domain( histoData.map( hXValue ) )
        .range([0, width])
        .padding(0.2);
    
    const hYScale = d3.scaleLinear()
        .domain( [0, d3.max( histoData, hYValue)] )
        .range( [height, 0] );
    
    const hColor = "#aaa";
    barplot_monochrome_withoutXAxisLables(group, histoData, 
            width, height,
            hXValue, hXScale,
            hYValue, hYScale,
            hColor);
}

function barplot_monochrome_withoutXAxisLables( group, data, width, height, xValue, xScale, yValue, yScale, color){
    /*const xAxis = group.append("g")
        .attr("transform","translate(0,"+height+")")
        .call( d3.axisBottom( xScale ) );*/
    const yAxis = group.append("g")
        .call( d3.axisLeft( yScale ) );
    const bars = group.selectAll(".bar").data(data)
        .enter().append("rect")
            .attr("class","bar")
            .attr("width", xScale.bandwidth() )
            .attr("height", d => height - yScale( yValue(d) ) )
            .attr("x", d => xScale(xValue(d)) )
            .attr("y", d => yScale(yValue(d)) )
            .attr("fill", color);
}