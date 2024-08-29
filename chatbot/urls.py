from django.contrib import admin
from django.urls import path
from .views import generate_caption

urlpatterns = [
    path('generate-caption/', generate_caption),
]