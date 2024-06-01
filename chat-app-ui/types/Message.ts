export interface Message {
    text: any;
    receiver: string;
    tempTag?: string;
    mId?: string;
    cId: string;
    sender: string;
    isSender: boolean;
    canDelete?: boolean;
  }
  