from .helpers.formatter import format_name


def render_report(user):
    return f"report:{format_name(user['name'])}"
