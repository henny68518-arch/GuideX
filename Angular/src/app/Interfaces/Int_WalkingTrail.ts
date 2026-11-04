

export interface Int_WalkingTrail {

   WalkingTrailId : number;
   WalkingTrailName : string;
   Description : string;
   regionId : number;
   Directions : string;
   LengthInKm : number;
   RouteDuration : number;
   Difficulty : number;
   MinAge : number;
   MaxAge : number;
   IsWet : boolean;

    SeasonSummer: boolean;
    SeasonWinter: boolean;
    SeasonSpring: boolean;
    SeasonAutumn: boolean;
  /** רשימת התמונות של מסלול ההליכה — מאפשרת הצגה ומחיקה. נטענת בנפרד בפרטי המסלול. */
  images?: Int_WalkingTrailFile[];
}

/** פריט תמונה של מסלול הליכה — מטא-דאטה בלבד (FileId + FileName), לשימוש הצגה ומחיקה. */
export interface Int_WalkingTrailFile {
  fileId: number;
  fileName: string;
}
