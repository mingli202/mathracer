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

    public Lobby GetLobby(string lobbyId)
    {
        return this.lobbies[lobbyId];
    }

    public string GetPrintableLobbies()
    {
        string json = JsonSerializer.Serialize(this.lobbies);

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

    public string GetPrintableLobby(string lobbyId)
    {
        if (!this.LobbyExists(lobbyId))
        {
            return $"{lobbyId} does not exist";
        }

        string json = JsonSerializer.Serialize(this.lobbies[lobbyId]);

        Lobby lobbyCopy = JsonSerializer.Deserialize<Lobby>(json)!;

        lobbyCopy.equations = [];

        return JsonSerializer.Serialize(
            lobbyCopy,
            new JsonSerializerOptions { WriteIndented = true }
        );
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

    public void PrintLobbies(string functionName)
    {
        Task.Run(() => Console.WriteLine("{0} {1}", functionName, GetPrintableLobbies())).ConfigureAwait(false);
    }

    public void PrintLobby(string functionName, string lobbyId)
    {
        Task.Run(() => Console.WriteLine("{0} {1}", functionName, GetPrintableLobby(lobbyId))).ConfigureAwait(false);
    }
}
