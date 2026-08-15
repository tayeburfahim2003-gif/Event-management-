import { useEffect, useState } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom'; 
import API from '../services/api'; 
 
function EventDetail() { 
    const [event, setEvent] = useState(null); 
    const [loading, setLoading] = useState(true); 
    const { id } = useParams(); 
    const navigate = useNavigate(); 
 
    useEffect(() => { 
        fetchEvent(); 
    }, [id]); 
 
    const fetchEvent = async () => { 
        try { 
            const response = await API.get(`/events/${id}`); 
            setEvent(response.data.data); 
        } catch (error) { 
            console.error('Error fetching event:', error); 
        } finally { 
            setLoading(false); 
        } 
    }; 
 
    const handleRegister = async () => { 
        try { 
            await API.post('/registrations', { eventId: id }); 
            alert('Successfully registered for event!'); 
            fetchEvent(); 
        } catch (error) { 
            alert('Registration failed: ' + error.response?.data?.error); 
        } 
    }; 
 
    if (loading) return <div>Loading event...</div>; 
    if (!event) return <div>Event not found</div>; 
 
    return ( 
        <div style={{ maxWidth: '600px', margin: '50px auto' }}> 
            <h1>{event.title}</h1> 
            <p>{event.description}</p> 
            <p><strong>Venue:</strong> {event.venue}</p> 
            <p><strong>Date:</strong> {new Date(event.startDate).toLocaleString()}</p> 
            <p><strong>Capacity:</strong> {event.registeredCount}/{event.capacity}</p> 
            <button onClick={handleRegister} style={{ padding: '10px 20px' }}>Register for Event</button> 
            <br /> 
            <button onClick={() => navigate('/events')} style={{ padding: '10px 20px', marginTop: '10px' }}>Back to Events</button> 
        </div> 
    ); 
} 
 
export default EventDetail; 
