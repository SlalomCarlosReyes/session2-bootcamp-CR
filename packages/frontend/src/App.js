import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import './App.css';

const DEFAULT_FORM = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
};

function toDateInputValue(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().slice(0, 10);
}

function formatDueDateLabel(value) {
  if (!value) {
    return 'No due date';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'No due date';
  }

  return parsed.toLocaleDateString();
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formValues, setFormValues] = useState(DEFAULT_FORM);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [taskToDelete, setTaskToDelete] = useState(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ filter, sortBy, sortOrder });
      const response = await fetch(`/api/tasks?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const result = await response.json();
      setTasks(result);
      setError(null);
    } catch (requestError) {
      setError(requestError.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filter, sortBy, sortOrder]);

  const resetForm = () => {
    setFormValues(DEFAULT_FORM);
    setEditingTaskId(null);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const title = formValues.title.trim();

    if (!title) {
      setError('Task title is required');
      return;
    }

    const payload = {
      title,
      description: formValues.description.trim(),
      priority: formValues.priority,
      dueDate: toDateInputValue(formValues.dueDate) || null,
    };

    try {
      const endpoint = editingTaskId ? `/api/tasks/${editingTaskId}` : '/api/tasks';
      const method = editingTaskId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body?.error?.message || 'Failed to save task');
      }

      await loadTasks();
      resetForm();
    } catch (requestError) {
      setError(requestError.message || 'Failed to save task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setFormValues({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: toDateInputValue(task.dueDate),
    });
  };

  const handleCompletionToggle = async (task) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}/completion`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update completion');
      }

      await loadTasks();
    } catch (requestError) {
      setError(requestError.message || 'Failed to update completion');
    }
  };

  const handleRemoveDueDate = async (task) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}/due-date`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dueDate: null }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove due date');
      }

      await loadTasks();
    } catch (requestError) {
      setError(requestError.message || 'Failed to remove due date');
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!taskToDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTaskToDelete(null);
      await loadTasks();
      setError(null);
    } catch (requestError) {
      setError(requestError.message || 'Failed to delete task');
    }
  };

  const visibleTaskSummary = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    return {
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
    };
  }, [tasks]);

  const isOverdue = (task) => {
    if (!task.dueDate || task.completed) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.dueDate) < today;
  };

  return (
    <Box className="app-shell">
      <Container maxWidth="lg" className="app-container">
        <header className="app-header">
          <Typography variant="h3" component="h1" className="app-title">
            TODO App
          </Typography>
          <Typography variant="body1" className="app-subtitle">
            Plan tasks, track priorities, and keep your list clean.
          </Typography>
        </header>

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {editingTaskId ? 'Edit Task' : 'Add Task'}
                </Typography>
                <Box component="form" onSubmit={handleFormSubmit} className="task-form">
                  <TextField
                    label="Title"
                    required
                    value={formValues.title}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, title: event.target.value }))
                    }
                  />
                  <TextField
                    label="Description"
                    multiline
                    minRows={3}
                    value={formValues.description}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, description: event.target.value }))
                    }
                  />
                  <FormControl fullWidth>
                    <InputLabel id="priority-label">Priority</InputLabel>
                    <Select
                      labelId="priority-label"
                      label="Priority"
                      value={formValues.priority}
                      onChange={(event) =>
                        setFormValues((prev) => ({ ...prev, priority: event.target.value }))
                      }
                    >
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Due date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formValues.dueDate}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, dueDate: event.target.value }))
                    }
                  />
                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" type="submit" fullWidth>
                      {editingTaskId ? 'Save Task' : 'Add Task'}
                    </Button>
                    <Button
                      variant="outlined"
                      type="button"
                      fullWidth
                      disabled={!editingTaskId}
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  justifyContent="space-between"
                >
                  <Typography variant="h5">Tasks</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label={`Total: ${visibleTaskSummary.total}`} />
                    <Chip color="success" label={`Done: ${visibleTaskSummary.completed}`} />
                    <Chip color="warning" label={`Pending: ${visibleTaskSummary.pending}`} />
                  </Stack>
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} className="toolbar">
                  <FormControl fullWidth>
                    <InputLabel id="filter-label">Filter</InputLabel>
                    <Select
                      labelId="filter-label"
                      value={filter}
                      label="Filter"
                      onChange={(event) => setFilter(event.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="incomplete">Incomplete</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel id="sort-by-label">Sort by</InputLabel>
                    <Select
                      labelId="sort-by-label"
                      value={sortBy}
                      label="Sort by"
                      onChange={(event) => setSortBy(event.target.value)}
                    >
                      <MenuItem value="createdAt">Created date</MenuItem>
                      <MenuItem value="dueDate">Due date</MenuItem>
                      <MenuItem value="priority">Priority</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel id="sort-order-label">Order</InputLabel>
                    <Select
                      labelId="sort-order-label"
                      value={sortOrder}
                      label="Order"
                      onChange={(event) => setSortOrder(event.target.value)}
                    >
                      <MenuItem value="asc">Ascending</MenuItem>
                      <MenuItem value="desc">Descending</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                {loading && <Typography className="empty-state">Loading tasks...</Typography>}
                {error && <Alert severity="error">{error}</Alert>}

                {!loading && !error && tasks.length === 0 && (
                  <Typography className="empty-state">No tasks found. Add your first task.</Typography>
                )}

                {!loading && !error && tasks.length > 0 && (
                  <Stack spacing={2} className="task-list">
                    {tasks.map((task) => (
                      <Card key={task.id} variant="outlined" className="task-card">
                        <CardContent>
                          <Stack direction="row" alignItems="flex-start" spacing={2}>
                            <Checkbox
                              checked={task.completed}
                              onChange={() => handleCompletionToggle(task)}
                              inputProps={{ 'aria-label': `mark ${task.title} as completed` }}
                            />
                            <Box className="task-content">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography
                                  variant="h6"
                                  className={task.completed ? 'task-title-completed' : 'task-title'}
                                >
                                  {task.title}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={task.priority}
                                  color={
                                    task.priority === 'high'
                                      ? 'error'
                                      : task.priority === 'medium'
                                        ? 'warning'
                                        : 'default'
                                  }
                                />
                                {isOverdue(task) && <Chip size="small" color="error" label="Overdue" />}
                                {task.completed && <Chip size="small" color="success" label="Completed" />}
                              </Stack>

                              {task.description && (
                                <Typography variant="body2" className="task-description">
                                  {task.description}
                                </Typography>
                              )}

                              <Typography variant="caption" className="task-meta">
                                Due: {formatDueDateLabel(task.dueDate)}
                              </Typography>

                              <Stack direction="row" spacing={1} className="task-actions">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<EditOutlinedIcon />}
                                  onClick={() => handleEditTask(task)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="warning"
                                  disabled={!task.dueDate}
                                  onClick={() => handleRemoveDueDate(task)}
                                >
                                  Remove due date
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<DeleteOutlineIcon />}
                                  onClick={() => setTaskToDelete(task)}
                                >
                                  Delete
                                </Button>
                              </Stack>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={Boolean(taskToDelete)} onClose={() => setTaskToDelete(null)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this task?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setTaskToDelete(null)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirmed}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;