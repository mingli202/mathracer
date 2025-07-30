using System.Collections;
using System.Text.Json;
using System.Text.Json.Serialization;
using equation;

namespace models;

public enum PlayerState
{
    playing,
    lobby,
    completed,
}

public class Player
{
    public string playerId { get; set; }
    public int score { get; set; }
    public bool isHost { get; set; }
    public string name { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public PlayerState state { get; set; }

    public Player()
    {
        playerId = "";
        score = 0;
        isHost = false;
        name = "Player";
        state = PlayerState.lobby;
    }

    public Player(string name, string id)
    {
        playerId = id;
        score = 0;
        isHost = false;
        this.name = name;
        state = PlayerState.lobby;
    }

    public override string ToString()
    {
        return JsonSerializer.Serialize(this, new JsonSerializerOptions { WriteIndented = true });
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

    public override string ToString()
    {
        return JsonSerializer.Serialize(this);
    }
}

public class Lobby
{
    public string lobbyId { get; set; }
    public GameMode gameMode { get; set; }

    [JsonConverter(typeof(LobbyPlayersConverter))]
    public Dictionary<string, Player> players { get; set; }
    public Equation[] equations { get; set; }

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
        if (!this.players.ContainsKey(id))
        {
            return;
        }
        Player p = this.players[id];
        this.players.Remove(id);

        if (p.isHost && this.players.Count > 0)
        {
            Player newHost = this.players.Values.First();
            newHost.isHost = true;
        }
    }

    public bool UpdatePlayerState(string id, string state)
    {
        if (!this.players.ContainsKey(id))
        {
            return false;
        }

        Player p = this.players[id];
        PlayerState s = (PlayerState)Enum.Parse(typeof(PlayerState), state);
        p.state = s;

        // check if all players are playing
        return this.players.Values.All(p => p.state == PlayerState.playing);
    }

    public void ClearStats()
    {
        foreach (var player in this.players.Values)
        {
            player.score = 0;
        }
        this.equations = Equation.GenerateAllEquations(
            this.gameMode.count * (this.gameMode.type == "time" ? 10 : 1)
        );
    }

    public override string ToString()
    {
        return JsonSerializer.Serialize(this, new JsonSerializerOptions { WriteIndented = true });
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
        if (reader.TokenType != JsonTokenType.StartArray)
        {
            throw new JsonException();
        }

        ArrayList arr = new();

        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndArray)
            {
                break;
            }

            Player p = JsonSerializer.Deserialize<Player>(ref reader, options)!;
            arr.Add(p);
        }

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
            JsonSerializer.Serialize(writer, p, options);
        }

        writer.WriteEndArray();
    }
}

public class Payload
{
    public string payload { set; get; } = "";

    public override string ToString()
    {
        return JsonSerializer.Serialize(this, new JsonSerializerOptions { WriteIndented = true });
    }
}

public class Credentials
{
    public string username { set; get; } = "";
    public string password { set; get; } = "";

    public override string ToString()
    {
        return JsonSerializer.Serialize(this, new JsonSerializerOptions { WriteIndented = true });
    }
}
