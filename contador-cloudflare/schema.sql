-- A unica tabela. Uma linha por combinacao de pais, nussach, tipo, lingua e dia.
-- Nao ha coluna de pessoa, de aparelho nem de IP: nao existe o que vazar.
CREATE TABLE IF NOT EXISTS contagem (
  pais    TEXT    NOT NULL,
  nussach TEXT    NOT NULL,
  tipo    TEXT    NOT NULL,
  lingua  TEXT    NOT NULL,
  dia     TEXT    NOT NULL,          -- AAAA-MM-DD, sem hora, de proposito
  n       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (pais, nussach, tipo, lingua, dia)
);
