import { useEffect, useState } from 'react'; 
import { Link } from 'react-router-dom'; 
import API from '../services/api'; 
 
function Events() { 
    const [events, setEvents] = useState([]); 
    const [loading, setLoading] = useState(true); 
 
    useEffect(() => { 
        fetchEvents(); 
    }, []); 
 
    const fetchEvents = async () => { 
        try { 
            const response = await API.get('/events'); 
            setEvents(response.data.data); 
        } catch (error) { 
            console.error('Error fetching events:', error); 
        } finally { 
            setLoading(false); 
        } 
    }; 
 
    if (loading) return <div>Loading events...</div>; 
 
    return ( 
        <div style={{ maxWidth: '800px', margin: '50px auto' }}> 
            <h1>All Events</h1> 
            <Link to="/create-event"><button style={{ padding: '10px', marginBottom: '20px' }}>Create New Event</button></Link> 
            {events.length === 0 ? <p>No events available</p> : events.map((event) => ( 
                <div key={event._id} style={{ border: '1px solid #ccc', padding: '20px', margin: '10px 0', borderRadius: '8px' }}> 
                    <h3>{event.title}</h3> 
                    <p>{event.description}</p> 
                    <p><strong>Venue:</strong> {event.venue}</p> 
                    <p><strong>Date:</strong> {new Date(event.startDate).toLocaleString()}</p> 
                    <p><strong>Capacity:</strong> {event.registeredCount}/{event.capacity}</p> 
                    <br /> 
                    <Link to={`/events/${event._id}`}><button style={{ padding: '5px 15px', marginTop: '10px' }}>View Details</button></Link> 
                </div> 
            ))} 
        </div> 
    ); 
} 
 
export default Events; 
