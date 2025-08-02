using Microsoft.AspNetCore.Authorization;

namespace AuthRequirementsData.Authorization;

class ValidTokenAuthorizeAttribute : AuthorizeAttribute, IAuthorizationRequirement, IAuthorizationRequirementData
{
    public IEnumerable<IAuthorizationRequirement> GetRequirements()
    {
        yield return this;
    }
}
