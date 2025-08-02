using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;

using models;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly RSA _rsa;
    private readonly RSA _signingKey;
    private readonly LoggingService _logger;


    public AuthController(RSA rsa, RSA signingKey, LoggingService logger)
    {
        this._rsa = rsa;
        this._logger = logger;
        this._signingKey = signingKey;
    }

    [HttpGet("key")]
    public ActionResult<string> GetKey()
    {
        byte[] spkiPublicKey = _rsa.ExportSubjectPublicKeyInfo();
        return Ok(Convert.ToBase64String(spkiPublicKey));
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] Payload base64payload)
    {
        string? json = this.DecryptRsaAndBase64String(base64payload.payload);
        System.Console.WriteLine("json: " + json);

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
        string encryptedToken = this.EncryptRsaAndBase64String(token.ToString(), this._signingKey);

        return Ok(encryptedToken);
    }

    [HttpGet("validateToken")]
    public IActionResult ValidateToken()
    {
        Token? token = this.ValidateToken(Request.Headers["Token"]);

        if (token == null)
        {
            return Unauthorized();
        }

        string encryptedToken = this.EncryptRsaAndBase64String(token.ToString());

        return Ok(encryptedToken);
    }

    private string? DecryptRsaAndBase64String(string base64payload, RSA? rsa = null)
    {
        rsa ??= this._rsa;
        try
        {
            byte[] payload = Convert.FromBase64String(base64payload);
            byte[] decrypted = rsa.Decrypt(payload, RSAEncryptionPadding.OaepSHA256);
            string json = Encoding.UTF8.GetString(decrypted);

            return json;
        }
        catch (Exception e)
        {
            this._logger.Log(
                Severity.Error,
                $"DecryptRsaAndBase64String failed: {e.Message}",
                base64payload
            );
            return null;
        }
    }

    private string EncryptRsaAndBase64String(string json, RSA? rsa = null)
    {
        rsa ??= this._rsa;

        var encrypted = rsa.Encrypt(Encoding.UTF8.GetBytes(json), RSAEncryptionPadding.OaepSHA256);
        string base64 = Convert.ToBase64String(encrypted);
        return base64;
    }

    private Token? ValidateToken(string? token)
    {
        if (token == null)
        {
            return null;
        }

        string? decrypted = this.DecryptRsaAndBase64String(token, this._signingKey);

        if (decrypted == null)
        {
            return null;
        }

        Token? t = JsonSerializer.Deserialize<Token>(decrypted);

        if (t == null)
        {
            return null;
        }

        if (t.expiration < DateTime.Now)
        {
            this._logger.Log(Severity.Debug, $"ValidateToken failed, token expired at {t.expiration}", t);
            return null;
        }

        Token newToken = new Token(t.user);

        this._logger.Log(Severity.Debug, "ValidateToken succeeded, generating new token", newToken);

        return newToken;
    }
}
