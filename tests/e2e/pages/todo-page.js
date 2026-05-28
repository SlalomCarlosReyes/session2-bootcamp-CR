const { expect } = require('@playwright/test');

class TodoPage {
  constructor(page) {
    this.page = page;
    this.titleInput = page.getByLabel('Title');
    this.descriptionInput = page.getByLabel('Description');
    this.prioritySelect = page.getByRole('combobox', { name: 'Priority' });
    this.addTaskButton = page.getByRole('button', { name: 'Add Task' });
    this.filterSelect = page.getByRole('combobox', { name: 'Filter' });
    this.sortBySelect = page.getByRole('combobox', { name: 'Sort by' });
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'TODO App' })).toBeVisible();
  }

  async createTask({ title, description = '', priority = 'medium' }) {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);

    await this.prioritySelect.click();
    await this.page.getByRole('option', { name: new RegExp(`^${priority}$`, 'i') }).click();

    await this.addTaskButton.click();
    await expect(this.page.getByText(title, { exact: true })).toBeVisible();
  }

  async openFilter(valueLabel) {
    await this.filterSelect.click();
    await this.page.getByRole('option', { name: valueLabel }).click();
  }

  async openSortBy(valueLabel) {
    await this.sortBySelect.click();
    await this.page.getByRole('option', { name: valueLabel }).click();
  }
}

module.exports = { TodoPage };
