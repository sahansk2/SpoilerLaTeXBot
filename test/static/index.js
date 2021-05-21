console.log('loaded')

const handleSubmitDetection = (e) => {
    e.preventDefault();
    console.log("submit")
    const message = document.forms['expression-form']['expression-in'].value
    console.log("will try to submit " + message)
    fetch('/detect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
    })
    .then(response => {
        if (!response.ok) { 
            throw new Error('Network response was bad!')
        }
        return response.json()
    })
    .then(expressions => {
        let resultnode = document.getElementById('expression-out')
        const oldchildren = resultnode.childNodes
        while (resultnode.firstChild) {
            resultnode.firstChild.remove()
        }
        let i = 0;
        for (const expr of expressions) {
            const exprnode = document.createElement('p')
            exprnode.textContent = expr
            exprnode.id = i
            resultnode.append(exprnode)
            i += 1
        }
    })
}

const handleSubmitLatex = (e) => {
    e.preventDefault()
    console.log('submit')
    const latex = document.forms['latex-form']['latex-in'].value
    fetch('/latex', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(latex)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Bad network response!')
        }
        return response.blob()
    })
    .then(rendered => {
        console.log(rendered)
        const resultnode = document.getElementById('latex-out')
        const renderedURL = URL.createObjectURL(rendered)
        if (resultnode.firstChild) {
            resultnode.firstChild.remove()
        }
        const renderedNode = new Image()
        renderedNode.src = renderedURL
        resultnode.appendChild(renderedNode)
    })
}