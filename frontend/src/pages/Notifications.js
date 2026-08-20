import { useEffect, useState } from 'react';
import { Container, ListGroup, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaBell, FaCheckDouble, FaTrash } from 'react-icons/fa';
import API, { getErrorMessage } from '../services/api';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  const units = [
    ['year', 31536000], ['month', 2592000], ['day', 86400],
    ['hour', 3600], ['minute', 60],
  ];
  for (const [name, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${name}${value > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data.data.notifications || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load notifications'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      // silent fail is fine here
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      alert(getErrorMessage(err, 'Could not mark all as read'));
    }
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      alert(getErrorMessage(err, 'Could not delete notification'));
    }
  };

  return (
    <Container className="mt-4 mb-5" style={{ maxWidth: 700 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-success mb-0">
          <FaBell className="me-2" /> Notifications
        </h1>
        {notifications.some((n) => !n.read) && (
          <Button variant="outline-success" size="sm" onClick={markAllAsRead}>
            <FaCheckDouble className="me-1" /> Mark all read
          </Button>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <Container className="text-center py-5">
          <Spinner animation="border" variant="success" />
        </Container>
      ) : notifications.length === 0 ? (
        <Alert variant="light" className="text-center border">You're all caught up — no notifications.</Alert>
      ) : (
        <ListGroup>
          {notifications.map((n) => (
            <ListGroup.Item
              key={n._id}
              className={`d-flex justify-content-between align-items-start ${!n.read ? 'bg-light border-success' : ''}`}
              action
              onClick={() => !n.read && markAsRead(n._id)}
            >
              <div className="me-3">
                <div className="fw-bold">
                  {!n.read && <Badge bg="success" className="me-2">New</Badge>}
                  {n.title}
                </div>
                <div className="text-muted small">{n.message}</div>
                <div className="text-muted small mt-1">{timeAgo(n.createdAt)}</div>
              </div>
              <Button
                size="sm"
                variant="link"
                className="text-danger p-0"
                onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                title="Delete"
              >
                <FaTrash />
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
}

export default Notifications;
