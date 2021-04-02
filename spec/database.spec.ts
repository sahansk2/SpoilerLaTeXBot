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

import '../src/db/model'
import assert from 'assert'
import DatabaseConnection from '../src/db/db'

describe('Basic sqlite3 functionality', () => {
    const connection = new DatabaseConnection(':memory:')
    it('Should initialize a messages table', () => {
        const stmt = connection.db.prepare('SELECT * FROM messages')
        const results = stmt.all()
        assert.deepStrictEqual([], results)
    })

    it('Should be able to insert arbitrary messages with channelIDs', () => {
        connection.insert_message({
            bot_message_id: 'botmsgid',
            guild_id: 'guildid',
            src_message_id: 'srcmsgid',
            channel_id: 'channelid',
            src_user_id: 'srcusrid'
        })
        const results = connection.db.prepare('SELECT * FROM messages').all()
        assert.strictEqual(results.length, 1)
    })

    it('Should be able to delete messages given a botid only if the user is right', () => {
        connection.delete_dependent_botmsg({ guild_id: "guildid", channel_id: "channelid", message_id: "botmsgid"}, 'wrong-user')
        const stmt_delete_fail = connection.db.prepare('SELECT * FROM messages')
        const results_delete_fail = stmt_delete_fail.all()
        assert.notStrictEqual(0, results_delete_fail.length)
        connection.delete_dependent_botmsg({ guild_id: "guildid", channel_id: "channelid", message_id: "botmsgid"}, 'srcusrid')
        const stmt_delete = connection.db.prepare('SELECT * FROM messages')
        const results_delete = stmt_delete.all()
        assert.strictEqual(0, results_delete.length)
        
    })
})