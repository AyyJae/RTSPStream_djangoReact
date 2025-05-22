import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const GridView = ({ streams, baseUrl }) => {
  const [activeStreams, setActiveStreams] = useState([]);
  const [streamStates, setStreamStates] = useState({});
  const wsRefs = useRef({});

  useEffect(() => {
    // Filter active streams
    const active = streams.filter(stream => stream.is_active);
    setActiveStreams(active);

    // Initialize stream states
    const initialStates = {};
    active.forEach(stream => {
      initialStates[stream.id] = {
        connected: false,
        error: null,
        currentFrame: '',
        isPlaying: true
      };
    });
    setStreamStates(initialStates);

    // Connect to all active streams via WebSocket
    active.forEach(stream => {
      connectToStream(stream.id);
    });

    // Clean up function
    return () => {
      // Close all WebSocket connections
      Object.keys(wsRefs.current).forEach(streamId => {
        if (wsRefs.current[streamId]) {
          wsRefs.current[streamId].close();
        }
      });
    };
  }, [streams, baseUrl]);

  const connectToStream = (streamId) => {
    if (wsRefs.current[streamId]) {
      wsRefs.current[streamId].close();
    }

    const socketUrl = `${baseUrl.replace('http', 'ws')}/ws/stream/${streamId}/`;
    wsRefs.current[streamId] = new WebSocket(socketUrl);

    wsRefs.current[streamId].onopen = () => {
      console.log(`WebSocket connection established for stream ${streamId}`);
      setStreamStates(prev => ({
        ...prev,
        [streamId]: {
          ...prev[streamId],
          connected: true,
          error: null
        }
      }));
    };

    wsRefs.current[streamId].onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.error) {
        setStreamStates(prev => ({
          ...prev,
          [streamId]: {
            ...prev[streamId],
            error: data.error,
            isPlaying: false
          }
        }));
      } else if (data.frame) {
        setStreamStates(prev => ({
          ...prev,
          [streamId]: {
            ...prev[streamId],
            currentFrame: `data:image/jpeg;base64,${data.frame}`,
            error: null
          }
        }));
      }
    };

    wsRefs.current[streamId].onerror = (event) => {
      console.error(`WebSocket error for stream ${streamId}:`, event);
      setStreamStates(prev => ({
        ...prev,
        [streamId]: {
          ...prev[streamId],
          error: 'Failed to connect to stream',
          isPlaying: false
        }
      }));
    };

    wsRefs.current[streamId].onclose = () => {
      console.log(`WebSocket connection closed for stream ${streamId}`);
      setStreamStates(prev => ({
        ...prev,
        [streamId]: {
          ...prev[streamId],
          connected: false
        }
      }));
    };
  };

  const toggleStream = (streamId) => {
    setStreamStates(prev => {
      const newState = {
        ...prev,
        [streamId]: {
          ...prev[streamId],
          isPlaying: !prev[streamId].isPlaying
        }
      };

      if (newState[streamId].isPlaying) {
        // Reconnect the stream
        connectToStream(streamId);
      } else {
        // Disconnect the stream
        if (wsRefs.current[streamId]) {
          wsRefs.current[streamId].close();
        }
      }

      return newState;
    });
  };

  // Calculate grid class based on number of streams
  const getGridClass = () => {
    const count = activeStreams.length;
    if (count === 0) return '';
    if (count === 1) return 'col-12';
    if (count === 2) return 'col-md-6';
    if (count <= 4) return 'col-md-6 col-lg-6';
    return 'col-md-6 col-lg-4';
  };

  if (activeStreams.length === 0) {
    return (
      <div className="text-center mt-5">
        <h3>No active streams</h3>
        <p>Please activate streams to view them in grid layout</p>
        <Link to="/" className="btn btn-primary">Manage Streams</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Grid View ({activeStreams.length} active streams)</h2>
        <Link to="/" className="btn btn-secondary">Back to List</Link>
      </div>

      <div className="row g-3">
        {activeStreams.map(stream => {
          const streamState = streamStates[stream.id] || {};
          const { error, currentFrame, isPlaying } = streamState;

          return (
            <div key={stream.id} className={getGridClass()}>
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="m-0">{stream.name}</h5>
                  <button 
                    className={`btn btn-sm ${isPlaying ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => toggleStream(stream.id)}
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                </div>
                <div className="card-body p-0">
                  {error ? (
                    <div className="alert alert-danger m-2">
                      {error}
                    </div>
                  ) : null}
                  
                  <div className="stream-container text-center">
                    {isPlaying ? (
                      currentFrame ? (
                        <img 
                          src={currentFrame} 
                          alt={`Stream ${stream.name}`} 
                          className="img-fluid w-100" 
                          style={{ maxHeight: '300px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                          <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="stream-placeholder d-flex justify-content-center align-items-center" style={{ height: '200px', backgroundColor: '#f8f9fa' }}>
                        <div className="text-center">
                          <p>Stream Paused</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-footer">
                  <small className="text-muted">{stream.rtsp_url}</small>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GridView;