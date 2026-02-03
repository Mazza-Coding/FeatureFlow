from rest_framework.throttling import AnonRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """
    Stricter rate limiting for authentication endpoints
    to prevent brute force attacks.
    """
    scope = 'auth'
