import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API = 'https://accomplished-caring-production.up.railway.app/api';

export default function Projects() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', priority: 'medium', dueDate: '' });
  const [error, setError] = useState('');

  const authHeaders = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadProjects();
  }, []);

  const loadProjects = () => {
    axios.get(`${API}/projects`, { headers: authHeaders })
      .then(res => setProjects(res.data.projects))
      .catch(() => navigate('/login'));
  };

  const createProject = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${API}/projects`, form, { headers: authHeaders });
      setForm({ name: '', description: '', priority: 'medium', dueDate: '' });
      setShowForm(false);
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create project');
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await axios.delete(`${API}/projects/${id}`, { headers: authHeaders });
      loadProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete');
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">TeamSync</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">Hi, {user.name} 👋</span>
          <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">Dashboard</Link>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-800">My Projects</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            + New Project
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-slate-700 mb-4">Create a New Project</h3>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <form onSubmit={createProject} className="space-y-3">
              <input
                type="text"
                placeholder="Project name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="What's this project about? (optional)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-3">
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                  Create Project
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 text-sm px-4 py-2 hover:underline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <p className="text-slate-400 mb-2">No projects yet!</p>
            <p className="text-slate-400 text-sm">Click "New Project" to get started.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map(project => (
              <div key={project._id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-800">{project.name}</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    project.priority === 'high' ? 'bg-red-100 text-red-600' :
                    project.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {project.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-3">{project.description || 'No description added'}</p>
                <p className="text-xs text-slate-400 mb-4">
                  👥 {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center justify-between">
                  <Link to={`/projects/${project._id}`} className="text-sm text-blue-600 hover:underline">
                    View Tasks →
                  </Link>
                  {project.owner._id === user._id && (
                    <button onClick={() => deleteProject(project._id)} className="text-sm text-red-400 hover:underline">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}