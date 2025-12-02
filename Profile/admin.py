from django.contrib import admin
from .models import Profile
from django.utils.html import mark_safe

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'display_image')

    def display_image(self, obj):
        if obj.profile_picture and obj.profile_picture.url:
            return mark_safe(f'<img src="{obj.profile_picture.url}" width="50" height="50" style="border-radius: 50%;">')
        return "No Image"

    display_image.short_description = "Profile Image"
