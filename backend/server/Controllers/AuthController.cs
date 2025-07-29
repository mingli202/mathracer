using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpGet]
    public ActionResult<string> Get([FromHeader(Name = "Authorization")] string token)
    {
        return "Hello World";
    }
}
