using GuideX.Data;
using GuideX.Entities;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;

namespace GuideX.Repository
{
    public class UserRepository
    {

        private readonly GuideXpContext _context;

        public UserRepository(GuideXpContext context) { _context = context; }


        public User GetUserByEmailAndPassword(string Email, string UserPassword)
        {
          
            return _context.Users.FirstOrDefault(user => user.Email == Email && user.UserPassword == UserPassword);
        }

        public User GetUserByEmailAndPhoneAndIdNumber(string Email, string PhoneNumber, string idNumber)
        {
            return _context.Users.FirstOrDefault(user => user.Email == Email && user.PhoneNumber == PhoneNumber && user.IdNumber == idNumber);

        }


       
    }
}
