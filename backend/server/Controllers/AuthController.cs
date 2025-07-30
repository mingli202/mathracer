using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using models;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private RSA _rsa;

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

        if (creds.username != "admin" || creds.password != "admin")
        {
            return Unauthorized();
        }

        return Ok();
    }
}
