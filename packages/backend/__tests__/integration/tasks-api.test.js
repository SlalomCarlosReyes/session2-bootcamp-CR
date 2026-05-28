const request = require('supertest');
const { app, db } = require('../../src/app');

function createTask(payload = {}) {
  return request(app)
    .post('/api/tasks')
    .send({
      title: 'Integration task',
      description: 'Task description',
      priority: 'medium',
      ...payload,
    });
}

beforeEach(() => {
  db.prepare('DELETE FROM tasks').run();
});

describe('Tasks API integration', () => {
  it('creates a task', async () => {
    const response = await createTask({ title: 'Create task' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: 'Create task',
      description: 'Task description',
      priority: 'medium',
      completed: false,
    });
    expect(response.body).toHaveProperty('id');
  });

  it('updates a task', async () => {
    const created = await createTask({ title: 'Before update' });

    const response = await request(app)
      .put(`/api/tasks/${created.body.id}`)
      .send({ title: 'After update', priority: 'high' });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('After update');
    expect(response.body.priority).toBe('high');
  });

  it('toggles completion status', async () => {
    const created = await createTask({ title: 'Complete me' });

    const response = await request(app)
      .patch(`/api/tasks/${created.body.id}/completion`)
      .send({ completed: true });

    expect(response.status).toBe(200);
    expect(response.body.completed).toBe(true);
  });

  it('adds and removes due date', async () => {
    const created = await createTask({ title: 'Due date task' });

    const withDueDate = await request(app)
      .patch(`/api/tasks/${created.body.id}/due-date`)
      .send({ dueDate: '2026-12-10' });

    expect(withDueDate.status).toBe(200);
    expect(withDueDate.body.dueDate).toContain('2026-12-10');

    const withoutDueDate = await request(app)
      .patch(`/api/tasks/${created.body.id}/due-date`)
      .send({ dueDate: null });

    expect(withoutDueDate.status).toBe(200);
    expect(withoutDueDate.body.dueDate).toBeNull();
  });

  it('filters completed tasks only', async () => {
    const first = await createTask({ title: 'Task A' });
    await createTask({ title: 'Task B' });

    await request(app)
      .patch(`/api/tasks/${first.body.id}/completion`)
      .send({ completed: true });

    const response = await request(app).get('/api/tasks?filter=completed');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('Task A');
    expect(response.body[0].completed).toBe(true);
  });

  it('sorts by due date and places null due dates at end', async () => {
    await createTask({ title: 'No due date', dueDate: null });
    await createTask({ title: 'Later', dueDate: '2026-12-20' });
    await createTask({ title: 'Sooner', dueDate: '2026-12-01' });

    const response = await request(app).get('/api/tasks?sortBy=dueDate&sortOrder=asc');

    expect(response.status).toBe(200);
    expect(response.body[0].title).toBe('Sooner');
    expect(response.body[1].title).toBe('Later');
    expect(response.body[2].title).toBe('No due date');
  });

  it('sorts by priority', async () => {
    await createTask({ title: 'Low', priority: 'low' });
    await createTask({ title: 'Medium', priority: 'medium' });
    await createTask({ title: 'High', priority: 'high' });

    const response = await request(app).get('/api/tasks?sortBy=priority&sortOrder=asc');

    expect(response.status).toBe(200);
    expect(response.body.map(task => task.title)).toEqual(['High', 'Medium', 'Low']);
  });

  it('deletes an existing task', async () => {
    const created = await createTask({ title: 'Delete me' });

    const response = await request(app).delete(`/api/tasks/${created.body.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: created.body.id, message: 'Task deleted successfully' });

    const list = await request(app).get('/api/tasks');
    expect(list.body).toHaveLength(0);
  });

  it('returns validation error for empty title', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ title: '  ' });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatchObject({
      code: 'TASK_TITLE_REQUIRED',
      message: 'Task title is required',
    });
  });
});
