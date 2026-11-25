from __future__ import annotations

import math
import statistics


def latency_summary(values: list[float]) -> dict[str, float | None]:
    if not values:
        return {"median_ms": None, "p95_ms": None}
    ordered = sorted(values)
    def percentile(p: float) -> float:
        return ordered[min(len(ordered) - 1, math.ceil(p * len(ordered)) - 1)]
    return {"median_ms": statistics.median(ordered), "p95_ms": percentile(.95)}


def classification_metrics(labels: list[bool], predictions: list[bool]) -> dict[str, float]:
    if len(labels) != len(predictions):
        raise ValueError("labels and predictions must have equal length")
    tp = sum(a and b for a, b in zip(labels, predictions))
    tn = sum(not a and not b for a, b in zip(labels, predictions))
    fp = sum(not a and b for a, b in zip(labels, predictions))
    fn = sum(a and not b for a, b in zip(labels, predictions))
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    return {"tp": tp, "tn": tn, "fp": fp, "fn": fn,
            "precision": precision, "recall": recall,
            "f1": 2 * precision * recall / (precision + recall) if precision + recall else 0.0}

