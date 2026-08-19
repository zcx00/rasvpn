import crypto from 'crypto';
async function test() {
  const res = await fetch('https://app.platega.io/transaction/process', {
    method: 'POST',
    headers: {
      'X-MerchantId': '2b4657e8-0b0c-45c1-aa8c-886439001ac2',
      'X-Secret': 'dummy',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentMethod: 1,
      id: crypto.randomUUID(),
      paymentDetails: {
          amount: 100,
          currency: 'RUB'
      },
      description: `Подписка`,
      returnUrl: `https://test.com/success`,
      failedUrl: `https://test.com/failed`,
    }),
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
