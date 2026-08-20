import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FaCalendarPlus } from 'react-icons/fa';
import API, { getErrorMessage } from '../services/api';
import EventForm from '../components/EventForm';

function CreateEvent() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    setBusy(true);
    setError('');
    try {
      const res = await API.post('/events', payload);
      navigate(`/events/${res.data.data._id}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create event'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container className="mt-4 mb-5">
      <Row className="justify-content-center">
        <Col lg={9}>
          <h1 className="text-success mb-4">
            <FaCalendarPlus className="me-2" /> Create New Event
          </h1>
          <EventForm onSubmit={handleSubmit} submitLabel="Create Event" busy={busy} error={error} />
        </Col>
      </Row>
    </Container>
  );
}

export default CreateEvent;
