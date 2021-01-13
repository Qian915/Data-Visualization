d3.text("flowers.csv")
    .then( scatterPlot );

function scatterplot( fileText ){
	const data = d3.csvParse( fileText );
	console.log( Object.keys(data[0]) );        // which keys are given in the csv-file
		
	const xValue = d=> parseFloat( d.petal_width ); //取obj的value: data.keyName
	const yValue = d=> parseFloat( d.sepal_width );          
	const cValue = d=> d.species;          //select a 'categorical' value for the color  (e.g. species)

	//////////////////// drawing-area definition and division
	const W = 500, H = 300;
	const margin = { left:60, right:20, top:60, bottom:60 };
	const iW = W - margin.left - margin.right;
	const iH = H - margin.top - margin.bottom;

	const xScale = d3.scaleLinear() //TODO:  Setup Scales
		.domain([d3.min(data, xValue), d3.max(data, xValue)])
		.range([0, iW]);

	const yScale = d3.scaleLinear()
		.domain([d3.min(data, yValue), d3.max(data, yValue)])
		.range([iH, 0]);  //inverse range!!!
		// note the y-scale makes more sense to be from bottom to top

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
		.attr("transform","translate( "+margin.left+", "+margin.top+" )");

	const xAxis = diagram.append("g")        //TODO:  draw Axis
		.attr("transform","translate(0,"+iH+")")    //translate to the bottom
		.call(d3.axisBottom(xScale));

	const yAxis = diagram.append("g")
		.call(d3.axisLeft(yScale));
		

	const dots = diagram.selectAll(".dot").data(data).enter()    // TODO:  draw a circle for each data-element
		.append("circle")    //append circle! not dot!!!
		.attr("class", "dot")
		.attr("cx", d=>xScale(xValue(d)) )    // pass xScale to xValue！
		.attr("cy", d=>yScale(yValue(d)) )    // circle: cx, cy, r!
		.attr("r", "2")
		.attr("fill", d=>cScale(cValue(d)) )
		/*.on("mouseover", function(e, d) {         
            label.attr("x", xScale(xValue(d)) )     
                 .attr("y", yScale(yValue(d)) ) 
                 .text( cValue(d) );
        })
        .on("mouseout", () => label.text(""));

const label = diagram.append("text")
    .text("")
    .attr("x", "0")
    .attr("y", "0")
    .style("pointer-events","none")
    .attr("text-anchor","center")
*/
	

}