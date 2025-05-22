import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

const StreamView = ({ streams, baseUrl }) => {
  const { id } = useParams();
  const [stream, setStream] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [currentFrame, setCurrentFrame] = useState('');
  const wsRef = useRef(null);

  // Find the stream in the streams array
  useEffect(() => {
    const foundStream = streams.find(s => s.id === parseInt(id));
    setStream(foundStream);
    
    if (foundStream && foundStream.is_active) {
      setIsPlaying(true);
    }
  }, [streams, id]);

  // Handle WebSocket connection
  useEffect(() => {
    if (!stream || !isPlaying) return;

    // Connect to WebSocket
    const socketUrl = `${baseUrl.replace('http', 'ws')}/ws/stream/${id}/`;
    wsRef.current = new WebSocket(socketUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connection established');
      setError(null);
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.error) {
        setError(data.error);
        setIsPlaying(false);
      } else if (data.frame) {
        setCurrentFrame(`data:image/jpeg;base64,${data.frame}`);
      }
    };

    wsRef.current.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError('Failed to connect to stream');
      setIsPlaying(false);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // Clean up function
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [stream, isPlaying, baseUrl, id]);

  const togglePlayPause = () => {
    if (isPlaying) {
      // Stop the stream
      if (wsRef.current) {
        wsRef.current.close();
      }
      setIsPlaying(false);
    } else {
      // Start the stream
      setIsPlaying(true);
    }
  };

  if (!stream) {
    return (
      <div className="alert alert-warning">
        Stream not found. <Link to="/" className="alert-link">Return to streams list</Link>
      </div>
    );
  }

  return (
    <div className="stream-view">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3>{stream.name}</h3>
          <div>
            <button 
              className={`btn ${isPlaying ? 'btn-warning' : 'btn-success'} me-2`}
              onClick={togglePlayPause}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <Link to="/" className="btn btn-secondary">Back to List</Link>
          </div>
        </div>
        <div className="card-body">
          <p className="text-muted mb-3">{stream.rtsp_url}</p>
          
          {error ? (
            <div className="alert alert-danger">
              {error}
            </div>
          ) : null}
          
          <div className="stream-container text-center">
            {isPlaying ? (
              currentFrame ? (
                <img 
                  src={currentFrame} 
                  alt="Stream" 
                  className="img-fluid stream-image" 
                />
              ) : (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )
            ) : (
              <div className="stream-placeholder d-flex justify-content-center align-items-center" style={{ height: '400px', backgroundColor: '#f8f9fa' }}>
                <div className="text-center">
                  <h5>Stream Paused</h5>
                  <p>Click Play to start streaming</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamView;