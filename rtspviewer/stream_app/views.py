from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import StreamSource

@csrf_exempt
@require_http_methods(["GET"])
def list_streams(request):
    streams = StreamSource.objects.all().values('id', 'name', 'rtsp_url', 'is_active')
    return JsonResponse(list(streams), safe=False)

@csrf_exempt
@require_http_methods(["POST"])
def add_stream(request):
    try:
        data = json.loads(request.body)
        name = data.get('name')
        rtsp_url = data.get('rtsp_url')
        
        if not name or not rtsp_url:
            return JsonResponse({'error': 'Name and RTSP URL are required'}, status=400)
        
        # Create new stream source
        stream = StreamSource.objects.create(
            name=name,
            rtsp_url=rtsp_url
        )
        
        return JsonResponse({
            'id': stream.id,
            'name': stream.name,
            'rtsp_url': stream.rtsp_url,
            'is_active': stream.is_active
        })
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_stream(request, stream_id):
    try:
        stream = StreamSource.objects.get(id=stream_id)
        stream.delete()
        return JsonResponse({'success': True})
    except StreamSource.DoesNotExist:
        return JsonResponse({'error': 'Stream not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def toggle_stream(request, stream_id):
    try:
        stream = StreamSource.objects.get(id=stream_id)
        stream.is_active = not stream.is_active
        stream.save()
        
        return JsonResponse({
            'id': stream.id,
            'name': stream.name,
            'rtsp_url': stream.rtsp_url,
            'is_active': stream.is_active
        })
    except StreamSource.DoesNotExist:
        return JsonResponse({'error': 'Stream not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# Create your views here.
