// Declare a function that iterates through the data and graphs the data for each stock.
createIndexPlot = (canvas, symbol, data) => {
    // Create a canvas context.
    const ctx = canvas.getContext('2d');

    // Set the line width for the plot.
    ctx.lineWidth = 2;

    // Check if the first data value is less than the final data value.
    // If its smaller the line is green to indicate there has been an increase in value over the past year,
    // And if its greater (or equal to) then its red to indicate that there has been a loss or no increase.
    if (data[0].close < data[data.length - 1].close) {
        ctx.strokeStyle = 'green';
    } else {
        ctx.strokeStyle = 'red';
    }

    // Set the scale for the plot.
    const xScale = canvas.width / data.length;
    const yScale = canvas.height / Math.max(...data.map(({close}) => close));

    // Begin a new path.
    ctx.beginPath();

    // Iterate through the data and draw the plot.
    for (let i = 0; i < data.length; i += 2) {
        const x = i * xScale;
        const y = canvas.height - data[i].close * yScale;
        ctx.lineTo(x, y);
    }

    // Stroke the path to draw the plot on the canvas.
    ctx.stroke();
}