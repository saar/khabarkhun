Feature: Like-able article.
  Every article should have a like feature.


  Scenario: Like an article
    Given article is'nt liked
    When user click on like button of the article
    Then like button should represent that liking process was started


  Scenario: Article just liked
    Given the article is in liking process
    When liking process finished
    Then the article should be liked

  Scenario: Article cat'n be liked
    Given the article is in liking process
    When liking process was failed
    Then the article should'nt be liked
