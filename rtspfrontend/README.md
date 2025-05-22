# RTSP Stream Viewer

A web application that allows users to add RTSP stream URLs and view the live streams in a browser. The application consists of a React.js frontend and Django backend.

## Features

- Add, view, and manage RTSP stream sources
- Display live video streams in the browser
- View multiple streams simultaneously in a grid layout
- Basic stream controls (play/pause)
- Responsive design for various screen sizes

## Technical Architecture

### Frontend
- React.js
- Bootstrap for styling
- WebSocket communication for real-time video streaming

### Backend
- Django
- Django Channels for WebSocket support
- OpenCV and FFmpeg for video processing

## Prerequisites

Before running this application, make sure you have the following installed:

- Python 3.8 or higher
- Node.js 16 or higher
- FFmpeg
- Git

## Setup Instructions

### Clone the Repository

```bash
git clone https://github.com/yourusername/rtsp-stream-viewer.git
cd rtsp-stream-viewer
```

### Backend Setup

1. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:

```bash
cd backend
pip install django
pip install channels
pip install channels-redis
pip install django-cors-headers
pip install opencv-python
pip install ffmpeg-python

# Create Django project
django-admin startproject backend
cd backend
python manage.py startapp stream_app
```

3. Apply database migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

4. Run the Django development server:

```bash
python manage.py runserver
```

The backend server will be accessible at `http://localhost:8000`.

### Frontend Setup

1. Install Node.js dependencies:

```bash
cd frontend
npm install
```

2. Create a `.env` file with the backend URL:

```
REACT_APP_API_URL=http://localhost:8000
```

3. Start the development server:

```bash
npm start
```

The frontend will be accessible at `http://localhost:5173`. ##created with Vite
If not, `http://localhost:3000`.

## Deployment

### Backend Deployment

The backend can be deployed to any platform that supports Django applications, such as Heroku, AWS, or DigitalOcean.

Example for Heroku:

1. Create a Procfile in the backend directory:
```
web: daphne backend.asgi:application --port $PORT --bind 0.0.0.0
```

2. Deploy to Heroku:
```bash
heroku create your-app-name
git push heroku main
```

### Frontend Deployment

The frontend can be deployed to GitHub Pages or any other static site hosting service.

1. Build the production version:
```bash
cd frontend
npm run build
```

2. Deploy to GitHub Pages:
```bash
npm install -g gh-pages
gh-pages -d build
```

## Security Considerations

- RTSP URLs often contain credentials. Be careful not to expose these in client-side code or repositories.
- Consider adding authentication to protect access to the streams.
- For production use, ensure proper CORS settings and secure WebSocket connections (WSS).

## Troubleshooting

- **Stream not displaying**: Ensure the RTSP URL is correct and accessible from the server
- **Backend connection issues**: Check if the backend server is running and CORS settings are properly configured
- **Performance issues**: Consider adjusting video quality settings in the FFmpeg conversion process

## Acknowledgments

- FFmpeg for video processing
- OpenCV for image handling
- React.js and Django communities