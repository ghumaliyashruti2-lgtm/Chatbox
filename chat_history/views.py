from django.shortcuts import render,redirect
from django.contrib.admin.views.decorators import staff_member_required
from chat_history.models import ChatHistory
from datetime import timedelta
from django.utils.timezone import now
import json
from django.http import JsonResponse
from django.utils.timezone import localdate
from django.shortcuts import get_object_or_404
# Create your views here.

@staff_member_required(login_url='login')
def myhistory(request):

    # --- Profile Image ---
    profile = None
    if hasattr(request.user, "profile"):
        if request.user.profile.profile_picture:
            profile = request.user.profile.profile_picture.url

    # --- Sorting Logic ---
    sort_option = request.GET.get("sort", "newest")  # default newest first

    if sort_option == "oldest":
        messages = ChatHistory.objects.filter(user=request.user).order_by("created_at")
    else:
        messages = ChatHistory.objects.filter(user=request.user).order_by("-created_at")

    # --- Grouping by Date ---
    grouped = {}
    for msg in messages:
        date = msg.created_at.date().strftime("%A, %B %d, %Y")

        # Split AI message into points
        ai_points = [s.strip() for s in msg.ai_message.split('.') if s.strip()]
        msg.ai_points = ai_points

        grouped.setdefault(date, []).append(msg)

    return render(request, "history.html", {
        "grouped_history": grouped,
        "user_image": profile,
        "sort_option": sort_option
    })


@staff_member_required(login_url='login')
def clean_history(request):
    if request.method == "POST":
        data = json.loads(request.body)
        range_type = data.get("range")

        today = localdate()

        print("CLEAN HISTORY CALLED ----")
        print("RANGE =", range_type)

        if range_type == "day":
            ChatHistory.objects.filter(
                user=request.user,
                created_at__date=today
            ).delete()

        elif range_type == "week":
            week_start = today - timedelta(days=today.weekday())
            ChatHistory.objects.filter(
                user=request.user,
                created_at__date__gte=week_start
            ).delete()

        elif range_type == "month":
            ChatHistory.objects.filter(
                user=request.user,
                created_at__year=today.year,
                created_at__month=today.month
            ).delete()

        elif range_type == "all":
            ChatHistory.objects.filter(user=request.user).delete()

        return JsonResponse({"status": "success"})

    return JsonResponse({"error": "Invalid request"}, status=400)



# delete particular history
@staff_member_required(login_url='login')
def delete_history(request, pk):
    # Fetch only user's own message
    item = get_object_or_404(ChatHistory, pk=pk, user=request.user)
    
    item.delete()
    return redirect("history")
