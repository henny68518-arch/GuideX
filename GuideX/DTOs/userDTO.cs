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

    /// <summary>גוף הבקשה להפיכת הרשאת משתמש (PUT /Users/{userId}/permission). מכיל רק את שם ההרשאה.</summary>
    public record UpdatePermissionRequest(string Permission);

    /// <summary>
    /// גוף הבקשה לעדכון פרטי משתמש בסיסי (PUT /Users/{userId}) —
    /// למשל עריכת פרופיל של מנהל, שאין לו פרופיל מדריכה או רכזת.
    /// ת.ז. וסיסמה אינן ניתנות לעריכה ואינן נכללות כאן.
    /// </summary>
    public record UserUpdateDto(
        string FirstName,
        string LastName,
        string? City,
        string? PhoneNumber,
        string Email);



}
