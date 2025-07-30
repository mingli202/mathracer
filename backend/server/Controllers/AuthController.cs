using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using models;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly RSA _rsa;
    private readonly LoggingService _logger;

    public AuthController(RSA rsa, LoggingService logger)
    {
        this._rsa = rsa;
        this._logger = logger;
    }

    [HttpGet("key")]
    public ActionResult<string> GetKey()
    {
        byte[] spkiPublicKey = _rsa.ExportSubjectPublicKeyInfo();
        return Ok(Convert.ToBase64String(spkiPublicKey));
    }

    [HttpPost("decrypt")]
    public ActionResult Decrypt([FromBody] Payload base64payload)
    {
        string? json = this.DecryptRsaAndBase64String(base64payload.payload);

        if (json == null)
            return BadRequest();

        // HACK: dubious code
        this._logger.Log(Severity.Debug, "Decrypt succeeded", json);
        return Ok(json);
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] Payload base64payload)
    {
        string? json = this.DecryptRsaAndBase64String(base64payload.payload);

        if (json == null)
            return BadRequest();

        Credentials? creds = JsonSerializer.Deserialize<Credentials>(json);

        if (creds == null)
            return BadRequest();

        byte[] adminUsernameHash = Convert.FromBase64String(
            "5sxF3UNAZjwn5U1ObVCTShuKuRR1LZ2aNe4SnpUUPPE="
        );
        byte[] adminPasswordHash = Convert.FromBase64String(
            "QHipLSagok1+5FQ4z0x9Qk1uEVQzJN6O3YIYDlzx7F8="
        );

        Rfc2898DeriveBytes k1 = new Rfc2898DeriveBytes(
            creds.username,
            [],
            100_000,
            HashAlgorithmName.SHA256
        );
        byte[] computedUsernameHash = k1.GetBytes(32);

        Rfc2898DeriveBytes k2 = new Rfc2898DeriveBytes(
            creds.password,
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
            this._logger.Log(Severity.Error, "Login failed: invalid credentials", creds);
            return Unauthorized();
        }

        this._logger.Log(Severity.Info, "Login succeeded", creds);

        return Ok();
    }

    private string? DecryptRsaAndBase64String(string base64payload)
    {
        try
        {
            byte[] payload = Convert.FromBase64String(base64payload);
            byte[] decrypted = this._rsa.Decrypt(payload, RSAEncryptionPadding.OaepSHA256);
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
}
