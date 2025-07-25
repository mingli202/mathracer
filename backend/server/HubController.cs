using hub;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class HubController : ControllerBase
{
    private readonly RacerHub _hub;

    public HubController(RacerHub hub)
    {
        _hub = hub;
    }

    [HttpGet]
    public string GetLobbiess()
    {
        return _hub.GetLobbies();
    }
}
