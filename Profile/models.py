from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User

GENDER_CHOICES = (
    ('male', 'Male'),
    ('female', 'Female'),
    ('other', 'Other'),
)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    mobile = models.CharField(max_length=10, null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    profile_picture = models.ImageField(
    upload_to="profile_images/",
    default="default/user_img.png",
    null=True,
    blank=True
)
    def __str__(self):
        return self.user.username




@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
