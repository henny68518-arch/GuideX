using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;

namespace GuideX.Repository
{
    public class UserRepository
    {

        private readonly GuideXpContext _context;

        public UserRepository(GuideXpContext context) { _context = context; }


       
        public User? GetUserByEmailAndPassword(string Email, string UserPassword)
        {
            return _context.Users
                .Include(u => u.Permission) 
                .FirstOrDefault(user => user.Email == Email && user.UserPassword == UserPassword);
        }

        public User? GetUserByEmailAndPhoneAndIdNumber(string Email, string PhoneNumber, string idNumber)
        {
            return _context.Users
                .Include(u => u.Permission)  
                .FirstOrDefault(user => user.Email == Email && user.PhoneNumber == PhoneNumber && user.IdNumber == idNumber);
        }

       
        public async Task<bool> UpdateUserAsync(int userId, UserUpdateDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
            {
                return false;
            }

            if (!string.IsNullOrWhiteSpace(dto.FirstName)) user.FirstName = dto.FirstName!;
            if (!string.IsNullOrWhiteSpace(dto.LastName)) user.LastName = dto.LastName!;
            if (!string.IsNullOrWhiteSpace(dto.City)) user.City = dto.City;
            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber)) user.PhoneNumber = dto.PhoneNumber;
            if (!string.IsNullOrWhiteSpace(dto.Email)) user.Email = dto.Email!;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return true;
        }

    }
}
