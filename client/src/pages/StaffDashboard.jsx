import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);

  const [recordForm, setRecordForm] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatment: '',
    prescriptions: '',
    nextVaccinationDate: '',
  });

  const fetchAllData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [apptsRes, recsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/appointments/all', { headers }),
        axios.get('http://localhost:5000/api/medical-records/all', { headers }),
      ]);
      setAppointments(apptsRes.data);
      setRecords(recsRes.data);
    } catch (err) {
      console.error('Error loading staff data:', err);
    }
  };

  useEffect(() => {
    if (!token || user?.role === 'pet_owner') {
      navigate('/login');
      return;
    }

    const loadInitial = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [apptsRes, recsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/appointments/all', { headers }),
          axios.get('http://localhost:5000/api/medical-records/all', { headers }),
        ]);
        setAppointments(apptsRes.data);
        setRecords(recsRes.data);
      } catch (err) {
        console.error('Error loading staff data:', err);
      }
    };

    loadInitial();
  }, [token, user?.role, navigate]);

  // Update Appointment Status (Confirmed / Completed / Cancelled)
  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/appointments/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllData();
    } catch {
      alert('Failed to update status');
    }
  };

  // Save Digital Medical Record
  const handleSaveRecord = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    try {
      await axios.post(
        'http://localhost:5000/api/medical-records',
        {
          petId: selectedAppt.petId._id,
          ownerId: selectedAppt.ownerId._id,
          ...recordForm,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Digital Medical Record saved!');
      setSelectedAppt(null);
      setRecordForm({
        visitDate: new Date().toISOString().split('T')[0],
        diagnosis: '',
        treatment: '',
        prescriptions: '',
        nextVaccinationDate: '',
      });
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save record');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6">
        <div>
          <h1 className="text-xl font-bold text-teal-700">VetCare Clinic Portal</h1>
          <p className="text-sm text-gray-500">
            Logged in as: {user?.name} (<span className="uppercase font-semibold">{user?.role}</span>)
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* 1. ALL APPOINTMENTS QUEUE */}
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Clinic Appointments ({appointments.length})
        </h2>
        <div className="space-y-3">
          {appointments.map((appt) => (
            <div
              key={appt._id}
              className="p-4 border rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-3"
            >
              <div>
                <p className="font-bold text-teal-700">
                  {appt.petId?.name} ({appt.petId?.species}) — {appt.serviceType}
                </p>
                <p className="text-sm text-gray-600">
                  Owner: {appt.ownerId?.name} ({appt.ownerId?.phone})
                </p>
                <p className="text-sm text-gray-500">
                  📅 {appt.date} at ⏰ {appt.timeSlot} | Status:{' '}
                  <span className="font-semibold uppercase text-teal-700">{appt.status}</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusChange(appt._id, 'confirmed')}
                  className="bg-blue-500 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-600"
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleStatusChange(appt._id, 'completed')}
                  className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700"
                >
                  Complete
                </button>
                <button
                  onClick={() => setSelectedAppt(appt)}
                  className="bg-teal-700 text-white px-3 py-1.5 rounded text-xs hover:bg-teal-800"
                >
                  + Add Medical Record
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. ADD MEDICAL RECORD FORM (Lalabas lang kapag pinindot ang "+ Add Medical Record") */}
      {selectedAppt && (
        <div className="max-w-6xl mx-auto bg-teal-50 border border-teal-200 p-6 rounded-xl shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-teal-800">
              Encode Medical Record for {selectedAppt.petId?.name} (Owner: {selectedAppt.ownerId?.name})
            </h2>
            <button
              onClick={() => setSelectedAppt(null)}
              className="text-sm text-red-600 font-semibold"
            >
              Close ✕
            </button>
          </div>
          <form onSubmit={handleSaveRecord} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="date"
              value={recordForm.visitDate}
              onChange={(e) => setRecordForm({ ...recordForm, visitDate: e.target.value })}
              required
              className="p-2.5 border rounded-lg bg-white"
            />
            <input
              type="text"
              placeholder="Diagnosis (e.g., Ear Infection)"
              value={recordForm.diagnosis}
              onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
              required
              className="p-2.5 border rounded-lg bg-white"
            />
            <input
              type="text"
              placeholder="Treatment Given (e.g., Ear Cleaning + Drops)"
              value={recordForm.treatment}
              onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })}
              required
              className="p-2.5 border rounded-lg bg-white"
            />
            <input
              type="text"
              placeholder="Prescriptions / Medicine"
              value={recordForm.prescriptions}
              onChange={(e) => setRecordForm({ ...recordForm, prescriptions: e.target.value })}
              className="p-2.5 border rounded-lg bg-white"
            />
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600 block mb-1">Next Follow-up / Vaccination Date (Optional):</label>
              <input
                type="date"
                value={recordForm.nextVaccinationDate}
                onChange={(e) => setRecordForm({ ...recordForm, nextVaccinationDate: e.target.value })}
                className="w-full p-2.5 border rounded-lg bg-white"
              />
            </div>
            <button
              type="submit"
              className="md:col-span-2 bg-teal-600 text-white py-2.5 rounded-lg font-semibold hover:bg-teal-700"
            >
              Save Digital Record
            </button>
          </form>
        </div>
      )}

      {/* 3. ALL DIGITAL MEDICAL RECORDS */}
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          All Digital Medical Records ({records.length})
        </h2>
        <div className="space-y-3">
          {records.map((rec) => (
            <div key={rec._id} className="p-4 border rounded-lg bg-gray-50 text-sm">
              <div className="flex justify-between font-bold text-teal-800">
                <span>{rec.petId?.name} ({rec.petId?.species}) — Owner: {rec.ownerId?.name}</span>
                <span>📅 {rec.visitDate}</span>
              </div>
              <p className="mt-1"><strong>Diagnosis:</strong> {rec.diagnosis}</p>
              <p><strong>Treatment:</strong> {rec.treatment}</p>
              <p><strong>Prescriptions:</strong> {rec.prescriptions}</p>
              {rec.nextVaccinationDate && (
                <p className="text-teal-700 font-medium mt-1">
                  Next Visit/Vaccine: {rec.nextVaccinationDate}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">Encoded by: {rec.vetId?.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}