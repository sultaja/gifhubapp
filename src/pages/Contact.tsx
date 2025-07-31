import ContactForm from '@/components/ContactForm';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();
  return (
    <div className="container max-w-4xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('contact_page.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('contact_page.subtitle')}</p>
      </div>
      <ContactForm />
    </div>
  );
};

export default Contact;