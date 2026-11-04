namespace GuideX.DTOs
{


    //public record userResetDTO(string Email, string PhoneNumber, string idNumber);
    public record RegionDTO(int RegionId, string RegionName);
    public record KashrutDTO(int KashrutId, string KashrutName);
    public record RoleDTO(int RoleId, string RoleName);
    public record ReligiousDTO(int ReligiousId, string ReligiousName);

    public class PermissionResult
    {
        public bool NewValue { get; set; }
    }


}
