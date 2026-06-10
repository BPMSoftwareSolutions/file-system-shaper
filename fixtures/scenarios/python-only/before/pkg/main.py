from .services.user_service import build_user
from .services.report_service import render_report


def run():
    return render_report(build_user("Ada"))


if __name__ == "__main__":
    print(run())
