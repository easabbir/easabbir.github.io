---
title: "Who Tests the Tests?"
description: "Mutation checks for hardware integration tests"
date: 2026-11-10 10:04:00 +0600
category: Embedded QA
tags: [mutation-testing, test-quality, pytest]
series: Embedded QA Series
part: 4
---
A green test proves one thing: it did not fail this time. It does not prove the test can fail. On hardware this matters even more, because a timeout, an empty buffer or a skipped step can all quietly produce a pass.

## The habit

After every new test passes on the device, we break its expectation on purpose and run it again:

- Change the expected error text to something the device never prints.
- Remove a valid value from an allowed set, for example drop INFO from the accepted log levels.
- Point a check at a module that never logs the line.

The test must fail, and the failure message must show what the device actually sent. Then we restore the file and confirm the diff is exactly the intended change. It takes a minute per test.

## Why it pays off on hardware

- **Timeouts look like success.** A fetch that waits two seconds and returns whatever arrived can make an assertion on an empty collection pass, depending on how it is written.
- **Skips look like progress.** When a serial port is locked by another program, every test is skipped. A CI summary with no failures says nothing about the firmware.
- **Recovery must run on failure.** One mutation check confirmed something different: that our fixture teardown still sends its recovery command after the test fails. The device log showed the command arriving right after the failure was reported.

## Reading the failure message

A good failure message is part of the test. Ours print the received lines, for example `'WRONG TEXT: abc' missing in ['unknown command: abc']`. When the real firmware regresses, the engineer reading the CI report sees the cause without opening a log viewer.

## Offline checks when the hardware is away

When no unit was available, we tested the parsing logic of a new test against captured device output and hand-made bad inputs. It does not replace a device run, but it means the first hardware run tests the firmware, not our regular expression.

> **Takeaway:** Make it part of "done": a new test is finished when it has passed on the device **and** failed on purpose with a readable message.
