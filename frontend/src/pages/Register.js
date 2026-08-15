import { useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import API from '../services/api'; 
 
function Register() { 
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        department: 'Computer Science' 
    }); 
    const navigate = useNavigate(); 
 
    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        try { 
            const response = await API.post('/auth/register', formData); 
            localStorage.setItem('token', response.data.token); 
            alert('Registration successful!'); 
            navigate('/login'); 
        } catch (error) { 
            alert('Registration failed: ' + error.response?.data?.error); 
        } 
    }; 
 
    return ( 
        <div style={{ maxWidth: '400px', margin: '50px auto' }}> 
            <h2>Register</h2> 
            <form onSubmit={handleSubmit}> 
                <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0' }} /> 
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0' }} /> 
                <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0' }} /> 
                <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0' }}> 
                    <option>Computer Science</option> 
                    <option>Engineering</option> 
                    <option>Business</option> 
                    <option>Arts</option> 
                    <option>Science</option> 
                    <option>Medicine</option> 
                    <option>Law</option> 
                    <option>Education</option> 
                    <option>Other</option> 
                </select> 
                <button type="submit" style={{ width: '100%', padding: '10px' }}>Register</button> 
            </form> 
            <p>Already have an account? <a href="/login">Login</a></p> 
        </div> 
    ); 
} 
 
export default Register; 
