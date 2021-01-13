const renderAll = (() => {
  // World population data set from World Population Prospects 2019
  const worldPopulation = [
      { country: 'China', population: 1397029},
      { country: 'India', population: 1309054},
      { country: 'USA', population: 319929},
      { country: 'Indonesia', population: 258162},
      { country: 'Brazil', population: 205962},
      { country: 'Pakistan', population: 189381},
      { country: 'Nigeria', population: 181182},
      { country: 'Bangladesh', population: 161201}
  ]
  // statistics of number of students at the FAU in 2019
  const studentsFAU = [
      {faculty: 'PhilFak', students: 9612 },
      {faculty: 'WISO', students: 9641 },
      {faculty: 'MedFak', students: 3861 },
      {faculty: 'NatFak', students: 5322 },
      {faculty: 'TechFak', students: 9612 },
  ]

  // get name of faculty from key
  const m = new Map()
  m.set('PhilFak', 'Philosophische Fakultät')
  m.set('WISO', 'Wirtschafts- und Sozialwissenschaften')
  m.set('MedFak', 'Medizinische Fakultät')
  m.set('NatFak', 'Natuwissenschaftliche Fakultät')
  m.set('TechFak', 'Technische Fakultät')

  // dropdown menus
  const dropdownMenu = (selection, props) => {
    const {
      options,
      onOptionClicked,
      selectedOption
    } = props;
    
    let select = selection.selectAll('select').data([null]);
    select = select.enter().append('select')
        .attr("class", "form-control")
        .style("font-family", "sans-serif")
      .merge(select)
        .on('change', function() {
          onOptionClicked(this.value);
        });
    
    const option = select.selectAll('option').data(options);
    option.enter().append('option')
      .merge(option)
        .attr('value', d => d)
        .property('selected', d => d === selectedOption)
        .text(d => d);
  };
  // mein render function for the bars in the bar chart
  const renderBars = props => {
    const { 
      selection, 
      data, 
      xScale, 
      yScale,
      margin,
      width, 
      height
    } = props // destructuring props
    console.log(height)
    console.log(width)
    //access functions for data values
    const xValue = d => d.value
    const yValue = d => d.key
    // mein selection
    const rects = selection.selectAll('rect').data(data, d => d.key)
    rects
      .join(
        enter => {
          //enter.append('rect')
          const gEnter = enter.append('g')
          gEnter.append('rect')
          .attr('y', d => yScale(yValue(d)))
          .attr('x', 1.5)
          .attr('width', 0)
          .attr('height', yScale.bandwidth())
          .attr('fill', 'teal')
          //.attr('width', 0)
          .transition().duration(800)
            .attr('width', d => xScale(xValue(d)))
          gEnter.append('text')
            //.attr('y', d => yScale(yValue(d)) + yScale.bandwidth() / 2 + 5)
            .attr('y', d => height - margin.top - margin.bottom/3 )
            .attr('x', d => 10) //xScale(xValue(d)) / 5)
            .text(d => d.key + ': ' + d.value)
            .style('visibility', 'hidden')
            .style('font-family', 'sans-serif')
            .style('font-size', '1.1em')
            .style('vertical-align', 'bottom')
          gEnter
            //.on('mouseleave', (event,sel) =>  {
            .on('mouseleave', sel =>  {
              gEnter.selectAll('rect')
                .attr('fill-opacity', 1)
              gEnter.selectAll('text')
                .style('visibility', 'hidden')
            } )
            //.on('mouseenter', (event,e) =>  {
            .on('mouseenter', e =>  {
              const thisRect = gEnter.selectAll('rect')
              thisRect.attr('fill-opacity', d => d.key !== e.key ? 0.5 : 1)
              const thisText = gEnter.selectAll('text')
              thisText.style('visibility', d => d.key === e.key ? 'visible' : 'hidden')
            } )
        },
        update => update // do nothing by update
        ,
        exit => exit // actually nothing to remove
          .remove()
    )
  }

  // render the complete bar chart
  const render = props => {
    const { 
      selection, 
      data, 
      titleText,
      width,
      height
    } = props // destructuring the props
    //double logic: access function for data values
    const xValue = d => d.value
    const yValue = d => d.key

    //sets margins and inner height and width
    const margin = {top: 50, right: 30, bottom: 50, left: 70};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    //sets scales - maps data to pixels
    // x-coordinate
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, xValue)])
        .range([0, innerWidth]);
    // y-coordinate
    const yScale = d3.scaleBand()
      .domain(data.map(yValue))
      .range([0, innerHeight])
      .padding(0.1);
    // add graphic elements to a group
    const g = selection.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    //add axes
    const xAxisTickFormat = num => d3.format('.1s')(num).replace('G','B')
    const yAxis = d3.axisLeft(yScale)
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(xAxisTickFormat)
      .tickSize(-innerHeight)
    // improve x-axis
    xAxis.ticks(5).tickPadding(5)
    // add y-axis
    g.append('g').call(yAxis);
    g.append('g')
      .call(xAxis)
        .attr('transform', `translate(0, ${innerHeight})`);
    // render the bars of the bar chart
    renderBars({
      selection: g, 
      data: data, 
      xScale: xScale, 
      yScale: yScale, 
      margin: margin,
      width: width,
      height: height
    })
    // add a title to the plot
    g.append('text')
      .attr('y',-15)
      .style('font-family','sans-serif')
      .style('font-size', '1.2em')
      .text(titleText)
  }

  // the sgv element
  const width = 500;
  const height = 300
  const svg = d3.select('#D3BarChart').append('svg');
  svg
    .attr('width',width)
    .attr('height',height)
    .style('background-color', 'mintcream')

  // run d3 to generate a plot according to user selection
  const colData = ['Students at FAU', 'World Population']
  let selColumn = 'Students at FAU'
  const handleClick = (col) => {
    selColumn = col
    run()
  }
  const run = ( ) => {
    console.log(d3)
    // clean plot
    svg.selectAll('g').remove()
    // construct menu
    d3.select('#D3BarChart-Menu')
    .call(dropdownMenu, {
      options: colData,
      onOptionClicked: handleClick,
      selectedOption: selColumn
    });
    // init data according to user selection
    let data = [];
    let titleText = '';
    if (selColumn === colData[0])
    {
      data = studentsFAU.map ( d => {
        return { key: d.faculty, value: d.students }
      })
      titleText = 'Students an the FAU'
    }
    else if (selColumn === colData[1]) {
      data = worldPopulation.map ( d => {
        return { key: d.country, value: 1000 * d.population } 
      })
      titleText = 'World Population'
    }
    // sort, so bars are sorted according to size
    data.sort( (a,b) => b.value - a.value )
    // render
    render({ 
      selection: svg, 
      data: data, 
      titleText: titleText,
      width: width,
      height: height
    })
  }
  // visible method of this closure
  return {
    run: run
  }
})()
