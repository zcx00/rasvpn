async function test() {
  const res = await fetch('https://api.platega.io/v1/payments', {
    method: 'POST',
    headers: {
      'X-API-KEY': 'dummy',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      merchantId: '12345',
      amount: 149,
      currency: 'RUB',
      orderId: 'INV-123456',
      description: `Test`,
      successUrl: `https://test.com`,
      failUrl: `https://test.com`,
    }),
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
