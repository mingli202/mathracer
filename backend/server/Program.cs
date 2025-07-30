using System.Security.Cryptography;
using hub;

RSA rsa = RSA.Create(2048);
byte[] spkiPublicKey = rsa.ExportSubjectPublicKeyInfo();

var builder = WebApplication.CreateBuilder(args);

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        name: MyAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins("http://localhost:3000");
            policy.AllowAnyHeader();
            policy.AllowAnyMethod();
            policy.AllowCredentials();
        }
    );
});

builder.Services.AddSingleton<Lobbies>();
builder.Services.AddSingleton<LoggingService>();
builder.Services.AddSingleton<RSA>(rsa);

builder.Services.AddSignalR();
builder.Services.AddControllers();

var app = builder.Build();

app.UseRouting();
app.UseCors(MyAllowSpecificOrigins);
app.UseAuthorization();
app.UseAuthentication();
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapHub<RacerHub>("/hub");
});

app.Run();
