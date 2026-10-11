from django.urls import path, include

from . import api
from . import views


urlpatterns = [
    *[
        path(p, views.IndexView.as_view())
        for p in ["", "login", "app", "about", "about/features"]
    ],
    path("favicon.png", views.FaviconView.as_view()),
    path("favicon.ico", views.FaviconIcoView.as_view()),
    path("app-dist/<version>/<path:path>", views.AppDistView.as_view()),
    path("terminal", views.TerminalView.as_view()),
    path("demo", views.DemoView.as_view()),
    path("", include(api.urlpatterns)),
    path("<path:static_path>", views.StaticFileView.as_view()),
]
