@mobile
Feature: Phone layout and touch

  Background:
    Given the unpkg mock is serving fixture packages
    And the notebook is open

  Scenario Outline: The page does not scroll sideways at <width> px
    When I load the book file "e2e/fixtures/sample.book"
    And the viewport is <width> px wide
    Then the book has 2 cells
    And the page does not scroll horizontally

    Examples:
      | width |
      | 360   |
      | 390   |
      | 430   |

  Scenario: The editor is stacked above a full-width preview
    When I add a code cell
    And I enter the code:
      """
      show("stacked")
      """
    Then the preview of cell 1 shows "stacked"
    And the editor of cell 1 is stacked above its preview
    And the preview of cell 1 is as wide as the cell
    And there is no Monaco keyboard overlay in cell 1
    And the Format button of cell 1 does not cover the editor

  Scenario: Every code cell of a book renders its preview
    When I load the book file "e2e/fixtures/mobile.book"
    Then the book has 3 cells
    And the preview of cell 1 shows "[1,4,9,16]"
    And the preview of cell 3 shows "second cell"

  Scenario: Touch controls are at least 44 px
    When I add a code cell
    Then the action bar buttons of cell 1 are at least 44 px
    And the Format button of cell 1 is at least 44 px
    And the add cell buttons are at least 44 px
    And the top menu buttons are at least 44 px
    And the height handle of cell 1 has a hit area of at least 44 px

  Scenario: Cells are moved, deleted and added by tapping
    When I tap the Code add button
    And I enter the code:
      """
      show("first")
      """
    And I tap the Code add button
    And I enter the code:
      """
      show("second")
      """
    And I tap move cell 2 up
    Then the editor of cell 1 contains "second"
    When I tap delete cell 1
    Then the book has 1 cell
    And the preview of cell 1 shows "first"

  Scenario: A markdown cell is edited and left by tapping
    When I tap the Text add button
    And I tap the text cell 1
    And I type the markdown "# Tapped heading"
    And I tap outside the text cell
    Then the text cell 1 renders a "h1" with text "Tapped heading"

  Scenario: Dragging the height handle with a finger resizes the editor
    When I add a code cell
    And I note the height of the editor of cell 1
    And I drag the height handle of cell 1 by 120 px with touch
    Then the editor of cell 1 is about 120 px taller
    When I drag the height handle of cell 1 by -60 px with touch
    Then the editor of cell 1 is about 60 px taller

  Scenario: Save Book downloads the book without streamsaver
    When I load the book file "e2e/fixtures/sample.book"
    Then the book has 2 cells
    When I tap Save Book
    Then a .book file is downloaded containing "loaded from a book"
