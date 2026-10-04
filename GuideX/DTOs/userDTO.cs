namespace GuideX.DTOs
{
    public record userDTO(string Email, string UserPassword);

    public record userResetDTO(string Email, string PhoneNumber, string idNumber);

    public record userResetPasswordDTO(string Email, string PhoneNumber, string idNumber, string UserPassword);


    public record userWithPermissionsDTO(int UserId,
    string FirstName,
    string LastName,
    string IdNumber,
    string? City,
    string? PhoneNumber,
    string Email,
    string UserPassword,
    int PermissionId,
    bool SuperAdmin,
    bool UserManagement,
    bool EditRoutes,
    bool EditAttractions,
    bool editHostels,
    bool RespondInGeneralForum,
    bool RespondInSafetyForum);



}
