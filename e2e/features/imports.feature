Feature: Package imports

  Background:
    Given the unpkg mock is serving fixture packages
    And the notebook is open

  Scenario: Bare imports resolve through unpkg and failing imports are reported
    When I add a code cell
    And I enter the code:
      """
      import { shout } from "tiny-helper";
      import "tiny-styles/style.css";
      show(shout("hi"))
      """
    Then the preview of cell 1 shows "HI!"
    And the preview of cell 1 has the background colour "rgb(1, 2, 3)"
    And unpkg received a request for "/tiny-helper@1.0.0/lib/upper.js"
    When I enter the code:
      """
      import "no-such-package";
      show("unreachable")
      """
    Then cell 1 shows the error "Failed to fetch https://unpkg.com/no-such-package: HTTP 404"
