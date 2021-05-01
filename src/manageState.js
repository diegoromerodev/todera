function addToState(element, array, prop) {
    let name = ''
    for (let i = 0; i < array.length; i++){
        if (array[i][prop] === element[prop]) return;
    }
    if (prop === 'name') name = 'groups'
    else if (prop === 'description') name = 'todos'
    array.push(element)
    localStorage.setItem(name, JSON.stringify(array));
    return array
}

function removeFromState(id, arr, type) {
    const toDelete = arr.findIndex(element => element.id === id)
    const deleted = arr.splice(toDelete, 1)
    localStorage.setItem(type, JSON.stringify(arr));
    return deleted
}

export {addToState, removeFromState}