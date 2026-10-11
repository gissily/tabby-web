import fsspec
import os
from fsspec.implementations.local import LocalFileSystem
from django.conf import settings
from django.http.response import (
    FileResponse,
    HttpResponse,
    HttpResponseNotFound,
    HttpResponseRedirect,
)
from django.views import static
from rest_framework.views import APIView
from urllib.parse import urlparse


class IndexView(APIView):
    def get(self, request, format=None):
        if settings.FRONTEND_URL:
            return HttpResponseRedirect(settings.FRONTEND_URL)
        import os
        html_path = os.path.join(str(settings.STATIC_ROOT), "index.html")
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        backend_url = request.scheme + '://' + request.get_host()
        html_content = html_content.replace('{{backendURL}}', backend_url)
        response = HttpResponse(html_content, content_type='text/html')
        response["X-Frame-Options"] = "SAMEORIGIN"
        return response


class StaticFileView(APIView):
    """Serve any static file from STATIC_ROOT at root path."""
    def get(self, request, *args, **kwargs):
        path = kwargs.get('static_path', '')
        return static.serve(
            request, path, document_root=str(settings.STATIC_ROOT)
        )


class FaviconView(APIView):
    def get(self, request, format=None):
        return static.serve(
            request, "favicon.png", document_root=str(settings.STATIC_ROOT)
        )


class FaviconIcoView(APIView):
    def get(self, request, format=None):
        return static.serve(
            request, "favicon.png", document_root=str(settings.STATIC_ROOT)
        )


class TerminalView(APIView):
    def get(self, request, format=None):
        response = static.serve(
            request, "terminal.html", document_root=str(settings.STATIC_ROOT)
        )
        response["Content-Security-Policy"] = "frame-ancestors 'self' https://tabby.sh;"
        response["X-Frame-Options"] = "SAMEORIGIN"
        return response


class DemoView(APIView):
    def get(self, request, format=None):
        response = static.serve(
            request, "demo.html", document_root=str(settings.STATIC_ROOT)
        )
        response["Content-Security-Policy"] = "frame-ancestors 'self' https://tabby.sh;"
        response['X-Frame-Options'] = 'ALLOW-FROM https://tabby.sh'
        return response


class AppDistView(APIView):
    def get(self, request, version=None, path=None, format=None):
        fs = fsspec.filesystem(urlparse(settings.APP_DIST_STORAGE).scheme)
        url = f"{settings.APP_DIST_STORAGE}/{version}/{path}"
        if isinstance(fs, LocalFileSystem):
            if not fs.exists(url):
                return HttpResponseNotFound()
            return FileResponse(fs.open(url), filename=os.path.basename(url))
        else:
            return HttpResponseRedirect(fs.url(url))
