namespace TaskManager.Api.Models.Dtos;

public record RegisterDto(string Email, string Password, string ConfirmPassword);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(int UserId, string Email, string Token);

public record PasswordResetRequestDto(string Email);
public record ResetPasswordDto(string Token, string Password, string ConfirmPassword);
