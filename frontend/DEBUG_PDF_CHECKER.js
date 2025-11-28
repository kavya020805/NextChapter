// DEBUG TOOL: Check all books in database for PDF file issues
// 
// INSTRUCTIONS:
// 1. Open your NextChapter site in browser
// 2. Open Developer Tools (F12)
// 3. Go to Console tab
// 4. Copy and paste this entire code
// 5. Press Enter
//
// This will check all books and show which ones have PDF issues

(async function checkAllBooksPDFs() {
  console.log('🔍 Starting PDF check for all books...\n');
  
  // Get supabase from window (should be available if you're on the site)
  const supabase = window.supabase || (await import('/src/lib/supabaseClient.js')).supabase;
  
  // Fetch all books
  const { data: books, error } = await supabase
    .from('books')
    .select('id, title, pdf_file, pdf_path, pdf_filename');
  
  if (error) {
    console.error('❌ Error fetching books:', error);
    return;
  }
  
  console.log(`Found ${books.length} books in database\n`);
  
  const issues = [];
  const working = [];
  
  for (const book of books) {
    const pdfFileName = book.pdf_file || book.pdf_path || book.pdf_filename;
    
    if (!pdfFileName) {
      issues.push({
        id: book.id,
        title: book.title,
        issue: 'No PDF file specified in database',
        fields: { pdf_file: book.pdf_file, pdf_path: book.pdf_path, pdf_filename: book.pdf_filename }
      });
      continue;
    }
    
    // Normalize path
    let normalizedPath = pdfFileName.trim();
    const isExternal = /^https?:\/\//i.test(normalizedPath);
    
    if (!isExternal) {
      if (/^book-storage\//i.test(normalizedPath)) {
        normalizedPath = normalizedPath.replace(/^book-storage\//i, '');
      }
      if (/^public\//i.test(normalizedPath)) {
        normalizedPath = normalizedPath.replace(/^public\//i, '');
      }
      if (normalizedPath.startsWith('/')) {
        normalizedPath = normalizedPath.slice(1);
      }
    }
    
    // Get public URL
    let fullUrl = '';
    if (isExternal) {
      fullUrl = normalizedPath;
    } else {
      const { data: urlData } = supabase.storage.from('Book-storage').getPublicUrl(normalizedPath);
      fullUrl = urlData?.publicUrl || '';
    }
    
    if (!fullUrl) {
      issues.push({
        id: book.id,
        title: book.title,
        issue: 'Could not generate public URL',
        pdfFileName: pdfFileName
      });
      continue;
    }
    
    // Test if URL is accessible
    try {
      const response = await fetch(fullUrl, { method: 'HEAD' });
      if (response.ok) {
        working.push({
          id: book.id,
          title: book.title,
          url: fullUrl,
          size: response.headers.get('content-length')
        });
      } else {
        issues.push({
          id: book.id,
          title: book.title,
          issue: `HTTP ${response.status} - File not accessible`,
          url: fullUrl
        });
      }
    } catch (fetchError) {
      issues.push({
        id: book.id,
        title: book.title,
        issue: `Network error: ${fetchError.message}`,
        url: fullUrl
      });
    }
  }
  
  console.log('\n📊 RESULTS:\n');
  console.log(`✅ Working PDFs: ${working.length}`);
  console.log(`❌ Issues found: ${issues.length}\n`);
  
  if (working.length > 0) {
    console.log('✅ WORKING BOOKS:');
    console.table(working);
  }
  
  if (issues.length > 0) {
    console.log('\n❌ BOOKS WITH ISSUES:');
    console.table(issues);
    console.log('\nDetailed issues:');
    issues.forEach((issue, i) => {
      console.log(`\n${i + 1}. ${issue.title} (ID: ${issue.id})`);
      console.log(`   Issue: ${issue.issue}`);
      if (issue.url) console.log(`   URL: ${issue.url}`);
      if (issue.fields) console.log(`   Fields:`, issue.fields);
    });
  }
  
  console.log('\n✅ Check complete!');
  
  return { working, issues };
})();
