from django.contrib import admin
from Signup.models import Signup
# Register your models here.

class SignupAdmin(admin.ModelAdmin):
    list_display = ('signup_name','signup_email','signup_password','signup_confirm_password')
admin.site.register(Signup,SignupAdmin)


