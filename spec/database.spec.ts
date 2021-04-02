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