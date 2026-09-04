export * from "./types";
export * from "./manualProvider";
export * from "./providers";

import type { PaymentGatewayProvider, PaymentMethod } from "./types";
import { ManualPaymentProvider } from "./manualProvider";
import { BkashPaymentProvider, SSLCommerzPaymentProvider } from "./providers";

export function getPaymentProvider(method: PaymentMethod): PaymentGatewayProvider {
  switch (method) {
    case "BKASH":
      return new BkashPaymentProvider();
    case "SSLCOMMERZ":
      return new SSLCommerzPaymentProvider();
    case "NAGAD":
    case "ROCKET":
    case "BANK_TRANSFER":
    case "MANUAL_CASH":
    default:
      return new ManualPaymentProvider();
  }
}
