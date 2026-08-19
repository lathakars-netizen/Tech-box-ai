const fs = require('fs');

const phonesCode = fs.readFileSync('./data/phones.js', 'utf8');
let globalObj = { window: {} };
// Mock basic browser
global.window = globalObj.window;
eval(phonesCode.replace(/window\.phonesData/g, 'global.phonesData'));
const phonesData = global.phonesData;

// Mock DOM
let chatHistoryHtml = '';
global.document = {
    addEventListener: () => {},
    getElementById: (id) => {
        if (id === 'chatForm') return { addEventListener: () => {} };
        if (id === 'chatInput') return { value: '' };
        if (id === 'chatHistory') return { 
            appendChild: (el) => { chatHistoryHtml += el.innerHTML; },
            scrollHeight: 100, 
            scrollTop: 0 
        };
        return null;
    },
    querySelectorAll: () => [],
    createElement: (tag) => {
        return { 
            className: '', 
            innerHTML: '', 
            remove: () => {}
        };
    }
};

const aiCode = fs.readFileSync('./ai-assistant.js', 'utf8');
// Extract generateResponse function from inside the DOMContentLoaded block
const match = aiCode.match(/function generateResponse\s*\([^)]*\)\s*\{[\s\S]*?function renderPhoneCards/);
let extractedFunction = '';
if (match) {
    extractedFunction = match[0].replace('function renderPhoneCards', '');
}
const renderMatch = aiCode.match(/function renderPhoneCards\s*\([^)]*\)\s*\{[\s\S]*?\}\s*\n\}\);/);
let extractedRender = '';
if (renderMatch) {
    extractedRender = renderMatch[0].replace('});', '');
}

eval(`
    const phones = global.phonesData;
    function addAIMessage(html) { chatHistoryHtml += html; }
    ` + extractedFunction + extractedRender
);

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
];

queries.forEach(q => {
    chatHistoryHtml = '';
    generateResponse(q.toLowerCase());
    console.log('--- Query:', q);
    console.log('Response:', chatHistoryHtml.replace(/\n/g, '').replace(/  +/g, ' ').substring(0, 300) + '...');
});
