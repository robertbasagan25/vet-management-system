import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const fetchSystemData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [usersRes, apptsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users', { headers }),
        axios.get('http://localhost:5000/api/appointments/all', { headers }),
      ]);
      setUsers(usersRes.data);
      setAppointments(apptsRes.data);
    } catch (err) {
      console.error('Error loading super admin data:', err);
    }
  };

  useEffect(() => {
    if (!token || user?.role !== 'super_admin') {
      navigate('/login');
      return;
    }

    const loadInitial = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [usersRes, apptsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users', { headers }),
          axios.get('http://localhost:5000/api/appointments/all', { headers }),
        ]);
        setUsers(usersRes.data);
        setAppointments(apptsRes.data);
      } catch (err) {
        console.error('Error loading super admin data:', err);
      }
    };

    loadInitial();
  }, [token, user?.role, navigate]);

  // Palitan ang Role ng kahit sinong user
  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('User role updated!');
      fetchSystemData();
    } catch {
      alert('Failed to update role');
    }
  };

  // Mag-delete ng account
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('User deleted!');
      fetchSystemData();
    } catch {
      alert('Failed to delete user');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center bg-gray-900 text-white p-4 rounded-xl shadow-sm mb-6">
        <div>
          <h1 className="text-xl font-bold text-amber-400">VetCare Super Admin Panel</h1>
          <p className="text-sm text-gray-300">
            System Owner: {user?.name} (Full Control)
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* System Stats */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-amber-500">
          <p className="text-xs text-gray-500 uppercase">Total System Users</p>
          <p className="text-2xl font-bold text-gray-800">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-teal-600">
          <p className="text-xs text-gray-500 uppercase">Total System Appointments</p>
          <p className="text-2xl font-bold text-gray-800">{appointments.length}</p>
        </div>
      </div>

      {/* User & Role Management */}
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          User & Role Management (Promote / Demote / Delete)
        </h2>
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u._id}
              className="p-4 border rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-3"
            >
              <div>
                <p className="font-bold text-gray-800">{u.name}</p>
                <p className="text-xs text-gray-500">{u.email} • {u.phone}</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                  className="p-2 border rounded-lg text-sm bg-gray-50 font-medium"
                >
                  <option value="pet_owner">Pet Owner</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>

                {u._id !== user?.id && (
                  <button
                    onClick={() => handleDeleteUser(u._id)}
                    className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-red-200"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}