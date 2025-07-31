import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { createContactSubmission } from "@/services/api";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

type FormValues = z.infer<typeof formSchema>;

const ContactForm = () => {
  const { t } = useTranslation();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  let loadingToastId: string | number;

  const mutation = useMutation({
    mutationFn: createContactSubmission,
    onSuccess: () => {
      dismissToast(loadingToastId);
      showSuccess(t('contact_page.form.toast_success'));
      form.reset();
    },
    onError: (error: Error) => {
      dismissToast(loadingToastId);
      showError(error.message);
    },
  });

  const onSubmit = (values: FormValues) => {
    loadingToastId = showLoading(t('contact_page.form.toast_sending'));
    const submissionData = {
      name: values.name,
      email: values.email,
      project_details: values.message, // Map message to project_details
    };
    mutation.mutate(submissionData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>{t('contact_page.form.name')}</FormLabel>
              <FormControl><Input placeholder={t('contact_page.form.name_placeholder')} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>{t('contact_page.form.email')}</FormLabel>
              <FormControl><Input placeholder={t('contact_page.form.email_placeholder')} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="message" render={({ field }) => (
          <FormItem>
            <FormLabel>{t('contact_page.form.message')}</FormLabel>
            <FormControl><Textarea placeholder={t('contact_page.form.message_placeholder')} {...field} rows={5} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? t('contact_page.form.sending') : t('contact_page.form.send_button')}
        </Button>
      </form>
    </Form>
  );
};

export default ContactForm;