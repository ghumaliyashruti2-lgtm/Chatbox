from django.shortcuts import render, redirect
from profiles.models import Profile
from django.contrib.admin.views.decorators import staff_member_required
from django.conf import settings
import os


@staff_member_required(login_url='login')
def profile(request):
    profile = Profile.objects.get(user=request.user)
    return render(request, "profile.html", {
        "name": request.user.username,
        "email": request.user.email,
        "profile": profile,
    })


@staff_member_required(login_url='login')
def myprofile(request):
    profile = Profile.objects.get(user=request.user)

    if request.method == "POST":
        profile.gender = request.POST.get("gender")
        profile.mobile = request.POST.get("mobile")
        profile.save()
        return redirect("profile")

    return render(request, "my-profile.html", {"profile": profile})


@staff_member_required(login_url='login')
def editprofile(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)

    if request.FILES.get("profile_picture"):
        profile.profile_picture = request.FILES["profile_picture"]
        profile.save()
        return redirect("my-profile")

    return render(request, "edit-profile.html", {"profile": profile})


@staff_member_required(login_url='login')
def deleteprofile(request):
    profile = Profile.objects.get(user=request.user)

    if request.method == "POST":
        delete_flag = request.POST.get("delete_flag")

        # Only delete if delete button was clicked AND user saved
        if delete_flag == "1":
            if profile.profile_picture and profile.profile_picture.name != "default/user_img.png":
                path = os.path.join(settings.MEDIA_ROOT, profile.profile_picture.name)
                if os.path.exists(path):
                    os.remove(path)

            profile.profile_picture = "default/user_img.png"

        profile.save()
        return redirect("my-profile")

    return render(request, "delete-profile.html", {"profile": profile})
