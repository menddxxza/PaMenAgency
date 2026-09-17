-- Bug encontrado (la causa real de "la nota se queda vacía al reabrirla",
-- perseguida durante toda esta sesión): varias consultas escribían
-- ${JSON.stringify(x)}::jsonb en vez de ${sql.json(x)}. postgres.js, al ver
-- que el parámetro se manda como tipo jsonb (por el cast ::jsonb), lo
-- serializa con JSON.stringify() él solo — así que stringify-ar el valor a
-- mano ANTES de pasarlo lo codificaba dos veces. El resultado quedaba en la
-- base de datos como un string de jsonb que contiene el TEXTO de un array
-- ("[{\"id\":...}]"), no el array en sí. comoBloques() (que exige
-- Array.isArray) trataba eso exactamente igual que una nota vacía, sin
-- ningún error visible ni en consola ni en el guardado — el título se leía
-- bien (columna de texto normal, ajena a esto) pero el cuerpo no.
--
-- duplicarNota() tenía el mismo fallo leyendo datos que podían venir ya
-- envueltos, así que una nota duplicada más de una vez puede tener varias
-- capas de envoltura — de ahí el bucle "hasta que ya no sea un string",
-- con un tope de 10 vueltas por seguridad.
--
-- Repara los datos ya guardados; el código que los escribía se ha
-- corregido aparte (ver notas/actions.ts, estudio/actions.ts, entrar/actions.ts).

do $$
declare
  vueltas int;
begin
  vueltas := 0;
  while exists (select 1 from notes where jsonb_typeof(content) = 'string') and vueltas < 10 loop
    update notes set content = (content #>> '{}')::jsonb where jsonb_typeof(content) = 'string';
    vueltas := vueltas + 1;
  end loop;

  vueltas := 0;
  while exists (select 1 from notes where jsonb_typeof(content_anterior) = 'string') and vueltas < 10 loop
    update notes set content_anterior = (content_anterior #>> '{}')::jsonb where jsonb_typeof(content_anterior) = 'string';
    vueltas := vueltas + 1;
  end loop;

  vueltas := 0;
  while exists (select 1 from notes where jsonb_typeof(debug_bloques) = 'string') and vueltas < 10 loop
    update notes set debug_bloques = (debug_bloques #>> '{}')::jsonb where jsonb_typeof(debug_bloques) = 'string';
    vueltas := vueltas + 1;
  end loop;

  vueltas := 0;
  while exists (select 1 from examenes where jsonb_typeof(preguntas) = 'string') and vueltas < 10 loop
    update examenes set preguntas = (preguntas #>> '{}')::jsonb where jsonb_typeof(preguntas) = 'string';
    vueltas := vueltas + 1;
  end loop;

  vueltas := 0;
  while exists (select 1 from intentos_examen where jsonb_typeof(respuestas) = 'string') and vueltas < 10 loop
    update intentos_examen set respuestas = (respuestas #>> '{}')::jsonb where jsonb_typeof(respuestas) = 'string';
    vueltas := vueltas + 1;
  end loop;
end $$;
