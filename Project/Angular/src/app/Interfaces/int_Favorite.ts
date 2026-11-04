export interface int_Favorite {
  favoriteId: number;
  userId: number;
  walkingTrailId?: number;
  attractionsId?: number;
  hostelsId?: number;

  /** שם האטרקציה/הוסטל/מסלול — מגיע מהשרת (גישה א'). */
  itemName?: string | null;

  /** סוג הפריט: "attraction" | "hostel" | "trail" — מגיע מהשרת. */
  itemType?: 'attraction' | 'hostel' | 'trail' | string | null;
}
