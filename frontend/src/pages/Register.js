import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { FaUserPlus, FaUser, FaEnvelope, FaLock, FaGraduationCap, FaLeaf } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  'Computer Science', 'Engineering', 'Business', 'Arts', 'Science',
  'Medicine', 'Law', 'Education', 'Other', 'Administration',
];

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Computer Science',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const result = await register(formData);
    setBusy(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center auth-container">
      <Card className="shadow-lg border-success auth-card auth-card-wide">
        <Card.Header className="bg-success text-white text-center py-3">
          <h3 className="mb-0">
            <FaLeaf className="me-2" />
            Create Account
          </h3>
          <div className="small opacity-75">Join Green University Events</div>
        </Card.Header>
        <Card.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FaUser className="me-2 text-success" />
                Full Name
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={update('name')}
                minLength={2}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FaEnvelope className="me-2 text-success" />
                Email
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={update('email')}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FaLock className="me-2 text-success" />
                Password
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={formData.password}
                onChange={update('password')}
                minLength={6}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaGraduationCap className="me-2 text-success" />
                    Department
                  </Form.Label>
                  <Form.Select value={formData.department} onChange={update('department')}>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>I am a...</Form.Label>
                  <Form.Select value={formData.role} onChange={update('role')}>
                    <option value="student">Student</option>
                    <option value="organizer">Organizer</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-grid">
              <Button variant="success" type="submit" size="lg" disabled={busy}>
                <FaUserPlus className="me-2" />
                {busy ? 'Creating account...' : 'Register'}
              </Button>
            </div>
          </Form>
          <div className="text-center mt-3">
            <Link to="/login" className="text-success">
              Already have an account? Login here
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Register;
