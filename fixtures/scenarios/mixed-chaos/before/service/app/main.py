from .legacy.pipeline import run_pipeline
from .legacy.steps.collector import collect


def main():
    return run_pipeline(collect())
