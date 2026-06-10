from .helpers.formatter import format_name


def build_user(name):
    return {"name": format_name(name)}
