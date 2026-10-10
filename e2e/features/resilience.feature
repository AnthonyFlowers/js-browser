Feature: Failures that must not break the notebook

  Background:
    Given the unpkg mock is serving fixture packages

  Scenario: A text editor chunk that fails to load is contained in its cell
    Given the "text-editor" chunk fails to load
    And the page has already reloaded once after a chunk error
    And the notebook is open
    When I add a text cell
    Then cell 1 shows the load error "The text editor failed to load." with a Reload button
    When I add a code cell
    And I enter the code:
      """
      show("still working")
      """
    Then the preview of cell 2 shows "still working"

  Scenario: A formatter chunk that fails to load shows a Format error
    Given the "babel" chunk fails to load
    And the page has already reloaded once after a chunk error
    And the notebook is open
    When I add a code cell
    And I enter the code:
      """
      show("kept")
      """
    And I click Format in cell 1
    Then cell 1 shows the format error "Format failed"
    And the editor of cell 1 contains "kept"

  Scenario: Code with a syntax error shows a Format error and is left unchanged
    Given the notebook is open
    When I add a code cell
    And I enter the code:
      """
      const = ;
      """
    And I click Format in cell 1
    Then cell 1 shows the format error "Can't format"
    And the editor of cell 1 contains "const = ;"
