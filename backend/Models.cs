using equation;

namespace models;

public class Player
{
    public int id { get; set; }
    public int progress { get; set; }
    public int score { get; set; }
    public bool isHost { get; set; }
    public string name { get; set; }

    public bool isSinglePlayer { get; set; }
    public bool hasComplete { get; set; }

    public Player(string name)
    {
        id = 0;
        progress = 0;
        score = 0;
        isHost = false;
        this.name = name;
        hasComplete = true;
        isSinglePlayer = false;
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

public class Game
{
    public string id { get; set; }
    public GameMode gameMode { get; set; }
    public Equation[] equations { get; set; }

    public Game(string id, Equation[] eq, GameMode gameMode)
    {
        this.id = id;
        this.gameMode = gameMode;
        this.equations = eq;
    }
}

public class Lobby
{
    public Dictionary<int, Player> players { get; set; }
    public GameMode gameMode { get; set; }

    public Lobby()
    {
        players = new Dictionary<int, Player>();
        gameMode = new GameMode();
    }

    public Lobby(string mode, int count)
    {
        players = new Dictionary<int, Player>();
        gameMode = new GameMode(mode, count);
    }
}
