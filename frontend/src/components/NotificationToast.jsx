import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext.jsx';

// A self-dismissing toast notification that appears when a real-time
// interview reminder arrives via Socket.io.
const NotificationToast = () => {
  const [notifications, setNotifications] = useState([]);
  const { subscribe, unsubscribe } = useSocket();

  useEffect(() => {
    const handleReminder = (payload) => {
      const id = Date.now(); // unique ID for this notification
      setNotifications((prev) => [...prev, { id, ...payload }]);

      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 8000);
    };

    subscribe('notification:interview-reminder', handleReminder);

    return () => {
      unsubscribe('notification:interview-reminder', handleReminder);
    };
  }, [subscribe, unsubscribe]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="flex max-w-sm items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-lg"
        >
          {/* Bell icon using unicode — no external icon lib needed */}
          <span className="text-xl">🔔</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              Interview Reminder
            </p>
            <p className="mt-0.5 text-sm text-amber-800">{notification.message}</p>
          </div>
          <button
            onClick={() =>
              setNotifications((prev) =>
                prev.filter((n) => n.id !== notification.id)
              )
            }
            className="text-amber-600 hover:text-amber-900"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;