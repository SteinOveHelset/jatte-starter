from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path('', include('core.urls')),
    path('', include('account.urls')),
    path('admin/', admin.site.urls),
]
