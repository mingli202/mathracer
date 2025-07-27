using System.Text.Json;
using equation;
using Microsoft.AspNetCore.SignalR;
using models;

namespace hub;

public class RacerHub : Hub
{
    private readonly Lobbies _lobbies;
    private readonly LoggingService _logger;

    public RacerHub(Lobbies lobbies, LoggingService logger)
    {
        _lobbies = lobbies;
        _logger = logger;
    }

    public async Task ExitLobby(string lobbyId, string playerId)
    {
        if (!_lobbies.LobbyExists(lobbyId))
        {
            _logger.Log(Severity.Error, $"Player {playerId} tried to exit lobby {lobbyId} but lobby does not exist.", _lobbies);
            return;
        }

        Lobby lobby = _lobbies.GetLobby(lobbyId);
        lobby.RemovePlayer(playerId);

        if (lobby.players.Count == 0)
        {
            _lobbies.RemoveLobby(lobbyId);
            _logger.Log(Severity.Debug, $"Lobby {lobbyId} removed", lobby);
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, lobbyId);
        await SyncPlayers(lobbyId);

        _logger.Log(Severity.Info, $"Player {playerId} exited lobby {lobbyId}.", lobby);
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

        _logger.Log(Severity.Info, $"Player {playerId} completed in {lobbyId}", lobby);
    }

    public async Task SyncPlayers(string lobbyId)
    {
        string json = "[]";

        if (_lobbies.LobbyExists(lobbyId))
        {
            Lobby lobby = _lobbies.GetLobby(lobbyId);
            Dictionary<string, Player> players = lobby.players;
            json = JsonSerializer.Serialize(
                players.Values,
                new JsonSerializerOptions { WriteIndented = true }
            );

            _logger.Log(Severity.Debug, $"Lobby {lobbyId} sync", lobby);
        }
        else
        {
            _logger.Log(Severity.Debug, $"Lobby {lobbyId} does not exist anymore", _lobbies);
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

    public async Task StartGame(string lobbyId)
    {
        Console.WriteLine($"StartGame {lobbyId}");

        Lobby lobby = _lobbies.GetLobby(lobbyId);
        GameMode selectedMode = lobby.gameMode;
        Equation[] equations = lobby.equations;

        int count = 3;
        while (count >= 0)
        {
            int now = DateTime.Now.Millisecond;

            Console.WriteLine($"CountDown {lobbyId}: {count}");
            await Clients.Groups(lobbyId).SendAsync("CountDown", count);

            count--;

            int elapsed = DateTime.Now.Millisecond - now;

            if (elapsed < 1000)
            {
                await Task.Delay(TimeSpan.FromMilliseconds(1000 - elapsed));
            }
        }

        count = 0;
        bool run = true;
        while (run)
        {
            int now = DateTime.Now.Millisecond;

            Console.WriteLine($"TimeElapsed {lobbyId}: {count}");
            await Clients.Groups(lobbyId).SendAsync("TimeElapsed", count);

            count++;
            if (count > selectedMode.count)
            {
                run = false;
            }
            int elapsed = DateTime.Now.Millisecond - now;

            if (elapsed < 1000)
            {
                await Task.Delay(TimeSpan.FromMilliseconds(1000 - elapsed));
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

        _logger.Log(Severity.Info, $"Player {playerId} updated score to {score} in lobby {lobbyId}", lobby);
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

        _logger.Log(Severity.Info, $"Lobby created ({lobbyId}).", lobby);

        await Clients
            .Client(Context.ConnectionId)
            .SendAsync("AddUnloadEventListener", lobbyId, player.playerId);

        return JsonSerializer.Serialize(new { player = player, lobby = lobby });
    }

    public async Task<string> JoinLobby(string lobbyId, string name)
    {
        if (!_lobbies.LobbyExists(lobbyId))
        {
            _logger.Log(Severity.Debug, $"Player {name} tried to join lobby {lobbyId} but lobby does not exist.", _lobbies);
            return "";
        }

        Lobby lobby = _lobbies.GetLobby(lobbyId);
        Player player = lobby.NewPlayer(name, Context.ConnectionId);

        await Groups.AddToGroupAsync(Context.ConnectionId, lobbyId);

        await SyncPlayers(lobbyId);

        _logger.Log(Severity.Info, $"{player.name} joined lobby {lobbyId}.", lobby);

        await Clients
            .Client(Context.ConnectionId)
            .SendAsync("AddUnloadEventListener", lobbyId, player.playerId);

        return JsonSerializer.Serialize(new { player = player, lobby = lobby });
    }
}
