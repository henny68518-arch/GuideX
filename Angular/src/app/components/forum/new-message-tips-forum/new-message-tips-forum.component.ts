import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../Services/auth-service.service';
import { NoWhitespaceValidatorService } from '../../../Services/noWhitespace_validator';
import { int_ForumMessage } from '../../../Interfaces/int_ForumMessage';
import { ForumMessageStoreService } from '../../../Services/forum-message-store.service';
import { SrvForumMessageService } from '../../../Services/srv-forum-message.service';

@Component({
  selector: 'app-new-message-tips-forum',
  imports: [MatIcon, ReactiveFormsModule],
  templateUrl: './new-message-tips-forum.component.html',
  styleUrl: './new-message-tips-forum.component.scss',
})
export class NewMessageTipsForumComponent {
  userDetails: any;
  // forumMessageStore?: any;
  private noSpace_validSrv = inject(NoWhitespaceValidatorService);

  constructor(
    public dialogRef: MatDialogRef<NewMessageTipsForumComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { parent: number; typeForum: number },
    public authService: AuthService,
    private srv_forum: SrvForumMessageService,
    public forumMessageStore: ForumMessageStoreService,
  ) {}
  ngOnInit() {
    this.userDetails = this.authService.getUserData();
    console.log(this.userDetails);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  formNewMesagge = new FormGroup({
    titleName: new FormControl('', [
      Validators.required,
      this.noSpace_validSrv.valid_espace,
    ]),
    message: new FormControl('', [
      Validators.required,
      this.noSpace_validSrv.valid_espace,
    ]),
  });

  send() {
    if (!this.userDetails) {
      return;
    }
    console.log('User details:', this.userDetails);
    const userId = this.userDetails.userId;
    console.log('user id: ' + userId);
    const parent = this.data.parent;
    const forumType = this.data.typeForum;
console.log("התאריך: ")
    const date = new Date();
    console.log("התאריך: ",date)
    const title = this.formNewMesagge.get('titleName')?.value?.trim() ?? '';
    const message = this.formNewMesagge.get('message')?.value?.trim() ?? '';
    const emailUser = this.userDetails.email;
    
    const newMessage: int_ForumMessage = {
      forumId: 0,
      userId: userId,
      date: date,
      parentForumId: parent,
      title: title,
      message: message,
      forumTypeId: forumType,
      userEmail:emailUser,
    };

    this.srv_forum.postMessage(newMessage).subscribe({
      next: (saved) => {
        this.forumMessageStore.addMessage(saved);
        this.formNewMesagge.reset();
        this.onClose();
        this.forumMessageStore.fetchMessagesByForumType(forumType);
      },
      error: (err) => console.error('Failed to post message:', err),
    });
  }
}
function log() {
  throw new Error('Function not implemented.');
}

