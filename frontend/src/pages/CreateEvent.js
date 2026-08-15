import { useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import API from '../services/api'; 
 
function CreateEvent() { 
    const [formData, setFormData] = useState({ 
        title: '', 
        description: '', 
        category: 'academic', 
        startDate: '', 
        endDate: '', 
        venue: '', 
        capacity: 50, 
        isGreen: false, 
        greenInitiatives: '' 
    }); 
    const navigate = useNavigate(); 
 
    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        try { 
            await API.post('/events', formData); 
            alert('Event created successfully!'); 
            navigate('/events'); 
        } catch (error) { 
            alert('Event creation failed: ' + error.response?.data?.error); 
        } 
    }; 
 
    return ( 
        <div style={{ maxWidth: '600px', margin: '50px auto' }}> 
            <h2>Create New Event</h2> 
            <form onSubmit={handleSubmit}> 
                <input type="text" placeholder="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0' }} /> 
                <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0' }} /> 
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0' }}> 
                    <option>academic</option> 
                    <option>sports</option> 
                    <option>cultural</option> 
                    <option>workshop</option> 
                    <option>conference</option> 
                    <option>social</option> 
                    <option>career</option> 
                    <option>other</option> 
                </select> 
                <input type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0' }} /> 
                <input type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0' }} /> 
                <input type="text" placeholder="Venue" value={formData.venue} onChange={(e) => setFormData({...formData, venue: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0' }} /> 
                <input type="number" placeholder="Capacity" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0' }} /> 
                <label><input type="checkbox" checked={formData.isGreen} onChange={(e) => setFormData({...formData, isGreen: e.target.checked})} /> Green Event</label> 
                    <textarea placeholder="Green Initiatives" value={formData.greenInitiatives} onChange={(e) => setFormData({...formData, greenInitiatives: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0' }} /> 
                )} 
                <button type="submit" style={{ width: '100%', padding: '10px' }}>Create Event</button> 
            </form> 
        </div> 
    ); 
} 
 
export default CreateEvent; 
