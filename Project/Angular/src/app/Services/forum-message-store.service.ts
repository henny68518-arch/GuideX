import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { int_ForumMessage } from '../Interfaces/int_ForumMessage';
import { SrvForumMessageService } from './srv-forum-message.service';

@Injectable({
  providedIn: 'root',
})
export class ForumMessageStoreService {
  private messagesSubject: BehaviorSubject<int_ForumMessage[]>;

  constructor(public srv_forum: SrvForumMessageService) {
    this.messagesSubject = new BehaviorSubject<int_ForumMessage[]>([]);
    // Load all messages from server on init
    this.srv_forum.getAllMessagesFromServer().subscribe({
      next: (messages) => this.messagesSubject.next(messages),
      error: (err) => console.error('Failed to load forum messages:', err),
    });
  }


   addMessage(message: int_ForumMessage): void {
    const current = this.messagesSubject.getValue();
    this.messagesSubject.next([...current, message]);
  }

  getMessages(): Observable<int_ForumMessage[]> {
    return this.messagesSubject.asObservable();
  }


  fetchMessagesByForumType(forumType: number): void {
    this.srv_forum.getAllMessagesByForumType(forumType).subscribe({
      next: (messages: int_ForumMessage[]) => {
        this.messagesSubject.next(messages);
      },

      error: (err) => {
        console.error('Error fetching forum messages:', err);
        this.messagesSubject.next([]);
      }
    });
  }

  getTitleByForumId(forumId: number): string | undefined {
    return this.messagesSubject.getValue().find(m => m.forumId === forumId)?.title;
  }
}
