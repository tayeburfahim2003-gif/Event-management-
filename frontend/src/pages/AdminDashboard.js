import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert, Tabs, Tab,
} from 'react-bootstrap';
import {
  FaUserShield, FaUsers, FaCalendarAlt, FaClipboardCheck, FaHourglassHalf,
  FaCheck, FaTimes, FaTrash,
} from 'react-icons/fa';
import API, { getErrorMessage } from '../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, eventsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/events', { params: { status: 'pending', limit: 100 } }),
        API.get('/admin/users'),
      ]);
      setStats(statsRes.data.data);
      setPendingEvents(eventsRes.data.data || []);
      setUsers(usersRes.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load admin dashboard'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleApprove = async (id) => {
    try {
      await API.put(`/admin/events/${id}/approve`);
      setPendingEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      alert(getErrorMessage(err, 'Approval failed'));
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection (optional):') || '';
    try {
      await API.put(`/admin/events/${id}/reject`, { reason });
      setPendingEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      alert(getErrorMessage(err, 'Rejection failed'));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(getErrorMessage(err, 'Could not delete user'));
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="success" />
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <h1 className="text-success mb-4">
        <FaUserShield className="me-2" /> Admin Dashboard
      </h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {stats && (
        <Row className="g-3 mb-4">
          <Col md={3}>
            <Card className="text-center shadow-sm border-success h-100">
              <Card.Body>
                <FaUsers className="text-success fs-2 mb-2" />
                <h3>{stats.totalUsers}</h3>
                <div className="text-muted">Total Users</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm border-success h-100">
              <Card.Body>
                <FaCalendarAlt className="text-success fs-2 mb-2" />
                <h3>{stats.totalEvents}</h3>
                <div className="text-muted">Total Events</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm border-success h-100">
              <Card.Body>
                <FaClipboardCheck className="text-success fs-2 mb-2" />
                <h3>{stats.totalRegistrations}</h3>
                <div className="text-muted">Registrations</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm border-warning h-100">
              <Card.Body>
                <FaHourglassHalf className="text-warning fs-2 mb-2" />
                <h3>{stats.pendingEvents}</h3>
                <div className="text-muted">Pending Approval</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Tabs defaultActiveKey="pending" className="mb-3">
        <Tab eventKey="pending" title={`Pending Events (${pendingEvents.length})`}>
          {pendingEvents.length === 0 ? (
            <Alert variant="light" className="border">No events waiting for approval.</Alert>
          ) : (
            <Table responsive hover className="align-middle bg-white shadow-sm">
              <thead className="table-success">
                <tr>
                  <th>Title</th>
                  <th>Organizer</th>
                  <th>Category</th>
                  <th>Starts</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingEvents.map((event) => (
                  <tr key={event._id}>
                    <td>
                      <Link to={`/events/${event._id}`} className="text-decoration-none">{event.title}</Link>
                    </td>
                    <td>{event.organizerName}</td>
                    <td className="text-capitalize">{event.category}</td>
                    <td>{new Date(event.startDate).toLocaleDateString()}</td>
                    <td className="text-end">
                      <Button size="sm" variant="success" className="me-2" onClick={() => handleApprove(event._id)}>
                        <FaCheck className="me-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleReject(event._id)}>
                        <FaTimes className="me-1" /> Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
        <Tab eventKey="users" title={`Users (${users.length})`}>
          <Table responsive hover className="align-middle bg-white shadow-sm">
            <thead className="table-success">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <Badge bg={u.role === 'admin' ? 'danger' : u.role === 'organizer' ? 'info' : 'secondary'} className="text-capitalize">
                      {u.role}
                    </Badge>
                  </td>
                  <td>{u.department}</td>
                  <td className="text-end">
                    <Button size="sm" variant="outline-danger" onClick={() => handleDeleteUser(u._id)}>
                      <FaTrash className="me-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>
    </Container>
  );
}

export default AdminDashboard;
