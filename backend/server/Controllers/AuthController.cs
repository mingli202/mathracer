using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using models;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly LoggingService _logger;
    private readonly TokenService _tokenService;
    private readonly EncryptionService _encryptionService;

    public AuthController(
        LoggingService logger,
        TokenService tokenService,
        EncryptionService encryptionService
    )
    {
        this._logger = logger;
        this._tokenService = tokenService;
        this._encryptionService = encryptionService;
    }

    [HttpGet("key")]
    public ActionResult<string> GetKey()
    {
        byte[] spkiPublicKey = this._encryptionService.ExportPublicKey();
        return Ok(Convert.ToBase64String(spkiPublicKey));
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] Payload base64payload)
    {
        string? json = this._encryptionService.Decrypt(base64payload.payload);

        if (json == null)
            return BadRequest();

        Credentials? credentials = JsonSerializer.Deserialize<Credentials>(json);

        if (credentials == null)
            return BadRequest();

        byte[] adminUsernameHash = Convert.FromBase64String(
            "5sxF3UNAZjwn5U1ObVCTShuKuRR1LZ2aNe4SnpUUPPE="
        );
        byte[] adminPasswordHash = Convert.FromBase64String(
            "QHipLSagok1+5FQ4z0x9Qk1uEVQzJN6O3YIYDlzx7F8="
        );

        Rfc2898DeriveBytes k1 = new Rfc2898DeriveBytes(
            credentials.username,
            [],
            100_000,
            HashAlgorithmName.SHA256
        );
        byte[] computedUsernameHash = k1.GetBytes(32);

        Rfc2898DeriveBytes k2 = new Rfc2898DeriveBytes(
            credentials.password,
            [],
            100_000,
            HashAlgorithmName.SHA256
        );
        byte[] computedPasswordHash = k1.GetBytes(32);

        if (
            !CryptographicOperations.FixedTimeEquals(adminUsernameHash, computedUsernameHash)
            || !CryptographicOperations.FixedTimeEquals(adminPasswordHash, computedPasswordHash)
        )
        {
            this._logger.Log(Severity.Error, "Login failed: invalid credentials", credentials);
            return Unauthorized();
        }

        this._logger.Log(Severity.Info, "Login succeeded", credentials);

        Token token = new Token(credentials.username);
        string encryptedToken = this._tokenService.Sign(token);

        return Ok(encryptedToken);
    }

    [HttpGet("validateToken")]
    public IActionResult ValidateToken()
    {
        Token? token = this._tokenService.Validate(Request.Headers["Token"]);

        if (token == null)
        {
            return Unauthorized();
        }

        string encryptedToken = this._tokenService.Sign(token);

        return Ok(encryptedToken);
    }
}
