
using GuideX.DTOs;
using GuideX.Entities;
using GuideX.Repository;

namespace GuideX.Services
{
    public class loginService
    {
        
            private readonly UserRepository _repo;

            public loginService(UserRepository repo)
            {
            _repo = repo;
            }


        public User? Login(userDTO dto)
        {
           return _repo.GetUserByEmailAndPassword(dto.Email, dto.UserPassword);
        }


        public User? beginReset(userResetDTO dto)
        {
            return _repo.GetUserByEmailAndPhoneAndIdNumber(dto.Email, dto.PhoneNumber, dto.idNumber);
        }

    }

}

