import { randomBytes } from "crypto";
import { Router } from "express";
import {
  Env,
  StandardCheckoutClient,
  StandardCheckoutPayRequest,
} from "@phonepe-pg/pg-sdk-node";
import {
  findOrderById,
  getOrderView,
  persistStore,
} from "../data/store.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";

const router = Router();
const PAYMENT_AMOUNT_PAISE = 100;
let phonePeClient;

function getPhonePeClient() {
  const clientId = process.env.PHONEPE_CLIENT_ID;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
  const clientVersion = Number(process.env.PHONEPE_CLIENT_VERSION);

  if (!clientId || !clientSecret || !Number.isInteger(clientVersion) || clientVersion < 1) {
    throw new Error(
      "PhonePe is not configured. Set PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET, and PHONEPE_CLIENT_VERSION."
    );
  }

  if (!phonePeClient) {
    phonePeClient = StandardCheckoutClient.getInstance(
      clientId,
      clientSecret,
      clientVersion,
      Env.PRODUCTION,
      false
    );
  }
  return phonePeClient;
}

function getRedirectUrl(orderId) {
  const configuredUrl = process.env.PHONEPE_REDIRECT_URL;
  if (!configuredUrl) {
    throw new Error("Set PHONEPE_REDIRECT_URL to your public frontend booking route.");
  }

  const redirectUrl = new URL(configuredUrl);
  if (redirectUrl.protocol !== "https:") {
    throw new Error("PHONEPE_REDIRECT_URL must use HTTPS.");
  }
  redirectUrl.pathname = `${redirectUrl.pathname.replace(/\/+$/, "")}/${encodeURIComponent(orderId)}`;
  redirectUrl.searchParams.set("payment", "phonepe");
  return redirectUrl.toString();
}

function getOwnedPhonePeOrder(req, res) {
  const order = findOrderById(req.params.orderId);
  if (!order || order.clientId !== req.user.id) {
    res.status(404).json({ error: "Order not found" });
    return null;
  }
  if (order.paymentMethod !== "phonepe") {
    res.status(400).json({ error: "This booking is not a PhonePe payment" });
    return null;
  }
  return order;
}

function applyProviderStatus(order, status) {
  if (
    status.merchantOrderId &&
    status.merchantOrderId !== order.phonepeMerchantOrderId
  ) {
    throw new Error("PhonePe returned a different merchant order ID");
  }
  if (
    status.state === "COMPLETED" &&
    Number(status.amount) !== PAYMENT_AMOUNT_PAISE
  ) {
    throw new Error("PhonePe confirmed an unexpected payment amount");
  }

  order.phonepeState = status.state;
  if (status.state === "COMPLETED") {
    order.paymentStatus = "paid";
    order.paidAt = new Date().toISOString();
    order.phonepeTransactionId =
      status.paymentDetails?.find((payment) => payment.transactionId)?.transactionId ||
      order.phonepeTransactionId ||
      null;
  } else if (status.state === "FAILED" || status.state === "CANCELLED") {
    order.paymentStatus = "failed";
  } else {
    order.paymentStatus = "pending";
  }
  persistStore();
}

router.use(authMiddleware);

router.post(
  "/phonepe/:orderId",
  requireRole("client"),
  async (req, res) => {
    const order = getOwnedPhonePeOrder(req, res);
    if (!order) return;
    if (order.paymentStatus === "paid") {
      return res.status(409).json({ error: "This booking has already been paid" });
    }

    try {
      const client = getPhonePeClient();
      if (order.phonepeMerchantOrderId) {
        const previousStatus = await client.getOrderStatus(order.phonepeMerchantOrderId);
        applyProviderStatus(order, previousStatus);
        if (previousStatus.state === "COMPLETED") {
          return res.json({ order: getOrderView(order), paid: true });
        }
        if (
          previousStatus.state === "PENDING" &&
          order.phonepeRedirectUrl
        ) {
          return res.json({ checkoutUrl: order.phonepeRedirectUrl });
        }
      }

      const merchantOrderId = `TC${Date.now()}${randomBytes(4).toString("hex")}`;
      const request = StandardCheckoutPayRequest.builder()
        .merchantOrderId(merchantOrderId)
        .amount(PAYMENT_AMOUNT_PAISE)
        .redirectUrl(getRedirectUrl(order.id))
        .message(`TechConnect ${order.service} booking`)
        .build();
      const checkout = await client.pay(request);

      order.phonepeMerchantOrderId = merchantOrderId;
      order.phonepeRedirectUrl = checkout.redirectUrl;
      order.phonepeState = checkout.state || "PENDING";
      order.paymentStatus = "pending";
      persistStore();

      return res.json({ checkoutUrl: checkout.redirectUrl });
    } catch (error) {
      const isConfigurationError =
        error.message.includes("not configured") ||
        error.message.includes("PHONEPE_REDIRECT_URL");
      return res.status(isConfigurationError ? 503 : 502).json({
        error: isConfigurationError
          ? error.message
          : "PhonePe could not start this payment. Please try again.",
      });
    }
  }
);

router.get(
  "/phonepe/:orderId/status",
  requireRole("client"),
  async (req, res) => {
    const order = getOwnedPhonePeOrder(req, res);
    if (!order) return;
    if (!order.phonepeMerchantOrderId) {
      return res.json({ order: getOrderView(order), state: "NOT_STARTED" });
    }

    try {
      const status = await getPhonePeClient().getOrderStatus(
        order.phonepeMerchantOrderId,
        true
      );
      applyProviderStatus(order, status);
      return res.json({ order: getOrderView(order), state: status.state });
    } catch {
      return res.status(502).json({
        error: "Could not verify the PhonePe payment status. Please retry.",
      });
    }
  }
);

export default router;
