import expectExport from 'expect'
import '../src/match'
import assert from 'assert'
import findExpressions from '../src/match'

describe('findExpressions', () => {
    it('Should match a simple expression', () => {
        const testStr = 'Did you get $|| 3 || for the first question'
        const exprs = findExpressions(testStr)
        assert.strictEqual(exprs.length, 1, `${exprs} has the wrong length, expected 1`)
        assert.strictEqual(exprs[0], '3')
    })
    it('Should match multiple expressions', () => {
        const testStr = String.raw`I got $|| \sqrt(x^{3}) || and $|| tan^{-1}(\pi/3) ||`
        const exprs = findExpressions(testStr)
        assert.strictEqual(exprs.length, 2)
        assert.notStrictEqual(exprs, [String.raw`\sqrt(x^{3})`, String.raw`tan^{-1}(\pi/3)`])
    })
    it('Should handle newlines', () => {
        const testStr = `I got $|| 2890 || \n and $|| tan^{-1}(4/3) ||`
        const exprs = findExpressions(testStr)
        assert.strictEqual(exprs.length, 2)
        assert.notStrictEqual(exprs, ['2890', 'tan^{-1}(4/3)'])
    })
    it('Should ignore recognized symbols enclosed in backticks', () => {
        const testStr = 'Just use `$|| latex here ||` to use the bot ||'
        const exprs = findExpressions(testStr)
        assert.strictEqual(exprs.length, 0)
        assert.notStrictEqual(exprs, ['2890', 'tan^{-1}(4/3)'])
    })
})