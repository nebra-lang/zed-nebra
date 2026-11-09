(identifier) @variable

[
  "and"
  "not"
  "or"
  "instanceof"
  "typeof"
  "keyof"
  "is"
  "as"
] @keyword.operator

[
  "local"
  "mut"
  "function"
  "end"
  "return"
  "do"
  "then"
  "if"
  "elseif"
  "else"
  "while"
  "repeat"
  "until"
  "for"
  "in"
  "break"
  "goto"
  "defer"
  "guard"
  "try"
  "catch"
  "finally"
  "match"
  "case"
  "when"
  "import"
  "export"
  "declare"
  "module"
  "class"
  "interface"
  "enum"
  "extend"
  "extends"
  "implements"
  "abstract"
  "static"
  "override"
  "protected"
  "constructor"
  "async"
  "await"
  "new"
  "meta"
] @keyword

(continue_statement) @keyword

(import_statement modifier: (identifier) @keyword)
(import_statement from: (identifier) @keyword)
(export_statement from: (identifier) @keyword)
(class_declaration modifier: (identifier) @keyword)
(declare_class modifier: (identifier) @keyword)
(declare_type keyword: (identifier) @keyword)
(interface_declaration keyword: (identifier) @keyword)
(declare_interface keyword: (identifier) @keyword)
(operator_declaration keyword: (identifier) @keyword)
(declare_operator keyword: (identifier) @keyword)
(accessor_declaration kind: (identifier) @keyword)
(declare_accessor kind: (identifier) @keyword)
(interface_method kind: (identifier) @keyword)
(interface_default_method kind: (identifier) @keyword)

(nil) @constant.builtin
[
  (true)
  (false)
] @boolean
(vararg_expression) @constant.builtin
(super) @variable.special

((identifier) @variable.special
  (#eq? @variable.special "self"))

((identifier) @constant
  (#match? @constant "^[A-Z][A-Z0-9_]+$"))

(number) @number

(string) @string
(template_string) @string
(escape_sequence) @string.escape
(interpolation
  "{" @punctuation.special
  "}" @punctuation.special) @embedded

(type_identifier) @type
((type_identifier) @type.builtin
  (#any-of? @type.builtin "string" "number" "boolean" "any" "void" "nil" "never" "function" "thread" "userdata"))
(literal_type) @number

(class_declaration name: (identifier) @type)
(declare_class name: (identifier) @type)
(interface_declaration name: (identifier) @type)
(declare_interface name: (identifier) @type)
(enum_declaration name: (identifier) @enum)
(declare_enum name: (identifier) @enum)
(declare_type name: (identifier) @type)
(enum_member name: (identifier) @variant)
(new_expression class: (type_identifier) @constructor)
"constructor" @constructor

(property_identifier) @property
(field name: (property_identifier) @property)
(interface_field name: (property_identifier) @property)
(struct_field name: (property_identifier) @property)
(field_declaration name: (identifier) @property)
(declare_field name: (identifier) @property)

(parameter name: (identifier) @variable.parameter)
(vararg_parameter name: (identifier) @variable.parameter)
(type_predicate parameter: (identifier) @variable.parameter)
(binding_pattern name: (identifier) @variable)

(function_name base: (identifier) @function)
(function_name field: (property_identifier) @function)
(function_name method: (property_identifier) @function.method)
(local_function_declaration name: (identifier) @function)
(method_declaration name: (property_identifier) @function.method)
(abstract_method_declaration name: (property_identifier) @function.method)
(declare_method name: (property_identifier) @function.method)
(interface_method name: (property_identifier) @function.method)
(interface_default_method name: (property_identifier) @function.method)
(accessor_declaration name: (property_identifier) @function.method)
(declare_accessor name: (property_identifier) @function.method)
(field name: (property_identifier) @function.method
  body: (function_body))

(function_call
  name: (variable (identifier) @function))
(function_call
  name: (variable (dot_index_expression field: (property_identifier) @function)))
(function_call
  name: (method_index_expression method: (property_identifier) @function.method))

((function_call
  name: (variable (identifier) @function.builtin))
  (#any-of? @function.builtin
    "assert" "collectgarbage" "dofile" "error" "getmetatable" "ipairs" "load" "loadfile" "loadstring"
    "next" "pairs" "pcall" "print" "rawequal" "rawget" "rawlen" "rawset" "require" "select"
    "setmetatable" "tonumber" "tostring" "type" "unpack" "xpcall"))

(annotation
  "@" @attribute
  name: (identifier) @attribute)

(label_statement (identifier) @label)
(goto_statement (identifier) @label)
(attribute (identifier) @attribute)

[
  "+"
  "-"
  "*"
  "/"
  "//"
  "%"
  "^"
  "#"
  "&"
  "~"
  "|"
  "<<"
  "=="
  "~="
  "!="
  "<="
  ">="
  "<"
  ">"
  "="
  ".."
  "??"
  "++"
  "~~"
  "&&"
  "||"
  "!"
  "->"
  "?"
] @operator

[
  ","
  ";"
  "."
  "?."
  ":"
  "::"
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

(type_parameters ["<" ">"] @punctuation.bracket)
(type_arguments ["<" ">"] @punctuation.bracket)

[
  (comment)
  (block_comment)
] @comment

((comment) @comment.doc
  (#match? @comment.doc "^---"))

(shebang) @preproc
