using Microsoft.AspNetCore.Mvc;
using models;

[ApiController]
[Route("api/[controller]")]
public class LobbyController : ControllerBase
{
    private readonly Lobbies _lobbies;

    public LobbyController(Lobbies lobbies)
    {
        _lobbies = lobbies;
    }

    [HttpGet("{lobbyId}")]
    public ActionResult<Lobby> Lobby(string lobbyId)
    {
        if (_lobbies.LobbyExists(lobbyId))
        {
            return Ok(_lobbies.GetLobby(lobbyId));
        }
        return NotFound();
    }

    [HttpGet("exists/{lobbyId}")]
    public ActionResult<bool> LobbyExists(string lobbyId)
    {
        return _lobbies.LobbyExists(lobbyId);
    }

    [HttpGet("lobbies/public")]
    public ActionResult<Dictionary<string, Lobby>> GetPublicLobbies()
    {
        return _lobbies.GetPublicLobbies();
    }
}
