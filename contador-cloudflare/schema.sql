-- A tabela dos totais. Uma linha por combinacao de pais, nussach, tipo, lingua
-- e dia. Nao ha coluna de pessoa, de aparelho nem de IP: nao existe o que vazar.
CREATE TABLE IF NOT EXISTS contagem (
  pais    TEXT    NOT NULL,
  nussach TEXT    NOT NULL,
  tipo    TEXT    NOT NULL,
  lingua  TEXT    NOT NULL,
  dia     TEXT    NOT NULL,          -- AAAA-MM-DD, sem hora, de proposito
  n       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (pais, nussach, tipo, lingua, dia)
);

-- A tabela das cidades, e ela e SEPARADA por um motivo de privacidade, nao de
-- arrumacao. Repare no que NAO tem aqui: dia.
--
-- "Cidade X, dia 15/09, 1 Kadish" e quase um nome numa cidade pequena: quem
-- sabe que alguem daquela comunidade esta de luto fecha a conta sozinho. Sem o
-- dia, a mesma linha diz apenas "ja rezaram daqui" — que e o que ele quis ver,
-- e nada mais. Por isso tambem nao ha nussach nem lingua aqui: cruzar tres
-- coisas numa cidade pequena volta a apontar para uma pessoa.
--
-- A cidade vem do proprio Cloudflare (request.cf.city). Quando ele nao souber,
-- a linha simplesmente nao entra.
CREATE TABLE IF NOT EXISTS cidades (
  pais   TEXT    NOT NULL,
  cidade TEXT    NOT NULL,
  n      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (pais, cidade)
);
