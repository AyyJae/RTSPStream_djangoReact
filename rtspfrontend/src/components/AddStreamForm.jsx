import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddStreamForm = ({ onAddStream }) => {
  const [name, setName] = useState('');
  const [rtspUrl, setRtspUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim()) {
      setError('Please enter a name for the stream');
      return;
    }
    
    if (!rtspUrl.trim()) {
      setError('Please enter an RTSP URL');
      return;
    }
    
    if (!rtspUrl.toLowerCase().startsWith('rtsp://')) {
      setError('URL must be a valid RTSP URL (starting with rtsp://)');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const result = await onAddStream(name, rtspUrl);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to add stream. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Add New Stream</h3>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="streamName" className="form-label">Stream Name</label>
            <input
              type="text"
              className="form-control"
              id="streamName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Front Door Camera"
              disabled={loading}
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="rtspUrl" className="form-label">RTSP URL</label>
            <input
              type="text"
              className="form-control"
              id="rtspUrl"
              value={rtspUrl}
              onChange={(e) => setRtspUrl(e.target.value)}
              placeholder="rtsp://username:password@camera-ip:port/path"
              disabled={loading}
            />
            <div className="form-text">
              Example: rtsp://admin:password@192.168.1.100:554/live/ch01
            </div>
          </div>
          
          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Adding...
                </>
              ) : 'Add Stream'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStreamForm;