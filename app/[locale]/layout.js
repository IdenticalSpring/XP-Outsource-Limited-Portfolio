// app/[locale]/layout.js
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  console.log("Locale in layout:", locale);

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
    console.log("Messages loaded for locale", locale, ":", messages); 
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}