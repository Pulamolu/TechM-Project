namespace TaskManager.Api.Models.Dtos;

public record TaskCreateDto(string Title, string? Description, DateTime ScheduledAt);
public record TaskUpdateDto(string Title, string? Description, DateTime ScheduledAt, bool IsCompleted);
public record TaskResponseDto(int Id, string Title, string? Description, DateTime ScheduledAt, bool IsCompleted, DateTime CreatedAt);
