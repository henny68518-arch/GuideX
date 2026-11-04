export interface int_Attractions {
  // AttractionsId: number;
  // AttractionsName: string;
  // regionId: string;
  // Address: string;
  // AttractionsTypeId: number;
  // Description: string;
  // ShomerShabat: number;
  // Phone: string;
//   ImageUrl: string;
attractionId: number;
  attractionsName: string | null;
  regionId: number | null;
  address: string | null;
  attractionTypeId: number | null;
  description: string | null;
  shomerShabat: number | null;
  phone: string | null;
  /** רשימת התמונות של האטרקציה — מאפשרת הצגה ומחיקה. נטענת בנפרד בפרטי האטרקציה. */
  images?: int_AttractionFile[];
}

/** פריט תמונה של אטרקציה — מטא-דאטה בלבד (FileId + FileName), לשימוש הצגה ומחיקה. */
export interface int_AttractionFile {
  fileId: number;
  fileName: string;
}
