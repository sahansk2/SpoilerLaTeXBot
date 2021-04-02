/*
  Copyright (2021) Sahan Kumarasinghe.

  This file is part of SecretLatexBot.

  SecretLatexBot is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as
  published by the Free Software Foundation, either version 3 of the
  License, or (at your option) any later version.

  SecretLatexBot is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import Database, { SqliteError } from "better-sqlite3"
import "./model"

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

class DatabaseConnection {
  db;
  constructor(path?: string) {
    this.db = new Database(path ?? ':memory:', { verbose: console.log })
    const SETUP_TABLE_SQL = `CREATE TABLE IF NOT EXISTS messages (
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      bot_message_id TEXT NOT NULL,
      src_message_id TEXT NOT NULL,
      src_user_id TEXT NOT NULL,
      PRIMARY KEY (guild_id, channel_id, bot_message_id)
    )`
    const initialize_table_stmt = this.db.prepare(SETUP_TABLE_SQL)
    initialize_table_stmt.run() 
  }

  insert_message(msg: MessageSchema) {
    const ADD_MESSAGE_ENTRY_SQL = `INSERT INTO messages 
      (
        guild_id, 
        channel_id, 
        bot_message_id, 
        src_message_id, 
        src_user_id
      ) VALUES (
        @guild_id,  
        @channel_id, 
        @bot_message_id, 
        @src_message_id, 
        @src_user_id
    `
    const insert_message_stmt = this.db.prepare(ADD_MESSAGE_ENTRY_SQL)
    return insert_message_stmt.run(msg)
  }

  delete_botmsg({ guild_id, channel_id, message_id: bot_message_id}: UniqueMessage, sender_id: string) {
    const DELETE_BOTMSG = `DELETE FROM messages WHERE guild_id = @guild_id and channel_id = @channel_id and bot_message_id = @bot_message_id`
    const delete_botmsg_stmt = this.db.prepare(DELETE_BOTMSG)
    return delete_botmsg_stmt.run({
      guild_id,
      channel_id,
      bot_message_id
    })
  }

  close(): void {
    this.db.close()
  }
}

// Useful query to get original source message given a bot message id reacted to, and the person who put that reaction
// Important to validate the deletion of the message
// const BOTMSG_TO_SRCMSG_SQL = `SELECT src_message_id FROM messages WHERE guild_id = @guild_id AND channel_id = @channel_id AND bot_message_id = @bot_message_id AND src_user_id = @src_user_id`
// const botmsg_to_srcmsg_stmt = db.prepare(BOTMSG_TO_SRCMSG_SQL)

export default DatabaseConnection