const W = 500, H = 300;
const lineData = [
    {x:0,   y:0},
    {x:150, y:150},
    {x:300, y:0},
    {x:450, y:150},
    {x:500, y:100},
    {x:400, y:0},
    {x:250, y:150}
];
//TODO:  setup a line-generator, that can draw the given lineData.

const lineXAccessor = d => d.x;
const lineYAccessor = d => d.y;

const lineGenerator = d3.line()
	.x(lineXAccessor)
	.y(lineYAccessor);
      
const svg = d3.select("#content")
    .append("svg")
    .attr("width",  W)
    .attr("height", H);


// horizontal line
svg.append("path")
    .attr("d", lineGenerator( [{x:0,y:150},{x:500,y:150}] ) )
    .attr("stroke", "black")

// zigzag line
svg.append("path")
    .attr("d", lineGenerator( lineData ) )
    .attr("fill", "none")       
    .attr("stroke", "red")