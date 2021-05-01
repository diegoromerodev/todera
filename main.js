/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./node_modules/nanoid/index.prod.js
// This file replaces `index.js` in bundlers like webpack or Rollup,
// according to `browser` config in `package.json`.



if (false) {}

let random = bytes => crypto.getRandomValues(new Uint8Array(bytes))

let customRandom = (alphabet, size, getRandom) => {
  // First, a bitmask is necessary to generate the ID. The bitmask makes bytes
  // values closer to the alphabet size. The bitmask calculates the closest
  // `2^31 - 1` number, which exceeds the alphabet size.
  // For example, the bitmask for the alphabet size 30 is 31 (00011111).
  // `Math.clz32` is not used, because it is not available in browsers.
  let mask = (2 << (Math.log(alphabet.length - 1) / Math.LN2)) - 1
  // Though, the bitmask solution is not perfect since the bytes exceeding
  // the alphabet size are refused. Therefore, to reliably generate the ID,
  // the random bytes redundancy has to be satisfied.

  // Note: every hardware random generator call is performance expensive,
  // because the system call for entropy collection takes a lot of time.
  // So, to avoid additional system calls, extra bytes are requested in advance.

  // Next, a step determines how many random bytes to generate.
  // The number of random bytes gets decided upon the ID size, mask,
  // alphabet size, and magic number 1.6 (using 1.6 peaks at performance
  // according to benchmarks).

  // `-~f => Math.ceil(f)` if f is a float
  // `-~i => i + 1` if i is an integer
  let step = -~((1.6 * mask * size) / alphabet.length)

  return () => {
    let id = ''
    while (true) {
      let bytes = getRandom(step)
      // A compact alternative for `for (var i = 0; i < step; i++)`.
      let j = step
      while (j--) {
        // Adding `|| ''` refuses a random byte that exceeds the alphabet size.
        id += alphabet[bytes[j] & mask] || ''
        if (id.length === size) return id
      }
    }
  }
}

let customAlphabet = (alphabet, size) => customRandom(alphabet, size, random)

let nanoid = (size = 21) => {
  let id = ''
  let bytes = crypto.getRandomValues(new Uint8Array(size))

  // A compact alternative for `for (var i = 0; i < step; i++)`.
  while (size--) {
    // It is incorrect to use bytes exceeding the alphabet size.
    // The following mask reduces the random byte in the 0-255 value
    // range to the 0-63 value range. Therefore, adding hacks, such
    // as empty string fallback or magic numbers, is unneccessary because
    // the bitmask trims bytes down to the alphabet size.
    let byte = bytes[size] & 63
    if (byte < 36) {
      // `0-9a-z`
      id += byte.toString(36)
    } else if (byte < 62) {
      // `A-Z`
      id += (byte - 26).toString(36).toUpperCase()
    } else if (byte < 63) {
      id += '_'
    } else {
      id += '-'
    }
  }
  return id
}



;// CONCATENATED MODULE: ./src/Group.js

function Group([name, todos=[], lastSelected = false]) {
    return {id: nanoid(6),
            name,
            todos,
            lastSelected}
}
;// CONCATENATED MODULE: ./src/manageState.js
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


;// CONCATENATED MODULE: ./src/manageGroups.js
function populateGroupTodos(todos, groups){
    for (let group of groups){
        group.todos = todos.filter(todo => {
            return group.id === todo.group
        })
    }
}


;// CONCATENATED MODULE: ./src/Todo.js


class Todo {
    constructor([title, description, notes, dueDate, priority, group = '']){
        if (!title || !description || !dueDate) return;
        this.id = nanoid(6)
        this.title = title
        this.description = description
        this.notes = notes
        this.dueDate = dueDate
        this.priority = priority
        this.group = group
    }
}
;// CONCATENATED MODULE: ./src/dom.js





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


;// CONCATENATED MODULE: ./src/index.js






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
/******/ })()
;