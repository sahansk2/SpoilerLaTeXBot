CREATE TABLE MessageContent(
  userMessageId TEXT,
  channelId TEXT,
  messageExpressionsHash TEXT,
  contentTimestamp TIMESTAMP,
  PRIMARY KEY (userMessageId)
);

CREATE TABLE UserToBotMessage(
  userMessageId TEXT REFERENCES MessageContent(userMessageId) ON DELETE CASCADE,
  botMessageId TEXT
);

-- DROP TABLE MessageContent;
-- If updating,
CREATE FUNCTION RefreshUserMessage(recentUserMessageId TEXT, recentChannelId TEXT, expressions TEXT[]) 
RETURNS TEXT[]
AS $$
DECLARE
  expressionHash TEXT;
BEGIN
    -- Significant assumption, there will be no double bars in the expressions.
    -- This is because Discord will try to break the spoiler at this part, so this should be fine
  expressionHash := md5(array_to_string(ARRAY(SELECT unnest(expressions) AS x ORDER BY x DESC), '||'));
  -- Case where this message is new
  IF 0 = (SELECT COUNT(*) FROM MessageContent m WHERE m.userMessageId = recentUserMessageId) THEN
    INSERT INTO MessageContent(userMessageId, channelId, messageExpressionsHash, contentTimestamp)
    VALUES (recentUserMessageId, recentChannelId, expressionHash, now());
    
    RETURN ARRAY[]::TEXT[];
  -- Case where the message expressions have changed
  ELSIF expressionHash <> (SELECT m.messageExpressionsHash FROM MessageContent m WHERE m.userMessageid = recentUserMessageId) THEN 
    UPDATE MessageContent as m
      SET messageExpressionsHash = expressionHash, contentTimestamp = now()
      WHERE m.userMessageId = recentUserMessageId;
    RETURN ARRAY(SELECT botMessageId FROM UserToBotMessage u WHERE u.userMessageId=recentUserMessageId);
  -- the message expressions did not change
  ELSE
    UPDATE MessageContent as m
      SET contentTimestamp = now()
      WHERE m.userMessageId = recentUserMessageId;
    RETURN ARRAY[]::TEXT[];
  END IF;
END $$ LANGUAGE plpgsql;