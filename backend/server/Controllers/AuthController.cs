using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private RSA rsa;

    public AuthController(RSA _rsa)
    {
        this.rsa = _rsa;
    }

    [HttpGet("key")]
    public ActionResult<string> GetKey()
    {
        byte[] spkiPublicKey = rsa.ExportSubjectPublicKeyInfo();
        return Ok(Convert.ToBase64String(spkiPublicKey));
    }
}
