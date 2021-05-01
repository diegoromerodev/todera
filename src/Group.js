import {nanoid} from 'nanoid'
export function Group([name, todos=[], lastSelected = false]) {
    return {id: nanoid(6),
            name,
            todos,
            lastSelected}
}