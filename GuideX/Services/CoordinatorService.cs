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

        public async Task<int> RegisterCoordinatorAsync(CoordinatorRegisterDto dto)
        {
            return await _repository.RegisterCoordinatorAsync(dto);
        }

        public async Task<bool> UpdateCoordinatorAsync(CoordinatorUpdateDto dto)
        {
            return await _repository.UpdateCoordinatorAsync(dto);
        }
    }
}
