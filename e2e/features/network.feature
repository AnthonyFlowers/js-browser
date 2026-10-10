Feature: Unreliable network

  Background:
    Given the unpkg mock never answers requests for "tiny-helper"
    And the notebook is open

  Scenario: A stalled package ends in the fetch error message
    When I add a code cell
    And I enter the code:
      """
      import { shout } from "tiny-helper";
      show(shout("x"))
      """
    Then cell 1 shows the error "Failed to fetch https://unpkg.com/tiny-helper: timed out after 30s (3 attempts)"
    And unpkg received 3 requests for "/tiny-helper"
