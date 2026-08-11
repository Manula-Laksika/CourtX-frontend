import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell, Check, CheckCheck, Trash2, Calendar, Briefcase,
  AlertCircle, Sparkles, Send, RefreshCw, X
} from 'lucide-react';
import SendNotificationModal from './SendNotificationModal';

export default function NotificationCenter({ user, onSelectCase }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const containerRef = useRef(null);

  const fetchNotifications = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const token = localStorage.getItem('courtx_token');
      if (!token) return;

      const response = await fetch('http://127.0.0.1:5001/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        const list = Array.isArray(data) ? data : (data.notifications || []);
        setNotifications(list);
        setUnreadCount(
          data.unreadCount != null
            ? data.unreadCount
            : list.filter(n => n.status === 'unread').length
        );
      }
    } catch (err) {
      // Silently ignore fetch errors for background polling
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(() => fetchNotifications(true), 15000);
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  // Close popover on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const token = localStorage.getItem('courtx_token');
      await fetch(`http://127.0.0.1:5001/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('courtx_token');
      await fetch('http://127.0.0.1:5001/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
      setUnreadCount(0);
    } catch (err) { /* ignore */ }
  };

  const deleteNotif = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const token = localStorage.getItem('courtx_token');
      await fetch(`http://127.0.0.1:5001/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const was = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (was && was.status === 'unread') setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { /* ignore */ }
  };

  const clearAll = async () => {
    try {
      const token = localStorage.getItem('courtx_token');
      await fetch('http://127.0.0.1:5001/api/notifications/clear-all', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) { /* ignore */ }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const typeIcon = (type) => {
    switch (type) {
      case 'hearing': return <Calendar className="w-3.5 h-3.5 text-amber-500" />;
      case 'case_update': return <Briefcase className="w-3.5 h-3.5 text-teal-600" />;
      case 'urgent': return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
      case 'announcement': return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
      default: return <Bell className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const typeBadge = (type) => {
    switch (type) {
      case 'hearing': return 'bg-amber-50 text-amber-700';
      case 'case_update': return 'bg-emerald-50 text-emerald-700';
      case 'urgent': return 'bg-rose-50 text-rose-700';
      case 'announcement': return 'bg-purple-50 text-purple-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return n.status === 'unread';
    if (filter === 'hearing') return n.type === 'hearing';
    if (filter === 'case_update') return n.type === 'case_update';
    if (filter === 'urgent') return n.type === 'urgent';
    return true;
  });

  const canSend = ['court_staff', 'admin', 'lawyer'].includes(user?.role);

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'hearing', label: 'Hearings' },
    { key: 'case_update', label: 'Updates' },
    { key: 'urgent', label: 'Urgent' },
  ];

  return (
    <div className="relative" ref={containerRef} style={{ zIndex: 50 }}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-slate-500 hover:text-teal-700 hover:bg-slate-100 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-rose-600 text-white shadow"
            style={{ width: 18, height: 18, fontSize: 10, fontWeight: 700, lineHeight: 1 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 bg-white rounded-xl border border-slate-200 overflow-hidden"
          style={{
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            boxShadow: '0 20px 50px -12px rgba(0,0,0,0.18), 0 4px 16px -4px rgba(0,0,0,0.08)',
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold text-teal-300 bg-teal-900/50 px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {canSend && (
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); setIsSendModalOpen(true); }}
                  className="px-2 py-1 text-[10px] font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded transition-colors flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  Send
                </button>
              )}
              <button
                type="button"
                onClick={() => fetchNotifications()}
                className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Actions row */}
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-teal-700 disabled:opacity-30 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-0.5 px-3 py-1.5 border-b border-slate-100 bg-white overflow-x-auto">
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-colors ${
                  filter === tab.key
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
                }`}
              >
                {tab.label}
                {tab.key === 'all' ? ` (${notifications.length})` : ''}
                {tab.key === 'unread' ? ` (${unreadCount})` : ''}
              </button>
            ))}
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
            {filtered.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Bell className="w-7 h-7 opacity-20 mb-2" />
                <p className="text-xs">No notifications here.</p>
              </div>
            ) : (
              filtered.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.status === 'unread') markAsRead(n.id);
                    if (n.case_id && onSelectCase) { onSelectCase(n.case_id); setIsOpen(false); }
                  }}
                  className={`flex items-start gap-2.5 px-4 py-3 border-b border-slate-50 cursor-pointer transition-colors group ${
                    n.status === 'unread'
                      ? 'bg-teal-50/30 hover:bg-teal-50/60'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  {/* Icon */}
                  <div className="shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                    {typeIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-semibold text-slate-800 truncate">{n.title}</span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">{timeAgo(n.created_at)}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {n.type && (
                        <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded capitalize ${typeBadge(n.type)}`}>
                          {(n.type || '').replace('_', ' ')}
                        </span>
                      )}
                      {n.case_number && (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono text-slate-500 bg-slate-100 rounded">
                          {n.case_number}
                        </span>
                      )}
                      {n.sender_name && (
                        <span className="text-[9px] text-slate-400">by {n.sender_name}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {n.status === 'unread' && (
                      <button
                        type="button"
                        onClick={(e) => markAsRead(n.id, e)}
                        className="p-1 text-slate-400 hover:text-teal-600 rounded transition-colors"
                        title="Mark read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => deleteNotif(n.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Live sync
            </span>
            <span>CourtX</span>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      <SendNotificationModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSuccess={() => fetchNotifications()}
        user={user}
      />
    </div>
  );
}
