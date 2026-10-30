import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  listTasks, taskStats, getTask, createTask, updateTask, updateStatus, deleteTask,
} from '../controllers/task.controller.js';
import {
  createTaskSchema, updateTaskSchema, statusSchema, listQuerySchema,
} from '../validators/task.validators.js';

const router = Router();
router.use(protect);

router.get('/stats', taskStats); // must be registered before '/:id'
router.route('/')
  .get(validate(listQuerySchema, 'query'), listTasks)
  .post(validate(createTaskSchema), createTask);
router.route('/:id')
  .get(getTask)
  .put(validate(updateTaskSchema), updateTask)
  .delete(deleteTask);
router.patch('/:id/status', validate(statusSchema), updateStatus);

export default router;
