const clc = require('cli-color');

const getMessage = (username, color) => {
    const validColors = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
    
    if (!validColors.includes(color)) {
        color = 'cyan'; // Cor padrão
    }
    
    const message = `Hello, ${username || 'visitor'}! Welcome to Node!`;
    return clc[color](message);
};

module.exports = { getMessage };
