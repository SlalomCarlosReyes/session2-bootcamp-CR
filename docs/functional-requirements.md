# Functional Requirements for TODO Application

## Task Management

1. The system shall allow users to create a new task with a required title.
2. The system shall allow users to optionally assign a priority level to a task at creation time.
3. The system shall allow users to edit an existing task, including its title, description, and priority.
4. The system shall allow users to delete an existing task.
5. The system shall require confirmation before permanently deleting a task.

## Task Completion

1. The system shall allow users to mark an incomplete task as completed.
2. The system shall allow users to mark a completed task as incomplete.
3. The system shall visually distinguish completed tasks from incomplete tasks.

## Due Date Management

1. The system shall allow users to add a due date to a task.
2. The system shall allow users to update an existing due date on a task.
3. The system shall allow users to remove a due date from a task.
4. The system shall display due dates in a consistent and readable date format.

## Sorting

1. The system shall allow users to sort tasks by due date in ascending order.
2. The system shall allow users to sort tasks by due date in descending order.
3. The system shall allow users to sort tasks by priority.
4. The system shall keep tasks without due dates grouped after tasks with due dates when sorting by due date.

## Filtering

1. The system shall allow users to filter the task list to show all tasks.
2. The system shall allow users to filter the task list to show only completed tasks.
3. The system shall allow users to filter the task list to show only incomplete tasks.
4. The system shall update the visible task list immediately when a filter is applied.

## Persistence

1. The system shall persist task data in client-side storage.
2. The system shall restore all persisted tasks when the application is refreshed or reopened.
3. The system shall persist task state changes, including completion status, due dates, and edits, without requiring manual save actions.
