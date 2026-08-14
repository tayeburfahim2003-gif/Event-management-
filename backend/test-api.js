// test-api.js - Complete API Testing Script
// Run with: node test-api.js

const axios = require('axios');

// ============================================
// CONFIGURATION
// ============================================
const BASE_URL = 'http://localhost:5000/api';
let authToken = null;
let createdEventId = null;
let createdRegistrationId = null;

// ============================================
// HELPER FUNCTIONS
// ============================================
const log = (title, data) => {
    console.log('\n' + '='.repeat(60));
    console.log(`📌 ${title}`);
    console.log('='.repeat(60));
    console.log(JSON.stringify(data, null, 2));
    console.log('='.repeat(60) + '\n');
};

const logError = (title, error) => {
    console.log('\n' + '='.repeat(60));
    console.log(`❌ ${title}`);
    console.log('='.repeat(60));
    console.log(`Status: ${error.response?.status || 'No response'}`);
    console.log(`Message: ${error.message}`);
    console.log(`Data: ${JSON.stringify(error.response?.data || {}, null, 2)}`);
    console.log('='.repeat(60) + '\n');
};

// ============================================
// TEST 1: HEALTH CHECK
// ============================================
const testHealth = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        log('✅ Health Check', response.data);
        return true;
    } catch (error) {
        logError('Health Check Failed', error);
        return false;
    }
};

// ============================================
// TEST 2: REGISTER USER
// ============================================
const testRegister = async () => {
    try {
        const userData = {
            name: 'Test User ' + Date.now(),
            email: `test${Date.now()}@student.com`,
            password: '123456',
            department: 'Computer Science'
        };
        
        const response = await axios.post(`${BASE_URL}/auth/register`, userData);
        log('✅ User Registered', response.data);
        return true;
    } catch (error) {
        logError('Registration Failed', error);
        return false;
    }
};

// ============================================
// TEST 3: LOGIN
// ============================================
const testLogin = async () => {
    try {
        const loginData = {
            email: 'admin@greenuniversity.edu',
            password: 'Admin@123'
        };
        
        const response = await axios.post(`${BASE_URL}/auth/login`, loginData);
        authToken = response.data.token;
        log('✅ Login Successful', {
            ...response.data,
            token: response.data.token.substring(0, 50) + '...'
        });
        return true;
    } catch (error) {
        logError('Login Failed', error);
        return false;
    }
};

// ============================================
// TEST 4: GET PROFILE
// ============================================
const testGetProfile = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        log('✅ Profile Retrieved', response.data);
        return true;
    } catch (error) {
        logError('Get Profile Failed', error);
        return false;
    }
};

// ============================================
// TEST 5: GET ALL EVENTS
// ============================================
const testGetEvents = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/events`);
        log('✅ All Events Retrieved', response.data);
        return true;
    } catch (error) {
        logError('Get Events Failed', error);
        return false;
    }
};

// ============================================
// TEST 6: CREATE EVENT
// ============================================
const testCreateEvent = async () => {
    try {
        const eventData = {
            title: `Tech Talk ${new Date().toLocaleDateString()}`,
            description: 'Amazing tech event about AI and Machine Learning',
            category: 'academic',
            startDate: '2026-08-15T10:00:00.000Z',
            endDate: '2026-08-15T12:00:00.000Z',
            venue: 'Hall A',
            capacity: 50,
            isGreen: true,
            greenInitiatives: 'Paperless event, digital certificates'
        };
        
        const response = await axios.post(`${BASE_URL}/events`, eventData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        createdEventId = response.data.data._id;
        log('✅ Event Created', {
            ...response.data,
            data: {
                ...response.data.data,
                _id: response.data.data._id
            }
        });
        return true;
    } catch (error) {
        logError('Create Event Failed', error);
        return false;
    }
};

// ============================================
// TEST 7: GET SINGLE EVENT
// ============================================
const testGetEvent = async () => {
    if (!createdEventId) {
        console.log('⚠️ No event ID found, skipping test');
        return false;
    }
    
    try {
        const response = await axios.get(`${BASE_URL}/events/${createdEventId}`);
        log('✅ Single Event Retrieved', response.data);
        return true;
    } catch (error) {
        logError('Get Event Failed', error);
        return false;
    }
};

// ============================================
// TEST 8: REGISTER FOR EVENT
// ============================================
const testRegisterForEvent = async () => {
    if (!createdEventId) {
        console.log('⚠️ No event ID found, skipping test');
        return false;
    }
    
    try {
        const response = await axios.post(`${BASE_URL}/registrations`, {
            eventId: createdEventId
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        createdRegistrationId = response.data.data._id;
        log('✅ Registration Successful', response.data);
        return true;
    } catch (error) {
        logError('Registration Failed', error);
        return false;
    }
};

// ============================================
// TEST 9: GET USER REGISTRATIONS
// ============================================
const testGetUserRegistrations = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/registrations/user`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        log('✅ User Registrations Retrieved', response.data);
        return true;
    } catch (error) {
        logError('Get Registrations Failed', error);
        return false;
    }
};

// ============================================
// TEST 10: ADMIN DASHBOARD STATS
// ============================================
const testAdminStats = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        log('✅ Admin Dashboard Stats', response.data);
        return true;
    } catch (error) {
        logError('Admin Stats Failed', error);
        return false;
    }
};

// ============================================
// TEST 11: CANCEL REGISTRATION
// ============================================
const testCancelRegistration = async () => {
    if (!createdRegistrationId) {
        console.log('⚠️ No registration ID found, skipping test');
        return false;
    }
    
    try {
        const response = await axios.delete(`${BASE_URL}/registrations/${createdRegistrationId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        log('✅ Registration Cancelled', response.data);
        return true;
    } catch (error) {
        logError('Cancel Registration Failed', error);
        return false;
    }
};

// ============================================
// TEST 12: DELETE EVENT
// ============================================
const testDeleteEvent = async () => {
    if (!createdEventId) {
        console.log('⚠️ No event ID found, skipping test');
        return false;
    }
    
    try {
        const response = await axios.delete(`${BASE_URL}/events/${createdEventId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        log('✅ Event Deleted', response.data);
        return true;
    } catch (error) {
        logError('Delete Event Failed', error);
        return false;
    }
};

// ============================================
// RUN ALL TESTS
// ============================================
const runAllTests = async () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 STARTING API TESTS');
    console.log('='.repeat(60));
    console.log(`⏰ Time: ${new Date().toLocaleString()}`);
    console.log(`📡 Server: ${BASE_URL}`);
    console.log('='.repeat(60));

    const results = [];

    // Run tests in sequence
    results.push(await testHealth());
    results.push(await testRegister());
    results.push(await testLogin());
    results.push(await testGetProfile());
    results.push(await testGetEvents());
    results.push(await testCreateEvent());
    results.push(await testGetEvent());
    results.push(await testRegisterForEvent());
    results.push(await testGetUserRegistrations());
    results.push(await testAdminStats());
    results.push(await testCancelRegistration());
    results.push(await testDeleteEvent());

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    const passed = results.filter(r => r === true).length;
    const total = results.length;
    
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    console.log('='.repeat(60) + '\n');
};

// ============================================
// RUN TESTS
// ============================================
runAllTests();