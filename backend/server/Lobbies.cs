using System.Text.Json;
using models;

public class Lobbies
{
    private Dictionary<string, Lobby> lobbies = new Dictionary<string, Lobby>();

    public void AddLobby(Lobby lobby)
    {
        this.lobbies.Add(lobby.lobbyId, lobby);
    }

    public void RemoveLobby(string lobbyId)
    {
        this.lobbies.Remove(lobbyId);
    }

    public bool LobbyExists(string lobbyId)
    {
        return this.lobbies.ContainsKey(lobbyId);
    }

    public Dictionary<string, Lobby> GetLobbies()
    {
        return this.lobbies;
    }

    public Dictionary<string, Lobby> GetPublicLobbies()
    {
        foreach (var lobby in this.lobbies)
        {
            if (lobby.Value.)
        }
    }

    public Lobby GetLobby(string lobbyId)
    {
        return this.lobbies[lobbyId];
    }

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
        } while (this.lobbies.ContainsKey(lobbyId));

        return lobbyId;
    }

    public override string ToString()
    {
        return JsonSerializer.Serialize(
            this.lobbies,
            new JsonSerializerOptions { WriteIndented = true }
        );
    }
}
