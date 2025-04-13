using System.Text.Json;
using System.Text.Json.Serialization;
using equation;

namespace models;

public class Player
{
    public string playerId { get; set; }
    public int score { get; set; }
    public bool isHost { get; set; }
    public string name { get; set; }
    public bool hasComplete { get; set; }

    public Player()
    {
        playerId = "";
        score = 0;
        isHost = false;
        name = "Player";
        hasComplete = false;
    }

    public Player(string name, string id)
    {
        playerId = id;
        score = 0;
        isHost = false;
        this.name = name;
        hasComplete = false;
    }
}

public class GameMode
{
    public string type { get; set; }
    public int count { get; set; }

    public GameMode()
    {
        this.type = "time";
        this.count = 10;
    }

    public GameMode(string type, int count)
    {
        this.type = type;
        this.count = count;
    }
}

public class Lobby
{
    [JsonConverter(typeof(LobbyPlayersConverter))]
    public Dictionary<string, Player> players { get; set; }

    public GameMode gameMode { get; set; }
    public Equation[] equations { get; set; }
    public string lobbyId { get; set; }

    public Lobby()
    {
        players = new Dictionary<string, Player>();
        gameMode = new GameMode();
        equations = [];
        lobbyId = "";
    }

    public Lobby(string lobbyId, Equation[] equations, GameMode gameMode)
    {
        this.players = new Dictionary<string, Player>();

        this.gameMode = gameMode;
        this.lobbyId = lobbyId;
        this.equations = equations;
    }

    public Player NewPlayer(string name, string id)
    {
        Player player = new Player(name, id);

        this.players.Add(player.playerId, player);

        return player;
    }

    public void RemovePlayer(string id)
    {
        if (this.players.ContainsKey(id))
        {
            this.players.Remove(id);
        }
    }
}

public class LobbyPlayersConverter : JsonConverter<Dictionary<string, Player>>
{
    public override Dictionary<string, Player> Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        Player[] arr = JsonSerializer.Deserialize<Player[]>(reader.GetString()!) ?? [];
        Dictionary<string, Player> lobby = new();

        foreach (Player p in arr)
        {
            lobby.Add(p.playerId, p);
        }

        return lobby;
    }

    public override void Write(
        Utf8JsonWriter writer,
        Dictionary<string, Player> lobby,
        JsonSerializerOptions options
    )
    {
        writer.WriteStartArray();

        foreach (Player p in lobby.Values)
        {
            writer.WriteStartObject();

            writer.WriteString("playerId", p.playerId);
            writer.WriteNumber("score", p.score);
            writer.WriteBoolean("isHost", p.isHost);
            writer.WriteString("name", p.name);
            writer.WriteBoolean("hasComplete", p.hasComplete);

            writer.WriteEndObject();
        }

        writer.WriteEndArray();
    }
}
