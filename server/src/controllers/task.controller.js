import mongoose from 'mongoose';
import Task from '../models/Task.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Always scope queries to the signed-in user so one user can never touch another's tasks.
const findOwned = async (req) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid task id.');
  const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
  if (!task) throw new ApiError(404, 'Task not found.');
  return task;
};

const applyStatus = (task, status) => {
  task.status = status;
  task.completedAt = status === 'completed' ? new Date() : null;
};

export const listTasks = asyncHandler(async (req, res) => {
  const { page, limit, status, priority, search, sortBy, order } = req.validated;

  const filter = { user: req.user.id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const sort = { [sortBy]: order === 'asc' ? 1 : -1, _id: -1 }; // _id keeps pagination stable on ties
  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    Task.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: tasks,
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
});

export const taskStats = asyncHandler(async (req, res) => {
  const rows = await Task.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const stats = { pending: 0, 'in-progress': 0, completed: 0 };
  rows.forEach((r) => { stats[r._id] = r.count; });
  res.json({ success: true, data: { ...stats, total: stats.pending + stats['in-progress'] + stats.completed } });
});

export const getTask = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await findOwned(req) });
});

export const createTask = asyncHandler(async (req, res) => {
  const data = req.validated;
  const task = new Task({ ...data, user: req.user.id });
  if (data.status === 'completed') task.completedAt = new Date();
  await task.save();
  res.status(201).json({ success: true, data: task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await findOwned(req);
  const { status, ...rest } = req.validated;
  task.set(rest);
  if (status && status !== task.status) applyStatus(task, status);
  await task.save();
  res.json({ success: true, data: task });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const task = await findOwned(req);
  if (req.validated.status !== task.status) applyStatus(task, req.validated.status);
  await task.save();
  res.json({ success: true, data: task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await findOwned(req);
  await task.deleteOne();
  res.json({ success: true, data: { id: task.id } });
});
