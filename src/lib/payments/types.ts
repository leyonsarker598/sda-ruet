export type PaymentMethod =
  | "BKASH"
  | "NAGAD"
  | "ROCKET"
  | "BANK_TRANSFER"
  | "MANUAL_CASH"
  | "SSLCOMMERZ";

export interface PaymentInitiateRequest {
  fundId: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  paymentReference?: string;
  isAnonymous?: boolean;
  message?: string;
}

export interface PaymentInitiateResponse {
  success: boolean;
  requiresRedirect: boolean;
  redirectUrl?: string;
  transactionId?: string;
  status: "PENDING" | "VERIFIED" | "FAILED";
  message?: string;
  error?: string;
}

export interface PaymentVerificationResponse {
  verified: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  paidAt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawResponse?: any;
  error?: string;
}

export interface PaymentGatewayProvider {
  readonly providerName: string;
  initiatePayment(request: PaymentInitiateRequest): Promise<PaymentInitiateResponse>;
  verifyPayment(transactionId: string): Promise<PaymentVerificationResponse>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleWebhook?(payload: any): Promise<{ processed: boolean; transactionId?: string }>;
}
