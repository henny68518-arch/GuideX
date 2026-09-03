namespace GuideX.DTOs
{
    public record userDTO(string Email, string UserPassword);

    public record userResetDTO(string Email, string PhoneNumber, string idNumber);

    public record userResetPasswordDTO(string Email, string PhoneNumber, string idNumber, string UserPassword);




}
