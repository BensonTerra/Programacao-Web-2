const arg = process.argv.slice(2)
console.log(username)

if(username.length !== 2) {
    console.log('Usage: node EX1_V2.js <first_number> <second_number>')
    process.exit(1)
}

const num1 = parseInt(username[0])
const num2 = parseInt(username[1])

if(isNaN(num1) || isNaN(num2)) {
    console.log('Error: Both arguments must be numbers')
    process.exit(1)
}

const sum = num1 + num2
console.log(`The sum of ${num1} and ${num2} is ${sum}`)