import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const okResponse = (payload) =>
  Promise.resolve({
    ok: true,
    json: async () => payload,
  });

const errorResponse = (message) =>
  Promise.resolve({
    ok: false,
    json: async () => ({ error: { message } }),
  });

describe('App Component', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders header and loads tasks', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      okResponse([
        {
          id: 1,
          title: 'Task from API',
          description: 'Description',
          priority: 'medium',
          dueDate: null,
          completed: false,
          createdAt: '2026-05-28T00:00:00.000Z',
          updatedAt: '2026-05-28T00:00:00.000Z',
        },
      ])
    );

    render(<App />);

    expect(screen.getByText('TODO App')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Task from API')).toBeInTheDocument();
    });
  });

  test('adds a new task', async () => {
    const user = userEvent.setup();

    const fetchMock = jest.spyOn(global, 'fetch');
    fetchMock
      .mockImplementationOnce(() => okResponse([]))
      .mockImplementationOnce(() =>
        okResponse({
          id: 2,
          title: 'New Task',
          description: '',
          priority: 'medium',
          dueDate: null,
          completed: false,
          createdAt: '2026-05-28T00:00:00.000Z',
          updatedAt: '2026-05-28T00:00:00.000Z',
        })
      )
      .mockImplementationOnce(() =>
        okResponse([
          {
            id: 2,
            title: 'New Task',
            description: '',
            priority: 'medium',
            dueDate: null,
            completed: false,
            createdAt: '2026-05-28T00:00:00.000Z',
            updatedAt: '2026-05-28T00:00:00.000Z',
          },
        ])
      );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No tasks found. Add your first task.')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/title/i), 'New Task');
    await user.click(screen.getByRole('button', { name: 'Add Task' }));

    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  test('shows API error message', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() => errorResponse('Failed to fetch tasks'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch tasks')).toBeInTheDocument();
    });
  });

  test('toggles completion state', async () => {
    const user = userEvent.setup();
    const fetchMock = jest.spyOn(global, 'fetch');

    fetchMock
      .mockImplementationOnce(() =>
        okResponse([
          {
            id: 9,
            title: 'Complete flow task',
            description: '',
            priority: 'high',
            dueDate: null,
            completed: false,
            createdAt: '2026-05-28T00:00:00.000Z',
            updatedAt: '2026-05-28T00:00:00.000Z',
          },
        ])
      )
      .mockImplementationOnce(() =>
        okResponse({
          id: 9,
          title: 'Complete flow task',
          description: '',
          priority: 'high',
          dueDate: null,
          completed: true,
          createdAt: '2026-05-28T00:00:00.000Z',
          updatedAt: '2026-05-28T00:00:00.000Z',
        })
      )
      .mockImplementationOnce(() =>
        okResponse([
          {
            id: 9,
            title: 'Complete flow task',
            description: '',
            priority: 'high',
            dueDate: null,
            completed: true,
            createdAt: '2026-05-28T00:00:00.000Z',
            updatedAt: '2026-05-28T00:00:00.000Z',
          },
        ])
      );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Complete flow task')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('checkbox', { name: /mark complete flow task as completed/i }));

    await waitFor(() => {
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });
});