const http = require('http');

// Test the book detail endpoint
function testBookAPI() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/books/1',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response Body:', data);
      try {
        const parsed = JSON.parse(data);
        console.log('Parsed JSON:', parsed);
      } catch (error) {
        console.log('Response is not valid JSON');
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request Error:', error);
  });

  req.end();
}

// Test the books list endpoint
function testBooksListAPI() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/books',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\n--- Books List API ---`);
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response Body:', data);
      try {
        const parsed = JSON.parse(data);
        console.log('Number of books:', parsed.length);
        if (parsed.length > 0) {
          console.log('First book ID:', parsed[0].id, 'Type:', typeof parsed[0].id);
        }
      } catch (error) {
        console.log('Response is not valid JSON');
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request Error:', error);
  });

  req.end();
}

console.log('Testing Book Detail API...');
testBookAPI();

setTimeout(() => {
  testBooksListAPI();
}, 1000);
