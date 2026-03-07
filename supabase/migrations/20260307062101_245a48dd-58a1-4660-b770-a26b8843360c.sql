DROP POLICY "Allow all access to contacts" ON public.contacts;
CREATE POLICY "Allow all access to contacts" ON public.contacts FOR ALL USING (true) WITH CHECK (true);