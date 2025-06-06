from django.db import models

class StreamSource(models.Model):
    name = models.CharField(max_length=100)
    rtsp_url = models.URLField(max_length=500)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.rtsp_url})"