import type {
  PaymentGatewayProvider,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  PaymentVerificationResponse,
} from "./types";

export class ManualPaymentProvider implements PaymentGatewayProvider {
  readonly providerName = "MANUAL_OFFLINE";

  async initiatePayment(request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    if (!request.transactionId || request.transactionId.trim().length < 3) {
      return {
        success: false,
        requiresRedirect: false,
        status: "FAILED",
        error: "A valid Transaction ID or Bank Reference is required for manual payment verification.",
      };
    }

    return {
      success: true,
      requiresRedirect: false,
      transactionId: request.transactionId.trim().toUpperCase(),
      status: "PENDING",
      message: "Payment reference recorded. It will be credited once verified by the treasurer.",
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerificationResponse> {
    // Manual payments require administrative manual audit
    return {
      verified: false,
      transactionId,
      amount: 0,
      currency: "BDT",
      error: "Manual payments must be audited and approved via the Admin Financial Console.",
    };
  }
}
