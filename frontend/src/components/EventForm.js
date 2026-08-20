import { useState } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { FaSave, FaLeaf } from 'react-icons/fa';

const CATEGORIES = ['academic', 'sports', 'cultural', 'workshop', 'conference', 'social', 'career', 'other'];

// Convert an ISO date string into the value <input type="datetime-local"> expects
const toLocalInput = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function EventForm({ initialData, onSubmit, submitLabel = 'Save Event', busy = false, error }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'academic',
    startDate: toLocalInput(initialData?.startDate),
    endDate: toLocalInput(initialData?.endDate),
    venue: initialData?.venue || '',
    capacity: initialData?.capacity || 50,
    image: initialData?.image || '',
    isGreen: initialData?.isGreen || false,
    greenInitiatives: initialData?.greenInitiatives || '',
    tags: (initialData?.tags || []).join(', '),
    prerequisites: initialData?.prerequisites || '',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
  });
  const [validated, setValidated] = useState(false);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    setValidated(true);

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      alert('End date must be after the start date.');
      return;
    }

    const payload = {
      ...formData,
      capacity: Number(formData.capacity),
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    onSubmit(payload);
  };

  return (
    <Card className="shadow-sm border-success">
      <Card.Body className="p-4">
        {error && <Alert variant="danger">{error}</Alert>}
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Event Title *</Form.Label>
                <Form.Control
                  type="text"
                  required
                  maxLength={100}
                  value={formData.title}
                  onChange={handleChange('title')}
                  placeholder="e.g. Annual Sustainability Fair"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Category *</Form.Label>
                <Form.Select value={formData.category} onChange={handleChange('category')}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              required
              maxLength={2000}
              value={formData.description}
              onChange={handleChange('description')}
              placeholder="What is this event about?"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date &amp; Time *</Form.Label>
                <Form.Control
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={handleChange('startDate')}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Date &amp; Time *</Form.Label>
                <Form.Control
                  type="datetime-local"
                  required
                  value={formData.endDate}
                  onChange={handleChange('endDate')}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Venue *</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={formData.venue}
                  onChange={handleChange('venue')}
                  placeholder="e.g. Main Auditorium"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Capacity *</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  required
                  value={formData.capacity}
                  onChange={handleChange('capacity')}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Cover Image URL</Form.Label>
            <Form.Control
              type="url"
              value={formData.image}
              onChange={handleChange('image')}
              placeholder="https://... (leave blank for a default image)"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tags</Form.Label>
            <Form.Control
              type="text"
              value={formData.tags}
              onChange={handleChange('tags')}
              placeholder="comma, separated, tags"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Prerequisites</Form.Label>
            <Form.Control
              type="text"
              value={formData.prerequisites}
              onChange={handleChange('prerequisites')}
              placeholder="Anything attendees need to bring or know beforehand"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Contact Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange('contactEmail')}
                  placeholder="Defaults to your account email"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Contact Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.contactPhone}
                  onChange={handleChange('contactPhone')}
                  placeholder="+1234567890"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3 p-3 bg-light rounded border">
            <Form.Check
              type="switch"
              id="isGreen"
              label={
                <span>
                  <FaLeaf className="text-success me-1" /> Mark as a Green Event
                </span>
              }
              checked={formData.isGreen}
              onChange={handleChange('isGreen')}
            />
            {formData.isGreen && (
              <Form.Control
                as="textarea"
                rows={2}
                className="mt-2"
                value={formData.greenInitiatives}
                onChange={handleChange('greenInitiatives')}
                placeholder="Describe the sustainability initiatives for this event"
              />
            )}
          </Form.Group>

          <div className="d-grid">
            <Button variant="success" type="submit" size="lg" disabled={busy}>
              <FaSave className="me-2" />
              {busy ? 'Saving...' : submitLabel}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default EventForm;
