using System.Text.Json;

public class Token
{
    public DateTime dateIssued { set; get; }
    public DateTime expiration { set; get; }
    public string user { set; get; }

    public Token(string user)
    {
        this.dateIssued = DateTime.Now;
        this.expiration = DateTime.Now.AddMinutes(10);
        this.user = user;
    }

    public override string ToString()
    {
        return JsonSerializer.Serialize(this, new JsonSerializerOptions { WriteIndented = true });
    }
}

public interface ITokenService
{
    string Sign(Token token);
    string NewSignedToken(string user);
    Token? Validate(string? token);
}

public class TokenService : ITokenService
{
    private readonly EncryptionService _encryptionService;

    public TokenService(LoggingService logger)
    {
        this._encryptionService = new EncryptionService(logger);
    }

    public string Sign(Token token)
    {
        string encryptedToken = this._encryptionService.Encrypt(token.ToString());
        return encryptedToken;
    }

    public string NewSignedToken(string user)
    {
        Token token = new Token(user);
        return this.Sign(token);
    }

    public Token? Validate(string? tokenString)
    {
        if (tokenString == null)
        {
            return null;
        }

        string? decrypted = this._encryptionService.Decrypt(tokenString);

        if (decrypted == null)
        {
            return null;
        }

        Token? token = JsonSerializer.Deserialize<Token>(decrypted);

        if (token == null)
        {
            return null;
        }

        if (token.expiration < DateTime.Now)
        {
            return null;
        }

        return token;
    }
}
