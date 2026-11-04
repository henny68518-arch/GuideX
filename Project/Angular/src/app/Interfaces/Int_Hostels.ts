

export interface Int_Hostels {

   HostelsId : number;
   HostelsName : string;
   regionId : number;
   Address : string;
   Description : string;
   NumberOfPlaces : number;
   kashrutId :number;
   Phone :string;
   /** רשימת התמונות של מקום הלינה — מאפשרת הצגה ומחיקה. נטענת בנפרד בפרטי מקום הלינה. */
   images?: Int_HostelFile[];
}

/** פריט תמונה של מקום לינה — מטא-דאטה בלבד (FileId + FileName), לשימוש הצגה ומחיקה. */
export interface Int_HostelFile {
  fileId: number;
  fileName: string;
}
