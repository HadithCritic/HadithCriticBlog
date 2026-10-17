# Local cache policy patch

This is the BSD-2-Clause source of `http-cache-semantics` 4.3.0, published
from upstream commit `b1d4bd682fbab0252985de45219f4e7497c0067c`, with a local
guard in `evaluateRequest` and linear comma splitting for Connection/Vary
headers. The original license and author are preserved.
The local version is `4.3.0-hc.1`; npm resolves Astro's dependency here through
the root override, including on a clean Linux `npm ci`.

The published 4.3.0 release still reproduces
[GHSA-ch52-4w7c-c8xp](https://github.com/advisories/GHSA-ch52-4w7c-c8xp).
A `max-stale` request can revive cache entries whose freshness was zeroed for
security reasons. The guard refuses reuse for non-storable responses,
`no-cache`, `Vary: *`, shared `proxy-revalidate`, and shared `Set-Cookie`
responses without the library's explicit `public` or `immutable` opt-in.
Ordinary expired public responses can still honor `max-stale`.

Regression coverage lives in `src/lib/tests/cache-policy.test.mjs`, including
serialized and revalidated policies. Remove the override and this directory
when an upstream release passes those tests without the guard. A clean audit
alone is not sufficient evidence that this behavior is fixed.
