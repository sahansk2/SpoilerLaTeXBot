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
})