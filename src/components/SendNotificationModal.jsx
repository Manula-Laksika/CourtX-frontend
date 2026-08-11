import React, { useState, useEffect, useCallback } from 'react';
import { Send, AlertCircle, CheckCircle, Users, Briefcase, User } from 'lucide-react';
import Modal from './Modal';

export default function SendNotificationModal({ isOpen, onClose, onSuccess, user }) {
  const [targetType, setTargetType] = useState('user'); // 'user', 'role', 'case'
  const [targetUserId, setTargetUserId] = useState('');
  const [targetRole, setTargetRole] = useState('client');
  const [targetCaseId, setTargetCaseId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('general');

  const [usersList, setUsersList] = useState([]);
  const [casesList, setCasesList] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDropdownOptions = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const token = localStorage.getItem('courtx_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [usersRes, casesRes] = await Promise.all([
        fetch('http://127.0.0.1:5001/api/users', { headers }),
        fetch('http://127.0.0.1:5001/api/cases', { headers })
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(usersData.filter(u => u.id !== user?.id));
      }
      if (casesRes.ok) {
        const casesData = await casesRes.json();
        setCasesList(casesData);
      }
    } catch (err) {
      console.error('Error fetching modal options:', err);
    } finally {
      setLoadingOptions(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      fetchDropdownOptions();
    }
  }, [isOpen, fetchDropdownOptions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title.trim()) {
      setError('Notification title is required.');
      return;
    }
    if (!message.trim()) {
      setError('Notification message is required.');
      return;
    }

    if (targetType === 'user' && !targetUserId) {
      setError('Please select a recipient user.');
      return;
    }
    if (targetType === 'case' && !targetCaseId) {
      setError('Please select a target case.');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('courtx_token');
      const response = await fetch('http://127.0.0.1:5001/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetType,
          targetUserId: targetType === 'user' ? targetUserId : null,
          targetRole: targetType === 'role' ? targetRole : null,
          targetCaseId: targetType === 'case' ? targetCaseId : null,
          title: title.trim(),
          message: message.trim(),
          type
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send notification.');
      }

      setSuccessMsg(data.message || 'Notification sent successfully!');
      setTitle('');
      setMessage('');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dispatch Official Notification">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Target Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Recipient Target Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTargetType('user')}
              className={`flex items-center justify-center gap-1.5 p-2 text-xs font-medium rounded-lg border transition-all ${
                targetType === 'user'
                  ? 'bg-teal-50 border-teal-600 text-teal-800 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Specific User
            </button>
            <button
              type="button"
              onClick={() => setTargetType('role')}
              className={`flex items-center justify-center gap-1.5 p-2 text-xs font-medium rounded-lg border transition-all ${
                targetType === 'role'
                  ? 'bg-teal-50 border-teal-600 text-teal-800 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> User Group
            </button>
            <button
              type="button"
              onClick={() => setTargetType('case')}
              className={`flex items-center justify-center gap-1.5 p-2 text-xs font-medium rounded-lg border transition-all ${
                targetType === 'case'
                  ? 'bg-teal-50 border-teal-600 text-teal-800 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> Case Parties
            </button>
          </div>
        </div>

        {/* Dynamic Recipient Fields */}
        {targetType === 'user' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Recipient
            </label>
            <select
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              disabled={loadingOptions}
            >
              <option value="">-- Choose User --</option>
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.role.replace('_', ' ')}) - {u.email}
                </option>
              ))}
            </select>
          </div>
        )}

        {targetType === 'role' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Role Group
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="client">All Clients</option>
              <option value="lawyer">All Lawyers</option>
              <option value="court_staff">All Court Staff</option>
            </select>
          </div>
        )}

        {targetType === 'case' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Case (Notify Lawyer & Client)
            </label>
            <select
              value={targetCaseId}
              onChange={(e) => setTargetCaseId(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              disabled={loadingOptions}
            >
              <option value="">-- Choose Case --</option>
              {casesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.case_number}: {c.title} ({c.client_name})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category & Title */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="general">General Notice</option>
              <option value="hearing">Hearing Alert</option>
              <option value="case_update">Case Update</option>
              <option value="urgent">Urgent Priority</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notification Title
            </label>
            <input
              type="text"
              placeholder="e.g. Urgent Hearing Location Change"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Message Content */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Message Body
          </label>
          <textarea
            rows={3}
            placeholder="Type your official notification details here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            required
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
            disabled={sending}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {sending ? 'Dispatching...' : 'Dispatch Notification'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
