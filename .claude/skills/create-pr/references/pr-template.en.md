# PR body template (English)

Used by the `create-pr` skill when invoked with the `en` or `영어` argument. The Korean default is `pr-template.md`.

Remove the `<!-- -->` comments when filling in. For sections that do not apply, write "None" or omit the section.

```markdown
## Summary

<!-- Describe what this PR changes and why, in 2-3 sentences. -->

## Changes

<!-- List the main changes. Prefer behavior changes over file listings. -->
- 

## Testing

<!-- Check only the items that actually passed. -->
- [ ] `bun run lint`
- [ ] `bun run test`
- [ ] `bun run build`

## Notes

<!-- Things reviewers should know, follow-up work, known limitations. Write "None" if there are none. -->

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```
