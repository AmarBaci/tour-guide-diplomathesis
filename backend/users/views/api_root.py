from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "message": "Welcome to the Tour Guide API!",
        "endpoints": {
            "Tourist Registration": "/api/register/tourist/",
            "Guide Registration": "/api/register/guide/",
            "Agency Registration": "/api/register/agency/",
            "Ministry Admin Registration": "/api/register/ministry/",
            "Agency Operators": "/api/agencies/<uuid:agency_id>/operators/",
            "Login": "/api/auth/login/",
            "Token Refresh": "/api/token/refresh/",
        }
    })