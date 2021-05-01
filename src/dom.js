import {addToState, removeFromState} from './manageState.js'
import {Todo} from './Todo.js'
import {Group} from './Group.js'
import {populateGroupTodos} from './manageGroups.js'

function addFormListeners(todos, groups){
    const todoForm = document.querySelector('#todo-form')
    const groupForm = document.querySelector('#group-form')
    const forms = [todoForm, groupForm]
    for (let form of forms){
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const values = [];
            for (let i = 0; i < form.elements.length; i++){
                const val = form.elements[i].value
                if (form.elements[i].type === 'submit') continue;
                values.push(val)
            }
            if (form.id === 'todo-form'){
                addToState(new Todo(values), todos, 'description')
                refreshTodos(groups, todos)
            } else if (form.id === 'group-form'){
                addToState(Group(values), groups, 'name')
                console.log(groups)
                refreshGroups(groups, todos)
            }
        })
    }
}

function showFormEventListeners(){
    const showButtons = document.querySelectorAll('.add-btn')
    showButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const groups = document.querySelector('#group-form')
            const todos = document.querySelector('#todo-form')
            if (btn.textContent.includes('group')){
                if (!todos.classList.contains('hide')) return;
                groups.classList.toggle('hide')
            } else {
                if (!groups.classList.contains('hide')) return;
                todos.classList.toggle('hide')
            }
            btn.classList.toggle('active')
            document.querySelector('#container').classList.toggle('lower')
        })
    })
}

function addSidebarListeners(callback, groups, todos){
    const sideBtns = document.querySelectorAll('.side-btn')
    sideBtns.forEach(button => button.addEventListener('click', function(){
        sideBtns.forEach(button => button.classList.remove('active'))
        this.classList.add('active')
        callback(this.textContent.trim(), groups)
        addCheckedListeners(groups, todos)
    }))
}

function addCheckedListeners(groups, todos){
    const checkedButtons = document.querySelectorAll('.completed')
    checkedButtons.forEach(button => {
        button.addEventListener('click', () => {
            removeFromState(button.parentElement.id, todos, 'todos')
            refreshTodos(groups, todos)
        })
    })
}

function addRemoveGroupListeners(groups, todos){
    const sideButtons = document.querySelectorAll('.side-btn .delete')
    sideButtons.forEach(button => button.addEventListener('click', () => {
        let select = false
        const removed = removeFromState(button.parentElement.id, groups, 'groups')
        if (removed[0].lastSelected){
            const todoContainer = document.querySelector('#todos')
            todoContainer.innerHTML = ''
        }
        refreshGroups(groups, todos)
    }))
}

function showGroups(arr){
    const sidebar = document.querySelector('#sidebar')
    const groups = createGroups(arr)
    sidebar.innerHTML = groups
}

function showDropdownGroups(arr){
    const dropdown = document.querySelector('#group-bind')
    dropdown.innerHTML = ''
    for (let group of arr){
        const option = document.createElement('option')
        option.setAttribute('value', group.id)
        option.textContent = group.name
        dropdown.append(option)
    }
}

function createGroups(arr){
    return arr.map(el => {
        return `
        <div id="${el.id}" class="side-btn ${el.lastSelected ? 'active' : ''}">
            <i class="fas fa-times delete"></i>
            ${el.name}
        </div>
        `
    }).join('\n')
}

function showTodos(name, arr){
    const group = arr.find(el => {
        el.lastSelected = false
        return el.name === name
    })
    if (!group) return
    group.lastSelected = true
    const todoContainer = document.querySelector('#todos')
    const todos = createTodos(group.todos)
    todoContainer.innerHTML = todos
}

function refreshTodos(groups, todos){
    const currGroup = groups.filter(group => group.lastSelected)[0]
    populateGroupTodos(todos, groups)
    showTodos(currGroup.name, groups)
    addCheckedListeners(groups, todos)
}

function refreshGroups(groups, todos){
    showGroups(groups)
    showDropdownGroups(groups)
    addSidebarListeners(showTodos, groups, todos)
    addRemoveGroupListeners(groups, todos)
}

function createTodos(todos){
    return todos.map(el => {
        let icon;
        if (el.priority === 'Urgent') icon = 'exclamation';
        else if (el.priority === 'Relaxed') icon = 'leaf';
        else if (el.priority === 'Medium') icon = 'bolt';
        return `
        <div id="${el.id}" class="neu-box ${el.priority.toLowerCase()}">
            <div class="completed">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="badges">
                <div class="tooltip-cont">
                    <div class="priority ${el.priority.toLowerCase()} w-tooltip">
                        <i class="fas fa-${icon}"></i>
                    </div>
                    <span class="tooltip">${el.priority}</span>
                </div>
                <div class="tooltip-cont">
                    <p class="date w-tooltip">${el.dueDate}</p>
                    <span class="tooltip">Due date</span>
                </div>
            </div>
            <h3 class="title">${el.title}</h3>
            <p class="desc">${el.description}</p>
            <p class="notes">${el.notes}</p>
        </div>
        `
    }).join('\n')
}

export {addFormListeners, addSidebarListeners, addCheckedListeners, addRemoveGroupListeners, showFormEventListeners, showTodos, showGroups, showDropdownGroups}