(do_statement "end" @end) @indent
(while_statement "end" @end) @indent
(repeat_statement "until" @end) @indent
(if_statement "end" @end) @indent
(for_numeric_statement "end" @end) @indent
(for_generic_statement "end" @end) @indent
(try_statement "end" @end) @indent
(match_statement "end" @end) @indent
(match_expression "end" @end) @indent
(function_body "end" @end) @indent
(enum_declaration "end" @end) @indent
(class_declaration "end" @end) @indent
(interface_declaration "end" @end) @indent
(extend_declaration "end" @end) @indent
(declare_module "end" @end) @indent
(declare_enum "end" @end) @indent
(declare_class "end" @end) @indent
(declare_interface "end" @end) @indent
(declare_extend "end" @end) @indent

(_ "{" "}" @end) @indent
(_ "(" ")" @end) @indent
(_ "[" "]" @end) @indent
