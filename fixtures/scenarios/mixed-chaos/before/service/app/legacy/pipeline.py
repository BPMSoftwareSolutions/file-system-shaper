from .steps.collector import collect


def run_pipeline(data):
    return {"items": collect(), "input": data}
