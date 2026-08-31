const fs = require('fs');
const code = fs.readFileSync('test_auth_reviews.js', 'utf8');
const modifiedCode = code.replace(
    `    const signInNav = elementsById['btnNavbarSignIn'];
    assert(signInNav !== undefined && signInNav !== null, 'Navbar displays "Sign In" button for guest users');`,
    `    const signInNav = elementsById['btnNavbarSignIn'];
    console.log("btnNavbarSignIn element:", signInNav);
    console.log("All elements:", Object.keys(elementsById));
    assert(signInNav !== undefined && signInNav !== null, 'Navbar displays "Sign In" button for guest users');`
);
fs.writeFileSync('test_debug.js', modifiedCode);
