const STATUS_LABEL = { pending: 'Pending', 'in-progress': 'In progress', completed: 'Completed' };
const NEXT = {
  pending: { status: 'in-progress', label: 'Start' },
  'in-progress': { status: 'completed', label: 'Complete' },
  completed: { status: 'pending', label: 'Reopen' },
};

const fmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function TaskItem({ task, onStatus, onEdit, onDelete }) {
  const overdue = task.dueDate && task.status !== 'completed' && new Date(task.dueDate) < new Date(new Date().toDateString());
  const next = NEXT[task.status];

  return (
    <li className={`task s-${task.status}`}>
      <div className="task-body">
        <div className="task-head">
          <h3 className={task.status === 'completed' ? 'done' : ''}>{task.title}</h3>
          <span className={`badge st-${task.status}`}>{STATUS_LABEL[task.status]}</span>
          <span className={`badge pr-${task.priority}`}>{task.priority} priority</span>
        </div>
        {task.description && <p className="task-desc">{task.description}</p>}
        {task.dueDate && (
          <p className={overdue ? 'due overdue' : 'due'}>
            {overdue ? 'Overdue · ' : 'Due '}{fmt(task.dueDate)}
          </p>
        )}
      </div>
      <div className="task-actions">
        <button className="btn small primary" onClick={() => onStatus(task, next.status)}>{next.label}</button>
        <button className="btn small" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}>Edit</button>
        <button className="btn small danger" onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`}>Delete</button>
      </div>
    </li>
  );
}
