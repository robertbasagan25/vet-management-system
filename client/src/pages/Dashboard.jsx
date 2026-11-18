import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ClinicMap from '../components/ClinicMap';

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
];

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // States para sa data
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  // Form states para sa Add Pet
  const [petForm, setPetForm] = useState({ name: '', species: 'Dog', breed: '', age: '' });

  // Form states para sa Book Appointment
  const [apptForm, setApptForm] = useState({
    petId: '',
    date: '',
    timeSlot: '',
    serviceType: 'Checkup',
    notes: '',
  });

  // Helper para kunin ang latest pets at appointments pagkatapos mag-add o mag-book
  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [petsRes, apptsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/pets/my-pets', { headers }),
        axios.get('http://localhost:5000/api/appointments/my-appointments', { headers }),
      ]);
      setPets(petsRes.data);
      setAppointments(apptsRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  // 1. Pagkabukas ng page, i-check kung may token at i-load ang data
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const loadInitialData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [petsRes, apptsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/pets/my-pets', { headers }),
          axios.get('http://localhost:5000/api/appointments/my-appointments', { headers }),
        ]);
        setPets(petsRes.data);
        setAppointments(apptsRes.data);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };

    loadInitialData();
  }, [token, navigate]);

  // 2. Tuwing pumipili ng date, i-check kung aling oras ang puno na
  useEffect(() => {
    if (!apptForm.date || !token) return;
    axios
      .get(`http://localhost:5000/api/appointments/booked-slots?date=${apptForm.date}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBookedSlots(res.data))
      .catch((err) => console.error(err));
  }, [apptForm.date, token]);

  // Submit: Add Pet
  const handleAddPet = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/pets', petForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Pet added!');
      setPetForm({ name: '', species: 'Dog', breed: '', age: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add pet');
    }
  };

  // Submit: Book Appointment
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!apptForm.petId || !apptForm.date || !apptForm.timeSlot) {
      return alert('Please select a pet, date, and time slot.');
    }
    try {
      await axios.post('http://localhost:5000/api/appointments', apptForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Appointment booked successfully!');
      setApptForm({ petId: '', date: '', timeSlot: '', serviceType: 'Checkup', notes: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6">
        <div>
          <h1 className="text-xl font-bold text-teal-700">VetCare Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome, {user?.name} ({user?.role})
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. ADD PET FORM */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Pet</h2>
          <form onSubmit={handleAddPet} className="space-y-3">
            <input
              type="text"
              placeholder="Pet Name (e.g., Bantay)"
              value={petForm.name}
              onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
              required
              className="w-full p-2.5 border rounded-lg"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={petForm.species}
                onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}
                className="p-2.5 border rounded-lg"
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Breed (e.g., Aspin)"
                value={petForm.breed}
                onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                className="p-2.5 border rounded-lg"
              />
            </div>
            <input
              type="text"
              placeholder="Age (e.g., 2 years)"
              value={petForm.age}
              onChange={(e) => setPetForm({ ...petForm, age: e.target.value })}
              required
              className="w-full p-2.5 border rounded-lg"
            />
            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-2.5 rounded-lg font-semibold hover:bg-teal-700"
            >
              + Save Pet
            </button>
          </form>

          {/* List of My Pets */}
          <h3 className="font-semibold text-gray-700 mt-6 mb-2">My Pets ({pets.length})</h3>
          <div className="space-y-2">
            {pets.map((pet) => (
              <div key={pet._id} className="p-3 bg-teal-50 rounded-lg flex justify-between text-sm">
                <span className="font-semibold text-teal-800">
                  {pet.name} ({pet.species})
                </span>
                <span className="text-gray-600">
                  {pet.breed} • {pet.age}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. BOOK APPOINTMENT FORM */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Book Appointment</h2>
          <form onSubmit={handleBookAppointment} className="space-y-3">
            <select
              value={apptForm.petId}
              onChange={(e) => setApptForm({ ...apptForm, petId: e.target.value })}
              required
              className="w-full p-2.5 border rounded-lg"
            >
              <option value="">-- Select Pet --</option>
              {pets.map((pet) => (
                <option key={pet._id} value={pet._id}>
                  {pet.name} ({pet.species})
                </option>
              ))}
            </select>

            <select
              value={apptForm.serviceType}
              onChange={(e) => setApptForm({ ...apptForm, serviceType: e.target.value })}
              className="w-full p-2.5 border rounded-lg"
            >
              <option value="Checkup">General Checkup</option>
              <option value="Vaccination">Vaccination</option>
              <option value="Grooming">Grooming</option>
              <option value="Surgery">Surgery / Consultation</option>
            </select>

            <input
              type="date"
              value={apptForm.date}
              onChange={(e) => setApptForm({ ...apptForm, date: e.target.value, timeSlot: '' })}
              required
              className="w-full p-2.5 border rounded-lg"
            />

            {/* Time Slots (Anti-Double Booking) */}
            {apptForm.date && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Select Available Time:</p>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    const isSelected = apptForm.timeSlot === slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        disabled={isBooked}
                        onClick={() => setApptForm({ ...apptForm, timeSlot: slot })}
                        className={`p-2 text-xs rounded-lg border font-medium ${
                          isBooked
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-gray-700 hover:bg-teal-50'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <textarea
              placeholder="Notes / Symptoms (optional)"
              value={apptForm.notes}
              onChange={(e) => setApptForm({ ...apptForm, notes: e.target.value })}
              className="w-full p-2.5 border rounded-lg"
              rows="2"
            />

            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-2.5 rounded-lg font-semibold hover:bg-teal-700"
            >
              Confirm Booking
            </button>
          </form>
        </div>
      </div>

      {/* 3. MY APPOINTMENTS LIST */}
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-sm mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          My Appointments ({appointments.length})
        </h2>
        {appointments.length === 0 ? (
          <p className="text-gray-500 text-sm">No appointments booked yet.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div
                key={appt._id}
                className="p-4 border rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-2"
              >
                <div>
                  <p className="font-bold text-teal-700">
                    {appt.petId?.name} — {appt.serviceType}
                  </p>
                  <p className="text-sm text-gray-600">
                    📅 {appt.date} at ⏰ {appt.timeSlot}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-yellow-100 text-yellow-800 w-fit">
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. CLINIC MAP & DIRECTIONS */}
      <div className="max-w-5xl mx-auto">
        <ClinicMap />
      </div>
    </div>
  );
}