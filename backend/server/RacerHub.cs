using System.Text.Json;
using equation;
using Microsoft.AspNetCore.SignalR;
using models;

namespace hub;

public class RacerHub : Hub
{
    private readonly Lobbies _lobbies;

    public RacerHub(Lobbies lobbies)
    {
        _lobbies = lobbies;
    }

    public async Task ExitLobby(string lobbyId, string playerId)
    {
        Console.WriteLine("lobbyId: {0}, playerId: {1}", lobbyId, playerId);
        if (!_lobbies.LobbyExists(lobbyId))
        {
            return;
        }
        Lobby lobby = _lobbies.GetLobby(lobbyId);
        lobby.RemovePlayer(playerId);

        if (lobby.players.Count == 0)
        {
            _lobbies.RemoveLobby(lobbyId);
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, lobbyId);
        await SyncPlayers(lobbyId);

        _lobbies.PrintLobbies("ExitLobby");
    }

    public async Task MoveToGameScreen(string lobbyId)
    {
        if (!_lobbies.LobbyExists(lobbyId))
        {
            return;
        }
        _lobbies.GetLobby(lobbyId).ClearStats();
        await SyncPlayers(lobbyId);
        await SyncEquations(lobbyId);
        await Clients.Groups(lobbyId).SendAsync("MoveToGameScreen");
    }

    public async Task PlayerCompleted(string lobbyId, string playerId)
    {
        var lobby = _lobbies.GetLobby(lobbyId).players;
        var player = lobby[playerId];
        player.state = PlayerState.completed;

        await SyncPlayers(lobbyId);

        _lobbies.PrintLobby("PlayerCompleted", lobbyId);
    }

    public async Task SyncPlayers(string lobbyId)
    {
        string json = "[]";

        if (_lobbies.LobbyExists(lobbyId))
        {
            Dictionary<string, Player> players = _lobbies.GetLobby(lobbyId).players;
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

        if (_lobbies.LobbyExists(lobbyId))
        {
            Equation[] equations = _lobbies.GetLobby(lobbyId).equations;
            json = JsonSerializer.Serialize(
                equations,
                new JsonSerializerOptions { WriteIndented = true }
            );
        }

        await Clients.Groups(lobbyId).SendAsync("SyncEquations", json);
    }

    public void StartGame(string lobbyId)
    {
        Console.WriteLine($"StartGame {lobbyId}");

        Lobby lobby = _lobbies.GetLobby(lobbyId);
        GameMode selectedMode = lobby.gameMode;
        Equation[] equations = lobby.equations;

        int count = 3;
        DateTime now = DateTime.Now;
        while (count >= 0)
        {
            Console.WriteLine($"CountDown {lobbyId}: {count}");
            Clients.Groups(lobbyId).SendAsync("CountDown", count);

            Task.Delay(TimeSpan.FromSeconds(1)).Wait(); ;

            count--;
        }

        count = 0;
        bool run = true;
        while (run)
        {
            Console.WriteLine($"TimeElapsed {lobbyId}: {count}");
            Clients.Groups(lobbyId).SendAsync("TimeElapsed", count);

            Task.Delay(TimeSpan.FromSeconds(1)).Wait();

            count++;
            if (count > selectedMode.count)
            {
                run = false;
            }
        }
    }

    public async Task UpdatePlayerState(string lobbyId, string playerId, string state)
    {
        if (!_lobbies.LobbyExists(lobbyId))
        {
            return;
        }
        Lobby lobby = _lobbies.GetLobby(lobbyId);
        if (lobby.UpdatePlayerState(playerId, state))
        {
            // the last one who joins will start the game
            await Clients.Client(Context.ConnectionId).SendAsync("StartGame");
        }
    }

    public async Task UpdateScore(string lobbyId, string playerId, int score)
    {
        var lobby = _lobbies.GetLobby(lobbyId).players;
        var player = lobby[playerId];
        player.score = score;

        await SyncPlayers(lobbyId);

        _lobbies.PrintLobby("UpdateScore", lobbyId);
    }

    public async Task<string> CreateLobby(string gmode, string name)
    {
        GameMode gameMode = JsonSerializer.Deserialize<GameMode>(gmode)!;

        string lobbyId = _lobbies.GenerateNewLobbyId();

        Equation[] equations = Equation.GenerateAllEquations(
            gameMode.count * (gameMode.type == "time" ? 10 : 1)
        );

        Lobby lobby = new Lobby(lobbyId, equations, gameMode);
        Player player = lobby.NewPlayer(name, Context.ConnectionId);

        player.isHost = true;

        _lobbies.AddLobby(lobby);
        await Groups.AddToGroupAsync(Context.ConnectionId, lobbyId);

        _lobbies.PrintLobbies("CreateLobby");

        await Clients
            .Client(Context.ConnectionId)
            .SendAsync("AddUnloadEventListener", lobbyId, player.playerId);

        return JsonSerializer.Serialize(new { player = player, lobby = lobby });
    }

    public async Task<string> JoinLobby(string lobbyId, string name)
    {
        if (!_lobbies.LobbyExists(lobbyId))
        {
            return "";
        }

        Lobby lobby = _lobbies.GetLobby(lobbyId);
        Player player = lobby.NewPlayer(name, Context.ConnectionId);

        await Groups.AddToGroupAsync(Context.ConnectionId, lobbyId);

        await SyncPlayers(lobbyId);

        _lobbies.PrintLobby("JoinLobby", lobbyId);

        await Clients
            .Client(Context.ConnectionId)
            .SendAsync("AddUnloadEventListener", lobbyId, player.playerId);

        return JsonSerializer.Serialize(new { player = player, lobby = lobby });
    }
}
