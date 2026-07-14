using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Models;
using TaskManager.Api.Models.Dtos;

namespace TaskManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;

    public TasksController(AppDbContext db)
    {
        _db = db;
    }

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskResponseDto>>> GetAll()
    {
        var tasks = await _db.Tasks
            .Where(t => t.UserId == CurrentUserId)
            .OrderBy(t => t.ScheduledAt)
            .Select(t => new TaskResponseDto(t.Id, t.Title, t.Description, t.ScheduledAt, t.IsCompleted, t.CreatedAt))
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskResponseDto>> GetById(int id)
    {
        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == CurrentUserId);
        if (task is null) return NotFound();

        return Ok(new TaskResponseDto(task.Id, task.Title, task.Description, task.ScheduledAt, task.IsCompleted, task.CreatedAt));
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponseDto>> Create(TaskCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest("Title is required.");

        var task = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            ScheduledAt = dto.ScheduledAt,
            UserId = CurrentUserId
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        var result = new TaskResponseDto(task.Id, task.Title, task.Description, task.ScheduledAt, task.IsCompleted, task.CreatedAt);
        return CreatedAtAction(nameof(GetById), new { id = task.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TaskResponseDto>> Update(int id, TaskUpdateDto dto)
    {
        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == CurrentUserId);
        if (task is null) return NotFound();

        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest("Title is required.");

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.ScheduledAt = dto.ScheduledAt;
        task.IsCompleted = dto.IsCompleted;

        await _db.SaveChangesAsync();

        return Ok(new TaskResponseDto(task.Id, task.Title, task.Description, task.ScheduledAt, task.IsCompleted, task.CreatedAt));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == CurrentUserId);
        if (task is null) return NotFound();

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
