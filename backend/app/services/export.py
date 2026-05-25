"""Export engine service.

Generates export files (TXT, CSV, JSON) from analysis results.
"""

from __future__ import annotations

import csv
import io
import json
import os
from datetime import datetime, timezone
from typing import Optional

from ..models.schemas import ImageResult


def export_as_txt(
    images: list[ImageResult],
    include_rejected: bool = False,
) -> str:
    """Export as plain text, one filename per line."""
    lines = []
    for img in images:
        decision = img.human_decision or img.ai_decision
        if not include_rejected and decision == "reject":
            continue
        lines.append(img.path)

    return "\n".join(lines)


def export_as_csv(
    images: list[ImageResult],
    include_rejected: bool = False,
    include_scores: bool = True,
) -> str:
    """Export as CSV with filename, score, status, reasons."""
    output = io.StringIO()
    writer = csv.writer(output)

    if include_scores:
        writer.writerow(["filename", "path", "score", "ai_decision", "human_decision", "reasons"])
    else:
        writer.writerow(["filename", "path", "ai_decision", "human_decision"])

    for img in images:
        decision = img.human_decision or img.ai_decision
        if not include_rejected and decision == "reject":
            continue

        row = [img.filename, img.path]
        if include_scores:
            row.extend([
                str(img.score) if img.score is not None else "",
                img.ai_decision.value,
                img.human_decision.value if img.human_decision else "",
                "; ".join(img.score_reasons),
            ])
        else:
            row.extend([
                img.ai_decision.value,
                img.human_decision.value if img.human_decision else "",
            ])

        writer.writerow(row)

    return output.getvalue()


def export_as_json(
    images: list[ImageResult],
    include_rejected: bool = False,
) -> str:
    """Export as structured JSON."""
    export_data = []
    for img in images:
        decision = img.human_decision or img.ai_decision
        if not include_rejected and decision == "reject":
            continue

        export_data.append({
            "filename": img.filename,
            "path": img.path,
            "extension": img.extension,
            "file_size_bytes": img.file_size_bytes,
            "dimensions": {
                "width": img.dimensions.width if img.dimensions else None,
                "height": img.dimensions.height if img.dimensions else None,
            } if img.dimensions else None,
            "score": img.score,
            "score_reasons": img.score_reasons,
            "ai_decision": img.ai_decision.value,
            "human_decision": img.human_decision.value if img.human_decision else None,
        })

    return json.dumps(export_data, indent=2)
