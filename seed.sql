-- seed categories
INSERT INTO categories (name) VALUES ('funnyJoke') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name) VALUES ('lameJoke')  ON CONFLICT (name) DO NOTHING;

-- funnyJoke
WITH cat AS (SELECT id FROM categories WHERE name='funnyJoke')
INSERT INTO jokes (category_id, setup, delivery)
SELECT cat.id, v.setup, v.delivery
FROM cat, (VALUES
  ('Why did the student eat his homework?','Because the teacher told him it was a piece of cake!'),
  ('What kind of tree fits in your hand?','A palm tree'),
  ('What is worse than raining cats and dogs?','Hailing taxis')
) AS v(setup, delivery);

-- lameJoke
WITH cat AS (SELECT id FROM categories WHERE name='lameJoke')
INSERT INTO jokes (category_id, setup, delivery)
SELECT cat.id, v.setup, v.delivery
FROM cat, (VALUES
  ('Which bear is the most condescending?','Pan-DUH'),
  ('What would the Terminator be called in his retirement?','The Exterminator')
) AS v(setup, delivery);
