const W = 600, H = 50;
const N = 100;
const data = Array(N).fill(null).map( (a,i) => i/(N-1) );  // [0, .... , 1]

const colorValue = d => d;

///  TODO:   create a Sequential color scale
// so the rest of the code generates a colored gradient filling the drawing-area
const colorScale = d3.scaleSequential()
	.domain([0, 1])
	.interpolator(d3.interpolateYlGn);
//////////////////////////////////////////

const xScale = d3.scaleBand()
    .domain( data )
    .range( [0, W] )

const svg = d3.select("#content")
    .append("svg")
    .attr("width",  W)
    .attr("height", H)
    .selectAll(".square")
        .data(data)
        .enter().append("rect")
            .attr("class","square")
            .attr("x",d=>xScale( colorValue(d) ) )
            .attr("height", H)
            .attr("width", xScale.bandwidth() )
            .attr("fill", d => colorScale(colorValue( d ) ) )
