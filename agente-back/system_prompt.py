from browser_use import Agent, SystemPrompt

class MySystemPrompt(SystemPrompt):
    def important_rules(self) -> str:
        # Get existing rules from parent class
        existing_rules = super().important_rules()

        # Add your custom rules
        new_rules = """
            1 - Reject cookies, unless it's not possible to continue without accepting them.
            2 - Don't hallucinate.
            3 - MOST IMPORTANT RULE:
                Always try to limit the number of requests you make, otherwise, the website will block us!
        """

        # Make sure to use this pattern otherwise the exiting rules will be lost
        return f'{existing_rules}\n{new_rules}'
