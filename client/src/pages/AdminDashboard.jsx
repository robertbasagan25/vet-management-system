import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      navigate('/login');
      return;
    }

    const loadAdminData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [apptsRes, recsRes, usersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/appointments/all', { headers }),
          axios.get('http://localhost:5000/api/medical-records/all', { headers }),
          axios.get('http://localhost:5000/api/users', { headers }),
        ]);
        setAppointments(apptsRes.data);
        setRecords(recsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error('Error loading admin data:', err);
      }
    };

    loadAdminData();
  }, [token, user?.role, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const staffCount = users.filter((u) => u.role === 'staff').length;
  const ownerCount = users.filter((u) => u.role === 'pet_owner').length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6">
        <div>
          <h1 className="text-xl font-bold text-indigo-700">VetCare Admin Dashboard</h1>
          <p className="text-sm text-gray-500">
            Clinic Manager: {user?.name} (<span className="uppercase font-semibold">{user?.role}</span>)
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Clinic Summary Stats */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-indigo-600">
          <p className="text-xs text-gray-500 uppercase">Total Appointments</p>
          <p className="text-2xl font-bold text-gray-800">{appointments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-teal-600">
          <p className="text-xs text-gray-500 uppercase">Medical Records</p>
          <p className="text-2xl font-bold text-gray-800">{records.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-600">
          <p className="text-xs text-gray-500 uppercase">Clinic Staff</p>
          <p className="text-2xl font-bold text-gray-800">{staffCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-600">
          <p className="text-xs text-gray-500 uppercase">Pet Owners</p>
          <p className="text-2xl font-bold text-gray-800">{ownerCount}</p>
        </div>
      </div>

      {/* Clinic Staff & Users List */}
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Clinic Staff & Registered Users</h2>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u._id} className="p-3 border rounded-lg flex justify-between items-center text-sm">
              <div>
                <p className="font-semibold text-gray-800">{u.name}</p>
                <p className="text-xs text-gray-500">{u.email} • {u.phone}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-indigo-100 text-indigo-700">
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">All Appointments Overview</h2>
        <div className="space-y-2">
          {appointments.map((appt) => (
            <div key={appt._id} className="p-3 border rounded-lg flex justify-between items-center text-sm">
              <div>
                <p className="font-bold text-indigo-700">
                  {appt.petId?.name} — {appt.serviceType}
                </p>
                <p className="text-xs text-gray-500">
                  Owner: {appt.ownerId?.name} | 📅 {appt.date} at {appt.timeSlot}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-yellow-100 text-yellow-800">
                {appt.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}