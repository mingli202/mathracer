using System.Text.Json;
using equation;
using Microsoft.AspNetCore.SignalR;
using models;

namespace hub;

public class RacerHub : Hub
{
    private static Dictionary<string, Lobby> lobbies = new Dictionary<string, Lobby>();

    public string CreateLobby(string gmode)
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
        Player player = lobby.newPlayer();

        return JsonSerializer.Serialize(new { player = player, lobby = lobby });
    }
}
