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

    public void PrintLobbies(string name)
    {
        Console.WriteLine("{0} {1}", name, GetLobbies());
    }

    public async Task SyncPlayers(string lobbyId)
    {
        string json = "[]";

        if (lobbies.ContainsKey(lobbyId))
        {
            Dictionary<string, Player> players = lobbies[lobbyId].players;
            json = JsonSerializer.Serialize(
                players.Values,
                new JsonSerializerOptions { WriteIndented = true }
            );
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
        Player player = lobby.NewPlayer(name, Context.ConnectionId);

        player.isHost = true;

        lobbies.Add(lobbyId, lobby);
        await Groups.AddToGroupAsync(Context.ConnectionId, lobbyId);

        PrintLobbies("CreateLobby");

        await Clients
            .Client(Context.ConnectionId)
            .SendAsync("AddUnloadEventListener", lobbyId, player.playerId);

        return JsonSerializer.Serialize(new { player = player, lobby = lobby });
    }

    public async Task<string> JoinLobby(string lobbyId, string name)
    {
        if (!lobbies.ContainsKey(lobbyId))
        {
            return "";
        }

        Lobby lobby = lobbies[lobbyId];
        Player player = lobby.NewPlayer(name, Context.ConnectionId);

        await Groups.AddToGroupAsync(Context.ConnectionId, lobbyId);

        await SyncPlayers(lobbyId);

        PrintLobbies("JoinLobby");

        await Clients
            .Client(Context.ConnectionId)
            .SendAsync("AddUnloadEventListener", lobbyId, player.playerId);

        return JsonSerializer.Serialize(new { player = player, lobby = lobby });
    }

    public async Task ExitLobby(string lobbyId, string playerId)
    {
        Console.WriteLine("ExitLobby");
        if (!lobbies.ContainsKey(lobbyId))
        {
            return;
        }
        Lobby lobby = lobbies[lobbyId];
        lobby.RemovePlayer(playerId);

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, lobbyId);
        await SyncPlayers(lobbyId);
    }

    public void StopConnection()
    {
        Console.WriteLine("left the app");
    }
}
