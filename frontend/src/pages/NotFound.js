import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { FaLeaf } from 'react-icons/fa';

function NotFound() {
  return (
    <Container className="text-center py-5">
      <FaLeaf className="text-success mb-3" style={{ fontSize: '3rem' }} />
      <h1>404</h1>
      <p className="text-muted">This page has wandered off the path.</p>
      <Link to="/">
        <Button variant="success">Back to Events</Button>
      </Link>
    </Container>
  );
}

export default NotFound;
