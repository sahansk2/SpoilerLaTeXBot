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
import msg_db from './db/db'
import { detect_content, clear_linked_messages } from './eventhooks'

require('dotenv').config()

const client: Client = new Client({ partials: ['MESSAGE', 'REACTION'] })
const BOT_KEY = process.env.BOT_KEY;

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
  console.log('detected message')
  detect_content(msg)
});

client.on('messageDelete', (msg) => {
  console.log('detected messageDelete on ', msg.id)
  // If it's partial, we don't care - we can't do anything about it, because we only have the msg id and nothing else.
  if (!msg.partial && msg.author.id != client.user!.id) {
    clear_linked_messages(msg as Message)
  }
})

client.on('messageUpdate', (old_msg, new_msg) => {
  console.log('detected messageUpdate on ', old_msg.id)
  // If it's partial, then that means it's probably just uncached. 
  if (old_msg.partial) {
    old_msg.fetch()
      .then((msg) => {
        clear_linked_messages(msg)
      })
      .catch((err) => console.log(err))
  } else {
    clear_linked_messages(old_msg as Message)
  }

  if (new_msg.partial) {
    new_msg.fetch()
      .then(msg => detect_content(msg))
      .catch(err => console.log(err))
  } else {
    detect_content(new_msg as Message)
  }
})

client.login(BOT_KEY);