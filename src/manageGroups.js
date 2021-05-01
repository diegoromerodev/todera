function populateGroupTodos(todos, groups){
    for (let group of groups){
        group.todos = todos.filter(todo => {
            return group.id === todo.group
        })
    }
}

export {populateGroupTodos}