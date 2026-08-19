const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const phonesCode = fs.readFileSync('./data/phones.js', 'utf8');
let windowObj = {};
eval(phonesCode.replace('window.phonesData = phonesData;', 'windowObj.phonesData = phonesData;'));
const phonesData = windowObj.phonesData || phonesData;

const dom = new JSDOM(`<!DOCTYPE html><html><body><form id='chatForm'></form><input id='chatInput' /><div id='chatHistory'></div><button class='prompt-chip'></button></body></html>`);
global.window = dom.window;
global.document = dom.window.document;
global.phonesData = phonesData;
global.setTimeout = (cb) => cb(); // Override setTimeout to run synchronously

document.addEventListener = (event, cb) => { if (event === 'DOMContentLoaded') { cb(); } };

const aiCode = fs.readFileSync('./ai-assistant.js', 'utf8');
eval(aiCode);

const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatHistory = document.getElementById('chatHistory');

const queries = [
    'Best phone under ₹30,000',
    'Best camera phone',
    'Best gaming phone',
    'Best battery phone',
    'Best performance phone',
    'Samsung phone',
    'Compare Samsung and OnePlus',
    'What is the best laptop?',
    'hello',
    ''
];

queries.forEach(q => {
    chatHistory.innerHTML = '';
    chatInput.value = q;
    if (q === '') {
        chatForm.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));
        console.log('--- Query: Empty Input');
        console.log('Result:', chatHistory.innerHTML.includes('user-message') ? 'Processed' : 'Ignored');
    } else {
        chatForm.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));
        console.log('--- Query:', q);
        const msgs = chatHistory.querySelectorAll('.ai-message');
        if (msgs.length > 0) {
            console.log('Response:', msgs[msgs.length - 1].textContent.substring(0, 200).replace(/\n/g, ' '));
        } else {
            console.log('Response: None');
        }
    }
});
