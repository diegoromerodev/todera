import {Group} from './Group.js'
import {Todo} from './Todo.js'
import {addToState, removeFromState} from './manageState.js'
import {populateGroupTodos} from './manageGroups.js'
import {addFormListeners, addSidebarListeners, addCheckedListeners,addRemoveGroupListeners, showGroups, showTodos,showFormEventListeners, showDropdownGroups} from './dom.js';

let userGroups = JSON.parse(localStorage.getItem('groups')) || [];
let userTodos = JSON.parse(localStorage.getItem('todos')) || [];


//( group )name, todos=[], lastSelected
//( todo )[title, description, notes, dueDate, priority, group]
let currGroup = (function(arr) {
    if (arr.length === 0) {
        const group = Group(['Todos']);
        group.lastSelected = true
        addToState(group, arr)
        return group
    }
    // return the group with the lastSelected flag
    return arr.filter(group => group.lastSelected)[0]
})(userGroups);

addFormListeners(userTodos, userGroups)
showGroups(userGroups, false)
showDropdownGroups(userGroups)
addSidebarListeners(showTodos, userGroups, userTodos)
showFormEventListeners()

populateGroupTodos(userTodos, userGroups)
//show last selected group's todos
showTodos(currGroup.name, userGroups)

addCheckedListeners(userGroups, userTodos)
addRemoveGroupListeners(userGroups, userTodos)