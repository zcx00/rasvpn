import crypto from 'crypto';
async function test() {
  const invoiceId = crypto.randomUUID();
  const res = await fetch('https://app.platega.io/v2/transaction/process', {
    method: 'POST',
    headers: {
      'X-MerchantId': '2b4657e8-0b0c-45c1-aa8c-886439001ac2',
      'X-Secret': 'dummy',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentDetails: {
          amount: 149,
          currency: 'RUB'
      },
      description: `Подписка RAS VPN`,
      return: `https://ais.run.app/?payment=success`,
      failedUrl: `https://ais.run.app/?payment=failed`,
      payload: invoiceId,
    }),
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
