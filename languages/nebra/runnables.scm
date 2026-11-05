(
  (function_call
    name: (variable (identifier) @run @_function)
    arguments: (arguments . (string (string_content) @test_name)))
  (#any-of? @_function "test" "it")
  (#set! tag nebra-test)
)

(
  (function_call
    name: (variable (identifier) @run @_function)
    arguments: (arguments . (string (string_content) @test_name)))
  (#eq? @_function "describe")
  (#set! tag nebra-suite)
)
