using System.Text.Json;
using System.Text.Json.Serialization;
using hub;
using Microsoft.AspNetCore.SignalR;

public enum Severity { Debug, Info, Error }

public class LogMessage
{
    public string message { get; set; }
    public string details { get; set; }
    public string timestamp { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public Severity severity { get; set; }

    public LogMessage(string message, string details, Severity severity)
    {
        this.message = message;
        this.details = details;
        this.timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.ff");
        this.severity = severity;
    }
}

public class LoggingService
{
    private readonly IHubContext<RacerHub> _hubContext;

    public LoggingService(IHubContext<RacerHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public void Log(Severity severity, string message, string details)
    {
        Task.Run(() =>
        {
            LogMessage log = new LogMessage(message, details, severity);
            _hubContext.Clients.All.SendAsync("Log", JsonSerializer.Serialize(log));
            Console.WriteLine("================================================================================");
            Console.WriteLine($"{severity.ToString().ToUpper()} {log.timestamp}: {message}");
            Console.WriteLine(details);
            Console.WriteLine("================================================================================");
        });
    }

    public void Log(Severity severity, string message, Object details)
    {
        Task.Run(() =>
        {
            LogMessage log = new LogMessage(message, details.ToString() ?? "", severity);
            _hubContext.Clients.All.SendAsync("Log", JsonSerializer.Serialize(log));
            Console.WriteLine("================================================================================");
            Console.WriteLine($"{severity.ToString().ToUpper()} {log.timestamp}: {message}");
            Console.WriteLine(details);
            Console.WriteLine("================================================================================");
        });
    }
}
