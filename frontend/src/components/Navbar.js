import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import {
  FaLeaf, FaBell, FaCalendarAlt, FaPlusCircle, FaClipboardList,
  FaUserShield, FaUserCircle, FaSignOutAlt, FaSignInAlt, FaUserPlus,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

function NavigationBar() {
  const { user, isAuthenticated, isOrganizer, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let interval;
    const fetchUnread = async () => {
      try {
        const res = await API.get('/notifications/unread-count');
        setUnreadCount(res.data.data.unreadCount);
      } catch (err) {
        // ignore - user may not be logged in yet
      }
    };
    if (isAuthenticated) {
      fetchUnread();
      interval = setInterval(fetchUnread, 30000);
    } else {
      setUnreadCount(0);
    }
    return () => interval && clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="app-navbar" variant="dark" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center">
          <FaLeaf className="me-2" />
          Green University Events
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              <FaCalendarAlt className="me-1" /> Events
            </Nav.Link>
            {isOrganizer && (
              <Nav.Link as={Link} to="/create-event">
                <FaPlusCircle className="me-1" /> Create Event
              </Nav.Link>
            )}
            {isOrganizer && (
              <Nav.Link as={Link} to="/my-events">
                <FaClipboardList className="me-1" /> My Events
              </Nav.Link>
            )}
            {isAuthenticated && !isOrganizer && (
              <Nav.Link as={Link} to="/my-registrations">
                <FaClipboardList className="me-1" /> My Registrations
              </Nav.Link>
            )}
            {isAdmin && (
              <Nav.Link as={Link} to="/admin">
                <FaUserShield className="me-1" /> Admin
              </Nav.Link>
            )}
          </Nav>
          <Nav className="align-items-lg-center">
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/notifications" className="position-relative me-2">
                  <FaBell />
                  {unreadCount > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="position-absolute top-0 start-100 translate-middle notif-badge"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Nav.Link>
                <NavDropdown
                  title={
                    <span>
                      <FaUserCircle className="me-1" />
                      {user?.name}
                    </span>
                  }
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    <FaUserCircle className="me-2" /> Profile
                  </NavDropdown.Item>
                  {isOrganizer && (
                    <NavDropdown.Item as={Link} to="/my-events">
                      <FaClipboardList className="me-2" /> My Events
                    </NavDropdown.Item>
                  )}
                  {!isOrganizer && (
                    <NavDropdown.Item as={Link} to="/my-registrations">
                      <FaClipboardList className="me-2" /> My Registrations
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <FaSignInAlt className="me-1" /> Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <FaUserPlus className="me-1" /> Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
