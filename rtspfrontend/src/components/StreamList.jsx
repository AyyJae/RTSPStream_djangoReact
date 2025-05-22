import React from 'react';
import { Link } from 'react-router-dom';

const StreamList = ({ streams, loading, error, onDelete, onToggle, onRefresh }) => {
  if (loading) {
    return <div className="text-center mt-5">
             <div className="spinner-border"></div>
           </div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <button 
          className="btn btn-outline-danger ms-3"
          onClick={onRefresh}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (streams.length === 0) {
    return (
      <div className="text-center mt-5">
        <h3>No streams available</h3>
        <p>Add your first stream to get started</p>
        <Link to="/add" className="btn btn-primary">Add Stream</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Available Streams</h2>
        <button className="btn btn-outline-secondary" onClick={onRefresh}>
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      <div className="list-group">
        {streams.map(stream => (
          <div key={stream.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">{stream.name}</h5>
              <p className="mb-1 text-muted">{stream.rtsp_url}</p>
              <span className={`badge ${stream.is_active ? 'bg-success' : 'bg-secondary'}`}>
                {stream.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="btn-group">
              <Link to={`/view/${stream.id}`} className="btn btn-sm btn-primary">
                View
              </Link>
              <button 
                className={`btn btn-sm ${stream.is_active ? 'btn-warning' : 'btn-success'}`}
                onClick={() => onToggle(stream.id)}
              >
                {stream.is_active ? 'Pause' : 'Play'}
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this stream?')) {
                    onDelete(stream.id);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreamList;