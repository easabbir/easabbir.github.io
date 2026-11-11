---
title: "Testing Firmware on Real Hardware"
description: "How we built an integration test suite for a cellular IoT gateway"
date: 2026-11-10 10:01:00 +0600
category: Embedded QA
tags: [firmware, iot, pytest, hardware-testing, ci]
series: Embedded QA Series
part: 1
---
In web QA, a failing test usually means a bug. In embedded QA, it might be the firmware, the test, the specification, the USB cable, or a terminal window someone left open on the test port. That difference shapes everything about how we test embedded products at Vivasoft.

This is the first article in a series about our embedded testing work. It describes a recent project: integration testing for a cellular IoT gateway, an application running directly on an LTE module that turns it into a communications co-processor for a smart-metering device.

## What we test, and how we reach it

The firmware exposes a debug command-line interface (CLI) over USB serial. Every command and every log line travels over that link, so the CLI is our window into the device. Our tests send commands, read the device's log output, and assert on what comes back. There are no mocks: every test runs against a real unit on the bench.

- **pytest** as the test runner, extended by the client's in-house framework for serial devices, log capture and device resets.
- **Layered configuration:** product constants, per-build information from the firmware release, and a per-bench file with the local COM ports. The same tests run on any bench.
- **Structured logs:** every byte on the serial link is recorded and parsed into module, level and message, so a failing test links straight to the exact device traffic.
- **CI:** a Jenkins pipeline flashes the target firmware and runs the suite on a dedicated test PC.

## What a test looks like

```python
@pytest_item
def unknown_command_FI(log_fetcher, verify_cli_recovery, param):
    """
    Verify that unknown commands are rejected and the CLI keeps responding
    1. Send the unknown command
    2. Assert an ERROR "unknown command: <command>" is logged
    3. Teardown: assert the CLI still answers a known command
    """
    logs = log_fetcher.send_and_get_until_pattern(param, f"unknown command: {param}",
                                                  module="CLI", level=LogLevel.ERROR)
    assert logs.contains(f"unknown command: {param}")
```

Each test follows a happy-path (`_HP`) or fault-injection (`_FI`) naming convention, has a docstring with numbered steps, and puts device recovery in fixture teardown, so a failure never leaves the hardware in a bad state for the next test.

## Three habits that made the difference

- **Spec first, then source, then device.** Expected behaviour comes from the specification. The firmware source explains the edge cases. The device confirms both. When they disagree, we report it instead of quietly picking one.
- **Probe before asserting.** Before writing a test, we send the command by hand with read-only probes and record the exact response.
- **Test the tests.** After a test passes, we break its expectation on purpose and confirm it fails with a clear message.

> **Takeaway:** The rest of this series takes each of these habits apart, with the real problems they caught: a test that was wrong about the spec, a feature that looked done but wasn't, and a lab full of COM ports that renumber themselves.
