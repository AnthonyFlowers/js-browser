Feature: Persistence

  Background:
    Given the unpkg mock is serving fixture packages
    And the notebook is open

  Scenario: The book is restored from IndexedDB after a reload
    When I add a code cell
    And I enter the code:
      """
      show("persisted")
      """
    Then the preview of cell 1 shows "persisted"
    And the book is saved in IndexedDB with "persisted"
    When I reload the page
    Then the book has 1 cell
    And the editor of cell 1 contains "persisted"
    And the preview of cell 1 shows "persisted"
    And the book name is "default"
