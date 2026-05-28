const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/todo-page');

function uniqueTitle(prefix) {
  return `${prefix} ${Date.now()} ${Math.floor(Math.random() * 10000)}`;
}

test.describe('TODO workflow', () => {
  test('creates a task', async ({ page }) => {
    const todo = new TodoPage(page);
    const title = uniqueTitle('Create Task');

    await todo.goto();
    await todo.createTask({ title, description: 'Task created from e2e', priority: 'high' });

    await expect(page.getByText(title, { exact: true })).toBeVisible();
  });

  test('edits an existing task', async ({ page }) => {
    const todo = new TodoPage(page);
    const originalTitle = uniqueTitle('Edit Original');
    const updatedTitle = uniqueTitle('Edit Updated');

    await todo.goto();
    await todo.createTask({ title: originalTitle, description: 'Before edit' });

    const taskCard = page.locator('.task-card').filter({ hasText: originalTitle }).first();
    await taskCard.getByRole('button', { name: 'Edit' }).click();

    await todo.titleInput.fill(updatedTitle);
    await page.getByRole('button', { name: 'Save Task' }).click();

    await expect(page.getByText(updatedTitle, { exact: true })).toBeVisible();
  });

  test('marks a task as completed', async ({ page }) => {
    const todo = new TodoPage(page);
    const title = uniqueTitle('Complete Task');

    await todo.goto();
    await todo.createTask({ title });

    const checkbox = page.getByRole('checkbox', { name: new RegExp(`mark ${title} as completed`, 'i') });
    await checkbox.click();

    const taskCard = page.locator('.task-card').filter({ hasText: title }).first();
    await expect(taskCard.getByText('Completed')).toBeVisible();
  });

  test('filters completed tasks', async ({ page }) => {
    const todo = new TodoPage(page);
    const completedTitle = uniqueTitle('Completed Filter Task');

    await todo.goto();
    await todo.createTask({ title: completedTitle });

    await page.getByRole('checkbox', { name: new RegExp(`mark ${completedTitle} as completed`, 'i') }).click();
    await todo.openFilter('Completed');

    await expect(page.getByText(completedTitle, { exact: true })).toBeVisible();
  });

  test('deletes a task with confirmation', async ({ page }) => {
    const todo = new TodoPage(page);
    const title = uniqueTitle('Delete Task');

    await todo.goto();
    await todo.createTask({ title });

    const taskCard = page.locator('.task-card').filter({ hasText: title }).first();
    await taskCard.getByRole('button', { name: 'Delete' }).click();

    await page.getByRole('button', { name: 'Delete' }).last().click();
    await expect(page.getByText(title, { exact: true })).not.toBeVisible();
  });
});
