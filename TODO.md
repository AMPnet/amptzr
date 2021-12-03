Reproduce issue with login that results with autologout:
- logout from metamask,
- change network with metamask,
- go in code and change one line and let live reload to reload the page, 
- login with metamask, accept change network,
- it should login the user, but results in login and immediate logout.

Possible cause is live reload, and some listener race condition; need to investigate.

---

Investigate what is happening with builds on GitHub Actions. There is issue with fetching remote repositories that are fetched via git protocol (not https). In the latest example, we had issues with fetching ethereumjs-abi repository, that is our 3rd-party dependency. 
Here are some issues and possible solutions:
* https://github.com/ethereumjs/ethereumjs-abi/issues/87
* https://github.com/actions/setup-node/issues/214

@mightymatth fixed this issue by doing this:
https://github.com/actions/setup-node/issues/214#issuecomment-774020466

---
