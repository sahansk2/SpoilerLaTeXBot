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

// This file contains the event hooks used directly by the Discord Bot
import { Message, MessageAttachment } from "discord.js"
import DatabaseConnection from "./db/db"
import { findExpressions, exprToURL } from "./match"

const SRC_LOC: string = "https://github.com/sahansk2/secretlatexbot";

function clear_linked_messages(src_msg: Message, connection: DatabaseConnection) {
  const db_msg = {
    guild_id: src_msg.guild!.id,
    channel_id: src_msg.channel.id,
    message_id: src_msg.id
  }
  const bot_msgs_to_delete = connection.get_all_linked(db_msg)
  for (const bot_msg of bot_msgs_to_delete) {
    console.log('deleting message with id=' + bot_msg.bot_message_id)
    src_msg.channel.messages.fetch(bot_msg.bot_message_id)
      .then((msg) => {
        msg.delete()
      }).catch(()=>{})
  }
  console.log('deleting in db')
  connection.delete_all_linked(db_msg)
  console.log('finished deleting in db')
  return src_msg
}
  
function detect_content(msg: Message, connection: DatabaseConnection) {
  const content: string = msg.content;
  const delim: number = content.indexOf("$||") 
  if (delim !== -1) {
    if (content.trim() == "$||help") {
      msg.channel.send(`Send Latex expressions in spoiler tags! Just wrap your latex expression like this: \`$|| YOUR EXPRESSION HERE ||\`. Supports multiple expressions in the same message. For example: Three divided by four is $||\\frac{3}{4}||, as opposed to $||\\frac{4}{5}||. Type \`$||source\` for access to source code.`)
    } else if (content.trim() == "$||source") {
      msg.channel.send(`The source code for this bot is available at ${SRC_LOC}.`)
    } else {
      const expressions = findExpressions(content)
      if (expressions.length > 0)
        for (let i = 0; i < expressions.length; i++) {
          msg.channel.send(new MessageAttachment(`https://chart.googleapis.com/chart?cht=tx&chl=${exprToURL(expressions[i])}`, `SPOILER_expr_${i}.png`))
            .then((botmsg) => {
              // Store the sent bot message / sender message pair
              console.log('the guild is: ', msg.guild!.id)
              console.log('the message author is: ', msg.author.id)

              const entry = {
                guild_id: msg.guild!.id,
                channel_id: msg.channel.id,
                bot_message_id: botmsg.id,
                src_message_id: msg.id,
                src_user_id: msg.author.id
              }
              connection.insert_message(entry)
              console.log('*********************************\n',
              connection.db.prepare(`SELECT * FROM messages`).all()
              )
              return botmsg
            }).catch((err) => console.log(err))
            // .then((botmsg) => botmsg.react('🗑️'))
        }
    }
  }
}

export {
  detect_content,
  clear_linked_messages
}