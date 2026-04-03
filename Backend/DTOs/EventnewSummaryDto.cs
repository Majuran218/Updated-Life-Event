namespace LifeEventsHub.Api.DTOs
{
    public class EventnewSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public string OwnerName { get; set; } = string.Empty;
    }
}