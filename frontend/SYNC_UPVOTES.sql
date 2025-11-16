-- Sync upvotes for all comments and replies
-- This script updates the upvotes_count column to match the actual number of upvote reactions

-- Step 1: Update comment upvotes counts
UPDATE book_comments 
SET upvotes_count = (
  SELECT COUNT(*) 
  FROM book_comment_reactions 
  WHERE book_comment_reactions.comment_id = book_comments.id 
    AND book_comment_reactions.reaction_type = 'upvote'
)
WHERE EXISTS (
  SELECT 1 FROM book_comment_reactions 
  WHERE book_comment_reactions.comment_id = book_comments.id 
    AND book_comment_reactions.reaction_type = 'upvote'
);

-- Step 2: Update reply upvotes counts
UPDATE book_comment_replies 
SET upvotes_count = (
  SELECT COUNT(*) 
  FROM book_reply_reactions 
  WHERE book_reply_reactions.reply_id = book_comment_replies.id 
    AND book_reply_reactions.reaction_type = 'upvote'
)
WHERE EXISTS (
  SELECT 1 FROM book_reply_reactions 
  WHERE book_reply_reactions.reply_id = book_comment_replies.id 
    AND book_reply_reactions.reaction_type = 'upvote'
);

-- Step 3: Set upvotes_count to 0 for comments with no upvotes
UPDATE book_comments 
SET upvotes_count = 0 
WHERE NOT EXISTS (
  SELECT 1 FROM book_comment_reactions 
  WHERE book_comment_reactions.comment_id = book_comments.id 
    AND book_comment_reactions.reaction_type = 'upvote'
);

-- Step 4: Set upvotes_count to 0 for replies with no upvotes
UPDATE book_comment_replies 
SET upvotes_count = 0 
WHERE NOT EXISTS (
  SELECT 1 FROM book_reply_reactions 
  WHERE book_reply_reactions.reply_id = book_comment_replies.id 
    AND book_reply_reactions.reaction_type = 'upvote'
);

-- Step 5: Show the results
SELECT 
  'Comments' as type,
  COUNT(*) as total_items,
  SUM(CASE WHEN upvotes_count > 0 THEN 1 ELSE 0 END) as items_with_upvotes,
  SUM(upvotes_count) as total_upvotes
FROM book_comments

UNION ALL

SELECT 
  'Replies' as type,
  COUNT(*) as total_items,
  SUM(CASE WHEN upvotes_count > 0 THEN 1 ELSE 0 END) as items_with_upvotes,
  SUM(upvotes_count) as total_upvotes
FROM book_comment_replies

ORDER BY type DESC;
