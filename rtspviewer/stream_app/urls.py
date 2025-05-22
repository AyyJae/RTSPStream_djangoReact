from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_streams, name='list_streams'),
    path('add/', views.add_stream, name='add_stream'),
    # path('api/streams/<int:stream_id>/', views.get_stream, name='get_stream'),
    path('<int:stream_id>/delete/', views.delete_stream, name='delete_stream'),
    path('<int:stream_id>/toggle/', views.toggle_stream, name='toggle_stream'),
]