# Definition of Done (DoD)

The products feature is **done only when all of these are true**. Each point keeps the rule of
the framework and says how it applies to this project. A point that does not apply is marked
as N/A with the reason.

- [ ] **Acceptance criteria met and verified.** Every point of `TODO.md` (Parts 1 to 7) is
  done and checked against the exam statement.
- [ ] **Code delivered through a PR.** The work is in the branch `feature/catalogo-productos`
  and there is a Pull Request to the `main` branch of my own fork, with a description and this
  checklist. The PR stays open for the review of the teacher.
- [ ] **Unit and API tests added and passing.** At least 4 new tests pass with `npm test`: 2 or
  more unit tests of the domain functions and 2 or more tests of the API with
  `startTestServer()`. Widget/UI tests: N/A, the exam does not ask for them.
- [ ] **Runs without regressions.** `npm run server` and `npm run dev` start, and the app works
  against the API in the browser. Running on Android and iOS: N/A, the exam does not ask for a
  native build.
- [ ] **No new linter or type warnings.** `npm run lint` and `npm run build` finish without
  errors.
- [ ] **Loading, empty and error states handled.** The list handles Loading, Empty, No results
  and Error with "Reintentar"; the detail and the form handle Loading and Error. Offline: N/A,
  there is no offline mode; a network error shows the Error state.
- [ ] **Names follow the coding standards.** Types and components in `PascalCase`, variables
  and functions in `camelCase`, constants in `UPPER_SNAKE_CASE` and booleans with the prefix
  `is`, `has` or `should`.
- [ ] **No secrets in the repository.** The `.env` file is ignored by Git and only
  `.env.example` is versioned.
- [ ] **The Kotlin exercise runs.** `kotlin/Product.kt` compiles and runs in the Kotlin
  Playground.
- [ ] **Documentation updated.** The feature doc, the three screen specs, the two ADRs, the
  endpoints, the entity and the README say what the code does.

Points of the framework that do not apply to this project:

- **Strings localized:** N/A. The app has only one language (Spanish), so the texts are written
  in the components.
- **Analytics / crash reporting events:** N/A. The exam does not ask for them.

The feature is not done until every point above is true. Partial work is not closed "to be
finished later".
