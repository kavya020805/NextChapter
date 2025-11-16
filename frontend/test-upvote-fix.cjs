const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpvoteFix() {
  console.log('Testing upvote functionality fixes...\n');

  // Test 1: Check if we can select without .single()
  console.log('Test 1: Selecting reactions with .limit(1)');
  try {
    const { data, error } = await supabase
      .from('book_comment_reactions')
      .select('*')
      .eq('comment_id', 'test-comment-id')
      .eq('user_id', 'test-user-id')
      .eq('reaction_type', 'upvote')
      .limit(1);
    
    console.log('✓ Select with .limit(1) works');
    console.log('  Data:', data);
    console.log('  Error:', error);
  } catch (err) {
    console.log('✗ Select with .limit(1) failed:', err.message);
  }

  // Test 2: Check if update with .limit(1) works
  console.log('\nTest 2: Updating comment count with .limit(1)');
  try {
    const { data, error } = await supabase
      .from('book_comments')
      .update({ upvotes_count: 10 })
      .eq('id', 'test-comment-id')
      .select('id, upvotes_count')
      .limit(1);
    
    console.log('✓ Update with .limit(1) works');
    console.log('  Data:', data);
    console.log('  Error:', error);
  } catch (err) {
    console.log('✗ Update with .limit(1) failed:', err.message);
  }

  // Test 3: Check if insert works
  console.log('\nTest 3: Inserting new upvote');
  try {
    const { data, error } = await supabase
      .from('book_comment_reactions')
      .insert({
        book_id: 'test-book-id',
        comment_id: 'test-comment-id',
        user_id: 'test-user-id',
        reaction_type: 'upvote'
      });
    
    console.log('✓ Insert works');
    console.log('  Data:', data);
    console.log('  Error:', error);
  } catch (err) {
    console.log('✗ Insert failed:', err.message);
  }

  console.log('\n✅ All tests completed!');
}

testUpvoteFix();
