import crypto from 'crypto';
async function test() {
  const res = await fetch('https://app.platega.io/transaction/process', {
    method: 'POST',
    headers: {
      'X-MerchantId': '123',
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
      description: `Подписка RAS VPN`,
      return: `https://test.com/?payment=success`,
      returnUrl: `https://test.com/?payment=success`,
      failedUrl: `https://test.com/?payment=failed`,
      payload: `invoice=123`
    }),
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
