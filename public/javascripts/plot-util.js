// Store whether the graph is toggled to scatter or candlestick.
let graphToggle = false;

// Create a plot with the stocks past and projected data.
const createPlot = (name, symbol, historicalData, projectionsData) => {

  // Define a layout for the plot.
  const layoutGraph = {
    title: name,
    xaxis: {
      rangeslider: {
        visible: false
      }
    },
    yaxis: {
      fixedrange: false
    }
  };

  // Create an array of line traces with data for the plot. 
  const traces = [
    { x: historicalData.map(({date}) => date), y: historicalData.map(({close}) => close), close: historicalData.map(({close}) => close), open: historicalData.map(({open}) => open), high: historicalData.map(({high}) => high), low: historicalData.map(({low}) => low), type: 'scatter', name: 'Historical', mode: 'lines', line: {color: '#7F7F7F'} },
    { x: projectionsData[0].map(({date}) => date), y: projectionsData[0].map(({close}) => close), type: 'scatter', name: 'Min', mode: 'lines', line: {color: '#17becf7d'} },
    { 
      x: projectionsData[1].map(({date}) => date), 
      y: projectionsData[1].map(({close}) => close), 
      type: 'scatter', name: 'Lower', mode: 'lines', 
      line: {color: '#17becfbf'}, fill: 'tonexty', fillcolor: 'rgba(255, 0, 0, 0.1)' 
    },
    { x: projectionsData[2].map(({date}) => date), y: projectionsData[2].map(({close}) => close), type: 'scatter', name: 'Avg', mode: 'lines', line: {color: '#17becf'}, fill: 'tonexty', fillcolor: 'rgba(255, 0, 0, 0.2)' },
    { x: projectionsData[3].map(({date}) => date), y: projectionsData[3].map(({close}) => close), type: 'scatter', name: 'Upper', mode: 'lines', line: {color: '#17becfbf'}, fill: 'tonexty', fillcolor: 'rgba(255, 0, 0, 0.2)' },
    { x: projectionsData[4].map(({date}) => date), y: projectionsData[4].map(({close}) => close), type: 'scatter', name: 'Max', mode: 'lines', line: {color: '#17becf7d'}, fill: 'tonexty', fillcolor: 'rgba(255, 0, 0, 0.1)' },  
  ]

  // 'Reacts' with the new plot traces 
  // Create a plot if it is empty, or redraw if its already filled.
  Plotly.react("graphPlot", traces, layoutGraph);
}

// Toggle between scatter or candlestick graphs, using restyle.
function toggleGraph() {
  if (graphToggle) {
    Plotly.restyle("graphPlot", { type: 'scatter' }, 0);
    graphToggle = false;
  } else {
    Plotly.restyle("graphPlot", { type: 'candlestick' }, 0);
    graphToggle = true;
  }
}

// Plot the bull/bear meter
function plotMeter(bullishScore) {
  // Create a data object with the value to be displayed on the gauge chart
  const meterData = [
    {
      type: "indicator",
      mode: "gauge+number",
      gauge: {
        shape: "angular",
        axis: {
          range: [-5, 5],
          tickvals: [-5, -3, -1, 1, 3, 5],
          ticktext: ["", "Bearish", "", "", "Bullish", ""],
          tickfont: {
            size: 30,
            color: "black"
          },
          tickwidth: 1,
          tickcolor: "gray",
          showline: true,
          linecolor: "black",
          linewidth: 1
        },
        bar: {
          thickness: 0
        },
        bgcolor: "white",
        borderwidth: 2,
        bordercolor: "gray",
        steps: [
          { range: [-5, -3], color: "red" },
          { range: [-3, -1], color: "orange" },
          { range: [-1, 1], color: "yellow" },
          { range: [1, 3], color: "greenyellow" },
          { range: [3, 5], color: "green" }
        ],
        threshold: {
          value: bullishScore,
          line: {
            color: "black",
            width: 4
          },
          thickness: 0.75,
          bgcolor: "gray",
          borderwidth: 2,
          bordercolor: "gray"
        }
      },
      number: {
        font: {
          size: 20
        },
        suffix: "%"
      }
    }
  ];

  // Create a layout object with a title and no axis ticks
  const layout = {
    showticklabels: false
  };

  // Plot the chart with Plotly.newPlot()
  Plotly.newPlot("bullBearPlot", meterData, layout);
}