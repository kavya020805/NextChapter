// DEBUG: Check what's in the cache
// Copy and paste this into browser console

(async function checkCache() {
  console.log('🔍 Checking cache contents...\n');
  
  // Check PDF cache
  try {
    const pdfCache = await caches.open('nextchapter-pdf-cache-v1');
    const pdfKeys = await pdfCache.keys();
    console.log('📄 PDF Cache:', pdfKeys.length, 'items');
    pdfKeys.forEach(key => console.log('  -', key.url));
  } catch (err) {
    console.error('Error checking PDF cache:', err);
  }
  
  console.log('\n');
  
  // Check metadata cache
  try {
    const metadataCache = await caches.open('nextchapter-metadata-cache-v1');
    const metadataKeys = await metadataCache.keys();
    console.log('📚 Metadata Cache:', metadataKeys.length, 'items');
    
    for (const key of metadataKeys) {
      const response = await metadataCache.match(key);
      const data = await response.json();
      console.log('  -', key.url);
      console.log('    Title:', data.title);
      console.log('    Author:', data.author);
    }
  } catch (err) {
    console.error('Error checking metadata cache:', err);
  }
  
  console.log('\n✅ Check complete');
})();
