const fs = require('fs');
let code = fs.readFileSync('news.html', 'utf8');

if (!code.includes('auth.css')) {
    code = code.replace('<link rel="stylesheet" href="search.css">', '<link rel="stylesheet" href="auth.css">\n    <link rel="stylesheet" href="search.css">');
}

if (!code.includes('auth.js')) {
    code = code.replace('<script src="favorites.js"></script>', '<script src="favorites.js"></script>\n    <script src="auth.js"></script>');
}

fs.writeFileSync('news.html', code);
console.log("Updated news.html");
