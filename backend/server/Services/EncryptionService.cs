using System.Security.Cryptography;
using System.Text;

public interface IEncryptionService
{
    string Encrypt(string plainText);
    string? Decrypt(string cipherText);
    byte[] ExportPublicKey();
}

public class EncryptionService : IEncryptionService
{
    private readonly LoggingService _logger;
    private readonly RSA _rsa = RSA.Create(2048);

    public EncryptionService(LoggingService logger)
    {
        this._logger = logger;
    }

    public string Encrypt(string plainText)
    {
        var encrypted = this._rsa.Encrypt(
            Encoding.UTF8.GetBytes(plainText),
            RSAEncryptionPadding.OaepSHA256
        );
        string base64 = Convert.ToBase64String(encrypted);
        return base64;
    }

    public string? Decrypt(string base64cipherText)
    {
        try
        {
            byte[] payload = Convert.FromBase64String(base64cipherText);
            byte[] decrypted = this._rsa.Decrypt(payload, RSAEncryptionPadding.OaepSHA256);
            string json = Encoding.UTF8.GetString(decrypted);

            return json;
        }
        catch (Exception e)
        {
            this._logger.Log(Severity.Error, $"Decrypt failed: {e.Message}", base64cipherText);
            return null;
        }
    }

    public byte[] ExportPublicKey()
    {
        return this._rsa.ExportSubjectPublicKeyInfo();
    }
}
