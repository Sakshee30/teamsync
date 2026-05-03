import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API = 'https://accomplished-caring-production.up.railway.app/api';

export default function TaskBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '', assignee: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [error, setError] = useState('');

  const authHeaders = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    loadProject();
    loadTasks();
  }, []);

  const loadProject = () => {
    axios.get(`${API}/projects/${id}`, { headers: authHeaders })
      .then(res => setProject(res.data.project))
      .catch(() => navigate('/projects'));
  };

  const loadTasks = () => {
    axios.get(`${API}/tasks/project/${id}`, { headers: authHeaders })
      .then(res => setTasks(res.data.tasks))
      .catch(err => console.log('Error loading tasks:', err));
  };

  const createTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${API}/tasks`, { ...taskForm, project: id }, { headers: authHeaders });
      setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '', assignee: '' });
      setShowTaskForm(false);
      loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create task');
    }
  };

  const moveTask = async (taskId, newStatus) => {
    try {
      await axios.put(`${API}/tasks/${taskId}`, { status: newStatus }, { headers: authHeaders });
      loadTasks();
    } catch (err) {
      console.log('Could not move task:', err);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`${API}/tasks/${taskId}`, { headers: authHeaders });
      loadTasks();
    } catch (err) {
      alert('Could not delete task');
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${API}/projects/${id}/members`, { email: memberEmail }, { headers: authHeaders });
      setMemberEmail('');
      setShowMemberForm(false);
      loadProject();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add member');
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const columns = [
    { key: 'todo', label: 'To Do', bg: 'bg-slate-200' },
    { key: 'in_progress', label: 'In Progress', bg: 'bg-yellow-100' },
    { key: 'in_review', label: 'In Review', bg: 'bg-purple-100' },
    { key: 'done', label: 'Done', bg: 'bg-green-100' },
  ];

  const isOwner = project?.owner?._id === user._id;

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">TeamSync</h1>
        <div className="flex items-center gap-4">
          <Link to="/projects" className="text-sm text-blue-600 hover:underline">← Projects</Link>
          <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">Dashboard</Link>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">{project?.name}</h2>
            <p className="text-sm text-slate-500 mt-1">{project?.description}</p>
            <p className="text-xs text-slate-400 mt-1">
              👥 {project?.members?.length} member{project?.members?.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            {isOwner && (
              <button
                onClick={() => setShowMemberForm(!showMemberForm)}
                className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition"
              >
                + Add Member
              </button>
            )}
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
            >
              + New Task
            </button>
          </div>
        </div>

        {showMemberForm && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <h3 className="font-semibold text-slate-700 mb-3">Add a Team Member</h3>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <form onSubmit={addMember} className="flex gap-3">
              <input
                type="email"
                placeholder="Enter their email address"
                value={memberEmail}
                onChange={e => setMemberEmail(e.target.value)}
                required
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                Add
              </button>
              <button type="button" onClick={() => setShowMemberForm(false)} className="text-slate-500 text-sm px-3 hover:underline">
                Cancel
              </button>
            </form>
          </div>
        )}

        {showTaskForm && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <h3 className="font-semibold text-slate-700 mb-3">Create a New Task</h3>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <form onSubmit={createTask} className="space-y-3">
              <input
                type="text"
                placeholder="What needs to be done?"
                value={taskForm.title}
                onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Add more details... (optional)"
                value={taskForm.description}
                onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                rows={2}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-3 flex-wrap">
                <select
                  value={taskForm.priority}
                  onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={taskForm.assignee}
                  onChange={e => setTaskForm({ ...taskForm, assignee: e.target.value })}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Assign to someone...</option>
                  {project?.members?.map(m => (
                    <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                  Create Task
                </button>
                <button type="button" onClick={() => setShowTaskForm(false)} className="text-slate-500 text-sm px-4 py-2 hover:underline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map(col => (
            <div key={col.key} className={`rounded-xl p-4 ${col.bg}`}>
              <h3 className="font-semibold text-slate-700 mb-3 text-sm">
                {col.label} ({tasks.filter(t => t.status === col.key).length})
              </h3>
              <div className="space-y-3">
                {tasks.filter(t => t.status === col.key).map(task => (
                  <div key={task._id} className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="font-medium text-slate-800 text-sm mb-1">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-slate-500 mb-2">{task.description}</p>
                    )}
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-600' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>{task.priority}</span>
                      {task.dueDate && (
                        <span className="text-xs text-slate-400">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {task.assignee && (
                      <p className="text-xs text-slate-500 mb-2">👤 {task.assignee.name}</p>
                    )}
                    <div className="flex gap-1 flex-wrap mt-2">
                      {columns.filter(c => c.key !== col.key).map(c => (
                        <button
                          key={c.key}
                          onClick={() => moveTask(task._id, c.key)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          → {c.label}
                        </button>
                      ))}
                      <button
                        onClick={() => deleteTask(task._id)}
                        className="text-xs text-red-400 hover:underline ml-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.status === col.key).length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">Nothing here yet</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


