using equation;

namespace models;

public class Player
{
    public int playerId { get; set; }
    public int score { get; set; }
    public bool isHost { get; set; }
    public string name { get; set; }
    public bool hasComplete { get; set; }

    public Player()
    {
        playerId = 0;
        score = 0;
        isHost = false;
        name = "Player";
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
    public Dictionary<int, Player> players { get; set; }
    public GameMode gameMode { get; set; }
    public Equation[] equations { get; set; }
    public string lobbyId { get; set; }

    public Lobby()
    {
        players = new Dictionary<int, Player>();
        gameMode = new GameMode();
        equations = [];
        lobbyId = "";
    }

    public Lobby(string lobbyId, Equation[] equations, GameMode gameMode)
    {
        this.players = new Dictionary<int, Player>();
        this.gameMode = gameMode;
        this.lobbyId = lobbyId;
        this.equations = equations;
    }

    public Player newPlayer()
    {
        Player player = new Player();
        player.playerId = this.players.Count;

        while (this.players.ContainsKey(player.playerId))
        {
            player.playerId++;
        }

        return player;
    }
}
