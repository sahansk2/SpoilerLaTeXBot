import { Client, Message, MessageAttachment, MessageEmbed } from 'discord.js';
import findExpressions from './match';

require('dotenv').config()

const client: Client = new Client()
const BOT_KEY = process.env.BOT_KEY;

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
      msg.channel.send(`Send Latex expressions in spoiler tags! Just wrap your latex expression like this: \`$|| YOUR EXPRESSION HERE ||\`. Supports multiple expressions in the same message. For example: Three divided by four is $||\\frac{3}{4}||, as opposed to $||\\frac{4}{5}||.`)
    } else {
      const expressions = findExpressions(content)
      if (expressions.length > 0)
        msg.channel.send(expressions.map((expr, i) => new MessageAttachment(`https://chart.googleapis.com/chart?cht=tx&chl=${encodeURI(expr)}`, `SPOILER_expr_${i}.png`)))
    }
  }
});

client.login(BOT_KEY);
