import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FaEdit } from 'react-icons/fa';
import API, { getErrorMessage } from '../services/api';
import EventForm from '../components/EventForm';

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    API.get(`/events/${id}`)
      .then((res) => setEvent(res.data.data))
      .catch((err) => setError(getErrorMessage(err, 'Could not load event')))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (payload) => {
    setBusy(true);
    setError('');
    try {
      await API.put(`/events/${id}`, payload);
      navigate(`/events/${id}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update event'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="success" />
      </Container>
    );
  }

  if (!event) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error || 'Event not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <Row className="justify-content-center">
        <Col lg={9}>
          <h1 className="text-success mb-4">
            <FaEdit className="me-2" /> Edit Event
          </h1>
          <EventForm
            initialData={event}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            busy={busy}
            error={error}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default EditEvent;
