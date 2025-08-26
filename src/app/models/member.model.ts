export interface Member {
    id: number; // Remove the optional "?" here
    name: string;
    email: string;
    phone: string;
    subscriptionType: SubscriptionType;
    period: string;
    amountPaid: number;
    paidDate: Date;
    validUntil: Date;
    gymId?: number;      // ✅ add gymId
    gymName?: string;    // ✅ add gymName
    [field: string]: any; // ✅ allows dynamic indexing
  }
  
  
  export interface SubscriptionType {
    label: string;
    value: string;
    period: string;
    price: number;
  }
  