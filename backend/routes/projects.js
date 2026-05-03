const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
    })
    .populate('owner', 'name email')
    .populate('members.user', 'name email');

    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, description, priority, dueDate, color } = req.body;

    const project = await Project.create({
      name,
      description,
      priority,
      dueDate,
      color: color || '#2563EB',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Could not create project' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch project' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owner can update' });
    }

    const { name, description, status, priority, dueDate, color } = req.body;
    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, status, priority, dueDate, color },
      { new: true }
    );

    res.json({ project: updated });
  } catch (err) {
    res.status(500).json({ message: 'Could not update project' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can delete this project' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete project' });
  }
});

router.post('/:id/members', auth, async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can add members' });
    }

    const newMember = await User.findOne({ email });
    if (!newMember) return res.status(404).json({ message: 'No user found with that email' });

    const alreadyIn = project.members.some(m => m.user.toString() === newMember._id.toString());
    if (alreadyIn) return res.status(400).json({ message: 'User is already in this project' });

    project.members.push({ user: newMember._id, role });
    await project.save();

    res.json({ message: `${newMember.name} added to project` });
  } catch (err) {
    res.status(500).json({ message: 'Could not add member' });
  }
});

module.exports = router;