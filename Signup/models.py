from django.db import models

# Create your models here.
class Signup(models.Model):
    signup_name = models.CharField(max_length=50)
    signup_email = models.CharField(max_length=50)
    signup_password=models.CharField(max_length=128)
    signup_confirm_password=models.CharField(max_length=128)