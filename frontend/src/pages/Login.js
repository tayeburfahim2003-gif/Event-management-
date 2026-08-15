import { useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import API from '../services/api'; 
 
function Login() { 
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState(''); 
    const navigate = useNavigate(); 
 
    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        try { 
            const response = await API.post('/auth/login', { email, password }); 
            localStorage.setItem('token', response.data.token); 
            alert('Login successful!'); 
            navigate('/events'); 
        } catch (error) { 
            alert('Login failed: ' + error.response?.data?.error); 
        } 
    }; 
 
    return ( 
        <div style={{ maxWidth: '400px', margin: '50px auto' }}> 
            <h2>Login</h2> 
            <form onSubmit={handleSubmit}> 
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', margin: '10px 0' }} /> 
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', margin: '10px 0' }} /> 
                <button type="submit" style={{ width: '100%', padding: '10px' }}>Login</button> 
            </form> 
            <p>Don't have an account? <a href="/register">Register</a></p> 
        </div> 
    ); 
} 
 
export default Login; 
