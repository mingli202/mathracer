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
    private readonly LoggingService _logger;

    public TokenService(LoggingService logger, EncryptionService encryptionService)
    {
        this._encryptionService = new EncryptionService(logger);
        this._logger = logger;
    }

    /// <summary>
    /// Signs a token and returns the encrypted token string.
    /// </summary>
    /// <param name="token">The token to sign.</param>
    /// <returns>The encrypted token string.</returns>
    public string Sign(Token token)
    {
        string encryptedToken = this._encryptionService.Encrypt(token.ToString());
        return encryptedToken;
    }

    /// <summary>
    /// Generates a new signed token for a user.
    /// </summary>
    /// <param name="user">The user to generate the token for.</param>
    /// <returns>The encrypted token string.</returns>
    public string NewSignedToken(string user)
    {
        Token token = new Token(user);
        return this.Sign(token);
    }

    /// <summary>
    /// Validates a token string and returns a new token if valid, otherwise null.
    /// </summary>
    /// <param name="tokenString">The token string to validate.</param>
    /// <returns>The new token if valid, otherwise null.</returns>
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
            this._logger.Log(Severity.Debug, $"ValidateToken failed, token expired at {token.expiration}", token);
            return null;
        }

        Token newToken = new Token(token.user);

        this._logger.Log(Severity.Debug, "Validate token succeeded, generating new token", newToken);

        return token;
    }
}
