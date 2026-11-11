---
title: "When Expected Errors Look Like Failures"
description: "Designing assertions around intentional negative checks"
date: 2026-11-10 10:08:00 +0600
category: Embedded QA
tags: [assertions, self-test, boot-log]
series: Embedded QA Series
part: 8
---
A common smoke check after a device reset is "no ERROR lines in the boot log". It is simple and usually right. On our project it would have failed forever, even with perfect firmware.

## Why

The firmware runs a built-in self-test at every boot. Some of its checks are negative: they deliberately write to a read-only object and request an unknown object ID, then verify that both are rejected. The rejection is logged by the lower layer at ERROR level, and the self-test then logs a PASS for that check:

```text
[STORE]  [ERROR] write rejected: object is read-only
[BOOT]   [INFO]  PASS  read-only object rejects a write
[STORE]  [ERROR] unknown object id
[BOOT]   [INFO]  PASS  unknown object id is rejected
[BOOT]   [INFO]  SELFTEST PASS: 12 passed, 0 failed
```

Two ERROR lines, both proof that the device works. The reset test asserted that there were no ERROR lines at all, so it could never pass. It was failing earlier for a different reason, which hid this one. We found it by probing the self-test command directly and then checking old boot logs.

## How to handle it

- **Allow-list the expected errors** in the test: ignore exactly the known self-test lines and fail on anything else. Precise, but must be updated when the self-test changes.
- **Change the firmware** so expected rejections inside a self-test are logged at a lower level. Cleaner, but a developer decision.
- **Assert on the summary**, `SELFTEST PASS ... 0 failed`, and keep a separate, narrower error check for the rest of the boot sequence.

Which one is right is a team decision, so we raised it instead of quietly loosening the test. One more lesson came with it: when a new self-test was added a few days later, the count of checks changed. Never hard-code the count; assert on "0 failed".

> **Takeaway:** "No errors" is a claim about the whole log. Before you make it, find out which errors the system produces on purpose.
