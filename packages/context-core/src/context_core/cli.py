import typer

app = typer.Typer(help="Context-Med: Akademik Yayin Uretim Pipeline'i")
run_app = typer.Typer(help="Run specific pipeline modules")

app.add_typer(run_app, name="run")

try:
    from context_va.cli import va_cmd
    run_app.add_typer(va_cmd, name="va")
except ImportError as e:
    @run_app.command(name="va")
    def va_placeholder():
        print(f"context-va not installed or error: {e}")

if __name__ == "__main__":
    app()
