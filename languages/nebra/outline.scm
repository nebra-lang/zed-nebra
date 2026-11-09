(function_declaration
  "function" @context
  name: (_) @name) @item

(local_function_declaration
  "local" @context
  "function" @context
  name: (_) @name) @item

(class_declaration
  "class" @context
  name: (_) @name) @item

(interface_declaration
  "interface" @context
  name: (_) @name) @item

(interface_declaration
  keyword: (identifier) @context
  name: (_) @name) @item

(enum_declaration
  "enum" @context
  name: (_) @name) @item

(enum_member
  name: (_) @name) @item

(extend_declaration
  "extend" @context
  type: (_) @name) @item

(field_declaration
  name: (_) @name) @item

(method_declaration
  "function" @context
  name: (_) @name) @item

(abstract_method_declaration
  "abstract" @context
  "function" @context
  name: (_) @name) @item

(constructor_declaration
  "constructor" @name) @item

(operator_declaration
  keyword: (_) @context
  operator: (_) @name) @item

(accessor_declaration
  kind: (_) @context
  name: (_) @name) @item

(interface_field
  name: (_) @name) @item

(interface_method
  kind: _ @context
  name: (_) @name) @item

(interface_default_method
  kind: _ @context
  name: (_) @name) @item

(declare_function
  "function" @context
  name: (_) @name) @item

(declare_variable
  name: (_) @name) @item

(declare_module
  "module" @context
  name: (_) @name) @item

(declare_class
  "class" @context
  name: (_) @name) @item

(declare_interface
  "interface" @context
  name: (_) @name) @item

(declare_interface
  keyword: (identifier) @context
  name: (_) @name) @item

(declare_enum
  "enum" @context
  name: (_) @name) @item

(declare_type
  keyword: (_) @context
  name: (_) @name) @item

(declare_extend
  "extend" @context
  type: (_) @name) @item

(declare_field
  name: (_) @name) @item

(declare_method
  "function" @context
  name: (_) @name) @item

(declare_constructor
  "constructor" @name) @item

(declare_accessor
  kind: (_) @context
  name: (_) @name) @item

(source_file
  (block
    (local_declaration
      "local" @context
      names: (local_name name: (_) @name)) @item))
