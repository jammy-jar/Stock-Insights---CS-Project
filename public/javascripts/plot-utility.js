function createScatterGraph(actual, projections) {
    const data = [
      {x: actual.map(({date}) => date), y: actual.map(({close}) => close), type: 'scatter', name: 'Trace 0', mode: 'lines'},      {x: projections[0].map(({date}) => date), y: projections[0].map(({close}) => close), type: 'scatter', name: 'Trace 1', mode: 'lines'},
      {x: projections[1].map(({date}) => date), y: projections[1].map(({close}) => close), type: 'scatter', name: 'Trace 2', mode: 'lines'},
      {x: projections[2].map(({date}) => date), y: projections[2].map(({close}) => close), type: 'scatter', name: 'Trace 3', mode: 'lines'},
      {x: projections[3].map(({date}) => date), y: projections[3].map(({close}) => close), type: 'scatter', name: 'Trace 4', mode: 'lines'},
      {x: projections[4].map(({date}) => date), y: projections[4].map(({close}) => close), type: 'scatter', name: 'Trace 5', mode: 'lines'},  
    ];
  
    const layout = {
      title: 'Scatter Graph',
      xaxis: {
        title: 'X values',
      },
      yaxis: {
        title: 'Y values',
      }
    };
  
    Plotly.newPlot("testPlot", data, layout);
}
createScatterGraph(actualData, projectionData)