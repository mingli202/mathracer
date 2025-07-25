using System.Text.Json;
using equation;
using Microsoft.AspNetCore.SignalR;
using models;

namespace hub;

public class RacerHub : Hub
{
    private static Dictionary<string, Lobby> lobbies = new Dictionary<string, Lobby>();

    public string GenerateNewLobbyId()
    {
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

        return lobbyId;
    }

    public string GetLobbies()
    {
        string json = JsonSerializer.Serialize(lobbies);

        Dictionary<string, Lobby> lobbiesCopy = JsonSerializer.Deserialize<Dictionary<string, Lobby>>(json)!;

        foreach (Lobby lobby in lobbiesCopy.Values)
        {
            lobby.equations = [];
        }

        return JsonSerializer.Serialize(
            lobbiesCopy,
            new JsonSerializerOptions { WriteIndented = true }
        );
    }

    public async void PrintLobbies(string name)
    {
        await Task.Run(() => Console.WriteLine("{0} {1}", name, GetLobbies()));
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

    public async Task SyncEquations(string lobbyId)
    {
        string json = "[]";

        if (lobbies.ContainsKey(lobbyId))
        {
            Equation[] equations = lobbies[lobbyId].equations;
            json = JsonSerializer.Serialize(
                equations,
                new JsonSerializerOptions { WriteIndented = true }
            );
        }

        await Clients.Groups(lobbyId).SendAsync("SyncEquations", json);
    }

    public async Task<string> CreateLobby(string gmode, string name)
    {
        GameMode gameMode = JsonSerializer.Deserialize<GameMode>(gmode)!;

        string lobbyId = GenerateNewLobbyId();

        Equation[] equations = Equation.GenerateAllEquations(
            gameMode.count * (gameMode.type == "time" ? 10 : 1)
        );

        Lobby lobby = new Lobby(lobbyId, equations, gameMode);
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
        Console.WriteLine("lobbyId: {0}, playerId: {1}", lobbyId, playerId);
        if (!lobbies.ContainsKey(lobbyId))
        {
            return;
        }
        Lobby lobby = lobbies[lobbyId];
        lobby.RemovePlayer(playerId);

        if (lobby.players.Count == 0)
        {
            lobbies.Remove(lobbyId);
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, lobbyId);
        await SyncPlayers(lobbyId);

        PrintLobbies("ExitLobby");
    }

    public async Task MoveToGameScreen(string lobbyId)
    {
        if (!lobbies.ContainsKey(lobbyId))
        {
            return;
        }
        lobbies[lobbyId].ClearStats();
        await SyncPlayers(lobbyId);
        await SyncEquations(lobbyId);
        await Clients.Groups(lobbyId).SendAsync("MoveToGameScreen");
    }

    public async Task UpdatePlayerState(string lobbyId, string playerId, string state)
    {
        if (!lobbies.ContainsKey(lobbyId))
        {
            return;
        }
        Lobby lobby = lobbies[lobbyId];
        if (lobby.UpdatePlayerState(playerId, state))
        {
            // the last one who joins will start the game
            await Clients.Client(Context.ConnectionId).SendAsync("StartGame");
        }
    }

    public async Task StartGame(string gameId)
    {
        Lobby lobby = lobbies[gameId];
        GameMode selectedMode = lobby.gameMode;
        Equation[] equations = lobby.equations;

        int count = 3;
        DateTime now = DateTime.Now;
        int elapsed = 1;
        while (count >= 0)
        {
            if (elapsed >= 1)
            {
                await Clients.Groups(gameId).SendAsync("CountDown", count);
                elapsed = 0;
                now = DateTime.Now;
                count--;
            }

            elapsed = (DateTime.Now - now).Seconds;
        }

        int time = 0;
        elapsed = 0;
        bool run = true;
        while (run)
        {
            if (elapsed >= 1)
            {
                time++;
                await Clients.Groups(gameId).SendAsync("TimeElapsed", time);
                elapsed = 0;
                now = DateTime.Now;
            }

            elapsed = (DateTime.Now - now).Seconds;

            if (time > selectedMode.count)
            {
                run = false;
            }
        }
    }

    public async Task UpdateScore(string lobbyId, string playerId, int score)
    {
        var lobby = lobbies[lobbyId].players;
        var player = lobby[playerId];
        player.score = score;

        await SyncPlayers(lobbyId);

        PrintLobbies("UpdateScore");
    }

    public async Task PlayerCompleted(string lobbyId, string playerId)
    {
        var lobby = lobbies[lobbyId].players;
        var player = lobby[playerId];
        player.state = PlayerState.completed;

        await SyncPlayers(lobbyId);

        PrintLobbies("PlayerCompleted");
    }

    public string LobbyExists(string lobbyId)
    {
        bool exists = lobbies.ContainsKey(lobbyId);
        return JsonSerializer.Serialize(exists);
    }
}
