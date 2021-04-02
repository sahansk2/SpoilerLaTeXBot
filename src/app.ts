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

import { Client } from 'discord.js';
import DatabaseConnection from './db/db'
import { detect_content, clear_linked_messages } from './eventhooks'

require('dotenv').config()

const client: Client = new Client({ partials: ['MESSAGE', 'REACTION'] })
const BOT_KEY = process.env.BOT_KEY;

const connection = new DatabaseConnection(process.env.SLB_PATH)
process.on('SIGINT', () => {
  console.log('Bye for now!')
  connection.close()
  process.exit()
})
client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  client.user?.setPresence({ activity: { name: '$||help' }})
  console.log('Set presence.')
});

client.on('message', (msg) => {
  detect_content(msg, connection)
});

client.on('messageDelete', (msg) => {
  // If it's partial, we don't care - we can't do anything about it, because we only have the msg id and nothing else.
  if (!msg.partial) {
    clear_linked_messages(msg, connection)
  }
})

client.on('messageUpdate', (old_msg, new_msg) => {
  // If it's partial, then that means it's probably just uncached. 
  if (old_msg.partial) {
    old_msg.fetch()
      .then((msg) => {
        clear_linked_messages(msg, connection)
      })
      .catch((err) => console.log(err))
  } else {
    clear_linked_messages(old_msg, connection)
  }

  if (new_msg.partial) {
    new_msg.fetch()
      .then(msg => detect_content(msg, connection))
      .catch(err => console.log(err))
  } else {
    detect_content(new_msg, connection)
  }
})

client.login(BOT_KEY);