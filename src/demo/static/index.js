/* MESSAGES DISPLAYED TO WEBSITE USER */

const errorText = 'Error calculating result! Check your network, or check your input.'
const detectionResultHeader = 'Detected chunks:'
const convertedImageHeader = 'Detected chunks:'

/* NODE/ELEMENT HELPERS */
const overwriteResultNode = id => {
    let resultnode = document.getElementById(id)
    const oldchildren = resultnode.childNodes
    while (resultnode.firstChild) {
        resultnode.firstChild.remove()
    }
    return resultnode
}
const createErrorNode = text => {
    const errorNode = document.createElement('p')
    errorNode.textContent = text
    errorNode.classList.add('error')
    return errorNode
}

/* HEAVY LOGIC */

const handleSubmitDetection = (e) => {
    e.preventDefault();
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
            throw new Error(response.statusText)
        }
        return response.json()
    })
    .then(expressions => {
        let resultnode = document.getElementById('expression-out')
        const oldchildren = resultnode.childNodes
        while (resultnode.firstChild) {
            resultnode.firstChild.remove()
        }
        let titlenode = document.createElement('h3')
            .appendChild(
                document.createElement('i')
            )
        titlenode.innerText = detectionResultHeader
        resultnode.appendChild(titlenode)
        for (const expr of expressions) {
            const containing = document.createElement('p')
            const exprnode = containing.appendChild(document.createElement('span'))
            exprnode.textContent = expr
            exprnode.classList.add('simpleborder', 'latex-expr')
            resultnode.append(containing)
        }
    })
    .catch(err => {
        const resultnode = overwriteResultNode('expression-out')
        resultnode.appendChild(createErrorNode(errorText))
        console.log(err)
    })
}

const handleSubmitLatex = (e) => {
    e.preventDefault()
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
            throw new Error(response.statusText)
        }
        return response.blob()
    })
    .then(rendered => {
        console.log(rendered)
        const resultnode = overwriteResultNode('latex-out')
        const renderedNode = new Image()
        renderedNode.src = URL.createObjectURL(rendered)
        renderedNode.classList.add('simpleborder', 'latex-image')
        resultnode.appendChild(renderedNode)
    })
    .catch(err => {
        const resultnode = overwriteResultNode('latex-out')
        resultnode.appendChild(createErrorNode(errorText))
        console.log(err)
    })
}

