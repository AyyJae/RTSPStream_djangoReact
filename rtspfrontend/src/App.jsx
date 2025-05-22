import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import StreamList from './components/StreamList';
import StreamView from './components/StreamView';
import AddStreamForm from './components/AddStreamForm';
import GridView from './components/GridView';
import axios from 'axios';

// Base API URL - change this to your deployed backend URL
const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch streams when component mounts
  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/streams/`);
      setStreams(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch streams:', err);
      setError('Failed to load streams. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const addStream = async (name, rtspUrl) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/streams/add/`, {
        name,
        rtsp_url: rtspUrl
      });
      setStreams([...streams, response.data]);
      return { success: true };
    } catch (err) {
      console.error('Failed to add stream:', err);
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to add stream'
      };
    }
  };

  const deleteStream = async (streamId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/streams/${streamId}/delete/`);
      setStreams(streams.filter(stream => stream.id !== streamId));
      return { success: true };
    } catch (err) {
      console.error('Failed to delete stream:', err);
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to delete stream'
      };
    }
  };

  const toggleStream = async (streamId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/streams/${streamId}/toggle/`);
      setStreams(streams.map(stream => 
        stream.id === streamId ? response.data : stream
      ));
      return { success: true };
    } catch (err) {
      console.error('Failed to toggle stream:', err);
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to toggle stream status'
      };
    }
  };

  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="main-content pt-4">
          <Routes>
            <Route path="/" element={
              <StreamList 
                streams={streams}
                loading={loading}
                error={error}
                onDelete={deleteStream}
                onToggle={toggleStream}
                onRefresh={fetchStreams}
              />
            } />
            <Route path="/add" element={
              <AddStreamForm onAddStream={addStream} />
            } />
            <Route path="/view/:id" element={
              <StreamView streams={streams} baseUrl={API_BASE_URL} />
            } />
            <Route path="/grid" element={
              <GridView streams={streams} baseUrl={API_BASE_URL} />
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;