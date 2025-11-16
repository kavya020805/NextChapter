const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tbwtxhfqvbwlgpyqskss.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRid3R4aGZxdmJ3bGdweXFza3NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MzI3MDMsImV4cCI6MjA3ODEwODcwM30._Zm5iJCL6zqU65KtxzO9SabE-av06BhwBC1kbeHhgWM';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncUpvotesForAllAccounts() {
  console.log('=== SYNCING UPVOTES FOR ALL ACCOUNTS ===\n');

  try {
    // Step 1: Get all comments
    console.log('Step 1: Fetching all comments...');
    const { data: comments, error: commentsError } = await supabase
      .from('book_comments')
      .select('id, book_id, upvotes_count');
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      return;
    }
    
    console.log(`Found ${comments.length} comments`);

    // Step 2: Get all replies
    console.log('\nStep 2: Fetching all replies...');
    const { data: replies, error: repliesError } = await supabase
      .from('book_comment_replies')
      .select('id, comment_id, upvotes_count');
    
    if (repliesError) {
      console.error('Error fetching replies:', repliesError);
      return;
    }
    
    console.log(`Found ${replies.length} replies`);

    // Step 3: Sync comment upvotes
    console.log('\nStep 3: Syncing comment upvotes...');
    for (const comment of comments) {
      // Count actual upvotes for this comment
      const { data: upvotes, error: countError } = await supabase
        .from('book_comment_reactions')
        .select('id')
        .eq('comment_id', comment.id)
        .eq('reaction_type', 'upvote');
      
      if (countError) {
        console.error(`Error counting upvotes for comment ${comment.id}:`, countError);
        continue;
      }
      
      const actualCount = upvotes ? upvotes.length : 0;
      
      if (comment.upvotes_count !== actualCount) {
        console.log(`Comment ${comment.id}: ${comment.upvotes_count} -> ${actualCount} upvotes`);
        
        // Update the comment with correct count
        const { error: updateError } = await supabase
          .from('book_comments')
          .update({ upvotes_count: actualCount })
          .eq('id', comment.id);
        
        if (updateError) {
          console.error(`Error updating comment ${comment.id}:`, updateError);
        } else {
          console.log(`  ✓ Updated comment ${comment.id}`);
        }
      }
    }

    // Step 4: Sync reply upvotes
    console.log('\nStep 4: Syncing reply upvotes...');
    for (const reply of replies) {
      // Count actual upvotes for this reply
      const { data: upvotes, error: countError } = await supabase
        .from('book_reply_reactions')
        .select('id')
        .eq('reply_id', reply.id)
        .eq('reaction_type', 'upvote');
      
      if (countError) {
        console.error(`Error counting upvotes for reply ${reply.id}:`, countError);
        continue;
      }
      
      const actualCount = upvotes ? upvotes.length : 0;
      
      if (reply.upvotes_count !== actualCount) {
        console.log(`Reply ${reply.id}: ${reply.upvotes_count} -> ${actualCount} upvotes`);
        
        // Update the reply with correct count
        const { error: updateError } = await supabase
          .from('book_comment_replies')
          .update({ upvotes_count: actualCount })
          .eq('id', reply.id);
        
        if (updateError) {
          console.error(`Error updating reply ${reply.id}:`, updateError);
        } else {
          console.log(`  ✓ Updated reply ${reply.id}`);
        }
      }
    }

    // Step 5: Show summary
    console.log('\nStep 5: Verification...');
    const { data: finalComments } = await supabase
      .from('book_comments')
      .select('id, upvotes_count');
    
    const { data: finalReplies } = await supabase
      .from('book_comment_replies')
      .select('id, upvotes_count');
    
    console.log(`\n✅ Sync complete!`);
    console.log(`- Updated ${finalComments?.length || 0} comments`);
    console.log(`- Updated ${finalReplies?.length || 0} replies`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the sync
syncUpvotesForAllAccounts();
