import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Table, Badge, Button, Spinner, Alert, Card } from 'react-bootstrap';
import { FaClipboardList, FaEdit, FaTrash, FaUsers, FaPlus } from 'react-icons/fa';
import API, { getErrorMessage } from '../services/api';

const STATUS_VARIANT = {
  draft: 'secondary',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  ongoing: 'info',
  completed: 'dark',
  cancelled: 'danger',
};

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await API.get('/events/my-events');
      setEvents(res.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load your events'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event permanently?')) return;
    try {
      await API.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      alert(getErrorMessage(err, 'Delete failed'));
    }
  };

  return (
    <Container className="mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h1 className="text-success mb-0">
          <FaClipboardList className="me-2" /> My Events
        </h1>
        <Link to="/create-event">
          <Button variant="success"><FaPlus className="me-1" /> Create New Event</Button>
        </Link>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <Container className="text-center py-5">
          <Spinner animation="border" variant="success" />
        </Container>
      ) : events.length === 0 ? (
        <Card className="text-center p-5 border-success">
          <h3 className="text-success">You haven't created any events yet</h3>
        </Card>
      ) : (
        <Table responsive hover className="align-middle bg-white shadow-sm">
          <thead className="table-success">
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Starts</th>
              <th>Registered</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event._id}>
                <td>
                  <Link to={`/events/${event._id}`} className="fw-semibold text-decoration-none">
                    {event.title}
                  </Link>
                </td>
                <td className="text-capitalize">{event.category}</td>
                <td>{new Date(event.startDate).toLocaleDateString()}</td>
                <td>{event.registeredCount} / {event.capacity}</td>
                <td>
                  <Badge bg={STATUS_VARIANT[event.status] || 'secondary'} className="text-capitalize">
                    {event.status}
                  </Badge>
                </td>
                <td className="text-end">
                  <Link to={`/my-events/${event._id}/registrations`} className="me-2">
                    <Button size="sm" variant="outline-primary" title="View registrations">
                      <FaUsers />
                    </Button>
                  </Link>
                  <Link to={`/edit-event/${event._id}`} className="me-2">
                    <Button size="sm" variant="outline-success" title="Edit event">
                      <FaEdit />
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline-danger" title="Delete event" onClick={() => handleDelete(event._id)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default MyEvents;
