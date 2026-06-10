
-- ============= programme_sections =============
CREATE TABLE public.programme_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  title text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programme_sections TO anon, authenticated;
GRANT ALL ON public.programme_sections TO service_role;
ALTER TABLE public.programme_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read programme_sections" ON public.programme_sections FOR SELECT USING (true);
CREATE TRIGGER programme_sections_touch BEFORE UPDATE ON public.programme_sections FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============= programme_functionaries =============
CREATE TABLE public.programme_functionaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_key text NOT NULL, -- ministers | counsellors | protocol
  name text NOT NULL,
  affiliation text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programme_functionaries TO anon, authenticated;
GRANT ALL ON public.programme_functionaries TO service_role;
ALTER TABLE public.programme_functionaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read programme_functionaries" ON public.programme_functionaries FOR SELECT USING (true);
CREATE TRIGGER programme_functionaries_touch BEFORE UPDATE ON public.programme_functionaries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============= programme_order_of_service =============
CREATE TABLE public.programme_order_of_service (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item text NOT NULL,
  led_by text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programme_order_of_service TO anon, authenticated;
GRANT ALL ON public.programme_order_of_service TO service_role;
ALTER TABLE public.programme_order_of_service ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read programme_order_of_service" ON public.programme_order_of_service FOR SELECT USING (true);
CREATE TRIGGER programme_oos_touch BEFORE UPDATE ON public.programme_order_of_service FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============= programme_hymns =============
CREATE TABLE public.programme_hymns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  reference text,
  author text,
  lyrics text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programme_hymns TO anon, authenticated;
GRANT ALL ON public.programme_hymns TO service_role;
ALTER TABLE public.programme_hymns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read programme_hymns" ON public.programme_hymns FOR SELECT USING (true);
CREATE TRIGGER programme_hymns_touch BEFORE UPDATE ON public.programme_hymns FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============= programme_photography =============
CREATE TABLE public.programme_photography (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL, -- order | exclusives
  label text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programme_photography TO anon, authenticated;
GRANT ALL ON public.programme_photography TO service_role;
ALTER TABLE public.programme_photography ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read programme_photography" ON public.programme_photography FOR SELECT USING (true);
CREATE TRIGGER programme_photography_touch BEFORE UPDATE ON public.programme_photography FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============= programme_credits =============
CREATE TABLE public.programme_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  name text NOT NULL,
  phone text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programme_credits TO anon, authenticated;
GRANT ALL ON public.programme_credits TO service_role;
ALTER TABLE public.programme_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read programme_credits" ON public.programme_credits FOR SELECT USING (true);
CREATE TRIGGER programme_credits_touch BEFORE UPDATE ON public.programme_credits FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============= programme_thank_you (single-row) =============
CREATE TABLE public.programme_thank_you (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body text NOT NULL DEFAULT '',
  verse_reference text,
  verse_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programme_thank_you TO anon, authenticated;
GRANT ALL ON public.programme_thank_you TO service_role;
ALTER TABLE public.programme_thank_you ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read programme_thank_you" ON public.programme_thank_you FOR SELECT USING (true);
CREATE TRIGGER programme_thank_you_touch BEFORE UPDATE ON public.programme_thank_you FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============= SEED =============
INSERT INTO public.programme_sections (key, title, order_index) VALUES
  ('cover','Cover',0),
  ('order_of_service','Order of Service',1),
  ('functionaries','Functionaries',2),
  ('hymns','Hymns',3),
  ('photography','Order of Photography',4),
  ('exclusives','Exclusives',5),
  ('credits','Credits',6),
  ('thank_you','Thank You',7);

INSERT INTO public.programme_functionaries (group_key, name, affiliation, order_index) VALUES
  ('ministers','Pastor Gilbert John Ayamah','Church of Pentecost',0),
  ('ministers','Pastor Richmond Boakye','Church of Pentecost',1),
  ('ministers','Rev. Bismarck Laryea','Assemblies of God Church',2),
  ('ministers','Rev. Moses Asamoah Larbi','Assemblies of God Church',3),
  ('ministers','Rev. Fr. Bernard Asomaning Menu','St. Charles Borromeo Catholic Church, Oyibe',4),
  ('counsellors','Elder Emmanuel Mintah',NULL,0),
  ('counsellors','Elder Jacob Aboah',NULL,1),
  ('counsellors','Deaconess Helina Amoako',NULL,2),
  ('counsellors','Elder Daniel K. Adams',NULL,3),
  ('counsellors','Elder Michael Fosu',NULL,4),
  ('counsellors','Elder Michael Quaye',NULL,5),
  ('counsellors','Mrs. Ama Quaye',NULL,6),
  ('counsellors','Mr. Julius Beyou',NULL,7),
  ('protocol','Mr. Isaac Teye-Doryumu',NULL,0),
  ('protocol','Miss Edwina Kotey',NULL,1),
  ('protocol','Mr. Robert Kwamin',NULL,2),
  ('protocol','Mr. Emmanuel Antwi',NULL,3);

INSERT INTO public.programme_order_of_service (item, led_by, order_index) VALUES
  ('Opening Prayer','Deaconess Joycelyn Ansah',0),
  ('Praises','Echoes of Praise',1),
  ('Bridal Procession','Dem Dem',2),
  ('Hymn','There Shall Be Showers of Blessings',3),
  ('Call to Worship','Echoes of Praise',4),
  ('Scripture Reading','Bro. Robert Kwamin',5),
  ('Exchange of Vows','Ps. Gilbert Ayamah',6),
  ('Blessing of Marriage','Ps. Gilbert Ayamah',7),
  ('Signing of Marriage Certificate',NULL,8),
  ('Ministrations','Echoes of Praise / Deaconess Joycelyn Ansah',9),
  ('Sermon','Ps. John Gilbert Ayamah',10),
  ('Offertory','Conductor',11),
  ('Presentation of Marriage Certificate',NULL,12),
  ('Couple''s Response',NULL,13),
  ('Announcement',NULL,14),
  ('Closing Prayer',NULL,15),
  ('Benediction',NULL,16),
  ('Conductor','Elder George Amartefio',17);

INSERT INTO public.programme_hymns (title, reference, author, lyrics, order_index) VALUES
  ('Dɛm Da N''','(PSB-T 133), PAN (F) 603',NULL,
E'Dɛm da n'', dɛm ara n'' ɔbɛyɛ\nDɛm da n'', dɛm ara n'' ɔbɛyɛ\nSunsum bɔhwehwɛ\nNa ɔafa N'' ayefor\nN'' ɔdze no akɛma ayefor-kun',0),
  ('There Shall Be Showers of Blessings',NULL,'D. W. Whittle',
E'There shall be showers of blessing:\nThis is the promise of love;\nThere shall be seasons refreshing,\nSent from the Savior above.\n\nRefrain:\nShowers of blessing,\nShowers of blessing we need:\nMercy-drops round us are falling,\nBut for the showers we plead.\n\n2. There shall be showers of blessing,\nPrecious reviving again;\nOver the hills and the valleys,\nSound of abundance of rain. [Refrain]\n\n3. There shall be showers of blessing:\nSend them upon us, O Lord;\nGrant to us now a refreshing,\nCome and now honor Thy Word. [Refrain]\n\n4. There shall be showers of blessing:\nOh, that today they might fall,\nNow as to God we''re confessing,\nNow as on Jesus we call! [Refrain]',1);

INSERT INTO public.programme_photography (category, label, order_index) VALUES
  ('order','Officiating Ministers with Couple',0),
  ('order','Marriage Counsellors',1),
  ('order','Groom''s Parents',2),
  ('order','Bride''s Parents',3),
  ('order','Both Parents (Bride & Groom)',4),
  ('order','Groom''s Siblings',5),
  ('order','Bride''s Siblings',6),
  ('order','Family of the Groom',7),
  ('order','Family of the Bride',8),
  ('order','Upperroom Assembly',9),
  ('order','Knights of St. John International 1003',10),
  ('order','Knights of St. John Int. Ladies Auxiliary',11),
  ('order','All KSJI Members Present',12),
  ('order','Nyankpala Assembly',13),
  ('order','New Akrofrom Assembly',14),
  ('order','Staff of Ghana Highway Authority',15),
  ('order','Friends of the Groom',16),
  ('order','Friends of the Bride',17),
  ('order','Agya C.K Gyamfi',18),
  ('exclusives','Bride Party',0),
  ('exclusives','Groom and Bride Only',1),
  ('exclusives','Groom and Best Men',2),
  ('exclusives','Groom and Ladies of Honor',3),
  ('exclusives','Groom and Best Man',4),
  ('exclusives','Groom and Lady of Honor',5),
  ('exclusives','Bride and Best Men',6),
  ('exclusives','Bride and Ladies of Honor',7),
  ('exclusives','Bride and Best Man',8),
  ('exclusives','Bride and Lady of Honor',9),
  ('exclusives','Bride Only',10),
  ('exclusives','Groom Only',11);

INSERT INTO public.programme_credits (role, name, phone, order_index) VALUES
  ('Best Man','Mr. Godwin Anafo Apullah',NULL,0),
  ('Lady of Honour','Miss Emma Ewuraesi Otoo',NULL,1),
  ('Brides Maid','Ms Abigail Naa Lamiley Otoo',NULL,2),
  ('Brides Maid','Ms Gifty Kezia Otoo',NULL,3),
  ('Brides Maid','Ms Wendy Sackey',NULL,4),
  ('Brides Maid','Ms Alexandra Darko',NULL,5),
  ('Brides Maid','Ms Eleanor Fynn Garbrah',NULL,6),
  ('Little Bride','Kezia Korang Boakye',NULL,7),
  ('Photography/Videography','Gigabyte Media Services','0244029622',8),
  ('Make-Up','Abi''s Signature','0246334271',9),
  ('Decor','E.O. Decor',NULL,10),
  ('Gift Table','Mr. Emmanuel Benjamin',NULL,11),
  ('Gift Table','Miss Millicent Apullah',NULL,12);

INSERT INTO public.programme_thank_you (body, verse_reference, verse_text) VALUES (
E'With hearts full of gratitude and joy, we sincerely thank everyone who joined us in celebrating our Marriage Ceremony.\n\nYour presence, prayers, love, blessings, gifts, and good wishes made our special day truly memorable. We are deeply grateful to our families, friends, colleagues, church members, and all loved ones who traveled near and far to share in this beautiful moment with us.\n\nMay God richly bless each of you for being part of our celebration and for the love you continue to show us.',
'Jeremiah 17:7',
'But blessed is the one who trusts in the LORD, whose confidence is in him.'
);
