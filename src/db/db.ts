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

import { Database } from 'sqlite3'
import { Message } from 'discord.js'

require('dotenv').config()

var sqlite3 = require('sqlite3').verbose();

interface MessageSchema {
  $bot_message_id: string;
  $src_message_id: string;
  $src_user_id: string;
}

class DatabaseConnection {
  db: Database;
  constructor(path?: string) {
    console.log("constructed connection")
    this.db = new Database(path)
    const SETUP_TABLE_SQL = `CREATE TABLE IF NOT EXISTS messages (
      bot_message_id TEXT NOT NULL PRIMARY KEY,
      src_message_id TEXT NOT NULL,
      src_user_id TEXT NOT NULL
    )`
    this.db.serialize(() => {
      this.db.run(SETUP_TABLE_SQL)  
    })
  }

  insert_message(msg: MessageSchema) {
    const ADD_MESSAGE_ENTRY_SQL = `INSERT INTO messages 
      (
        bot_message_id, 
        src_message_id, 
        src_user_id
      ) VALUES (
        $bot_message_id, 
        $src_message_id, 
        $src_user_id
      )
    `
    this.db.serialize(() => {
      this.db.run(ADD_MESSAGE_ENTRY_SQL, msg)
    })
  }

  // delete_dependent_botmsg($bot_message_id: string, $src_user_id: string) {
  //   const DELETE_BOTMSG = `DELETE FROM messages WHERE bot_message_id = $bot_message_id AND src_user_id = $src_user_id`
  //   this.db.serialize(() => {
  //     this.db.run(DELETE_BOTMSG, {
  //       $src_user_id,
  //       $bot_message_id
  //     })
  //   })
  // }

  close(): void {
    this.db.close()
  }

  delete_all_linked(src_msg: Message) {
    const $src_message_id = src_msg.id
    const FETCH_ALL_LINKED = `SELECT bot_message_id FROM messages WHERE src_message_id = $src_message_id`
    const DELETE_ALL_LINKED = `DELETE FROM messages WHERE src_message_id = $src_message_id`
    this.db.serialize(() => {
      this.db.each(FETCH_ALL_LINKED, { $src_message_id }, (err, { bot_message_id }) => {
        if (err) return;
        src_msg.channel.messages.fetch(bot_message_id).then(botmsg => botmsg.delete()).catch(err => console.log(err))
        this.db.serialize(() => {
          this.db.run(DELETE_ALL_LINKED, { $src_message_id })
        })
      })
    })
  }
}

// Useful query to get original source message given a bot message id reacted to, and the person who put that reaction
// Important to validate the deletion of the message
// const BOTMSG_TO_SRCMSG_SQL = `SELECT src_message_id FROM messages WHERE guild_id = @guild_id AND channel_id = @channel_id AND bot_message_id = @bot_message_id AND src_user_id = @src_user_id`
// const botmsg_to_srcmsg_stmt = db.prepare(BOTMSG_TO_SRCMSG_SQL)
const msg_db = new DatabaseConnection(process.env.SLB_DB_PATH)

export default msg_db