using LifeEventsHub.Api.Data;
using LifeEventsHub.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeEventsHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsnewController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventsnewController(AppDbContext context)
        {
            _context = context;
        }

        // GET api/events/country-counts
        [HttpGet("country-counts")]
        public async Task<ActionResult<IEnumerable<CountryEventCountDto>>> GetCountryCounts()
        {
            var result = await _context.Events
                .GroupBy(e => e.Country)
                .Select(g => new CountryEventCountDto
                {
                    Country = g.Key,
                    EventCount = g.Count()
                })
                .OrderByDescending(x => x.EventCount)
                .ToListAsync();

            return Ok(result);
        }

        // GET api/events/by-country/{country}
        [HttpGet("by-country/{country}")]
        public async Task<ActionResult<IEnumerable<EventnewSummaryDto>>> GetEventsByCountry(string country)
        {
            // Input validation - handle null, empty, or whitespace country parameter
            if (string.IsNullOrWhiteSpace(country))
            {
                return BadRequest("Country parameter is required and cannot be empty.");
            }

            // Normalize input once instead of per-row in the database
            var normalizedCountry = country.Trim().ToUpperInvariant();

            // Use EF.Functions.Like for case-insensitive comparison
            // This approach allows database indexes on Country to be utilized more effectively
            // compared to ToLower() which prevents index usage
            var events = await _context.Events
                .Where(e => e.Country != null && EF.Functions.Like(e.Country.ToUpper(), normalizedCountry))
                .Select(e => new EventnewSummaryDto
                {
                    Id = e.Id,
                    Name = e.Title,  // Map Title to Name for the DTO
                    EventDate = e.EventDate,
                    OwnerName = e.CreatedBy  // Map CreatedBy to OwnerName for the DTO
                })
                .ToListAsync();

            return Ok(events);
        }
    }
}