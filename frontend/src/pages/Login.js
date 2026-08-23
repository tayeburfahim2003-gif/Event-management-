import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { FaSignInAlt, FaEnvelope, FaLock, FaLeaf } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const result = await login(email, password, rememberMe);
    setBusy(false);
    if (result.success) {
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center auth-container">
      <Card className="shadow-lg border-success auth-card">
        <Card.Header className="bg-success text-white text-center py-3">
          <h3 className="mb-0">
            <FaLeaf className="me-2" />
            Welcome Back
          </h3>
          <div className="small opacity-75">Sign in to Green University Events</div>
        </Card.Header>
        <Card.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FaEnvelope className="me-2 text-success" />
                Email
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>
                <FaLock className="me-2 text-success" />
                Password
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Check
                type="checkbox"
                id="rememberMe"
                label="Remember me for 30 days"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            </Form.Group>
            <div className="d-grid">
              <Button variant="success" type="submit" size="lg" disabled={busy}>
                <FaSignInAlt className="me-2" />
                {busy ? 'Signing in...' : 'Login'}
              </Button>
            </div>
          </Form>
          <div className="text-center mt-3">
            <Link to="/register" className="text-success">
              Don't have an account? Register here
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
