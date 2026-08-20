import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Row, Col, Card, Button, Badge, Spinner, Form, InputGroup,
} from 'react-bootstrap';
import {
  FaSearch, FaPlus, FaLeaf, FaCalendarAlt, FaMapMarkerAlt, FaUsers,
} from 'react-icons/fa';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['academic', 'sports', 'cultural', 'workshop', 'conference', 'social', 'career', 'other'];

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [greenOnly, setGreenOnly] = useState(false);
  const { isOrganizer } = useAuth();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (category) params.category = category;
      const response = await API.get('/events', { params });
      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, category]);

  useEffect(() => {
    const timeout = setTimeout(fetchEvents, 300); // debounce search
    return () => clearTimeout(timeout);
  }, [fetchEvents]);

  const visibleEvents = greenOnly ? events.filter((e) => e.isGreen) : events;

  return (
    <Container className="mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h1 className="text-success mb-0">
          <FaCalendarAlt className="me-2" />
          Discover Events
        </h1>
        {isOrganizer && (
          <Link to="/create-event">
            <Button variant="success">
              <FaPlus className="me-1" /> Create New Event
            </Button>
          </Link>
        )}
      </div>

      <Row className="g-2 mb-4 align-items-center">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text className="bg-success text-white">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search events by title, description, or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-success"
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select value={category} onChange={(e) => setCategory(e.target.value)} className="border-success">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Check
            type="switch"
            id="greenOnly"
            label={<span><FaLeaf className="text-success me-1" />Green only</span>}
            checked={greenOnly}
            onChange={(e) => setGreenOnly(e.target.checked)}
          />
        </Col>
      </Row>

      {loading ? (
        <Container className="text-center mt-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-2">Loading events...</p>
        </Container>
      ) : visibleEvents.length === 0 ? (
        <Card className="text-center p-5 border-success">
          <h3 className="text-success">No events found</h3>
          <p className="text-muted">
            {isOrganizer ? 'Be the first to create an event!' : 'Try adjusting your search or check back later.'}
          </p>
        </Card>
      ) : (
        <Row>
          {visibleEvents.map((event) => {
            const spotsLeft = event.capacity - event.registeredCount;
            return (
              <Col md={6} lg={4} key={event._id} className="mb-4">
                <Card className="h-100 shadow-sm border-success event-card">
                  <div
                    className="event-card-image"
                    style={{ backgroundImage: `url(${event.image})` }}
                  />
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="text-success">{event.title}</Card.Title>
                    <Card.Text className="text-muted flex-grow-1">
                      {event.description ? `${event.description.substring(0, 100)}...` : ''}
                    </Card.Text>
                    <div className="mb-2">
                      <Badge bg="secondary" className="me-1 text-capitalize">{event.category}</Badge>
                      {event.isGreen && (
                        <Badge bg="success">
                          <FaLeaf className="me-1" />Green
                        </Badge>
                      )}
                      {spotsLeft <= 0 && <Badge bg="danger" className="ms-1">Full</Badge>}
                    </div>
                    <div className="small text-muted">
                      <div><FaMapMarkerAlt className="me-1" />{event.venue}</div>
                      <div><FaCalendarAlt className="me-1" />{new Date(event.startDate).toLocaleString()}</div>
                      <div><FaUsers className="me-1" />{event.registeredCount}/{event.capacity} registered</div>
                    </div>
                  </Card.Body>
                  <Card.Footer className="bg-white border-0 pb-3">
                    <Link to={`/events/${event._id}`}>
                      <Button variant="outline-success" className="w-100">View Details</Button>
                    </Link>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
}

export default Events;
