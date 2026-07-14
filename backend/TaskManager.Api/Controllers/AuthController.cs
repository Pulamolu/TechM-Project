using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Models;
using TaskManager.Api.Models.Dtos;
using TaskManager.Api.Services;

namespace TaskManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokenService;

    public AuthController(AppDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Email and password are required.");

        if (dto.Password != dto.ConfirmPassword)
            return BadRequest("Password and confirmation password do not match.");

        if (dto.Password.Length < 6)
            return BadRequest("Password must be at least 6 characters long.");

        var email = dto.Email.Trim().ToLowerInvariant();

        if (await _db.Users.AnyAsync(u => u.Email == email))
            return Conflict("An account with this email already exists.");

        var (hash, salt) = PasswordHasher.HashPassword(dto.Password);

        var user = new User
        {
            Email = email,
            PasswordHash = hash,
            PasswordSalt = salt
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _tokenService.CreateToken(user);
        return Ok(new AuthResponseDto(user.Id, user.Email, token));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user is null || !PasswordHasher.VerifyPassword(dto.Password, user.PasswordHash, user.PasswordSalt))
            return Unauthorized("Invalid email or password.");

        var token = _tokenService.CreateToken(user);
        return Ok(new AuthResponseDto(user.Id, user.Email, token));
    }

    [HttpPost("request-reset")]
    public async Task<ActionResult> RequestReset(PasswordResetRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("Email is required.");

        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        // Always return success response to avoid revealing account existence.
        if (user is null)
            return Ok();

        // Create a token and store it with expiry (e.g., 1 hour).
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        var expires = DateTime.UtcNow.AddHours(1);

        var prt = new PasswordResetToken
        {
            Token = token,
            UserId = user.Id,
            ExpiresAt = expires
        };

        _db.PasswordResetTokens.Add(prt);
        await _db.SaveChangesAsync();

        // TODO: Send email with link containing token. For now, return Ok and rely on dev logs.
        return Ok();
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword(ResetPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Token) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Token and new password are required.");

        if (dto.Password != dto.ConfirmPassword)
            return BadRequest("Password and confirmation password do not match.");

        var prt = await _db.PasswordResetTokens.Include(t => t.User).FirstOrDefaultAsync(t => t.Token == dto.Token);
        if (prt is null || prt.ExpiresAt < DateTime.UtcNow)
            return BadRequest("Invalid or expired token.");

        var user = prt.User;
        var (hash, salt) = PasswordHasher.HashPassword(dto.Password);
        user.PasswordHash = hash;
        user.PasswordSalt = salt;

        _db.PasswordResetTokens.Remove(prt);
        await _db.SaveChangesAsync();

        return Ok();
    }
}
