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

    public AuthController(RSA rsa)
    {
        this._rsa = rsa;
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
        byte[] payload = Convert.FromBase64String(base64payload.payload);
        byte[] decrypted = this._rsa.Decrypt(payload, RSAEncryptionPadding.OaepSHA256);
        string json = Encoding.UTF8.GetString(decrypted);
        Credentials? creds = JsonSerializer.Deserialize<Credentials>(json);

        if (creds == null)
        {
            return BadRequest();
        }

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
            return Unauthorized();
        }

        return Ok();
    }
}
