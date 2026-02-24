const https = require('https');

console.log("Testing DNS resolution for Supabase API...");

https.get('https://kkvsmxwtnajhyoiciqyq.supabase.co/rest/v1/', (res) => {
    console.log('Status code:', res.statusCode);
}).on('error', (e) => {
    console.error('Connection error:', e.message);
    if (e.code === 'ENOTFOUND') {
        console.error("DNS Resolution failed: The domain does not exist or your ISP is blocking it.");
    }
});
