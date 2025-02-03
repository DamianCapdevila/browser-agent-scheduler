from browser_use import Agent, SystemPrompt

class MySystemPrompt(SystemPrompt):
    def important_rules(self) -> str:
        # Get existing rules from parent class
        existing_rules = super().important_rules()

        # Add your custom rules
        new_rules = """
        1. Acepta las cookies cuando se te solicite.
        2. No alucines.
        9. REGLA MÁS IMPORTANTE:
        - SIEMPRE intenta limitar la cantidad de peticiones que haces, ¡de lo contrario el sitio web nos bloqueará!
        """

        # Make sure to use this pattern otherwise the exiting rules will be lost
        return f'{existing_rules}\n{new_rules}'
