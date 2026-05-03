const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return false;
  const isMember = project.members.some(m => m.user.toString() === userId.toString());
  const isOwner = project.owner.toString() === userId.toString();
  return isMember || isOwner;
};

router.get('/dashboard', auth, async (req, res) => {
  try {
    const myProjects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
    }).select('_id');

    const projectIds = myProjects.map(p => p._id);

    const total = await Task.countDocuments({ project: { $in: projectIds } });
    const done = await Task.countDocuments({ project: { $in: projectIds }, status: 'done' });
    const inProgress = await Task.countDocuments({ project: { $in: projectIds }, status: 'in_progress' });
    const overdue = await Task.countDocuments({
      project: { $in: projectIds },
      status: { $ne: 'done' },
      dueDate: { $lt: new Date() }
    });

    const recentTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignee', 'name email')
      .populate('project', 'name color')
      .sort({ createdAt: -1 })
      .limit(5);

    const overdueTasks = await Task.find({
      project: { $in: projectIds },
      status: { $ne: 'done' },
      dueDate: { $lt: new Date() }
    })
    .populate('assignee', 'name email')
    .populate('project', 'name color')
    .limit(5);

    res.json({ stats: { total, done, inProgress, overdue }, recentTasks, overdueTasks });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
});

router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const hasAccess = await checkProjectAccess(req.params.projectId, req.user._id);
    if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email')
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, project, assignee, priority, dueDate, status } = req.body;

    const hasAccess = await checkProjectAccess(project, req.user._id);
    if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

    const newTask = new Task({
      title,
      description: description || '',
      project,
      assignee: assignee && assignee !== '' ? assignee : null,
      priority: priority || 'medium',
      dueDate: dueDate && dueDate !== '' ? dueDate : null,
      status: status || 'todo',
      reporter: req.user._id
    });

    await newTask.save();
    await newTask.populate('assignee', 'name email');
    await newTask.populate('reporter', 'name email');

    res.status(201).json({ task: newTask });
  } catch (err) {
    console.log('Task creation failed:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const hasAccess = await checkProjectAccess(task.project, req.user._id);
    if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

    const { title, description, status, priority, assignee, dueDate } = req.body;

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        assignee: assignee && assignee !== '' ? assignee : null,
        dueDate: dueDate && dueDate !== '' ? dueDate : null
      },
      { new: true }
    )
    .populate('assignee', 'name email')
    .populate('reporter', 'name email');

    res.json({ task: updated });
  } catch (err) {
    console.log('Task update failed:', err.message);
    res.status(500).json({ message: 'Could not update task' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const hasAccess = await checkProjectAccess(task.project, req.user._id);
    if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete task' });
  }
});

module.exports = router;