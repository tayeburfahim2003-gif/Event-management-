import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import NavigationBar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import MyEvents from './pages/MyEvents';
import EventRegistrations from './pages/EventRegistrations';
import MyRegistrations from './pages/MyRegistrations';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<Events />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events/:id" element={<EventDetail />} />

          <Route
            path="/create-event"
            element={
              <PrivateRoute roles={['organizer', 'admin']}>
                <CreateEvent />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-event/:id"
            element={
              <PrivateRoute roles={['organizer', 'admin']}>
                <EditEvent />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-events"
            element={
              <PrivateRoute roles={['organizer', 'admin']}>
                <MyEvents />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-events/:id/registrations"
            element={
              <PrivateRoute roles={['organizer', 'admin']}>
                <EventRegistrations />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-registrations"
            element={
              <PrivateRoute>
                <MyRegistrations />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
