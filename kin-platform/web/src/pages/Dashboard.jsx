import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchUser(token);
    fetchTasks(token);
  }, []);

  const fetchUser = async (token) => {
    try {
      const res = await fetch(`${API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async (token) => {
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ description: newTask })
      });
      
      if (res.ok) {
        setNewTask('');
        fetchTasks(token);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="text-xl font-bold">KIN Dashboard</div>
        <div className="flex items-center gap-4">
          <span className="text-pink-400">💳 {user?.credits || 0} credits</span>
          <span>{user?.name}</span>
          <button onClick={logout} className="text-gray-400 hover:text-white">Logout</button>
        </div>
      </nav>

      <main className="container mx-auto p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Create Task</h2>
            <form onSubmit={createTask} className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="What do you need KIN to do?"
                className="flex-1 p-3 bg-gray-700 rounded-lg outline-none focus:ring-2 ring-pink-500"
              />
              <button type="submit" className="bg-pink-500 px-6 py-3 rounded-lg font-bold hover:bg-pink-600">
                Send
              </button>
            </form>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {['Book Restaurant', 'Order Product', 'Set Reminder', 'Make Call'].map((action) => (
                <button
                  key={action}
                  onClick={() => setNewTask(`Help me ${action.toLowerCase()}`)}
                  className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-sm"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Recent Tasks</h2>
          
          {tasks.length === 0 ? (
            <p className="text-gray-400">No tasks yet. Create your first one above!</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p>{task.description}</p>
                    <p className="text-sm text-gray-400">{new Date(task.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    task.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
