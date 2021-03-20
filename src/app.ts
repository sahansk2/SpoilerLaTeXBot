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

import { Client, Message, MessageAttachment, MessageEmbed } from 'discord.js';
import { findExpressions, exprToURL } from './match';

require('dotenv').config()

const client: Client = new Client()
const BOT_KEY = process.env.BOT_KEY;
const SRC_LOC: string = "https://github.com/sahansk2/secretlatexbot";

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  client.user?.setPresence({ activity: { name: '$||help' }})
  console.log('Set presence.')
});

client.on('message', (msg) => {
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
        msg.channel.send(expressions.map((expr, i) => new MessageAttachment(`https://chart.googleapis.com/chart?cht=tx&chl=${exprToURL(expr)}`, `SPOILER_expr_${i}.png`)))
    }
  }
});

client.login(BOT_KEY);
