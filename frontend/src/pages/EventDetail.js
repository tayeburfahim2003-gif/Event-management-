import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Card, Button, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';
import {
  FaLeaf, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaEnvelope, FaPhone,
  FaArrowLeft, FaEdit, FaTrash, FaClipboardList,
} from 'react-icons/fa';
import API, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FeedbackSection from '../components/FeedbackSection';

function EventDetail() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const fetchEvent = useCallback(async () => {
    try {
      const response = await API.get(`/events/${id}`);
      setEvent(response.data.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkRegistration = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await API.get('/registrations/user');
      const registrations = response.data.data || [];
      const found = registrations.find((r) => r.eventId && r.eventId._id === id);
      setRegistration(found || null);
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    fetchEvent();
    checkRegistration();
  }, [fetchEvent, checkRegistration]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await API.post('/registrations', { eventId: id });
      setMessage('Successfully registered for this event!');
      await fetchEvent();
      await checkRegistration();
    } catch (error) {
      setMessage(getErrorMessage(error, 'Registration failed'));
    } finally {
      setBusy(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!registration) return;
    if (!window.confirm('Cancel your registration for this event?')) return;
    setBusy(true);
    setMessage('');
    try {
      await API.delete(`/registrations/${registration._id}`);
      setRegistration(null);
      setMessage('Registration cancelled.');
      await fetchEvent();
    } catch (error) {
      setMessage(getErrorMessage(error, 'Cancellation failed'));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Delete this event permanently? This cannot be undone.')) return;
    setBusy(true);
    try {
      await API.delete(`/events/${id}`);
      navigate('/my-events');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Delete failed'));
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="success" />
        <p className="mt-2">Loading event...</p>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Event not found</Alert>
        <Button variant="secondary" onClick={() => navigate('/')}>
          <FaArrowLeft className="me-2" /> Back to Events
        </Button>
      </Container>
    );
  }

  const spotsLeft = event.capacity - event.registeredCount;
  const isFull = spotsLeft <= 0;
  const isOwner = user && (user.id === event.organizerId?._id || user.role === 'admin');
  const canRegister = event.status === 'approved';

  return (
    <Container className="mt-4 mb-5">
      <Button variant="link" className="text-success ps-0 mb-2" onClick={() => navigate(-1)}>
        <FaArrowLeft className="me-2" /> Back
      </Button>
      <Card className="shadow border-success">
        <div className="event-detail-image" style={{ backgroundImage: `url(${event.image})` }} />
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <h1>{event.title}</h1>
            {event.isGreen && (
              <Badge bg="success" className="fs-6">
                <FaLeaf className="me-1" /> Green Event
              </Badge>
            )}
          </div>

          <div className="mb-3">
            <Badge bg="secondary" className="me-2 text-capitalize">{event.category}</Badge>
            <Badge bg={isFull ? 'danger' : 'info'} className="me-2">
              {isFull ? 'Full' : `${spotsLeft} spots left`}
            </Badge>
            <Badge bg="light" text="dark" className="border text-capitalize">{event.status}</Badge>
          </div>

          {message && <Alert variant="info">{message}</Alert>}

          <Card.Text className="fs-5">{event.description}</Card.Text>
          <hr />
          <Row>
            <Col md={6}>
              <p><FaMapMarkerAlt className="me-2 text-success" /><strong>Venue:</strong> {event.venue}</p>
              <p><FaCalendarAlt className="me-2 text-success" /><strong>Starts:</strong> {new Date(event.startDate).toLocaleString()}</p>
              <p><FaCalendarAlt className="me-2 text-success" /><strong>Ends:</strong> {new Date(event.endDate).toLocaleString()}</p>
              <p><FaUsers className="me-2 text-success" /><strong>Registered:</strong> {event.registeredCount} / {event.capacity}</p>
            </Col>
            <Col md={6}>
              {event.greenInitiatives && (
                <p><FaLeaf className="me-2 text-success" /><strong>Green Initiatives:</strong> {event.greenInitiatives}</p>
              )}
              {event.prerequisites && <p><strong>Prerequisites:</strong> {event.prerequisites}</p>}
              <p><strong>Organizer:</strong> {event.organizerName}</p>
              {event.contactEmail && (
                <p><FaEnvelope className="me-2 text-success" />{event.contactEmail}</p>
              )}
              {event.contactPhone && (
                <p><FaPhone className="me-2 text-success" />{event.contactPhone}</p>
              )}
            </Col>
          </Row>
          {event.tags && event.tags.length > 0 && (
            <div className="mb-3">
              {event.tags.map((tag) => (
                <Badge key={tag} bg="light" text="dark" className="border me-2">#{tag}</Badge>
              ))}
            </div>
          )}
          <hr />

          {registration && registration.qrCode && (
            <Card className="mb-3 bg-light border-success">
              <Card.Body className="text-center">
                <p className="mb-2 fw-bold text-success">Your registration QR code</p>
                <img src={registration.qrCode} alt="Registration QR code" style={{ width: 160, height: 160 }} />
                <p className="small text-muted mt-2 mb-0">Present this at check-in</p>
              </Card.Body>
            </Card>
          )}

          <div className="d-flex gap-3 flex-wrap">
            {!isOwner && user?.role === 'student' && (
              !registration ? (
                <Button variant="success" onClick={handleRegister} disabled={isFull || !canRegister || busy}>
                  {!isAuthenticated
                    ? 'Login to Register'
                    : !canRegister
                      ? 'Not Open for Registration'
                      : isFull
                        ? 'Event Full'
                        : busy ? 'Registering...' : 'Register for Event'}
                </Button>
              ) : (
                <Button variant="danger" onClick={handleCancelRegistration} disabled={busy}>
                  Cancel Registration
                </Button>
              )
            )}

            {isOwner && (
              <>
                <Link to={`/edit-event/${event._id}`}>
                  <Button variant="outline-success">
                    <FaEdit className="me-2" /> Edit Event
                  </Button>
                </Link>
                <Link to={`/my-events/${event._id}/registrations`}>
                  <Button variant="outline-primary">
                    <FaClipboardList className="me-2" /> View Registrations
                  </Button>
                </Link>
                <Button variant="outline-danger" onClick={handleDeleteEvent} disabled={busy}>
                  <FaTrash className="me-2" /> Delete
                </Button>
              </>
            )}
          </div>

          {!isAuthenticated && (
            <Alert variant="warning" className="mt-3">
              Please <Link to="/login">login</Link> to register for this event.
            </Alert>
          )}

          <FeedbackSection
            eventId={event._id}
            registration={registration}
            onFeedbackSubmitted={checkRegistration}
          />
        </Card.Body>
      </Card>
    </Container>
  );
}

export default EventDetail;
