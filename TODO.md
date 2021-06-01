Reproduce issue with login that results with autologout:
- logout from metamask,
- change network with metamask,
- go in code and change one line and let live reload to reload the page, 
- login with metamask, accept change network,
- it should login the user, but results in login and immediate logout.

Possible cause is live reload, and some listener race condition; need to investigate.

---

- add eslint
- make build/publish pipeline
