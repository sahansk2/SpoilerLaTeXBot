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
const sharp = require("sharp");
const mjAPI = require("mathjax-node");

function findExpressions(content: string): string[] {
    const backtickRegex = RegExp('`[^`]*`')
    const expRegex = RegExp(String.raw`\$\|\|([^$]+?)\|\|`, 'g');
    const matches = content.replace(backtickRegex, '').matchAll(expRegex)
    let results: string[] = [];
    for (let result of matches) {
        results.push(result[1].trim())
    }
    return results;
}

function exprToURL(expr: string): string {
    return `${encodeURIComponent(expr)}`
}


function get_image(latex: String) {
    return mjAPI.typeset({
      math: latex,
      format: "inline-TeX",
      svg: true,
    })
    .then((data: any) => {
      if (data.errors) throw new Error("Bad SVG output!")
      else {
        return sharp(Buffer.from(data.svg), { density: 230 }).extractChannel('alpha').toColorspace('b-w').png().toBuffer()
      }
    })
    .catch((err: any) => console.log(err))
}

export {
    findExpressions,
    exprToURL,
    get_image
}