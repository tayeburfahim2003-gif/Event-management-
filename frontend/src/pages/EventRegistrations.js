import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Table, Badge, Spinner, Alert, Button, Card } from 'react-bootstrap';
import { FaArrowLeft, FaUsers, FaCheckCircle } from 'react-icons/fa';
import API, { getErrorMessage } from '../services/api';

const STATUS_VARIANT = {
  registered: 'secondary',
  'checked-in': 'success',
  'no-show': 'danger',
  cancelled: 'dark',
};

function EventRegistrations() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [eventRes, regRes] = await Promise.all([
        API.get(`/events/${id}`),
        API.get(`/registrations/event/${id}`),
      ]);
      setEvent(eventRes.data.data);
      setRegistrations(regRes.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load registrations'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCheckIn = async (registration) => {
    try {
      const qrData = JSON.stringify({ eventId: id, userId: registration.userId._id || registration.userId });
      await API.post('/registrations/checkin', { qrData });
      setRegistrations((prev) =>
        prev.map((r) => (r._id === registration._id ? { ...r, attendanceStatus: 'checked-in' } : r))
      );
    } catch (err) {
      alert(getErrorMessage(err, 'Check-in failed'));
    }
  };

  return (
    <Container className="mt-4 mb-5">
      <Link to={`/events/${id}`} className="text-success text-decoration-none">
        <FaArrowLeft className="me-2" /> Back to event
      </Link>

      <div className="d-flex justify-content-between align-items-center my-3 flex-wrap gap-2">
        <h1 className="text-success mb-0">
          <FaUsers className="me-2" />
          Registrations {event ? `— ${event.title}` : ''}
        </h1>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <Container className="text-center py-5">
          <Spinner animation="border" variant="success" />
        </Container>
      ) : registrations.length === 0 ? (
        <Card className="text-center p-5 border-success">
          <h3 className="text-success">No one has registered yet</h3>
        </Card>
      ) : (
        <Table responsive hover className="align-middle bg-white shadow-sm">
          <thead className="table-success">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Registered On</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg) => (
              <tr key={reg._id}>
                <td>{reg.userId?.name || 'Unknown'}</td>
                <td>{reg.userId?.email}</td>
                <td>{reg.userId?.department}</td>
                <td>{new Date(reg.registrationDate).toLocaleDateString()}</td>
                <td>
                  <Badge bg={STATUS_VARIANT[reg.attendanceStatus] || 'secondary'} className="text-capitalize">
                    {reg.attendanceStatus}
                  </Badge>
                </td>
                <td className="text-end">
                  {reg.attendanceStatus !== 'checked-in' && (
                    <Button size="sm" variant="outline-success" onClick={() => handleCheckIn(reg)}>
                      <FaCheckCircle className="me-1" /> Check In
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default EventRegistrations;
