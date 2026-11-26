# Putting a list of photos through Adobe (a helper's brief)

Claude hands a batch of faces to helpers, one person each, so that the
pictures do not fill its own conversation. This is what a helper is told: its
prompt says "read `tools/cast_jobs.md` and do what it says for this list",
and names a list made by `tools/cast_jobs.py prepare`.

---

You are running a list of photos through Adobe's background removal and
selection tools, and saving Adobe's answers to disk. The photos are a family's
and Adobe is the only service they may be sent to: do not send them anywhere
else. Your prompt names the list (a JSON file). Do every row in it.

Each row has: `name`, `file` (a JPEG's path), `bytes` (its exact size), `size`,
`cutout` (where to save the background-removed picture), and `selections`
(none, one or more: each has `save_as`, a `prompt`, and sometimes `bodyParts`).

Set-up, once:

1. ToolSearch with query
   `select:mcp__Adobe__asset_initialize_file_upload,mcp__Adobe__asset_finalize_file_upload,mcp__Adobe__image_remove_background,mcp__Adobe__image_select_by_prompt`.
2. Call `mcp__Adobe__adobe_mandatory_init` with no arguments, once, before
   any other Adobe tool.

For each row:

1. `asset_initialize_file_upload` with `path: "rubber-necker/cast/<name>.jpg"`,
   `file_size: <bytes>`, `media_type: "image/jpeg"`. The answer has `filename`
   and a `transfer_document`; the address to send the file to is in
   `transfer_document._links["http://ns.adobe.com/adobecloud/rel/block/transfer"][0].href`.
2. Send the file with Bash (expect 200 or 201):
   `curl -sS -L -X PUT -H "Content-Type: image/jpeg" --data-binary @"<file>" -o /dev/null -w "%{http_code}\n" "<transfer address>"`
3. `asset_finalize_file_upload` with `filename` exactly as step 1 returned it
   and `transfer_document` set to the whole transfer_document object exactly
   as step 1 returned it. The answer's `assets[0].presignedAssetUrl` is the
   picture's address for the next steps.
4. `image_remove_background` with `imageURI: <presignedAssetUrl>` and nothing
   else. (Its description suggests an interactive version for a single
   picture; use this plain one, because its result feeds a script.) The answer
   has an `outputUrl` (possibly inside `results[0]`). Fetch it at once:
   `curl -sS -L -o "<cutout>" "<outputUrl>"`.
5. For each of the row's selections: `image_select_by_prompt` with
   `imageURI: <presignedAssetUrl>` and `options: {"prompt": <prompt>}`, adding
   `"bodyParts": <bodyParts>` only if the selection has them. The answer's
   `results[0].outputUrl` is a mask. Fetch it at once:
   `curl -sS -L -o "<save_as>" "<outputUrl>"`.

You may run a row's step 4 and step 5 calls in parallel, and may have two or
three rows in flight at once, but keep each row's addresses straight: an
answer saved under the wrong name is the one mistake that matters here.

If Adobe answers "Service Unavailable" or times out, try that call again (up
to three times). If a selection says "No Salient Object found", try again with
the prompt "the person" (for a selection that has bodyParts) or "the animal"
(for one that has none); if it still fails, leave it and say so in your
report.

Do not open the pictures with the Read tool. Check your work with:

`/home/user/Rubber-Necker-Bills-Revenge/.venv/bin/python /home/user/Rubber-Necker-Bills-Revenge/tools/cast_jobs.py check <the list>`

It prints one line per row and "all good" at the end. Redo anything it flags
as MISSING, NOT AN IMAGE or WRONG SIZE. Anything it flags as an ODD AMOUNT,
report and leave.

Do not edit, add or delete any other file in the repository, and do not run
git.

Report back: the checker's final output in full; for every selection, what
Adobe's answer called the mask (its `maskDescription`); any answer that carried
a `tradeoffs` entry saying body parts were not found; and one line for
anything that failed or needed a different prompt.
