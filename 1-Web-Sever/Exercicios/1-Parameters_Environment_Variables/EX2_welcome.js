const username = process.argv.slice(2)[0];
console.log(username);

if (username) {
  console.log(`Hello, ${username}!, Welcome to Node`);
}
else {
	console.log('Please provide a username.');
}
