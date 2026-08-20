import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaClipboardList, FaQrcode, FaMapMarkerAlt, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import API, { getErrorMessage } from '../services/api';

const STATUS_VARIANT = {
  registered: 'secondary',
  'checked-in': 'success',
  'no-show': 'danger',
  cancelled: 'dark',
};

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrModal, setQrModal] = useState(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await API.get('/registrations/user');
      setRegistrations(res.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load your registrations'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancel = async (registration) => {
    if (!window.confirm(`Cancel your registration for "${registration.eventId?.title}"?`)) return;
    try {
      await API.delete(`/registrations/${registration._id}`);
      setRegistrations((prev) => prev.filter((r) => r._id !== registration._id));
    } catch (err) {
      alert(getErrorMessage(err, 'Cancellation failed'));
    }
  };

  return (
    <Container className="mt-4 mb-5">
      <h1 className="text-success mb-4">
        <FaClipboardList className="me-2" /> My Registrations
      </h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <Container className="text-center py-5">
          <Spinner animation="border" variant="success" />
        </Container>
      ) : registrations.length === 0 ? (
        <Card className="text-center p-5 border-success">
          <h3 className="text-success">No registrations yet</h3>
          <p className="text-muted">
            Browse <Link to="/">upcoming events</Link> and register for one!
          </p>
        </Card>
      ) : (
        <Row>
          {registrations.map((reg) => (
            <Col md={6} lg={4} key={reg._id} className="mb-4">
              <Card className="h-100 shadow-sm border-success">
                <Card.Body className="d-flex flex-column">
                  <Card.Title>
                    {reg.eventId ? (
                      <Link to={`/events/${reg.eventId._id}`} className="text-success text-decoration-none">
                        {reg.eventId.title}
                      </Link>
                    ) : 'Event removed'}
                  </Card.Title>
                  {reg.eventId && (
                    <div className="small text-muted mb-2">
                      <div><FaMapMarkerAlt className="me-1" />{reg.eventId.venue}</div>
                      <div><FaCalendarAlt className="me-1" />{new Date(reg.eventId.startDate).toLocaleString()}</div>
                    </div>
                  )}
                  <Badge bg={STATUS_VARIANT[reg.attendanceStatus] || 'secondary'} className="text-capitalize mb-3 align-self-start">
                    {reg.attendanceStatus}
                  </Badge>
                  <div className="mt-auto d-flex gap-2">
                    {reg.qrCode && (
                      <Button size="sm" variant="outline-success" onClick={() => setQrModal(reg)}>
                        <FaQrcode className="me-1" /> QR Code
                      </Button>
                    )}
                    {reg.attendanceStatus === 'registered' && (
                      <Button size="sm" variant="outline-danger" onClick={() => handleCancel(reg)}>
                        <FaTimes className="me-1" /> Cancel
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={!!qrModal} onHide={() => setQrModal(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Your Check-in QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {qrModal?.eventId && <p className="fw-bold">{qrModal.eventId.title}</p>}
          {qrModal && <img src={qrModal.qrCode} alt="Registration QR code" style={{ width: 220, height: 220 }} />}
          <p className="small text-muted mt-2 mb-0">Present this at the event entrance for check-in</p>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default MyRegistrations;
