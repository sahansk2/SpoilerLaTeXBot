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

import { Client, Message } from 'discord.js';
import { app } from '../test/testapp'
import msg_db from './db/db'
import { detect_content, clear_linked_messages } from './eventhooks'

require('dotenv').config()

const client: Client = new Client({ partials: ['MESSAGE', 'REACTION'] })

const BOT_KEY = process.env.BOT_KEY;
const TESTPORT = process.env.TESTPORT;

process.on('SIGINT', () => {
  console.log('Bye for now!')
  msg_db.close()
  process.exit()
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  client.user?.setPresence({ activity: { name: '$||help' }})
  console.log('Set presence.')
});

client.on('message', (msg) => {
  console.log('detected new message', msg.id)
  detect_content(msg)
});

client.on('messageDelete', (msg) => {
  console.log('detected messageDelete on', msg.id)
  // If it's partial, we don't care - we can't do anything about it, because we only have the msg id and nothing else.
  if (!msg.partial && msg.author.id != client.user!.id) {
    clear_linked_messages(msg as Message)
  }
})

client.on('messageUpdate', (old_msg, new_msg) => {
  console.log('detected messageUpdate from', old_msg.id, 'to', new_msg.id)
  // If it's partial, then that means it's probably just uncached. 
  let message_promises: Array<Promise<Message>> = []
  if (old_msg.partial) {
    message_promises.push(old_msg.fetch())
  } else {
    message_promises.push(new Promise(resolve => resolve(old_msg)))
  }

  if (new_msg.partial) {
    message_promises.push(new_msg.fetch())
  } else {
    message_promises.push(new Promise(resolve => resolve(new_msg)))
  }

  Promise.all(message_promises)
    .then(([old_msg, new_msg]) => {
      if (old_msg.content == new_msg.content) return;
      clear_linked_messages(old_msg)
      detect_content(new_msg)
  }).catch((err) => console.log(err))
})

client.login(BOT_KEY);

app.listen(TESTPORT || 4343, () => {
  console.log('Now listening on localhost:4343')
})