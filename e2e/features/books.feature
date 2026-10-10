Feature: Book files

  Background:
    Given the unpkg mock is serving fixture packages
    And the notebook is open

  Scenario: Load Book imports the cells of a .book file
    When I load the book file "e2e/fixtures/sample.book"
    Then the book has 2 cells
    And the preview of cell 1 shows "loaded from a book"
    And the text cell 2 renders a "h1" with text "Imported heading"
