/**
 * דירוג בודד — מה שמחזיר השרת (GET/POST /rating).
 * השם המלא (firstName + lastName) משולב מהמשתמש בשרת.
 */
export interface Int_Rating {
  ratingId: number;
  userId: number;
  firstName: string;
  lastName: string;
  numberOfStars: number;
  date: Date | null;
  note: string | null;
}

/**
 * תשובת ה-GET הגנרי — ממוצע, מספר דירוגים והרשימה המלאה.
 */
export interface Int_RatingList {
  average: number;
  count: number;
  ratings: Int_Rating[];
}

/**
 * תשובת ה-GET ממוצע בלבד.
 */
export interface Int_RatingAverage {
  average: number;
  count: number;
}

/**
 * גוף הבקשה להוספת דירוג (POST /rating).
 */
export interface Int_CreateRating {
  entityType: string;
  entityId: number;
  numberOfStars: number;
  note: string | null;
}

/**
 * סוגי הישויות המדורגות — חייבים להתאים למפתחות שבצד השרת.
 * (בשרת: guide, attraction, hostel, walkingtrail — ללא מקף)
 */
export const RatingEntityType = {
  GUIDE: 'guide',
  ATTRACTION: 'attraction',
  HOSTEL: 'hostel',
  WALKING_TRAIL: 'walkingtrail',
} as const;
