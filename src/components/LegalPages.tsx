import React from 'react';

export const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-10 space-y-6 text-slate-300 font-sans leading-relaxed">
      <h1 className="text-3xl font-bold text-white mb-8">Политика конфиденциальности</h1>
      <p className="text-sm text-slate-500">Обновлено: {new Date().toLocaleDateString('ru-RU')}</p>
      
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cyan-400">1. Общие положения</h2>
        <p>Настоящая Политика конфиденциальности регулирует сбор, использование и защиту информации пользователей сервиса RAS VPN. Использование сервиса означает полное согласие пользователя с настоящей Политикой.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cyan-400">2. Сбор данных</h2>
        <p>Мы собираем минимум данных, необходимых для функционирования сервиса:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Telegram ID (для идентификации пользователя).</li>
          <li>Базовая статистика потребления трафика (количество байт) для контроля лимитов тарифа.</li>
        </ul>
        <p>Мы <strong>не храним</strong>, <strong>не отслеживаем</strong> и <strong>не передаем</strong> историю ваших посещений, логи подключений, IP-адреса сайтов и любые другие личные данные.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cyan-400">3. Использование данных</h2>
        <p>Собранные данные используются исключительно для:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Обеспечения работоспособности подписки.</li>
          <li>Обработки платежей (через безопасные платежные шлюзы, мы не имеем доступа к данным ваших карт).</li>
          <li>Оказания технической поддержки.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cyan-400">4. Безопасность и защита</h2>
        <p>Все соединения защищены современными протоколами шифрования. Доступ к управлению подписками осуществляется только через защищенную сессию Telegram.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cyan-400">5. Контакты</h2>
        <p>По всем вопросам, связанным с Политикой конфиденциальности, обращайтесь в нашу службу поддержки: <a href="https://t.me/rasvpn_manager" className="text-cyan-400 hover:underline">@rasvpn_manager</a></p>
      </section>
    </div>
  );
};

export const TermsOfService = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-10 space-y-6 text-slate-300 font-sans leading-relaxed">
      <h1 className="text-3xl font-bold text-white mb-8">Пользовательское соглашение</h1>
      <p className="text-sm text-slate-500">Обновлено: {new Date().toLocaleDateString('ru-RU')}</p>
      
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cyan-400">1. Предмет соглашения</h2>
        <p>Данное Пользовательское соглашение определяет условия использования сервиса RAS VPN. Оплачивая тариф или используя сервис, вы соглашаетесь с условиями данного документа.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cyan-400">2. Предоставление услуг</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Сервис предоставляет доступ к защищенным серверам для обеспечения безопасности соединения.</li>
          <li>Сервис не несет ответственности за перебои в работе оборудования со стороны дата-центров, однако обязуется оперативно устранять неполадки.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cyan-400">3. Обязанности пользователя</h2>
        <p>Пользователю запрещается:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Использовать сервис для совершения любых действий, нарушающих законодательство.</li>
          <li>Осуществлять DDoS-атаки, рассылку спама (включая email-спам), сканирование портов или распространение вредоносного ПО.</li>
          <li>Передавать свою подписку (ключ) третьим лицам (допускается использование только на личных устройствах пользователя).</li>
        </ul>
        <p>В случае нарушения сервис оставляет за собой право заблокировать подписку без возврата средств.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cyan-400">4. Оплата и возврат средств</h2>
        <p>Услуги оплачиваются авансовым платежом в соответствии с выбранным тарифом. В случае технических проблем на нашей стороне, которые мы не смогли решить в течение 48 часов, мы предоставляем возврат средств за неиспользованный период.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cyan-400">5. Изменение условий</h2>
        <p>Сервис вправе вносить изменения в данное соглашение. Продолжение использования сервиса означает согласие с новой редакцией.</p>
      </section>
      
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cyan-400">6. Контакты поддержки</h2>
        <p>Если у вас возникли вопросы или проблемы, свяжитесь с нами: <a href="https://t.me/rasvpn_manager" className="text-cyan-400 hover:underline">@rasvpn_manager</a></p>
      </section>
    </div>
  );
};
