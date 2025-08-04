using System.Security.Cryptography;
using hub;

RSA rsa = RSA.Create(2048);
RSA signingKey = RSA.Create(2048);

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
string[] frontEndUrl = builder.Environment.IsDevelopment()
    ? ["http://localhost:3000"]
    : ["https://mathracer-web-245625371319.us-central1.run.app", "https://mathracer-web-rfexjzrwcq-uc.a.run.app"];

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        name: MyAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins(frontEndUrl);
            policy.AllowAnyHeader();
            policy.AllowAnyMethod();
            policy.AllowCredentials();
        }
    );
});

builder.Services.AddSingleton<LoggingService>();

builder.Services.AddSingleton<Lobbies>();
builder.Services.AddSingleton<EncryptionService>();
builder.Services.AddSingleton<TokenService>();

builder.Services.AddSignalR();
builder.Services.AddControllers();

var app = builder.Build();

app.UseRouting();
app.UseCors(MyAllowSpecificOrigins);
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapHub<RacerHub>("/hub");
});

app.Run();
