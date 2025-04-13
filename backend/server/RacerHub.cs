using System.Text.Json;
using equation;
using Microsoft.AspNetCore.SignalR;
using models;

namespace hub;

public class RacerHub : Hub
{
    private static Dictionary<string, Lobby> lobbies = new Dictionary<string, Lobby>();

    public string GetLobbies()
    {
        return JsonSerializer.Serialize(lobbies);
    }

    public async Task SyncPlayers(string lobbyId)
    {
        string json = "[]";

        if (lobbies.ContainsKey(lobbyId))
        {
            Dictionary<int, Player> lobby = lobbies[lobbyId].players;
            json = JsonSerializer.Serialize(lobby.Values);
        }

        await Clients.Groups(lobbyId).SendAsync("SyncPlayers", json);
    }

    public async Task<string> CreateLobby(string gmode, string name)
    {
        GameMode gameMode = JsonSerializer.Deserialize<GameMode>(gmode)!;

        Random rand = new Random();
        byte[] buffer = new byte[6];
        string lobbyId = "";

        do
        {
            rand.NextBytes(buffer);
            lobbyId = System.Text.Encoding.Default.GetString(buffer);
        } while (lobbies.ContainsKey(lobbyId));

        Equation[] equations = Equation.GenerateAllEquations(
            gameMode.count * (gameMode.type == "time" ? 10 : 1)
        );

        Lobby lobby = new Lobby(lobbyId, equations, gameMode);
        Player player = lobby.NewPlayer(name);
        player.isHost = true;

        lobbies.Add(lobbyId, lobby);
        await Groups.AddToGroupAsync(Context.ConnectionId, lobbyId);

        return JsonSerializer.Serialize(new { player = player, lobby = lobby });
    }

    public async Task<string> JoinLobby(string lobbyId, string name)
    {
        if (lobbies.ContainsKey(lobbyId) == false)
        {
            return "";
        }

        Lobby lobby = lobbies[lobbyId];
        Player player = lobby.NewPlayer(name);

        await Groups.AddToGroupAsync(Context.ConnectionId, lobbyId);
        await SyncPlayers(lobbyId);

        return JsonSerializer.Serialize(new { player = player, lobby = lobby });
    }
}
