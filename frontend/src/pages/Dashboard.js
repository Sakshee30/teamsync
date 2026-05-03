import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API = 'https://accomplished-caring-production.up.railway.app/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const [stats, setStats] = useState({ total: 0, done: 0, inProgress: 0, overdue: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get(`${API}/tasks/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setStats(res.data.stats);
      setRecentTasks(res.data.recentTasks);
      setOverdueTasks(res.data.overdueTasks);
    })
    .catch(() => navigate('/login'));
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const statusStyle = (status) => {
    if (status === 'done') return 'bg-green-100 text-green-700';
    if (status === 'in_progress') return 'bg-yellow-100 text-yellow-700';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">TeamSync</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">Hi, {user.name} 👋</span>
          <Link to="/projects" className="text-sm text-blue-600 hover:underline">Projects</Link>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Overview</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total Tasks</p>
            <p className="text-3xl font-bold text-blue-500 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-slate-500">Completed</p>
            <p className="text-3xl font-bold text-green-500 mt-1">{stats.done}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-slate-500">In Progress</p>
            <p className="text-3xl font-bold text-yellow-500 mt-1">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-slate-500">Overdue</p>
            <p className="text-3xl font-bold text-red-500 mt-1">{stats.overdue}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 mb-4">Recent Tasks</h3>
            {recentTasks.length === 0 ? (
              <p className="text-slate-400 text-sm">No tasks yet</p>
            ) : recentTasks.map(task => (
              <div key={task._id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">{task.title}</p>
                  <p className="text-xs text-slate-400">{task.project?.name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusStyle(task.status)}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-red-500 mb-4">Overdue Tasks</h3>
            {overdueTasks.length === 0 ? (
              <p className="text-slate-400 text-sm">All caught up! 🎉</p>
            ) : overdueTasks.map(task => (
              <div key={task._id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">{task.title}</p>
                  <p className="text-xs text-slate-400">{task.project?.name}</p>
                </div>
                <p className="text-xs text-red-500">
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}