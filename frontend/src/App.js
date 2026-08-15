import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import Login from './pages/Login'; 
import Register from './pages/Register'; 
import Events from './pages/Events'; 
import EventDetail from './pages/EventDetail'; 
import CreateEvent from './pages/CreateEvent'; 
 
function App() { 
    return ( 
        <Router> 
            <Routes> 
                <Route path="/" element={<Events />} /> 
                <Route path="/login" element={<Login />} /> 
                <Route path="/register" element={<Register />} /> 
                <Route path="/events" element={<Events />} /> 
                <Route path="/events/:id" element={<EventDetail />} /> 
                <Route path="/create-event" element={<CreateEvent />} /> 
            </Routes> 
        </Router> 
    ); 
} 
 
export default App; 
