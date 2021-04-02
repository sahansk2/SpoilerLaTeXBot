interface MessageSchema {
    guild_id: string;
    channel_id: string;
    bot_message_id: string;
    src_message_id: string;
    src_user_id: string;
}
  
interface UniqueMessage {
    guild_id: string;
    channel_id: string;
    message_id: string;
}

export {
    MessageSchema,
    UniqueMessage
}