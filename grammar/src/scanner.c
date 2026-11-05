#include "tree_sitter/parser.h"

#include <stdbool.h>

enum TokenType {
  BLOCK_COMMENT,
  LONG_STRING,
};

void *tree_sitter_nebra_external_scanner_create(void) { return NULL; }

void tree_sitter_nebra_external_scanner_destroy(void *payload) {}

unsigned tree_sitter_nebra_external_scanner_serialize(void *payload, char *buffer) { return 0; }

void tree_sitter_nebra_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {}

static void advance(TSLexer *lexer) { lexer->advance(lexer, false); }

static void skip(TSLexer *lexer) { lexer->advance(lexer, true); }

/**
 * Reads the opening long bracket `[`, any number of `=` and `[`, the `[` already consumed, and
 * returns its level, or -1 when the text is no long bracket.
 */
static int open_level(TSLexer *lexer) {
  int level = 0;
  while (lexer->lookahead == '=') {
    level++;
    advance(lexer);
  }

  if (lexer->lookahead != '[') return -1;
  advance(lexer);
  return level;
}

/** Reads up to and including the closing long bracket of `level`; false at the end of the file. */
static bool read_until_close(TSLexer *lexer, int level) {
  while (!lexer->eof(lexer)) {
    if (lexer->lookahead != ']') {
      advance(lexer);
      continue;
    }

    advance(lexer);
    int equals = 0;
    while (lexer->lookahead == '=') {
      equals++;
      advance(lexer);
    }

    if (equals == level && lexer->lookahead == ']') {
      advance(lexer);
      return true;
    }
  }

  return false;
}

bool tree_sitter_nebra_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
  while (lexer->lookahead == ' ' || lexer->lookahead == '\t' || lexer->lookahead == '\r' || lexer->lookahead == '\n') {
    skip(lexer);
  }

  if (valid_symbols[BLOCK_COMMENT] && lexer->lookahead == '-') {
    advance(lexer);
    if (lexer->lookahead != '-') return false;
    advance(lexer);
    if (lexer->lookahead != '[') return false;
    advance(lexer);

    int level = open_level(lexer);
    if (level < 0) return false;

    read_until_close(lexer, level);
    lexer->result_symbol = BLOCK_COMMENT;
    return true;
  }

  if (valid_symbols[LONG_STRING] && lexer->lookahead == '[') {
    advance(lexer);
    int level = open_level(lexer);
    if (level < 0) return false;

    read_until_close(lexer, level);
    lexer->result_symbol = LONG_STRING;
    return true;
  }

  return false;
}
