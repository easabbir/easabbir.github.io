---
title: "Testing a CLI the Way a Machine Reads It"
description: "Why \"the text appears somewhere\" is not a test"
date: 2026-11-10 10:03:00 +0600
category: Embedded QA
tags: [cli-testing, serial, regex, log-format]
series: Embedded QA Series
part: 3
---
Our device logs every line in a fixed format: a module name, a level and the message, separated by tabs and ended by carriage return plus line feed. Test tools, log viewers and CI parsers all depend on that format. So when a feature ticket said "echoed input should follow the logging text formatting", the question was how to test it properly.

## The loose test that passed anyway

An existing test sent `help` and asserted that the word `help` came back. It passed. It would also have passed if the device echoed raw text with no formatting at all, which is exactly what the feature was meant to fix.

## Reading raw bytes, not parsed logs

A log parser is forgiving by design: it trims spaces and accepts variations. To test the format itself, we read the raw serial bytes up to the echo line and matched them against the specified structure:

```python
LOG_LINE = re.compile(
    r"\[(?P<module>[A-Z_]{2,15}) *\]\t"       # [MODULE]<TAB>
    r"\[(?P<level>DEBUG|INFO|WARN|ERROR)\] ?\t"  # [LEVEL]<TAB>
    r"(?P<line>[^\r\n]*)\r\n")                  # LINE<CR><LF>

match = LOG_LINE.fullmatch(echo_line)
assert match is not None
assert match["module"] == "CLI"
assert match["level"] == "DEBUG"
assert match["line"].endswith(command)
```

We ran it for four kinds of input: a plain command, a command with a module prefix, a command with arguments, and an unknown command. Every input line must be echoed, not only the valid ones.

## Checking the checker

Before trusting the pattern, we fed it real captured lines and deliberately wrong ones: raw text with no header, spaces instead of tabs, the wrong module, an invalid level, and no echo at all. Each was rejected with a message that shows the offending line. The spec's own example was accepted.

## What it found

The echo followed the log format, so the main part of the feature was done. But the spec also requires the echo at DEBUG level, and the firmware used INFO. With the level check in place the test fails, and the ticket goes back with a precise finding instead of a vague "looks fine".

> **Takeaway:** When a requirement is about format, test the bytes. A parser that tidies the output before your assertion runs will hide exactly the defect you are looking for.
