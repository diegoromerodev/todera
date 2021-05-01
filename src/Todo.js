import { nanoid } from "nanoid"

export class Todo {
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