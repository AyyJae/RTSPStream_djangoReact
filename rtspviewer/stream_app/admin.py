from django.contrib import admin
from .models import StreamSource

@admin.register(StreamSource)
class StreamSourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'rtsp_url', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'rtsp_url')