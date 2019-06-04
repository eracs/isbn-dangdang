const parser = require('./ISBN-parser');

function testISBNParser() {
    parser.parseTitleFromISBN('9787115318893')
        .then(data => console.log(data));
}

testISBNParser();