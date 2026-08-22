from fastapi import APIRouter, Depends, status

from app.api.deps import get_auth_service, get_current_user
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    GoogleLoginRequest,
    LoginRequest,
    RefreshRequest,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
    UserOut,
    VerifyOTPRequest,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest, auth_service: AuthService = Depends(get_auth_service)):
    user = await auth_service.signup(body.email, body.password, body.full_name)
    access, refresh = await auth_service.issue_tokens(user)
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, auth_service: AuthService = Depends(get_auth_service)):
    user = await auth_service.login(body.email, body.password)
    access, refresh = await auth_service.issue_tokens(user)
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/google", response_model=TokenResponse)
async def google_login(body: GoogleLoginRequest, auth_service: AuthService = Depends(get_auth_service)):
    user = await auth_service.login_or_create_with_google(body.id_token)
    access, refresh = await auth_service.issue_tokens(user)
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=dict)
async def refresh(body: RefreshRequest, auth_service: AuthService = Depends(get_auth_service)):
    access = await auth_service.refresh_access_token(body.refresh_token)
    return {"access_token": access, "token_type": "bearer"}


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, auth_service: AuthService = Depends(get_auth_service)):
    return await auth_service.request_password_reset_otp(body.email)


@router.post("/verify-otp")
async def verify_otp(body: VerifyOTPRequest, auth_service: AuthService = Depends(get_auth_service)):
    await auth_service.verify_otp(body.email, body.otp)
    return {"status": "success", "message": "OTP verified successfully!"}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, auth_service: AuthService = Depends(get_auth_service)):
    return await auth_service.reset_password_with_otp(body.email, body.otp, body.new_password)


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        xp_points=current_user.xp_points,
        current_streak=current_user.current_streak,
    )
