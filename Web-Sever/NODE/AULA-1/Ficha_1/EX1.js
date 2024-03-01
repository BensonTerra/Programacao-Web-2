//console.log(process.argv.slice(2))

const allColors = 
[
  { name: 'brightred', code: '#E74C3C' },
  { name: 'soothingpurple', code: '#9B59B6' },
  { name: 'skyblue', code: '#5DADE2' },
  { name: 'leafygreen', code: '#48C9B0' },
  { name: 'sunkissedyellow', code: '#F4D03F' },
  { name: 'groovygray', code: '#D7DBDD' }
];

function getRandomColor() 
{
  let color = allColors[Math.floor(Math.random()*allColors.length)]; //console.log(color);
  console.log('getRandomColor | ' + "Color: " + color.name + ' | Hex:' + color.code)
}


module.exports = 
{
  getRandomColor
};