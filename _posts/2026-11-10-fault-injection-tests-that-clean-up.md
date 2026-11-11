---
title: "Fault-Injection Tests That Clean Up After Themselves"
description: "A code-review lesson about teardown on real devices"
date: 2026-11-10 10:05:00 +0600
category: Embedded QA
tags: [fault-injection, pytest-fixtures, code-review]
series: Embedded QA Series
part: 5
---
Fault-injection tests send the device things it should reject: unknown commands, bad parameters, values out of range. The device should refuse them and carry on. Proving the "carry on" part is where our first version went wrong.

## The first version

```python
def unknown_command_FI(log_fetcher, param):
    error_logs = log_fetcher.send_and_get_until_pattern(param, expected_error, ...)
    recovery_logs = log_fetcher.send_and_get_until_pattern("info", "name:", ...)

    assert error_logs.contains(expected_error)
    assert recovery_logs.contains("name:")
```

It passed. A reviewer pointed out the problem: if the first assertion fails, or anything raises an exception before the end, the recovery step never runs. On a shared device that means the next test may start with the hardware in an unknown state, and its failure gets blamed on the wrong thing.

## Recovery belongs in teardown

```python
@pytest.fixture()
def verify_cli_recovery(log_fetcher):
    yield
    logs = log_fetcher.send_and_get_until_pattern("info", "name:", module="CLI")
    assert logs.contains("name:"), f"No response after fault injection: {logs}"

def unknown_command_FI(log_fetcher, verify_cli_recovery, param):
    ...
```

Everything after `yield` runs whether the test passes or fails. If the device does not recover, pytest reports a teardown error on that test, which is exactly where the problem was caused.

## We proved it on the device

We broke the test's assertion on purpose and checked the device log. The recovery command was sent right after the failure was reported, and the device answered. Then we restored the test.

## The rule we follow now

- Every test that changes device state gets a fixture that restores it: log level, time, configuration, stored objects.
- Every fault-injection test gets a recovery check in teardown, not at the end of the test body.
- Reuse the framework's existing restore fixtures where they exist, for example one that resets the log level.

The same review produced a smaller rule worth keeping: use a plain string for a simple substring match, and compile a regular expression only when you need one.

> **Takeaway:** On shared hardware, a test is responsible for the state it leaves behind. Put that responsibility where it cannot be skipped: in fixture teardown.
