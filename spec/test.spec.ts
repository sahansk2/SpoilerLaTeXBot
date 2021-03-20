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


import '../src/match'
import assert from 'assert'
import { findExpressions, exprToURL } from '../src/match'

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
    it('Should convert plus signs into the latex expression', () => {
        const testStr = 'What is $|| cos(2x) + sin(2x) ||?'
        const expr = findExpressions(testStr)[0]
        const encodedStr = exprToURL(expr)
        assert.doesNotMatch(encodedStr, RegExp(String.raw`\+`), 'A "+" was found in the encoded string. This will be converted to whitespace and will be lost.')
        const receivedStr = decodeURIComponent(encodedStr);
        assert.strictEqual(expr, receivedStr);
    })
})