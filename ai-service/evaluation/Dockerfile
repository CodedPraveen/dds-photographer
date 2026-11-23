FROM python:3.12-slim

WORKDIR /evaluation
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 DDS_EVALUATION_ISOLATED=1

COPY evaluation/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY evaluation ./evaluation

RUN useradd --create-home evaluator \
    && mkdir -p /evaluation/models /evaluation/dataset /evaluation/.evaluation-tmp \
    && chown -R evaluator:evaluator /evaluation
USER evaluator

# No EXPOSE and no CMD: callers must choose the offline CLI command explicitly.
# Recommended runtime flags:
# docker run --rm --network none --read-only --cap-drop=ALL --security-opt no-new-privileges \
#   --cpus=2 --memory=2g \
#   --tmpfs /tmp:rw,noexec,nosuid,size=512m \
#   -v ./models:/evaluation/models:ro -v ./dataset:/evaluation/dataset:ro \
#   dds-face-eval python -m evaluation.cli check-env

