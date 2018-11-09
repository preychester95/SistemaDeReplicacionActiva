if ((process.argv.length != 2 + 1)) {
    console.log(process.argv.length);
    ee.emit('error', new Error('Incorrect number of parameters. Use: node test_script param'));
}

a = process.argv[2];
console.log(a);
console.log(typeof(a));
console.log(a == 1);

console.log('Hola' + (5 + 2) + '\n');