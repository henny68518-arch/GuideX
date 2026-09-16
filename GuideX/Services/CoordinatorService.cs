using GuideX.DTOs;
using GuideX.Repository;

namespace GuideX.Services
{
    public class CoordinatorService
    {
        private readonly CoordinatorRepository _repository;

        public CoordinatorService(CoordinatorRepository repository)
        {
            _repository = repository;
        }

        /// <summary>קורא ל-Repository לרישום כורדינטור מלא ומחזיר את ה-UserId החדש.</summary>
        public async Task<int> RegisterCoordinatorAsync(CoordinatorRegisterDto dto)
        {
            return await _repository.RegisterCoordinatorAsync(dto);
        }

        /// <summary>קורא ל-Repository לעדכון פרופיל של רכזת/מוסד קיימת.</summary>
        public async Task<bool> UpdateCoordinatorAsync(CoordinatorUpdateDto dto)
        {
            return await _repository.UpdateCoordinatorAsync(dto);
        }
    }
}
