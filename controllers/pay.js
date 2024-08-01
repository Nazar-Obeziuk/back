const LiqPay = require("../lib/liqpay");

const liqpay = new LiqPay(
  "sandbox_i92883785959",
  "sandbox_Q3JbH8QzJ07YoaIdnmV6cRxhYC7pFJwFWuxTTHcY"
);

const generateUniqueOrderId = () => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.]/g, ""); // Remove special characters
  const randomPart = Math.floor(Math.random() * 10000); // Generate a random number
  return `order_${timestamp}_${randomPart}`;
};

exports.getPaymentLink = (req, res) => {
  const { amount, language, description } = req.body;

  const params = {
    version: 3,
    action: "pay",
    amount: amount,
    currency: "UAH",
    description: description,
    order_id: generateUniqueOrderId(),
    language: language || "uk",
  };
  const link = liqpay.cnb_link(params);
  res.send({ link });
};
