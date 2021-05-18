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
const mjAPI = require("mathjax-node");
const sharp = require("sharp");

import { Message, MessageAttachment } from "discord.js"
import msg_db from "./db/db"
import { findExpressions, exprToURL } from "./match"

const SRC_LOC: string = "https://github.com/sahansk2/secretlatexbot";

function clear_linked_messages(src_msg: Message) {
  msg_db.delete_all_linked(src_msg)
  console.log('finished deleting in db')
  return src_msg
}

function detect_content(msg: Message) {
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
          mjAPI.typeset({
            math: expressions[i],
            format: "inline-TeX",
            svg: true,
          })
          .then((data: any) => {
            if (data.errors) throw new Error("Bad SVG output!")
            else {
              console.log("SVG: " + data.svg.replace(/currentColor/g, 'white'))
              return sharp(Buffer.from(data.svg)).png().toBuffer()
            }
          })
          .then((img: any) => msg.channel.send(new MessageAttachment(img, `SPOILER_expr_${i}.png`)))
          .then((botmsg: MessageAttachment) => {
              // Store the sent bot message / sender message pair
              console.log('the message author is: ', msg.author.id)

              const entry = {
                $bot_message_id: botmsg.id,
                $src_message_id: msg.id,
                $src_user_id: msg.author.id
              }
              msg_db.insert_message(entry)
              return botmsg
            }).catch((err: any) => console.log(err))
            // .then((botmsg) => botmsg.react('🗑️'))
        }
    }
  }
}

export {
  detect_content,
  clear_linked_messages
}