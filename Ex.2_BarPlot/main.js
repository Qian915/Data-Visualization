'use strict';
//////////////////// input data and accessors
const data = [ 
    {value:110, name:'A', color:'steelblue'},
    {value:80,  name:'B', color:'green'},
    {value:90,  name:'C', color:'darkred'},
    {value:45,  name:'D', color:'gray'}
];
const xValue = d => d.value;  
const yValue = d => d.name;  


//////////////////// drawing-area definition and division
const W = 550, H = 300;
const margin = { left:60, right:20, top:20, bottom:60 };
const iW = W - margin.left - margin.right;
const iH = H - margin.top - margin.bottom;


/// e.g.   scales  (mapping from data to drawing area)

const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, xValue)])
    .range([0, iW]);


const yScale = d3.scaleBand()
    .domain(data.map(yValue))
    .range([0, iH])
    .padding(0.2);



////////////////////  composing SVG-content
const svg = d3.select("#content")
    .append("svg")
        .attr("width",  W)
        .attr("height", H);

const background = svg.append("rect")
    .attr("width",  W)
    .attr("height", H)
    .attr("fill",   "lightgray");

// e.g.   correctly scaled bars and axis-labeling
const diagram = svg.append("g")
    .attr("transform", "translate("+margin.left+", "+margin.top+")");   // "+": select var
    

const bars = null;

diagram.selectAll(".bar")
    .data(data)
    .enter()

    .append("rect")
    .attr("class", "bar")

    .attr("y", d => yScale(yValue(d)))
    .attr("width", d => xScale(xValue(d)))
    .attr("height", yScale.bandwidth())
    .attr("fill", d => d.color);


const xAxis = diagram.append("g")
    .attr("transform","translate(0,"+iH+")")
    .call( d3.axisBottom( xScale ) );

const yAxis = diagram.append("g")
    .call( d3.axisLeft( yScale ) );