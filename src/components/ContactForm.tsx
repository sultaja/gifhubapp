import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { createContactSubmission } from "@/services/api";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  company: z.string().optional(),
  project_details: z.string().min(10, "Please provide some details about your project.").optional(),
  budget_range: z.string().optional(),
});

const ContactForm = () => {
  const { t } = useTranslation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      project_details: "",
      budget_range: "",
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    loadingToastId = showLoading(t('contact_page.form.toast_sending'));
    mutation.mutate(values);
  };

  const budgetRanges = [
    "$5,000 - $10,000",
    "$10,000 - $20,000",
    "$20,000 - $50,000",
    "$50,000+",
  ];

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
        <FormField control={form.control} name="company" render={({ field }) => (
          <FormItem>
            <FormLabel>{t('contact_page.form.company')}</FormLabel>
            <FormControl><Input placeholder={t('contact_page.form.company_placeholder')} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="project_details" render={({ field }) => (
          <FormItem>
            <FormLabel>{t('contact_page.form.details')}</FormLabel>
            <FormControl><Textarea placeholder={t('contact_page.form.details_placeholder')} {...field} rows={5} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="budget_range" render={({ field }) => (
          <FormItem>
            <FormLabel>{t('contact_page.form.budget')}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('contact_page.form.budget_placeholder')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {budgetRanges.map(range => (
                  <SelectItem key={range} value={range}>{range}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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