/**
 * @file Nebra grammar for tree-sitter
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  OR: 1,
  NIL_COALESCE: 2,
  AND: 3,
  COMPARE: 4,
  INSTANCEOF: 5,
  CAST: 6,
  BIT_OR: 7,
  BIT_XOR: 8,
  BIT_AND: 9,
  SHIFT: 10,
  CONCAT: 11,
  ADD: 12,
  MUL: 13,
  UNARY: 14,
  POWER: 15,
  POSTFIX: 16,
  CALL: 17,
};

const commaSep1 = (rule) => seq(rule, repeat(seq(',', rule)));
const commaSep = (rule) => optional(commaSep1(rule));
const trailingCommaSep1 = (rule) => seq(commaSep1(rule), optional(','));

module.exports = grammar({
  name: 'nebra',

  word: ($) => $.identifier,

  externals: ($) => [$.block_comment, $._long_string],

  extras: ($) => [/\s/, $.comment, $.block_comment],

  supertypes: ($) => [$.statement, $.expression],

  conflicts: ($) => [
    [$._default_method_body, $.function_signature],
    [$.type_parameter],
    [$.binding_pattern, $.variable],
    [$.catch_clause, $.variable],
    [$.binary_expression],
    [$._type, $.union_type],
    [$._type_atom, $.generic_type],
    [$.defer_statement, $._prefix_expression],
    [$.call_statement, $._prefix_expression],
    [$._prefix_expression, $.function_call],
    [$.variable, $._prefix_expression],
    [$.parenthesized_type, $.function_type],
    [$._type_atom, $.function_type],
    [$.field_declaration, $.accessor_declaration],
    [$.declare_field, $.declare_accessor],
    [$.interface_method, $.interface_default_method],
    [$.match_arm],
    [$.import_statement],
    [$.class_declaration],
    [$.declare_class],
    [$.try_statement],
    [$.local_name],
    [$.function_signature, $.function_body],
  ],

  rules: {
    source_file: ($) => seq(optional($.shebang), optional($.block)),

    shebang: (_) => token(seq('#!', /.*/)),

    block: ($) => choice(seq(repeat1($.statement), optional($.return_statement)), $.return_statement),

    statement: ($) =>
      choice(
        $.empty_statement,
        $.assignment_statement,
        $.call_statement,
        $.label_statement,
        $.break_statement,
        $.continue_statement,
        $.goto_statement,
        $.defer_statement,
        $.guard_statement,
        $.try_statement,
        $.do_statement,
        $.while_statement,
        $.repeat_statement,
        $.if_statement,
        $.for_numeric_statement,
        $.for_generic_statement,
        $.function_declaration,
        $.local_function_declaration,
        $.local_declaration,
        $.enum_declaration,
        $.import_statement,
        $.export_statement,
        $.declare_statement,
        $.match_statement,
        $.class_declaration,
        $.interface_declaration,
        $.extend_declaration,
        $.annotation,
      ),

    empty_statement: (_) => ';',

    assignment_statement: ($) =>
      seq(field('targets', commaSep1($.variable)), '=', field('values', commaSep1($.expression))),

    call_statement: ($) => choice($.function_call, $.new_expression, $.await_expression, $.update_expression),

    label_statement: ($) => seq('::', $.identifier, '::'),

    break_statement: ($) => prec.right(seq('break', optional($.number))),

    continue_statement: (_) => 'continue',

    goto_statement: ($) => seq('goto', $.identifier),

    defer_statement: ($) => seq('defer', choice($.function_call, $.do_statement)),

    guard_statement: ($) => prec.right(seq('guard', field('condition', $.expression), optional(seq('else', $.expression)))),

    try_statement: ($) =>
      seq(
        'try',
        optional(field('body', $.block)),
        optional($.catch_clause),
        optional($.finally_clause),
        'end',
      ),

    catch_clause: ($) =>
      seq('catch', optional(seq('(', field('error', $.identifier), ')')), optional(field('body', $.block))),

    finally_clause: ($) => seq('finally', optional(field('body', $.block))),

    do_statement: ($) => seq('do', optional(field('body', $.block)), 'end'),

    while_statement: ($) => seq('while', field('condition', $.expression), 'do', optional(field('body', $.block)), 'end'),

    repeat_statement: ($) => seq('repeat', optional(field('body', $.block)), 'until', field('condition', $.expression)),

    if_statement: ($) =>
      seq(
        'if',
        field('condition', $.expression),
        'then',
        optional(field('consequence', $.block)),
        repeat($.elseif_clause),
        optional($.else_clause),
        'end',
      ),

    elseif_clause: ($) =>
      seq('elseif', field('condition', $.expression), 'then', optional(field('consequence', $.block))),

    else_clause: ($) => seq('else', optional(field('body', $.block))),

    for_numeric_statement: ($) =>
      seq(
        'for',
        field('name', $.identifier),
        '=',
        field('start', $.expression),
        ',',
        field('end', $.expression),
        optional(seq(',', field('step', $.expression))),
        'do',
        optional(field('body', $.block)),
        'end',
      ),

    for_generic_statement: ($) =>
      seq(
        'for',
        field('names', commaSep1($.identifier)),
        'in',
        field('values', commaSep1($.expression)),
        'do',
        optional(field('body', $.block)),
        'end',
      ),

    return_statement: ($) => prec.right(seq('return', optional(commaSep1($.expression)), optional(';'))),

    function_declaration: ($) =>
      seq(optional('async'), 'function', field('name', $.function_name), field('body', $.function_body)),

    local_function_declaration: ($) =>
      seq('local', optional('async'), 'function', field('name', $.identifier), field('body', $.function_body)),

    function_name: ($) =>
      seq(
        field('base', $.identifier),
        repeat(seq('.', field('field', $._member_name))),
        optional(seq(':', field('method', $._member_name))),
      ),

    local_declaration: ($) =>
      prec.right(
        seq(
          'local',
          optional('mut'),
          field('names', commaSep1($.local_name)),
          optional(seq('=', field('values', commaSep1($.expression)))),
        ),
      ),

    local_name: ($) => seq(field('name', $.identifier), optional($.attribute), optional($.type_annotation)),

    attribute: ($) => seq('<', $.identifier, '>'),

    annotation: ($) =>
      prec.right(seq('@', field('name', $.identifier), optional(seq('(', optional(trailingCommaSep1($.annotation_argument)), ')')))),

    annotation_argument: ($) => choice(seq(field('name', $.identifier), '=', field('value', $.expression)), $.expression),

    import_statement: ($) =>
      choice(
        seq(
          'import',
          optional(field('modifier', $.identifier)),
          choice($.import_names, field('default', $.identifier), seq('*', 'as', field('namespace', $.identifier))),
          field('from', $.identifier),
          field('source', $.string),
        ),
        seq('import', field('source', $.string)),
      ),

    import_names: ($) => seq('{', optional(trailingCommaSep1($.import_name)), '}'),

    import_name: ($) => seq(field('name', $.identifier), optional(seq('as', field('alias', $.identifier)))),

    export_statement: ($) =>
      choice(
        seq(
          'export',
          choice(
            $.function_declaration,
            $.local_function_declaration,
            $.local_declaration,
            $.enum_declaration,
            $.class_declaration,
            $.interface_declaration,
            $.extend_declaration,
          ),
        ),
        seq('export', $.import_names, field('from', $.identifier), field('source', $.string)),
      ),

    enum_declaration: ($) => seq('enum', field('name', $.identifier), repeat1(choice($.annotation, $.enum_member)), 'end'),

    enum_member: ($) =>
      prec.right(seq(field('name', $.identifier), optional($.type_annotation), optional(seq('=', field('value', $.expression))))),

    class_declaration: ($) =>
      seq(
        optional('abstract'),
        optional(field('modifier', $.identifier)),
        'class',
        field('name', $.identifier),
        optional(field('type_parameters', $.type_parameters)),
        optional(seq('extends', field('superclass', $.class_reference))),
        optional(seq('implements', commaSep1(field('interface', $.class_reference)))),
        repeat($._class_member),
        'end',
      ),

    class_reference: ($) => seq(alias($.identifier, $.type_identifier), optional($.type_arguments)),

    _class_member: ($) =>
      choice(
        $.annotation,
        $.field_declaration,
        $.method_declaration,
        $.abstract_method_declaration,
        $.constructor_declaration,
        $.operator_declaration,
        $.accessor_declaration,
      ),

    _visibility: (_) => choice('local', 'protected'),

    field_declaration: ($) =>
      prec.right(
        seq(
          optional($._visibility),
          optional('static'),
          field('name', $.identifier),
          optional($.type_annotation),
          optional(seq('=', field('value', $.expression))),
        ),
      ),

    method_declaration: ($) =>
      seq(
        optional($._visibility),
        optional('static'),
        optional('override'),
        optional('async'),
        'function',
        field('name', $._member_name),
        field('body', $.function_body),
      ),

    abstract_method_declaration: ($) =>
      seq(
        optional('protected'),
        'abstract',
        optional('async'),
        'function',
        field('name', $._member_name),
        field('signature', $.function_signature),
      ),

    constructor_declaration: ($) => seq(optional('local'), 'constructor', field('body', $.function_body)),

    operator_declaration: ($) =>
      seq(field('keyword', $.identifier), field('operator', $.operator_symbol), field('body', $.function_body)),

    accessor_declaration: ($) =>
      seq(optional('override'), field('kind', $.identifier), field('name', $._member_name), field('body', $.function_body)),

    operator_symbol: (_) =>
      choice('+', '-', '*', '/', '//', '%', '^', '..', '==', '<', '<=', '#', '&', '|', '~', '<<', seq('>', '>'), seq('[', ']', '='), seq('[', ']'), seq('(', ')')),

    interface_declaration: ($) =>
      seq(
        'interface',
        field('name', $.identifier),
        optional(field('type_parameters', $.type_parameters)),
        optional(seq('extends', commaSep1(field('interface', $.class_reference)))),
        repeat($._interface_member),
        'end',
      ),

    _interface_member: ($) => choice($.annotation, $.interface_field, $.interface_method, $.interface_default_method),

    interface_field: ($) => seq(field('name', $._field_name), $.type_annotation),

    interface_method: ($) =>
      seq(optional('async'), field('kind', $._method_kind), field('name', $._member_name), field('signature', $.function_signature)),

    interface_default_method: ($) =>
      seq(optional('async'), field('kind', $._method_kind), field('name', $._member_name), field('body', alias($._default_method_body, $.function_body))),

    _default_method_body: ($) =>
      seq(
        optional(field('type_parameters', $.type_parameters)),
        field('parameters', $.parameters),
        optional(field('return_type', $._return_type)),
        field('body', alias($._method_block, $.block)),
        'end',
      ),

    _method_block: ($) =>
      choice(seq(repeat1($._method_statement), optional($.return_statement)), $.return_statement),

    _method_statement: ($) =>
      choice(
        $.empty_statement,
        $.assignment_statement,
        $.call_statement,
        $.label_statement,
        $.break_statement,
        $.continue_statement,
        $.goto_statement,
        $.defer_statement,
        $.guard_statement,
        $.try_statement,
        $.do_statement,
        $.while_statement,
        $.repeat_statement,
        $.if_statement,
        $.for_numeric_statement,
        $.for_generic_statement,
        $.local_function_declaration,
        $.local_declaration,
        $.match_statement,
      ),

    _method_kind: ($) => choice('function', $.identifier),

    extend_declaration: ($) => seq('extend', field('type', $._type), repeat($._extend_member), 'end'),

    _extend_member: ($) => choice($.annotation, $.method_declaration, $.operator_declaration, $.accessor_declaration),

    match_statement: ($) => seq('match', field('value', $.expression), repeat1($.match_arm), 'end'),

    match_expression: ($) => seq('match', field('value', $.expression), repeat1($.match_expression_arm), 'end'),

    match_arm: ($) =>
      seq('case', field('pattern', $._pattern), optional(seq('when', field('guard', $.expression))), 'then', optional(field('body', $.block))),

    match_expression_arm: ($) =>
      seq('case', field('pattern', $._pattern), optional(seq('when', field('guard', $.expression))), 'then', field('value', $.expression)),

    _pattern: ($) => choice($.binding_pattern, $.expression),

    binding_pattern: ($) => seq(field('name', $.identifier), $.type_annotation),

    declare_statement: ($) =>
      seq(
        'declare',
        choice(
          $.declare_function,
          $.declare_variable,
          $.declare_module,
          $.declare_enum,
          $.declare_class,
          $.declare_interface,
          $.declare_type,
        ),
      ),

    declare_function: ($) =>
      seq(optional('async'), 'function', field('name', $.function_name), field('signature', $.function_signature)),

    declare_variable: ($) => seq(field('name', $.identifier), $.type_annotation),

    declare_type: ($) => seq(field('keyword', $.identifier), field('name', $.identifier), field('type_parameters', $.type_parameters)),

    declare_module: ($) => seq('module', field('name', $.string), repeat($._declare_module_member), 'end'),

    _declare_module_member: ($) =>
      choice(
        $.annotation,
        $.declare_function,
        $.declare_variable,
        $.declare_enum,
        $.declare_class,
        $.declare_interface,
        $.declare_extend,
      ),

    declare_enum: ($) => seq('enum', field('name', $.identifier), repeat1(choice($.annotation, $.enum_member)), 'end'),

    declare_class: ($) =>
      seq(
        optional('abstract'),
        optional(field('modifier', $.identifier)),
        'class',
        field('name', $.identifier),
        optional(field('type_parameters', $.type_parameters)),
        optional(seq('extends', field('superclass', $.class_reference))),
        optional(seq('implements', commaSep1(field('interface', $.class_reference)))),
        repeat($._declare_class_member),
        'end',
      ),

    _declare_class_member: ($) =>
      choice($.annotation, $.declare_field, $.declare_method, $.declare_constructor, $.declare_operator, $.declare_accessor),

    declare_field: ($) =>
      prec.right(seq(optional($._visibility), optional('static'), field('name', $.identifier), optional($.type_annotation))),

    declare_method: ($) =>
      seq(
        optional($._visibility),
        optional('static'),
        optional('override'),
        optional('abstract'),
        optional('async'),
        'function',
        field('name', $._member_name),
        field('signature', $.function_signature),
      ),

    declare_constructor: ($) => seq(optional('local'), 'constructor', field('signature', $.function_signature)),

    declare_operator: ($) =>
      seq(field('keyword', $.identifier), field('operator', $.operator_symbol), field('signature', $.function_signature)),

    declare_accessor: ($) => seq(field('kind', $.identifier), field('name', $._member_name), field('signature', $.function_signature)),

    declare_interface: ($) =>
      seq(
        'interface',
        field('name', $.identifier),
        optional(field('type_parameters', $.type_parameters)),
        optional(seq('extends', commaSep1(field('interface', $.class_reference)))),
        repeat(choice($.annotation, $.interface_field, $.interface_method)),
        'end',
      ),

    declare_extend: ($) =>
      seq(
        'extend',
        field('type', $._type),
        repeat(choice($.annotation, $.declare_method, $.declare_operator, $.declare_accessor)),
        'end',
      ),

    function_signature: ($) =>
      seq(
        optional(field('type_parameters', $.type_parameters)),
        field('parameters', $.parameters),
        optional(field('return_type', $._return_type)),
      ),

    function_body: ($) =>
      seq(
        optional(field('type_parameters', $.type_parameters)),
        field('parameters', $.parameters),
        optional(field('return_type', $._return_type)),
        optional(field('body', $.block)),
        'end',
      ),

    parameters: ($) =>
      seq('(', optional(choice(seq(commaSep1($.parameter), optional(seq(',', $.vararg_parameter))), $.vararg_parameter)), ')'),

    parameter: ($) =>
      seq(
        repeat($.annotation),
        field('name', $.identifier),
        optional($.type_annotation),
        optional(seq('=', field('default', $.expression))),
      ),

    vararg_parameter: ($) => seq('...', optional(field('name', $.identifier)), optional($.type_annotation)),

    _return_type: ($) => seq(':', choice($.type_predicate, $._type)),

    type_predicate: ($) => seq(field('parameter', $.identifier), 'is', field('type', $._type)),

    type_annotation: ($) => seq(':', field('type', $._type)),

    type_parameters: ($) => seq('<', commaSep1($.type_parameter), '>'),

    type_parameter: ($) =>
      seq(
        field('name', alias($.identifier, $.type_identifier)),
        optional(seq('extends', field('constraint', $._type))),
        optional(seq('implements', commaSep1($._type))),
      ),

    type_arguments: ($) => seq('<', commaSep1(choice($._type, $.wildcard_type)), '>'),

    wildcard_type: ($) => prec.right(seq('?', optional(seq(choice('extends', 'super'), $._type)))),

    _type: ($) => choice($.union_type, $._type_single),

    union_type: ($) => prec.left(seq($._type_single, repeat1(seq('|', $._type_single)))),

    _type_single: ($) => choice($._type_atom, $.array_type, $.optional_type, $.indexed_access_type),

    array_type: ($) => prec(1, seq($._type_single, '[', ']')),

    optional_type: ($) => prec(1, seq($._type_single, '?')),

    indexed_access_type: ($) => prec(1, seq($._type_single, '[', $._type, ']')),

    _type_atom: ($) =>
      choice(
        alias('nil', $.nil),
        alias('function', $.type_identifier),
        $.keyof_type,
        $.string,
        $.literal_type,
        alias('true', $.true),
        alias('false', $.false),
        $.generic_type,
        alias($.identifier, $.type_identifier),
        $.function_type,
        $.table_type,
        $.parenthesized_type,
        $.variadic_type,
      ),

    literal_type: ($) => seq(optional('-'), $.number),

    keyof_type: ($) => prec.right(seq('keyof', $._type_single)),

    generic_type: ($) => seq(alias($.identifier, $.type_identifier), $.type_arguments),

    function_type: ($) => prec.right(seq('(', commaSep($._type), ')', '->', field('return_type', $._type))),

    parenthesized_type: ($) => seq('(', commaSep1($._type), ')'),

    variadic_type: ($) => seq('...', $._type_single),

    table_type: ($) =>
      choice(
        seq('{', '}'),
        seq('{', '[', field('key', $._type), ']', ':', field('value', $._type), '}'),
        seq('{', trailingCommaSep1($.struct_field), '}'),
      ),

    struct_field: ($) => seq(optional('meta'), field('name', $._field_name), ':', field('type', $._type)),

    _field_name: ($) => choice($._member_name, $.string),

    _member_name: ($) => alias($.identifier, $.property_identifier),

    expression: ($) =>
      choice(
        $.nil,
        $.true,
        $.false,
        $.number,
        $.string,
        $.template_string,
        $.vararg_expression,
        $.function_definition,
        $._prefix_expression,
        $.table_constructor,
        $.match_expression,
        $.binary_expression,
        $.unary_expression,
        $.await_expression,
        $.typeof_expression,
        $.update_expression,
        $.cast_expression,
        $.type_check_expression,
        $.instanceof_expression,
      ),

    nil: (_) => 'nil',
    true: (_) => 'true',
    false: (_) => 'false',
    vararg_expression: (_) => '...',

    _prefix_expression: ($) =>
      choice($.variable, $.function_call, $.parenthesized_expression, $.new_expression, $.non_nil_expression, $.super),

    super: (_) => 'super',

    variable: ($) => choice($.identifier, $.bracket_index_expression, $.dot_index_expression),

    dot_index_expression: ($) =>
      prec(PREC.CALL, seq(field('table', choice($._prefix_expression, $.number)), choice('.', '?.'), field('field', $._member_name))),

    bracket_index_expression: ($) =>
      prec(PREC.CALL, seq(field('table', $._prefix_expression), '[', field('index', $.expression), ']')),

    method_index_expression: ($) =>
      prec(PREC.CALL, seq(field('table', $._prefix_expression), ':', field('method', $._member_name))),

    function_call: ($) =>
      prec(
        PREC.CALL,
        seq(field('name', choice($._prefix_expression, $.method_index_expression)), optional('?'), field('arguments', $.arguments)),
      ),

    arguments: ($) =>
      choice(seq('(', commaSep($.expression), ')'), $.table_constructor, $.string, $.template_string),

    new_expression: ($) => seq('new', field('class', alias($.identifier, $.type_identifier)), field('arguments', seq('(', commaSep($.expression), ')'))),

    non_nil_expression: ($) => prec(PREC.POSTFIX, seq(choice($._prefix_expression, $.nil), '!')),

    parenthesized_expression: ($) => seq('(', $.expression, ')'),

    function_definition: ($) => seq(optional('async'), 'function', field('body', $.function_body)),

    table_constructor: ($) => seq('{', optional(seq($.field, repeat(seq(choice(',', ';'), $.field)), optional(choice(',', ';')))), '}'),

    field: ($) =>
      choice(
        seq('[', field('key', $.expression), ']', '=', field('value', $.expression)),
        seq(field('name', $._member_name), '=', field('value', $.expression)),
        seq(optional('async'), 'function', field('name', $._member_name), field('body', $.function_body)),
        field('value', $.expression),
      ),

    binary_expression: ($) =>
      choice(
        ...[
          ['or', PREC.OR],
          ['||', PREC.OR],
          ['and', PREC.AND],
          ['&&', PREC.AND],
          ['==', PREC.COMPARE],
          ['~=', PREC.COMPARE],
          ['!=', PREC.COMPARE],
          ['<', PREC.COMPARE],
          ['<=', PREC.COMPARE],
          ['>', PREC.COMPARE],
          ['>=', PREC.COMPARE],
          ['|', PREC.BIT_OR],
          ['~', PREC.BIT_XOR],
          ['&', PREC.BIT_AND],
          ['<<', PREC.SHIFT],
          ['+', PREC.ADD],
          ['-', PREC.ADD],
          ['*', PREC.MUL],
          ['/', PREC.MUL],
          ['//', PREC.MUL],
          ['%', PREC.MUL],
        ].map(([operator, precedence]) =>
          prec.left(precedence, seq(field('left', $.expression), field('operator', operator), field('right', $.expression))),
        ),
        prec.left(PREC.SHIFT, seq(field('left', $.expression), field('operator', alias(seq('>', token.immediate('>')), '>>')), field('right', $.expression))),
        ...[
          ['..', PREC.CONCAT],
          ['^', PREC.POWER],
          ['??', PREC.NIL_COALESCE],
        ].map(([operator, precedence]) =>
          prec.right(precedence, seq(field('left', $.expression), field('operator', operator), field('right', $.expression))),
        ),
      ),

    unary_expression: ($) => prec.left(PREC.UNARY, seq(field('operator', choice('not', '#', '-', '~', '!')), field('operand', $.expression))),

    await_expression: ($) => prec.left(PREC.UNARY, seq('await', $.expression)),

    typeof_expression: ($) => prec.left(PREC.UNARY, seq('typeof', $.expression)),

    update_expression: ($) =>
      choice(
        prec.left(PREC.POSTFIX, seq(field('operand', $._prefix_expression), field('operator', choice('++', '~~')))),
        prec.right(PREC.UNARY, seq(field('operator', choice('++', '~~')), field('operand', $._prefix_expression))),
      ),

    cast_expression: ($) => prec.left(PREC.CAST, seq(field('value', $.expression), 'as', field('type', $._type))),

    type_check_expression: ($) => prec.left(PREC.CAST, seq(field('value', $.expression), 'is', field('type', $._type))),

    instanceof_expression: ($) => prec.left(PREC.INSTANCEOF, seq(field('value', $.expression), 'instanceof', field('type', $._type_atom))),

    number: (_) => {
      const decimal = /[0-9]+/;
      const exponent = /[eE][+-]?[0-9]+/;
      const hex = /[0-9a-fA-F]+/;
      const hexExponent = /[pP][+-]?[0-9]+/;
      return token(
        choice(
          seq(/0[xX]/, hex, '.', optional(hex), optional(hexExponent)),
          seq(/0[xX]/, '.', hex, optional(hexExponent)),
          seq(/0[xX]/, hex, hexExponent),
          seq(/0[xX]/, hex),
          seq(decimal, '.', decimal, optional(exponent)),
          seq('.', decimal, optional(exponent)),
          seq(decimal, exponent),
          decimal,
        ),
      );
    },

    string: ($) =>
      choice(
        seq('"', repeat(choice(alias($._double_quoted_content, $.string_content), $.escape_sequence)), token.immediate('"')),
        seq("'", repeat(choice(alias($._single_quoted_content, $.string_content), $.escape_sequence)), token.immediate("'")),
        alias($._long_string, $.string_content),
      ),

    _double_quoted_content: (_) => token.immediate(prec(1, /[^"\\\r\n]+/)),

    _single_quoted_content: (_) => token.immediate(prec(1, /[^'\\\r\n]+/)),

    escape_sequence: (_) =>
      token.immediate(
        seq('\\', choice(/[abfnrtvz"'\\`{}]/, /\r?\n/, /[0-9]{1,3}/, /x[0-9a-fA-F]{2}/, /u\{[0-9a-fA-F]+\}/)),
      ),

    template_string: ($) =>
      seq('`', repeat(choice(alias($._template_content, $.string_content), $.escape_sequence, $.interpolation)), token.immediate('`')),

    _template_content: (_) => token.immediate(prec(1, /[^`\\{]+/)),

    interpolation: ($) => seq(token.immediate('{'), $.expression, '}'),

    comment: (_) => token(seq('--', /[^\r\n]*/)),

    identifier: (_) => /[a-zA-Z_][a-zA-Z0-9_]*/,
  },
});
