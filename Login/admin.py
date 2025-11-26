from django.contrib import admin
from Login.models import Login
# Register your models here.

class LoginAdmin(admin.ModelAdmin):
    list_display = ('login_email','login_password')
admin.site.register(Login,LoginAdmin)


# Register your models here.
