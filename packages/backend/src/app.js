const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const isTest = process.env.NODE_ENV === 'test';
const dbFilePath = isTest ? ':memory:' : path.join(__dirname, '..', 'data', 'todo.db');

if (!isTest) {
  fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });
}

const db = new Database(dbFilePath);

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority TEXT NOT NULL DEFAULT 'medium',
    due_date TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const VALID_PRIORITIES = new Set(['low', 'medium', 'high']);

function toTaskResponse(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    dueDate: row.due_date,
    completed: Boolean(row.completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sendError(res, statusCode, message, code = 'REQUEST_ERROR') {
  res.status(statusCode).json({
    error: {
      code,
      message,
    },
  });
}

function parseId(rawId) {
  const id = Number.parseInt(rawId, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateDueDate(dueDate) {
  if (dueDate === null || dueDate === undefined || dueDate === '') {
    return { ok: true, normalized: null };
  }

  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false };
  }

  return { ok: true, normalized: parsed.toISOString() };
}

function validatePriority(priority) {
  return VALID_PRIORITIES.has(priority);
}

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

app.get('/api/tasks', (req, res) => {
  try {
    const filter = req.query.filter || 'all';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

    let whereClause = '';
    if (filter === 'completed') {
      whereClause = 'WHERE completed = 1';
    } else if (filter === 'incomplete') {
      whereClause = 'WHERE completed = 0';
    }

    let orderClause = 'ORDER BY created_at DESC';
    if (sortBy === 'dueDate') {
      orderClause = `
        ORDER BY
          CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC,
          due_date ${sortOrder.toUpperCase()},
          created_at DESC
      `;
    } else if (sortBy === 'priority') {
      const priorityOrder = sortOrder === 'asc'
        ? "CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END"
        : "CASE priority WHEN 'low' THEN 1 WHEN 'medium' THEN 2 WHEN 'high' THEN 3 ELSE 4 END";

      orderClause = `ORDER BY ${priorityOrder}, created_at DESC`;
    }

    const rows = db.prepare(`SELECT * FROM tasks ${whereClause} ${orderClause}`).all();
    res.status(200).json(rows.map(toTaskResponse));
  } catch (error) {
    sendError(res, 500, 'Failed to fetch tasks', 'TASK_FETCH_FAILED');
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const priority = req.body.priority || 'medium';
    const dueDateValidation = validateDueDate(req.body.dueDate);

    if (!title) {
      return sendError(res, 400, 'Task title is required', 'TASK_TITLE_REQUIRED');
    }

    if (!validatePriority(priority)) {
      return sendError(res, 400, 'Priority must be low, medium, or high', 'TASK_PRIORITY_INVALID');
    }

    if (!dueDateValidation.ok) {
      return sendError(res, 400, 'Due date must be a valid date', 'TASK_DUEDATE_INVALID');
    }

    const statement = db.prepare(`
      INSERT INTO tasks (title, description, priority, due_date, completed, created_at, updated_at)
      VALUES (?, ?, ?, ?, 0, datetime('now'), datetime('now'))
    `);
    const result = statement.run(title, description, priority, dueDateValidation.normalized);

    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(toTaskResponse(row));
  } catch (error) {
    sendError(res, 500, 'Failed to create task', 'TASK_CREATE_FAILED');
  }
});

app.put('/api/tasks/:id', (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return sendError(res, 400, 'A valid task id is required', 'TASK_ID_INVALID');
    }

    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return sendError(res, 404, 'Task not found', 'TASK_NOT_FOUND');
    }

    const title = typeof req.body.title === 'string' ? req.body.title.trim() : existingTask.title;
    const description = typeof req.body.description === 'string'
      ? req.body.description.trim()
      : existingTask.description;
    const priority = req.body.priority || existingTask.priority;
    const completed = typeof req.body.completed === 'boolean'
      ? Number(req.body.completed)
      : existingTask.completed;
    const rawDueDate = Object.prototype.hasOwnProperty.call(req.body, 'dueDate')
      ? req.body.dueDate
      : existingTask.due_date;
    const dueDateValidation = validateDueDate(rawDueDate);

    if (!title) {
      return sendError(res, 400, 'Task title is required', 'TASK_TITLE_REQUIRED');
    }

    if (!validatePriority(priority)) {
      return sendError(res, 400, 'Priority must be low, medium, or high', 'TASK_PRIORITY_INVALID');
    }

    if (!dueDateValidation.ok) {
      return sendError(res, 400, 'Due date must be a valid date', 'TASK_DUEDATE_INVALID');
    }

    db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, priority = ?, due_date = ?, completed = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(title, description, priority, dueDateValidation.normalized, completed, id);

    const updatedRow = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.status(200).json(toTaskResponse(updatedRow));
  } catch (error) {
    sendError(res, 500, 'Failed to update task', 'TASK_UPDATE_FAILED');
  }
});

app.patch('/api/tasks/:id/completion', (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return sendError(res, 400, 'A valid task id is required', 'TASK_ID_INVALID');
    }

    if (typeof req.body.completed !== 'boolean') {
      return sendError(res, 400, 'completed must be a boolean', 'TASK_COMPLETION_INVALID');
    }

    const result = db.prepare(
      "UPDATE tasks SET completed = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(Number(req.body.completed), id);

    if (!result.changes) {
      return sendError(res, 404, 'Task not found', 'TASK_NOT_FOUND');
    }

    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.status(200).json(toTaskResponse(row));
  } catch (error) {
    sendError(res, 500, 'Failed to update task completion', 'TASK_COMPLETION_UPDATE_FAILED');
  }
});

app.patch('/api/tasks/:id/due-date', (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return sendError(res, 400, 'A valid task id is required', 'TASK_ID_INVALID');
    }

    if (!Object.prototype.hasOwnProperty.call(req.body, 'dueDate')) {
      return sendError(res, 400, 'dueDate is required', 'TASK_DUEDATE_REQUIRED');
    }

    const dueDateValidation = validateDueDate(req.body.dueDate);
    if (!dueDateValidation.ok) {
      return sendError(res, 400, 'Due date must be a valid date', 'TASK_DUEDATE_INVALID');
    }

    const result = db.prepare(
      "UPDATE tasks SET due_date = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(dueDateValidation.normalized, id);

    if (!result.changes) {
      return sendError(res, 404, 'Task not found', 'TASK_NOT_FOUND');
    }

    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.status(200).json(toTaskResponse(row));
  } catch (error) {
    sendError(res, 500, 'Failed to update task due date', 'TASK_DUEDATE_UPDATE_FAILED');
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return sendError(res, 400, 'A valid task id is required', 'TASK_ID_INVALID');
    }

    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    if (!result.changes) {
      return sendError(res, 404, 'Task not found', 'TASK_NOT_FOUND');
    }

    res.status(200).json({ id, message: 'Task deleted successfully' });
  } catch (error) {
    sendError(res, 500, 'Failed to delete task', 'TASK_DELETE_FAILED');
  }
});

module.exports = { app, db, toTaskResponse };