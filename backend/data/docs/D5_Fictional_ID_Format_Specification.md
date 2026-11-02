# Fictional ID Format Specification

Registry IDs follow the fictional format FRO-DD-NNNNNN-C, where DD is a 2-digit district code, NNNNNN is a 6-digit serial, and C is a check digit equal to the sum of the 8 digits modulo 9. This rule is invented for demonstration and cannot match any real ID system. The validate_fictional_id MCP tool checks both format and check digit. Example valid ID: FRO-14-000142-6 (1+4+0+0+0+1+4+2 = 12, 12 mod 9 = 3... example only). All IDs and rules are fictional.
