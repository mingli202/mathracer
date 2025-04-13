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
        return JsonSerializer.Serialize(
            lobbies,
            new JsonSerializerOptions { WriteIndented = true }
        );
    }

    public void PrintLobbies()
    {
        Console.WriteLine(GetLobbies());
    }

    public async Task SyncPlayers(string lobbyId)
    {
        string json = "[]";

        if (lobbies.ContainsKey(lobbyId))
        {
            Dictionary<int, Player> players = lobbies[lobbyId].players;
            json = JsonSerializer.Serialize(players.Values);
        }

        await Clients.Groups(lobbyId).SendAsync("SyncPlayers", json);
    }

    public async Task<string> CreateLobby(string gmode, string name)
    {
        GameMode gameMode = JsonSerializer.Deserialize<GameMode>(gmode)!;

        Random rand = new Random();
        char[] buffer = new char[6];
        string lobbyId = "";

        do
        {
            for (int i = 0; i < 6; i++)
            {
                buffer[i] = (char)rand.Next((int)'a', (int)'z' + 1);
            }

            lobbyId = String.Join("", buffer);
        } while (lobbies.ContainsKey(lobbyId));

        Equation[] equations = Equation.GenerateAllEquations(
            gameMode.count * (gameMode.type == "time" ? 10 : 1)
        );

        Lobby lobby = new Lobby(lobbyId, [], gameMode); // FIX: replace this by equations
        Player player = lobby.NewPlayer(name);
        player.isHost = true;

        lobbies.Add(lobbyId, lobby);
        await Groups.AddToGroupAsync(Context.ConnectionId, lobbyId);

        PrintLobbies();

        return JsonSerializer.Serialize(new { player = player, lobby = lobby });
    }

    public async Task<string> JoinLobby(string lobbyId, string name)
    {
        if (!lobbies.ContainsKey(lobbyId))
        {
            return "";
        }

        Lobby lobby = lobbies[lobbyId];
        Player player = lobby.NewPlayer(name);

        await Groups.AddToGroupAsync(Context.ConnectionId, lobbyId);
        await SyncPlayers(lobbyId);

        PrintLobbies();

        return JsonSerializer.Serialize(new { player = player, lobby = lobby });
    }
}
