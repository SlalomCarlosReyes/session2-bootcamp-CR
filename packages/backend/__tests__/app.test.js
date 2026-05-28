const request = require('supertest');
const { app, db, toTaskResponse } = require('../src/app');

beforeEach(() => {
  db.prepare('DELETE FROM tasks').run();
});

describe('Backend app', () => {
  it('returns health status', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', message: 'Backend server is running' });
  });

  it('maps database row to task response shape', () => {
    const mapped = toTaskResponse({
      id: 1,
      title: 'Task',
      description: 'Desc',
      priority: 'high',
      due_date: '2026-01-01T00:00:00.000Z',
      completed: 1,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    });

    expect(mapped).toEqual({
      id: 1,
      title: 'Task',
      description: 'Desc',
      priority: 'high',
      dueDate: '2026-01-01T00:00:00.000Z',
      completed: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('creates and lists tasks', async () => {
    const createResponse = await request(app)
      .post('/api/tasks')
      .send({ title: 'My first task', priority: 'medium' });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toHaveProperty('id');
    expect(createResponse.body.title).toBe('My first task');

    const listResponse = await request(app).get('/api/tasks');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].title).toBe('My first task');
  });
});