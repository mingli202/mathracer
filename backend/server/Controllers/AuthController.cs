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

        var hash = SHA256.Create();
        byte[] hasedUsername = hash.ComputeHash(Encoding.UTF8.GetBytes(creds.username));
        byte[] hasedPassword = hash.ComputeHash(Encoding.UTF8.GetBytes(creds.password));

        byte[] adminUsernameHashed = Encoding.UTF8.GetBytes(
            "e7b296d30a89a190dfa0f240e26a5d005adc034b1b68bc833380b23dbef410b1"
        );
        byte[] adminPasswordHashed = Encoding.UTF8.GetBytes(
            "857899397b84f9ad6b0818df99886f2ddd98e064d67652748982b47c138c58df"
        );

        if (
            !CryptographicOperations.FixedTimeEquals(hasedUsername, adminUsernameHashed)
            || !CryptographicOperations.FixedTimeEquals(hasedPassword, adminPasswordHashed)
        )
        {
            return Unauthorized();
        }

        return Ok();
    }
}
