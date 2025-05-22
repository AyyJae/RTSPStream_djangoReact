import json
import asyncio
import cv2
import base64
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import StreamSource

logger = logging.getLogger(__name__)

class StreamConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print(f"[WS] Connect called for stream_id={self.scope['url_route']['kwargs']['stream_id']}")
        self.stream_id = self.scope['url_route']['kwargs']['stream_id']
        self.stream_group_name = f"stream_{self.stream_id}"
        
        # Join stream group
        await self.channel_layer.group_add(
            self.stream_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Start stream when connected
        asyncio.create_task(self.start_stream())
    
    async def disconnect(self, close_code):
        # Leave stream group
        await self.channel_layer.group_discard(
            self.stream_group_name,
            self.channel_name
        )
        
        # Stop the streaming task if running
        if hasattr(self, 'streaming_task') and not self.streaming_task.done():
            self.streaming_task.cancel()
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        command = data.get('command')
        
        if command == 'start':
            asyncio.create_task(self.start_stream())
        elif command == 'stop':
            if hasattr(self, 'streaming_task') and not self.streaming_task.done():
                self.streaming_task.cancel()
    
    async def stream_frame(self, event):
        frame_data = event['frame']
        
        # Send frame to websocket
        await self.send(text_data=json.dumps({
            'frame': frame_data
        }))
    
    async def start_stream(self):
        try:
            # Get stream source from database
            stream_source = await self.get_stream_source()
            
            if not stream_source:
                await self.send(text_data=json.dumps({
                    'error': 'Stream source not found'
                }))
                return
            
            # Process the video stream
            self.streaming_task = asyncio.create_task(self.process_video_stream(stream_source))
            
        except Exception as e:
            logger.error(f"Error starting stream: {str(e)}")
            await self.send(text_data=json.dumps({
                'error': f'Failed to start stream: {str(e)}'
            }))
    
    async def get_stream_source(self):
        # This is a synchronous operation in Django ORM
        # In a real app, you would use database_sync_to_async
        from channels.db import database_sync_to_async
        
        @database_sync_to_async
        def get_source():
            try:
                return StreamSource.objects.get(id=self.stream_id)
            except StreamSource.DoesNotExist:
                return None
        
        return await get_source()
    
    async def process_video_stream(self, stream_source):
        try:
            # Initialize video capture with the RTSP URL
            cap = cv2.VideoCapture(stream_source.rtsp_url)
            
            if not cap.isOpened():
                await self.send(text_data=json.dumps({
                    'error': 'Failed to open video stream'
                }))
                return
            
            # Process frames
            while True:
                ret, frame = cap.read()
                
                if not ret:
                    await self.send(text_data=json.dumps({
                        'error': 'Stream ended or failed to read frame'
                    }))
                    break
                
                # Convert frame to JPEG
                _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
                
                # Encode as base64
                frame_data = base64.b64encode(buffer).decode('utf-8')
                
                # Send frame to group
                await self.channel_layer.group_send(
                    self.stream_group_name,
                    {
                        'type': 'stream_frame',
                        'frame': frame_data
                    }
                )
                
                # Control frame rate (adjust as needed)
                await asyncio.sleep(0.1)  # ~10 FPS
        
        except asyncio.CancelledError:
            # Clean shutdown when task is cancelled
            pass
        except Exception as e:
            logger.error(f"Error in video processing: {str(e)}")
            await self.send(text_data=json.dumps({
                'error': f'Stream processing error: {str(e)}'
            }))
        finally:
            # Release resources
            if cap and cap.isOpened():
                cap.release()