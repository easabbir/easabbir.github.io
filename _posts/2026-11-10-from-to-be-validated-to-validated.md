---
title: "From \"To Be Validated\" to Validated"
description: "QA in an embedded feature workflow"
date: 2026-11-10 10:09:00 +0600
category: Embedded QA
tags: [qa-process, validation, workflow]
series: Embedded QA Series
part: 9
---
The ticket was one line: "Add input echo in terminal. Echoed text should follow the logging text formatting." Its status was To be validated, and it was assigned to QA. Here is how we turned that line into a test with a clear verdict.

## 1. Find out what "the formatting" means

The protocol specification defines the log line: module, level and message separated by tabs, ended by CR LF. It also says the echo must be at DEBUG level and contain the command exactly as received. The firmware source showed a deliberate choice: echo at INFO with a `> ` marker. Two sources, two answers.

## 2. Ask, don't assume

We wrote the conflict down with three options: check the format only, enforce the full spec, or lock in the firmware's behaviour. The first decision was format only. On review, the level was added: the echo must be at DEBUG, as the spec says.

## 3. Write the test from the spec

- Four inputs: a plain command, a module command, a command with arguments and an unknown command.
- Read the raw serial bytes up to the echo, and match the exact line structure.
- Assert module CLI, level DEBUG, and that the line ends with the command as typed.
- A docstring with numbered steps, so the next reader knows what is verified.

## 4. Verify the test itself

The format checks passed on the device. A deliberately broken expectation failed with a readable message. Offline checks confirmed the pattern accepts the spec's form and rejects malformed lines.

## 5. Report a precise verdict

The result is not "it works" or "it doesn't". The echo follows the log format; it is logged at INFO where the spec requires DEBUG. The ticket goes back with that sentence, the spec reference and a test that will turn green the moment the firmware is fixed.

## 6. Ship it the normal way

A feature branch from the main development branch, small focused commits, a pull request with the test results and the known deviation in the description, and review by a colleague before merge.

> **Takeaway:** Validation is not a thumbs-up. It is a precise statement of what matches the specification and what doesn't, backed by a test that keeps checking it.
