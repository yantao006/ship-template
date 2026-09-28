# Guest avatar login verification

On the production `/en` homepage, a signed-out visitor sees the `Sign In` avatar button.
Immediately after clicking it, the URL stays `/en`, and no dialog is present while `/api/auth/get-session` is pending.
That request returned `200` with `null`; the dialog appeared after the response, roughly 1.4 seconds after the click in the observed run.
No JavaScript console exception was recorded.
Throttling the session request kept the page unchanged after the click, reproducing the perceived no-response state without changing cookies or the UI.
In contrast, on the same signed-out production page, allowing the session request to finish opened the login dialog normally.
The first divergent step is the guest dialog's wait for `serverHasSession()` before `setOpen(true)`.

The fix makes only the guest avatar show sign-in synchronously, while still checking the server session afterward and dismissing a stale guest dialog if the user is already signed in.
The previously signed-in preview cookie was cleared only for the preview origin to test the signed-out path.
After uploading the new version to the `popovers` preview alias, an ego-browser click found the dialog immediately even while the throttled session request was pending.
The settled screenshot is `preview-open.png`.
Production traffic was not deployed or changed.
