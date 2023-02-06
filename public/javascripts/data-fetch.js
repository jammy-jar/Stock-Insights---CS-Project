// Declare a function that returns the data for a requested symbol.
const readDataJson = symbol => {
    // Create a new date object of the current date, and convert to JSON.
    const date = new Date().toJSON().substring(0, 10);

    // Fetch the historical data JSON file, and parse the result as JSON, 
    // and return the object.
    // If the file does not exist then the function returns undefined.
    const jsonData = fetch(`./historical/${symbol + date}.json`)
        .then(response => response.json())
        .then(jsonResponse => {
            return jsonResponse;
        })     
        .catch(e => {
            return;
        })
    
    return jsonData;
}

// Define an object of the functions in the file.
const dataFetch = {
    readDataJson
}

// Export the object containing the functions in the file.
export default dataFetch;