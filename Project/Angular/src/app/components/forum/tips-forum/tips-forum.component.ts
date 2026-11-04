import { Component } from '@angular/core';
import { int_ForumMessage } from '../../../Interfaces/int_ForumMessage';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { NewMessageTipsForumComponent } from '../new-message-tips-forum/new-message-tips-forum.component';
import { ForumMessageStoreService } from '../../../Services/forum-message-store.service';
import { HebrewDateConverterPipe } from '../../../Pipes/hebrewDateConverter ';
import { ActivatedRoute } from '@angular/router';
import { SrvForumMessageService } from '../../../Services/srv-forum-message.service';
import { AuthService } from '../../../Services/auth-service.service';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-tips-forum',
  imports: [MatIcon, CommonModule, HebrewDateConverterPipe],
  templateUrl: './tips-forum.component.html',
  styleUrl: './tips-forum.component.scss',
})
export class TipsForumComponent {
  // כל ההודעות בסדר צפייה: כל תגובה מופיעה מיד לאחר הודעת המקור שלה
  allTheMessage: int_ForumMessage[] | undefined;
  forumType: number = 0;


  constructor(
    public dialog: MatDialog,
    public forumMessageStore: ForumMessageStoreService,
    private route: ActivatedRoute,
    public Srv_Forum: SrvForumMessageService,
    public authService: AuthService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.forumType = Number(params['ForumType']);
      this.forumMessageStore.fetchMessagesByForumType(this.forumType);
    });

    this.forumMessageStore.getMessages().subscribe((messages) => {
      this.allTheMessage = this.organizeMessages(messages || []);
    });
  }

  private organizeMessages(messages: int_ForumMessage[]): int_ForumMessage[] {
    
    const forumMessages = messages.filter(
      (mess) => Number(mess.forumTypeId) == this.forumType
    );

    const byId = new Map<number, int_ForumMessage>();
    forumMessages.forEach((m) => byId.set(m.forumId, { ...m }));

    // מיין לפי תאריך (עולה לרשומות, יורד ליתר הפורומים)
    forumMessages.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return this.forumType === 3 ? diff : -diff;
    });

    const roots: int_ForumMessage[] = [];
    const replies: int_ForumMessage[] = [];

    forumMessages.forEach((m) => {
      if (m.parentForumId && byId.has(m.parentForumId)) {
        replies.push(m);
      } else if (m.parentForumId) {
        // תגובה להודעה שנמצאת בפורום אחר/נמחקה — מציגים אותה כהודעה עצמאית
        roots.push(m);
      } else {
        roots.push(m);
      }
    });

    // סדר סופי: הודעות מקור, וכל אחת מופיעה עם התגובות שלה
    const ordered: int_ForumMessage[] = [];
    roots.forEach((root) => {
      ordered.push(root);
      replies.forEach((reply) => {
        if (reply.parentForumId === root.forumId) {
          ordered.push(reply);
        }
      });
    });

    return ordered.map((m) => ({ ...m, date: new Date(m.date) }));
  }

  isReply(message: int_ForumMessage): boolean {
    return !!message.parentForumId;
  }

  openDialogAddMessage(parent: number, typeForum: number) {
    console.log('הצליח', parent, typeForum); // לוג עבור בדיקה
    const dialogRef = this.dialog.open(NewMessageTipsForumComponent, {
      width: '850px',
      data: { parent, typeForum }, // העברת הנתונים לדיאלוג
    });
  }

  maskEmail(email: string) {
        if (!email) return email; // אם המייל הוא undefined או ריק, מחזירים אותו כפי שהוא


    const atIndex = email.indexOf('@');
    if (atIndex === -1) return email; // במידה ואין סימן '@', מחזירים את המייל כפי שהוא

    const name = email.substring(0, atIndex);
    const domain = email.substring(atIndex); // הופך את הדומיין לאותיות גדולות

    // אם המייל קצר מ-5 אותיות, מחזירים אותו כפי שהוא
    if (name.length <= 4) {
      return email;
    }

    const maskedName = name.substring(0, 2) + '*'.repeat(name.length - 3);
    return maskedName + domain;
  }
//  getEmailAndHandleError(userId: number) : Observable<string | null> {
//     return this.srv_user.getEmailByUserId(userId).pipe(
//        tap(email => {
//       console.log("המייל שהתקבל הוא:", email); // הוספת קונסולה כאן
//     }),
//       catchError(error => {
//         this.errorMessage = "שגיאה בהבאת המייל: " + error.message;
//         console.error(this.errorMessage+":(");
//         return of(null); // מחזיר null במקרה של שגיאה
//       })
//     );      
//   }
  DeletePost(forumId: number) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { message: 'האם את בטוחה שברצונך למחוק את ההודעה?' },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        console.log('מחיקה בוטלה');
        return;
      }

      this.Srv_Forum.deletePost(forumId).subscribe({
        next: () => {
          this.forumMessageStore.fetchMessagesByForumType(this.forumType);
        },
        error: (err) => console.error('Error deleting post:', err),
      });
    });
  }

 
}
