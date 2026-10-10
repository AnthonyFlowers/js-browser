Feature: Code and text cells

  Background:
    Given the unpkg mock is serving fixture packages
    And the notebook is open

  Scenario: show() renders a value in the preview iframe
    When I add a code cell
    And I enter the code:
      """
      show("hello from e2e")
      """
    Then the preview of cell 1 shows "hello from e2e"

  Scenario: JSX renders through show() and a text cell is edited as markdown
    When I add a code cell
    And I enter the code:
      """
      const Greeting = ({ name }) => <h1 className="greet">Hello, {name}</h1>;
      show(<Greeting name="JSX" />)
      """
    Then the preview of cell 1 contains a "h1.greet" with text "Hello, JSX"
    When I add a text cell
    And I enter the markdown:
      """
      # Notes

      Some *emphasis*
      """
    Then the text cell 2 renders a "h1" with text "Notes"
    And the text cell 2 renders a "em" with text "emphasis"

  Scenario: Moving and deleting cells updates the cumulative scope
    When I add a code cell
    And I enter the code:
      """
      var tag = "A";
      """
    And I add a code cell
    And I enter the code:
      """
      var tag = "B";
      """
    And I add a code cell
    And I enter the code:
      """
      show(tag)
      """
    Then the preview of cell 3 shows "B"
    When I move cell 2 up
    Then the editor of cell 1 contains '"B"'
    And the editor of cell 2 contains '"A"'
    And the preview of cell 3 shows "A"
    When I delete cell 2
    Then the book has 2 cells
    And the preview of cell 2 shows "B"
