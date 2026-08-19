const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// Load phones data
const phonesCode = fs.readFileSync('./data/phones.js', 'utf8');
// Evaluate phones.js to get phonesData
let window = {};
eval(phonesCode);
const phonesData = window.phonesData;

// Set up JSDOM
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <form id="chatForm"></form>
      <input id="chatInput" />
      <div id="chatHistory"></div>
      <button class="prompt-chip"></button>
    </body>
  </html>
`);
global.window = dom.window;
global.document = dom.window.document;
global.phonesData = phonesData;

// Mock addEventListener for DOMContentLoaded
document.addEventListener = (event, cb) => {
    if (event === 'DOMContentLoaded') {
        cb();
    }
};

// Load ai-assistant.js
const aiCode = fs.readFileSync('./ai-assistant.js', 'utf8');
eval(aiCode);

// Get references
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatHistory = document.getElementById('chatHistory');

function testQuery(query) {
    console.log("\\n--- Testing Query:", query);
    chatInput.value = query;
    // Dispatch submit
    chatForm.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));
    
    // Process response after timeouts (there's a setTimeout for fake delay)
    // We can't wait for actual setTimeout in this simple script easily without overriding it.
}
