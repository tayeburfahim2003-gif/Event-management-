import { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Image } from 'react-bootstrap';
import { FaUserCircle, FaSave } from 'react-icons/fa';
import API, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    profilePicture: user?.profilePicture || '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const res = await API.put('/auth/update', formData);
      updateUser(res.data.data);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(getErrorMessage(err, 'Update failed'));
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;

  return (
    <Container className="mt-4 mb-5" style={{ maxWidth: 700 }}>
      <h1 className="text-success mb-4">
        <FaUserCircle className="me-2" /> My Profile
      </h1>
      <Card className="shadow-sm border-success">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <Image
              src={formData.profilePicture || user.profilePicture}
              roundedCircle
              width={100}
              height={100}
              style={{ objectFit: 'cover' }}
            />
          </div>

          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="mb-3">
            <Col md={6}>
              <strong>Email:</strong> {user.email}
            </Col>
            <Col md={6}>
              <strong>Role:</strong> <span className="text-capitalize">{user.role}</span>
            </Col>
            <Col md={6} className="mt-2">
              <strong>Department:</strong> {user.department}
            </Col>
          </Row>
          <hr />

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" value={formData.name} onChange={update('name')} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                value={formData.phoneNumber}
                onChange={update('phoneNumber')}
                placeholder="+1234567890"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Profile Picture URL</Form.Label>
              <Form.Control type="url" value={formData.profilePicture} onChange={update('profilePicture')} />
            </Form.Group>
            <div className="d-grid">
              <Button variant="success" type="submit" disabled={busy}>
                <FaSave className="me-2" />
                {busy ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Profile;
