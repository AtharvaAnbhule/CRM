'use client';
import { useState } from 'react';
import { FiCalendar, FiClock, FiMail, FiUser, FiX, FiCheck, FiMapPin } from 'react-icons/fi';

export default function EventScheduler() {
  // Form state
  const [form, setForm] = useState({
    title: '',
    attendees: [] as string[],
    newAttendee: '',
    startTime: '',
    endTime: '',
    description: '',
    location: 'Zoom Meeting',
  });
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  // Add attendee
  const addAttendee = () => {
    if (!form.newAttendee.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    setForm({
      ...form,
      attendees: [...form.attendees, form.newAttendee],
      newAttendee: '',
    });
    setError('');
  };

  // Remove attendee
  const removeAttendee = (email: string) => {
    setForm({
      ...form,
      attendees: form.attendees.filter((e) => e !== email),
    });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError('');

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          attendeeEmail: form.attendees.join(','),
          startTime: form.startTime,
          endTime: form.endTime,
          description: form.description,
          location: form.location,
        }),
      });

      if (!res.ok) throw new Error('Failed to send invite');
      alert('🎉 Invite sent successfully!');
      setForm({
        title: '',
        attendees: [],
        newAttendee: '',
        startTime: '',
        endTime: '',
        description: '',
        location: 'Zoom Meeting',
      });
    } catch (err) {
      setError('Failed to send invite. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 dark:bg-black rounded-xl shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Schedule a Meeting</h1>
        <p className="dark:text-white mt-2">Send professional calendar invites with one click</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium dark:text-white mb-1">Event Title *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiCalendar className="dark:text-white" />
            </div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Team Sync Meeting"
              required
            />
          </div>
        </div>

        {/* Attendees */}
        <div>
          <label className="block text-sm font-medium dark:text-white mb-1">Attendees *</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="dark:text-white" />
              </div>
              <input
                type="email"
                value={form.newAttendee}
                onChange={(e) => setForm({ ...form, newAttendee: e.target.value })}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="john@company.com"
              />
            </div>
            <button
              type="button"
              onClick={addAttendee}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <FiUser /> Add
            </button>
          </div>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

          {/* Attendee chips */}
          {form.attendees.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.attendees.map((email) => (
                <div
                  key={email}
                  className="flex items-center dark:bg-black px-3 py-2 rounded-full text-sm"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => removeAttendee(email)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date & Time */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium dark:text-white mb-1">Start Time *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiClock className="dark:text-white" />
              </div>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiClock className="dark:text-white" />
              </div>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                min={form.startTime}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium dark:text-white mb-1">Location</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMapPin className="dark:text-white" />
            </div>
            <select
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>Zoom Meeting</option>
              <option>Google Meet</option>
              <option>Microsoft Teams</option>
              <option>Office</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium dark:text-white mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Meeting agenda, notes, etc."
          />
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSending || form.attendees.length === 0}
            className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 ${
              isSending || form.attendees.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <FiCheck size={18} />
                Send Invitation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}