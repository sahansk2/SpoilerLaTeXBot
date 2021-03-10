function findExpressions(content: string): string[] {
    const backtickRegex = RegExp('`[^`]*`')
    const expRegex = RegExp(String.raw`\$\|\|([^$]+)\|\|`, 'g');
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
export {
    findExpressions,
    exprToURL
}