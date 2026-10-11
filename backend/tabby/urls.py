from django.contrib import admin
from django.urls import path, include

from .app.urls import urlpatterns as app_urlpatterns
from .app import views

urlpatterns = [
    path("api/1/auth/social/", include("social_django.urls", namespace="social")),
    path("", include(app_urlpatterns)),
    path("<path:static_path>", views.StaticFileView.as_view()),
    path("admin/", admin.site.urls),
]
