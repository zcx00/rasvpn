const link = "vless://0ecfa522-3788-4db9-8d14-38c3be992c68@89.22.225.206:443?type=tcp&security=reality&pbk=J1h4pED5U_wN5tFzJ9g59Fm2t9oNfBqZ4q_6Y&fp=chrome&sni=yahoo.com&sid=e5917424&spx=%2F#VLESS%20REALITY";
const newLink = link.replace(/#.*$/, '#DE-1');
console.log(newLink);
