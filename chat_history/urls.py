from django.contrib import admin
from django.urls import path
from chat_history import views
from django.conf import settings
from django.conf.urls.static import static  

urlpatterns = [
    
    path("history/",views.myhistory,name="history"),
    path("clean-history/", views.clean_history, name="clean-history"),
    path("delete-history/<int:pk>/", views.delete_history, name="delete-history"),


]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
