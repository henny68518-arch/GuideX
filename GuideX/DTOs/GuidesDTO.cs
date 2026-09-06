//namespace GuideX.DTOs
//{
//    public class GuidesDTO
//    {
//        public int GuideId { get; set; }
//        public int UserId { get; set; }
//        public string FirstName { get; set; }
//        public string LastName { get; set; }
//        public string IdNumber { get; set; }
//        public string City { get; set; }
//        public string PhoneNumber { get; set; }
//        public string Email { get; set; }
//        public int ReligiousId { get; set; }
//        public string ReligiousName { get; set; }
//        public int RegionId { get; set; }
//        public string RegionName { get; set; }

//    }




//}
using System.ComponentModel.DataAnnotations;

namespace GuideX.DTOs
{
    public class GuideDetailDTO
    {
        [Key]
        public int GuideId { get; set; }
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string IdNumber { get; set; }
        public string City { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public int ReligiousId { get; set; }
        public int[] RegionId { get; set; }
    }
}