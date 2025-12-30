from django.db import models
from django.contrib.auth.models import User

class ChatHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    user_message = models.TextField()
    ai_message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

