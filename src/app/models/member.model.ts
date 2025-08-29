export interface Member {
  id: number;                // Member ID
  name: string;              // Member name
  email: string;             // Member email
  phone: string;             // Member phone number
  subscriptionType: SubscriptionType; // Subscription details
  period: string;            // Subscription period (e.g., "1 Month")
  amountPaid: number;        // Amount paid
  paidDate: Date;            // Date when paid
  validUntil: Date;          // Subscription valid until
  gymId?: number;            // Optional Gym ID
  gymName?: string;          // Optional Gym Name
  attendance?: string[];     // Array of dates (YYYY-MM-DD) when member was present
  [field: string]: any;      // Dynamic index for extra fields
}
  
  export interface SubscriptionType {
    label: string;
    value: string;
    period: string;
    price: number;
  }
  