(function_declaration
  body: (function_body
    body: (_)? @function.inside)) @function.around

(local_function_declaration
  body: (function_body
    body: (_)? @function.inside)) @function.around

(function_definition
  body: (function_body
    body: (_)? @function.inside)) @function.around

(method_declaration
  body: (function_body
    body: (_)? @function.inside)) @function.around

(constructor_declaration
  body: (function_body
    body: (_)? @function.inside)) @function.around

(accessor_declaration
  body: (function_body
    body: (_)? @function.inside)) @function.around

(operator_declaration
  body: (function_body
    body: (_)? @function.inside)) @function.around

(class_declaration) @class.around
(interface_declaration) @class.around
(enum_declaration) @class.around
(declare_class) @class.around
(declare_interface) @class.around

(comment)+ @comment.around
(block_comment) @comment.around
