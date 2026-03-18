import Razorpay from "razorpay";

// razorpay package uses module.exports, so default import may resolve differently
const RazorpayConstructor = (Razorpay as any).default || Razorpay;

export const razorpay = new RazorpayConstructor({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
