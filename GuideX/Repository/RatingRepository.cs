using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Repository
{
    public class RatingRepository
    {
        private readonly GuideXpContext _context;

        public RatingRepository(GuideXpContext context)
        {
            _context = context;
        }

        /// <summary>
        /// שליפת כל דירוגי הישות (EntityType + EntityId) יחד עם שם המדרגת,
        /// ובדיקה מוגבלת של סוגי הישויות הנתמכים.
        /// </summary>
        public async Task<List<Rating>> GetRatingsQuery(string entityType, int entityId)
        {
            var type = NormalizeEntityType(entityType);
            return await _context.Ratings
                .AsNoTracking()
                .Include(r => r.User)
                .Where(r => r.EntityType == type && r.EntityId == entityId)
                .ToListAsync();
        }

        /// <summary>תשובה מלאה: ממוצע + מספר + רשימת דירוגים עם שמות.</summary>
        public async Task<RatingListResponse> GetListAsync(string entityType, int entityId)
        {
            var ratings = await GetRatingsQuery(entityType, entityId);
            return MapToResponse(ratings);
        }

        /// <summary>ממוצע ומספר בלבד (ללא רשימת הדירוגים).</summary>
        public async Task<RatingAverageResponse> GetAverageAsync(string entityType, int entityId)
        {
            var ratings = await GetRatingsQuery(entityType, entityId);
            return new RatingAverageResponse(
                Average: CalcAverage(ratings),
                Count: ratings.Count);
        }

        /// <summary>הוספת דירוג חדש. מחזיר את הדירוג שנוצר (כולל השם).</summary>
        public async Task<RatingResponseDto?> AddAsync(int userId, CreateRatingDto dto)
        {
            var type = NormalizeEntityType(dto.EntityType);

            var rating = new Rating
            {
                UserId = userId,
                EntityType = type,
                EntityId = dto.EntityId,
                NumberOfStars = dto.NumberOfStars,
                Note = string.IsNullOrWhiteSpace(dto.Note) ? null : dto.Note.Trim(),
                Date = DateTime.Now,
            };

            _context.Ratings.Add(rating);
            await _context.SaveChangesAsync();

            // שליפת הדירוג החדש כולל שם המדרגת.
            var saved = await _context.Ratings
                .AsNoTracking()
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.RatingId == rating.RatingId);

            return saved is null ? null : new RatingResponseDto(
                RatingId: saved.RatingId,
                UserId: saved.UserId,
                FirstName: saved.User?.FirstName ?? string.Empty,
                LastName: saved.User?.LastName ?? string.Empty,
                NumberOfStars: saved.NumberOfStars,
                Date: saved.Date,
                Note: saved.Note);
        }

        /// <summary>נרמול שם סוג הישות לתחביר אחיד (lowercase, ללא מקפים).</summary>
        private static string NormalizeEntityType(string entityType)
        {
            return entityType.Trim().ToLowerInvariant().Replace("-", string.Empty);
        }

        private static double CalcAverage(List<Rating> ratings)
        {
            if (ratings.Count == 0) return 0;
            return Math.Round(ratings.Average(r => r.NumberOfStars), 1);
        }

        private static RatingListResponse MapToResponse(List<Rating> ratings)
        {
            var list = ratings
                .OrderByDescending(r => r.Date)
                .Select(r => new RatingResponseDto(
                    RatingId: r.RatingId,
                    UserId: r.UserId,
                    FirstName: r.User?.FirstName ?? string.Empty,
                    LastName: r.User?.LastName ?? string.Empty,
                    NumberOfStars: r.NumberOfStars,
                    Date: r.Date,
                    Note: r.Note))
                .ToList();

            return new RatingListResponse(
                Average: CalcAverage(ratings),
                Count: list.Count,
                Ratings: list);
        }
    }
}
