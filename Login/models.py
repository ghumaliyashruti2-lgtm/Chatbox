from django.db import models

class Login(models.Model):
    login_email = models.CharField(max_length=50)
    login_password=models.CharField(max_length=8)