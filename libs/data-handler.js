// Import the file system module.
import fs from 'fs';
import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// Declare a function which creates a Json file to store historical data.
const createDataJson = (symbol, data) => {
    // Declare an array to store the formatted data.
    // Iterate over each object (representing a day of stocks), 
    // and create a new object consisting of only the date and close attributes.
    const dataFormat = []
    data.forEach(object => dataFormat.push({ 
        date: object.date, 
        close: object.close 
    }));

    // Convert the data to JSON.
    const json = JSON.stringify(dataFormat);

    // Create a new date object of the current date and time.
    // Convert to JSON, and create a substring, to remove the time part.
    const date = new Date().toJSON().substring(0, 10);

    // Write a file in the '/historical' directory.
    // Name the title based on the stock symbol, and todays date.
    // Catch any errors that occur and log them.
    fs.writeFileSync(path.join(__dirname, `../public/historical/${symbol + date}.json`), json, 'utf8', (error) => {
    if (error) {
        console.error(error);
    } else {
        console.log('The file has been saved!');
    }
    });
}

// Declare a function that returns a boolean value based on if a data file exists
// and is up to date.
const existingJson = symbol => {
    // Create a new date object of the current date, and convert to JSON.
    const date = new Date().toJSON().substring(0, 10);

    // Checks if historical data file exists and returns boolean value.
    return fs.existsSync(path.join(__dirname, `../public/historical/${symbol + date}.json`));
}

// Declare a function to delete outdated files in 'historical' directory when called.
const deleteOldFiles = () => {
    // Create a new date object of the current date, and convert to JSON.
    const date = new Date().toJSON().substring(0, 10);
    // Create a Regular Expression pattern with the date string.
    const pattern = new RegExp(date);

    // Read all the files in the 'historical' directory. Catch and print any errors.
    // Callback function returns files array which is an array of the string file names in the directory.
    fs.readdir(path.join(__dirname, `../public/historical/`), (error, files) => {
        if (error) {
            console.error(error);
        }

        // Use built in filter method to iterate through the files,
        // and test which ones contain the RegEx string defined above.
        // Any that return true to the test, are not included in the 'outDatedFiles' variable, 
        // by use of not / '!'  operator.
        const outdatedFiles = files.filter(file => !pattern.test(file));

        // Iterate through each outdated file and uses the 'unlink' function to delete the file.
        for (let file of outdatedFiles) {
            fs.unlink(path.join(__dirname, `../public/historical/${file}`), (error) => {
                if (error) {
                    console.error(error);
                }
            });
        }
    });
}

// Declare an object of functions to be exported.
const dataHandler = {
    createDataJson,
    existingJson,
    deleteOldFiles
}

// Export the dataHandler object.
export default dataHandler;