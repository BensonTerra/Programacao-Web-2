const fs = require('fs');
const filePath = 'data.txt';
const currentDateTime = new Date().toLocaleString();

// Read the file
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    
    // Append new line with current date and time
    const updatedData = data + '\n' + currentDateTime;
    
    // Write back to the file
    fs.writeFile(filePath, updatedData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log('Successfully appended date and time.');
    });
});